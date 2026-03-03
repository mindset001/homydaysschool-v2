import { Response } from 'express';
import { Payment } from '../models/Payment.js';
import { Student } from '../models/Student.js';
import { Class } from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';

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
    
    // Disable caching for payment data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
    
    // Disable caching for payment data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ payment });
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
    
    // Calculate total paid, total due
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalDue = payments.length > 0 ? payments[0].amountDue : 0;
    const balance = totalDue - totalPaid;
    
    // Disable caching for payment data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ 
      payments,
      summary: {
        totalPaid,
        totalDue,
        balance,
        paymentStatus: balance <= 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid'
      }
    });
  } catch (error: any) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPaymentsByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    
    console.log('Fetching payments for class:', classId);
    
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    // Query students directly by class name instead of relying on Class.students array
    const students = await Student.find({ class: classDoc.name });
    const studentIds = students.map(s => s._id);
    console.log(`Found ${students.length} students in class ${classDoc.name}`);
    console.log('Student IDs:', studentIds);
    
    const payments = await Payment.find({ studentId: { $in: studentIds } })
      .populate('studentId')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('receivedBy', 'firstName lastName email')
      .sort({ paymentDate: -1 });
    
    console.log('Found payments:', payments.length);
    payments.forEach(payment => {
      console.log('  Payment:', {
        _id: payment._id,
        studentId: payment.studentId,
        amount: payment.amount,
        paymentType: payment.paymentType
      });
    });
    
    // Disable caching for payment data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ payments, class: classDoc });
  } catch (error: any) {
    console.error('Error fetching class payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

    // Validate required fields
    if (!studentId || !academicYear || !term || !paymentType || !amount || !amountDue || !paymentMethod) {
      res.status(400).json({ message: 'All required fields must be provided' });
      return;
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Determine payment status
    let paymentStatus: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
    if (amount >= amountDue) {
      paymentStatus = 'Paid';
    } else if (amount > 0) {
      paymentStatus = 'Partial';
    }

    // Create Payment record
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
    
    console.log('Saving payment for student:', studentId);
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

    console.log('Payment created successfully:', {
      _id: populatedPayment?._id,
      studentId: populatedPayment?.studentId,
      amount: populatedPayment?.amount
    });

    res.status(201).json({ 
      message: 'Payment recorded successfully', 
      payment: populatedPayment 
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('Updating payment with ID:', id);
    console.log('Update data:', req.body);
    
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

    // Update Payment record
    const paymentUpdates: any = {};
    if (amount !== undefined) {
      paymentUpdates.amount = Number(amount);
      // Recalculate status if amount changes
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
