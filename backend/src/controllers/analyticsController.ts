import { Response } from 'express';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { Guardian } from '../models/Guardian.js';
import { Class } from '../models/Class.js';
import { Payment } from '../models/Payment.js';
import { Event } from '../models/Event.js';
import { Subject } from '../models/Subject.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { AuthRequest } from '../middleware/auth.js';

export const getHomeAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Use provided term/year, or fall back to the active academic session
    let { term, academicYear } = req.query as { term?: string; academicYear?: string };
    if (!term || !academicYear) {
      const activeSession = await AcademicSession.findOne({ isActive: true }).lean() as any;
      if (activeSession) {
        term = activeSession.term;
        academicYear = activeSession.academicYear;
      }
    }
    const sessionFilter = term && academicYear ? { term, academicYear } : null;

    // Get basic counts
    const [totalStudents, totalStaffs, totalGuardians, totalClasses, totalSubjects] = await Promise.all([
      Student.countDocuments(),
      Staff.countDocuments(),
      Guardian.countDocuments(),
      Class.countDocuments(),
      Subject.countDocuments(),
    ]);

    // Get all students with their class information
    const students = await Student.find().populate('class').lean();
    
    // Get all classes with fee information
    const classes = await Class.find().lean();
    const classFeesMap = new Map();
    classes.forEach((cls: any) => {
      classFeesMap.set(cls._id.toString(), cls.termFee || 0);
    });

    // Get payments grouped by student — scoped to active/requested session
    const paymentMatch: any = {};
    if (sessionFilter) {
      paymentMatch.term = sessionFilter.term;
      paymentMatch.academicYear = sessionFilter.academicYear;
    }

    const payments = await Payment.aggregate([
      { $match: paymentMatch },
      {
        $group: {
          _id: '$studentId',
          totalPaid: { $sum: '$amount' }
        }
      }
    ]);

    const studentPaymentMap = new Map();
    payments.forEach((payment: any) => {
      studentPaymentMap.set(payment._id.toString(), payment.totalPaid);
    });

    // Calculate current-session payment statistics
    let completedTuition = 0;
    let incompleteTuition = 0;
    let voidTuition = 0;
    let starterPackCollected = 0;

    students.forEach((student: any) => {
      const studentId = student._id.toString();
      const classId = student.class?._id?.toString() || student.class?.toString();
      const totalFee = classFeesMap.get(classId) || 0;
      const totalPaid = studentPaymentMap.get(studentId) || 0;

      if (totalFee === 0 || totalPaid >= totalFee) {
        completedTuition++;
      } else if (totalPaid === 0) {
        voidTuition++;
      } else {
        incompleteTuition++;
      }

      if (student.starterPackCollected === true) {
        starterPackCollected++;
      }
    });

    // Debtor stats: students with outstanding balances from previous terms
    const debtorMatch: any = {};
    if (sessionFilter) {
      debtorMatch.$nor = [{ term: sessionFilter.term, academicYear: sessionFilter.academicYear }];
    }

    const debtorAgg = await Payment.aggregate([
      { $match: debtorMatch },
      {
        $group: {
          _id: { studentId: '$studentId', term: '$term', academicYear: '$academicYear' },
          totalDue: { $sum: '$amountDue' },
          totalPaid: { $sum: '$amount' },
        },
      },
      { $match: { $expr: { $gt: ['$totalDue', '$totalPaid'] } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalOutstanding: { $sum: { $subtract: ['$totalDue', '$totalPaid'] } },
        },
      },
    ]);

    const debtorsCount = debtorAgg[0]?.count || 0;
    const totalDebtAmount = debtorAgg[0]?.totalOutstanding || 0;

    // Get upcoming events (next 30 days)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);

    const upcomingEvents = await Event.find({
      date: {
        $gte: today,
        $lte: futureDate
      }
    })
    .sort({ date: 1 })
    .limit(10)
    .lean();

    const formattedEvents = upcomingEvents.map((event: any) => ({
      id: event._id,
      event: event.event || 'Event',
      date: event.date,
    }));

    res.json({
      data: {
        total_students: totalStudents,
        total_staffs: totalStaffs,
        total_guardians: totalGuardians,
        total_subject: totalSubjects,
        total_classes: totalClasses,
        completed_tuition: completedTuition,
        incompleted_tuition: incompleteTuition,
        void: voidTuition,
        starter_pack_collected: starterPackCollected,
        debtors_count: debtorsCount,
        total_debt_amount: totalDebtAmount,
        events: formattedEvents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching home analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const migrateTermFees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Read old fee fields still present in MongoDB documents (even though removed from schema)
    const classes = await Class.find().lean() as any[];
    let migrated = 0;

    for (const cls of classes) {
      if (cls.termFee && cls.termFee > 0) continue; // already set, skip

      const oldSum =
        (cls.schoolFee || 0) +
        (cls.uniform || 0) +
        (cls.sportWear || 0) +
        (cls.schoolBus || 0) +
        (cls.snack || 0) +
        (cls.science || 0) +
        (cls.games || 0) +
        (cls.libraryFee || 0) +
        (cls.extraActivities || 0);

      if (oldSum > 0) {
        await Class.findByIdAndUpdate(cls._id, { $set: { termFee: oldSum } });
        migrated++;
      }
    }

    res.json({ message: 'Migration complete', classesUpdated: migrated, totalClasses: classes.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetTermData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { term, academicYear } = req.body as { term: string; academicYear: string };

    if (!term || !academicYear) {
      res.status(400).json({ message: 'term and academicYear are required' });
      return;
    }

    const yearInt = parseInt(academicYear);

    const [paymentResult, studentResult] = await Promise.all([
      Payment.deleteMany({ term, academicYear }),
      Student.updateMany(
        {},
        {
          $pull: {
            academicRecords: { term, year: yearInt } as any,
            termReports: { term, year: yearInt } as any,
          },
        }
      ),
    ]);

    res.json({
      message: 'Term data cleared successfully',
      paymentsDeleted: paymentResult.deletedCount,
      studentsUpdated: studentResult.modifiedCount,
      term,
      academicYear,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDebtors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activeSession = await AcademicSession.findOne({ isActive: true }).lean() as any;

    const matchStage: any = {};
    if (activeSession) {
      matchStage.$nor = [{ term: activeSession.term, academicYear: activeSession.academicYear }];
    }

    const debtors = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { studentId: '$studentId', term: '$term', academicYear: '$academicYear' },
          totalDue: { $sum: '$amountDue' },
          totalPaid: { $sum: '$amount' },
        },
      },
      { $match: { $expr: { $gt: ['$totalDue', '$totalPaid'] } } },
      {
        $group: {
          _id: '$_id.studentId',
          totalDebt: { $sum: { $subtract: ['$totalDue', '$totalPaid'] } },
          breakdown: {
            $push: {
              term: '$_id.term',
              academicYear: '$_id.academicYear',
              amountDue: '$totalDue',
              amountPaid: '$totalPaid',
              balance: { $subtract: ['$totalDue', '$totalPaid'] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'student.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'student.class',
          foreignField: '_id',
          as: 'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          studentId: '$_id',
          name: {
            $trim: {
              input: { $concat: [{ $ifNull: ['$user.firstName', ''] }, ' ', { $ifNull: ['$user.lastName', ''] }] },
            },
          },
          studentCode: '$student.studentId',
          class: '$class.name',
          totalDebt: 1,
          breakdown: 1,
        },
      },
      { $sort: { totalDebt: -1 } },
    ]);

    const totalOutstanding = debtors.reduce((sum: number, d: any) => sum + d.totalDebt, 0);

    res.json({ debtors, count: debtors.length, totalOutstanding });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
