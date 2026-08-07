import { Response } from 'express';
import { Payment } from '../models/Payment.js';
import { Student } from '../models/Student.js';
import { Class } from '../models/Class.js';
import { ClassFee } from '../models/ClassFee.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { AuthRequest } from '../middleware/auth.js';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const TERM_ORDER: Record<string, number> = {
  'First Term': 1,
  'Second Term': 2,
  'Third Term': 3,
};

/**
 * A class's fee line items (School Fee, Uniform, Bus, ...) for one specific
 * term/session. A term with no fee records set (via the Class Fees page) is
 * simply $0 due for that term — it never inherits or creates debt tied to
 * any other term.
 */
async function getTermFeeBreakdown(
  className: string,
  academicYear: string,
  term: string
): Promise<{ feeType: string; amount: number }[]> {
  const fees = await ClassFee.find({
    className: new RegExp(`^${className}$`, 'i'),
    academicYear,
    term,
  }).lean();
  return fees.map((f) => ({ feeType: f.feeType, amount: f.amount }));
}

async function getTermFee(className: string, academicYear: string, term: string): Promise<number> {
  const breakdown = await getTermFeeBreakdown(className, academicYear, term);
  return breakdown.reduce((sum, f) => sum + f.amount, 0);
}

/**
 * Sort AcademicSession documents chronologically:
 * academic year ascending, then term order ascending.
 */
function sortSessions(sessions: any[]): any[] {
  return [...sessions].sort((a, b) => {
    if (a.academicYear !== b.academicYear)
      return a.academicYear.localeCompare(b.academicYear);
    return (TERM_ORDER[a.term] ?? 0) - (TERM_ORDER[b.term] ?? 0);
  });
}

/**
 * Return the reference date for an academic session:
 * prefer startDate, fall back to createdAt.
 */
function sessionRefDate(session: any): Date {
  return session.startDate ? new Date(session.startDate) : new Date(session.createdAt);
}

/**
 * Derive the academic year string (e.g. "2025/2026") from any calendar date.
 * Nigerian school year runs September – August.
 *   Sep–Dec → year / year+1  (e.g. Sep 2025 → "2025/2026")
 *   Jan–Aug → year-1 / year  (e.g. Mar 2026 → "2025/2026")
 */
function academicYearFromDate(date: Date): string {
  const month = date.getMonth(); // 0 = Jan … 8 = Sep
  const year = date.getFullYear();
  if (month >= 8) {             // September or later
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`; // January – August
}

/**
 * Filter all sessions down to those applicable to a given student.
 *
 * Rule: include every session whose academicYear is >= the academic year
 * derived from the student's admissionDate.
 *
 * This correctly handles the common case where all existing students were
 * entered into the system mid-year (e.g. March 2026 ≡ 2025/2026) — they
 * are billed for the FULL academic year, not just the remaining terms.
 * A genuinely new student starting in September 2026 (2026/2027) will
 * never see 2025/2026 sessions.
 */
function applicableSessionsForStudent(sessions: any[], student: any): any[] {
  const admDate = student.admissionDate
    ? new Date(student.admissionDate)
    : new Date(student.createdAt);
  const studentAcademicYear = academicYearFromDate(admDate);
  // String comparison works correctly for "YYYY/YYYY+1" format
  return sessions.filter((s) => s.academicYear >= studentAcademicYear);
}

// ─────────────────────────────────────────────────────────
// GET /api/payments
// ─────────────────────────────────────────────────────────

export const getAllPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find()
      .populate('studentId', 'studentId class')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('receivedBy', 'firstName lastName email')
      .sort({ paymentDate: -1 });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/payments/student/:studentId/term-summary
// ─────────────────────────────────────────────────────────

/**
 * Returns a per-term payment breakdown driven by AcademicSession records.
 *
 * Key behaviours:
 * - Every applicable session appears in termSummaries, even with zero payments
 *   (these show up as "Unpaid" automatically when a new term is created).
 * - Sessions whose reference date is BEFORE the student's admission date are skipped.
 * - Each term is billed and settled independently — a term with no fee set
 *   (via the Tuition page) is $0 due, and an unpaid term never carries debt
 *   into any other term.
 */
export const getStudentTermSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // All academic sessions, sorted chronologically
    const allSessions = sortSessions(await AcademicSession.find().lean());

    // Only sessions that started on or after student admission
    const applicable = applicableSessionsForStudent(allSessions, student);

    // All payments for this student, mapped by "year__term" key
    const payments = await Payment.find({ studentId })
      .populate('receivedBy', 'firstName lastName')
      .lean();

    const paymentsByKey = new Map<string, { paid: number; payments: any[] }>();
    payments.forEach((p) => {
      const key = `${p.academicYear}__${p.term}`;
      if (!paymentsByKey.has(key)) {
        paymentsByKey.set(key, { paid: 0, payments: [] });
      }
      const entry = paymentsByKey.get(key)!;
      entry.paid += p.amount;
      entry.payments.push(p);
    });

    // Each applicable session is billed independently — no carry-over
    const termSummaries = await Promise.all(
      applicable.map(async (session) => {
        const key = `${session.academicYear}__${session.term}`;
        const { paid = 0, payments: termPayments = [] } = paymentsByKey.get(key) ?? {};
        const feeBreakdown = student.class
          ? await getTermFeeBreakdown(student.class, session.academicYear, session.term)
          : [];
        const termFee = feeBreakdown.reduce((sum, f) => sum + f.amount, 0);

        const totalDue = termFee;
        const rawBalance = totalDue - paid;

        return {
          term: session.term,
          academicYear: session.academicYear,
          label: `${session.term} — ${session.academicYear}`,
          termFee,
          feeBreakdown,
          totalDue,
          totalPaid: paid,
          balance: Math.max(0, rawBalance),
          overpaid: Math.max(0, -rawBalance),
          status: (rawBalance <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid') as 'Paid' | 'Partial' | 'Unpaid',
          payments: termPayments,
        };
      })
    );

    const overallPaid = termSummaries.reduce((s, t) => s + t.totalPaid, 0);
    const overallDue = termSummaries.reduce((s, t) => s + t.termFee, 0);
    const overallBalance = termSummaries.reduce((s, t) => s + t.balance, 0);

    // "Current" term fee — used by older callers as a single headline figure
    const activeSession = allSessions.find((s: any) => s.isActive);
    const currentTermFee = activeSession
      ? termSummaries.find((t) => t.term === activeSession.term && t.academicYear === activeSession.academicYear)?.termFee ?? 0
      : 0;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({
      termFee: currentTermFee,
      termSummaries,
      overall: {
        totalPaid: overallPaid,
        totalDue: overallDue,
        balance: overallBalance,
        status: (overallBalance <= 0 && overallPaid > 0 ? 'Paid' : overallPaid > 0 ? 'Partial' : 'Unpaid') as string,
      },
    });
  } catch (error: any) {
    console.error('Error computing term summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/payments/student/:studentId
// ─────────────────────────────────────────────────────────

/**
 * Payment list for a single student plus a cumulative summary.
 * totalDue reflects ALL applicable terms (not just a single term).
 */
export const getPaymentsByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    const payments = await Payment.find({ studentId })
      .populate('receivedBy', 'firstName lastName email')
      .sort({ paymentDate: -1 });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    // Compute cumulative totalDue as the sum of each applicable term's own fee
    const allSessions = sortSessions(await AcademicSession.find().lean());
    const applicable = applicableSessionsForStudent(allSessions, student);
    const termFees = student.class
      ? await Promise.all(applicable.map((s: any) => getTermFee(student.class, s.academicYear, s.term)))
      : [];
    const totalDue = termFees.reduce((sum, fee) => sum + fee, 0);

    const balance = Math.max(0, totalDue - totalPaid);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({
      payments,
      summary: {
        totalPaid,
        totalDue,
        balance,
        applicableTerms: applicable.length,
        paymentStatus: balance <= 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid',
      },
    });
  } catch (error: any) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/payments/class/:classId
// ─────────────────────────────────────────────────────────

/**
 * Payment list for an entire class, plus per-student cumulative summaries.
 *
 * Response shape:
 * {
 *   payments: [...],
 *   class: {...},
 *   studentSummaries: {
 *     [studentId]: { totalPaid, totalDue, balance, applicableTerms, paymentStatus }
 *   }
 * }
 *
 * The frontend should use studentSummaries for the balance column
 * instead of computing tuitionBalance locally.
 */
export const getPaymentsByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;

    console.log('Fetching payments for class:', classId);

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    // Use the active session to scope payments to the current term only
    const activeSession = await AcademicSession.findOne({ isActive: true }).lean() as any;
    const activeTerm = activeSession?.term;
    const activeYear = activeSession?.academicYear;

    const termFee = activeTerm && activeYear
      ? await getTermFee(classDoc.name, activeYear, activeTerm)
      : 0;

    // All students in this class
    const students = await Student.find({ class: classDoc.name }).lean();
    const studentIds = students.map((s) => s._id);
    console.log(`Found ${students.length} students in class ${classDoc.name}`);

    // All payments for this class — all terms (for the payment history list)
    const payments = await Payment.find({ studentId: { $in: studentIds } })
      .populate('studentId')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate('receivedBy', 'firstName lastName email')
      .sort({ paymentDate: -1 });

    console.log('Found payments:', payments.length);

    // Sum payments per student for the ACTIVE term only
    const paidByStudent = new Map<string, number>();
    payments.forEach((payment: any) => {
      const sid = payment.studentId?._id?.toString() ?? payment.studentId?.toString();
      const isActiveTerm = activeTerm && activeYear
        ? payment.term === activeTerm && payment.academicYear === activeYear
        : true;
      if (isActiveTerm) {
        paidByStudent.set(sid, (paidByStudent.get(sid) ?? 0) + (payment.amount || 0));
      }
    });

    // Build per-student summaries scoped to the active term
    const studentSummaries: Record<string, {
      totalPaid: number;
      totalDue: number;
      balance: number;
      carriedBalance: number;
      applicableTerms: number;
      paymentStatus: string;
    }> = {};

    for (const student of students) {
      const sid = (student._id as any).toString();
      const totalDue = termFee;
      const totalPaid = paidByStudent.get(sid) ?? 0;
      const balance = Math.max(0, totalDue - totalPaid);
      const carriedBalance = (student as any).carriedBalance ?? 0;

      studentSummaries[sid] = {
        totalPaid,
        totalDue,
        balance,
        carriedBalance,
        applicableTerms: 1,
        paymentStatus: balance <= 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid',
      };
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({ payments, class: classDoc, studentSummaries });
  } catch (error: any) {
    console.error('Error fetching class payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/payments/:id
// ─────────────────────────────────────────────────────────

export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate('studentId')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('receivedBy', 'firstName lastName email');

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ payment });
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// POST /api/payments
// ─────────────────────────────────────────────────────────

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating payment with data:', req.body);

    const {
      studentId,
      academicYear,
      term,
      paymentType,
      amount,
      amountDue,
      paymentDate,
      paymentMethod,
      referenceNumber,
      remarks,
    } = req.body;

    if (!studentId || !academicYear || !term || !paymentType || !amount || !amountDue || !paymentMethod) {
      res.status(400).json({ message: 'All required fields must be provided' });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    let paymentStatus: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
    if (amount >= amountDue) {
      paymentStatus = 'Paid';
    } else if (amount > 0) {
      paymentStatus = 'Partial';
    }

    const payment = new Payment({
      studentId,
      academicYear,
      term,
      paymentType,
      amount: Number(amount),
      amountDue: Number(amountDue),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      paymentStatus,
      referenceNumber,
      receivedBy: req.user!.userId,
      remarks,
    });

    await payment.save();
    console.log('Payment saved with ID:', payment._id);

    const populatedPayment = await Payment.findById(payment._id)
      .populate('studentId')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('receivedBy', 'firstName lastName email');

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: populatedPayment
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// PUT/PATCH /api/payments/:id
// ─────────────────────────────────────────────────────────

export const updatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('Updating payment with ID:', id);

    const {
      amount,
      amountDue,
      paymentDate,
      paymentMethod,
      paymentType,
      referenceNumber,
      remarks,
    } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    const paymentUpdates: any = {};
    if (amount !== undefined) {
      paymentUpdates.amount = Number(amount);
      const updatedAmountDue = amountDue !== undefined ? Number(amountDue) : payment.amountDue;
      if (Number(amount) >= updatedAmountDue) {
        paymentUpdates.paymentStatus = 'Paid';
      } else if (Number(amount) > 0) {
        paymentUpdates.paymentStatus = 'Partial';
      } else {
        paymentUpdates.paymentStatus = 'Unpaid';
      }
    }
    if (amountDue !== undefined) paymentUpdates.amountDue = Number(amountDue);
    if (paymentDate) paymentUpdates.paymentDate = new Date(paymentDate);
    if (paymentMethod) paymentUpdates.paymentMethod = paymentMethod;
    if (paymentType) paymentUpdates.paymentType = paymentType;
    if (referenceNumber !== undefined) paymentUpdates.referenceNumber = referenceNumber;
    if (remarks !== undefined) paymentUpdates.remarks = remarks;

    const updatedPayment = await Payment.findByIdAndUpdate(id, paymentUpdates, { new: true })
      .populate('studentId')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('receivedBy', 'firstName lastName email');

    res.json({
      message: 'Payment updated successfully',
      payment: updatedPayment
    });
  } catch (error: any) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// DELETE /api/payments/:id
// ─────────────────────────────────────────────────────────

export const deletePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
