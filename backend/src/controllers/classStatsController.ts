import { Response } from 'express';
import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Payment } from '../models/Payment.js';
import { AuthRequest } from '../middleware/auth.js';

export const getClassStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classes = await Class.find();
    
    const classStats = await Promise.all(
      classes.map(async (cls) => {
        // Query students directly by class name
        const students = await Student.find({ class: cls.name });
        const studentCount = students.length;
        
        if (studentCount === 0) {
          return {
            id: cls._id,
            class: cls.name,
            grade: cls.grade,
            section: cls.section,
            total: 0,
            paid: 0,
            paid_half: 0,
            paid_nothing: 0,
            starterpack_collected: 0,
            academicYear: cls.academicYear,
          };
        }
        
        // Get all payments for students in this class
        const studentIds = students.map((s: any) => s._id);
        const currentYear = cls.academicYear;
        
        // Calculate payment status for each student
        let paidCount = 0;
        let partialCount = 0;
        let unpaidCount = 0;
        let starterPackCollectedCount = 0;
        
        await Promise.all(
          studentIds.map(async (studentId: any) => {
            // only filter by academicYear if it's defined on the class
            const query: any = { studentId };
            if (currentYear) {
              query.academicYear = currentYear;
            }
            const payments = await Payment.find(query);
            if (!currentYear) {
              console.log(`classStats: class ${cls.name} has no academicYear, fetching all payments for student ${studentId}`);
            }
            
            if (payments.length === 0) {
              unpaidCount++;
              return;
            }
            
            // Check for starter pack payment
            const starterPackPayment = payments.find(p => p.paymentType === 'Starter Pack');
            if (starterPackPayment && starterPackPayment.paymentStatus === 'Paid') {
              starterPackCollectedCount++;
            }
            
            // Calculate total school fees paid
            const schoolFeePayments = payments.filter(p => p.paymentType === 'School Fee');
            if (schoolFeePayments.length > 0) {
              const totalPaid = schoolFeePayments.reduce((sum, p) => sum + p.amount, 0);
              const totalDue = schoolFeePayments[0].amountDue;
              
              if (totalPaid >= totalDue) {
                paidCount++;
              } else if (totalPaid > 0) {
                partialCount++;
              } else {
                unpaidCount++;
              }
            } else {
              unpaidCount++;
            }
          })
        );
        
        return {
          id: cls._id,
          class: cls.name,
          grade: cls.grade,
          section: cls.section,
          total: studentCount,
          paid: paidCount,
          paid_half: partialCount,
          paid_nothing: unpaidCount,
          starterpack_collected: starterPackCollectedCount,
          academicYear: cls.academicYear,
        };
      })
    );
    
    res.json({ classStats });
  } catch (error: any) {
    console.error('Error fetching class stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getClassStatById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Ensure the id is a valid Mongo ObjectId before querying
    // this prevents CastErrors when invalid values (e.g. "NaN") are provided
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid class id' });
      return;
    }

    const cls = await Class.findById(id);

    if (!cls) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    // Query students directly by class name
    const students = await Student.find({ class: cls.name });
    const studentCount = students.length;
    const currentYear = cls.academicYear || '2026/2027';
    
    if (studentCount === 0) {
      const classStat = {
        id: cls._id,
        class: cls.name,
        grade: cls.grade,
        section: cls.section,
        total: 0,
        paid: 0,
        paid_half: 0,
        paid_nothing: 0,
        starterpack_collected: 0,
        academicYear: cls.academicYear,
        subjects: cls.subjects,
        teacher: cls.teacher,
      };
      res.json({ classStat });
      return;
    }
    
    // Get all payments for students in this class
    const studentIds = students.map((s: any) => s._id);
    
    // Calculate payment status for each student
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;
    let starterPackCollectedCount = 0;
    
    await Promise.all(
      studentIds.map(async (studentId: any) => {
        const query: any = { studentId };
        if (currentYear) {
          query.academicYear = currentYear;
        }
        const payments = await Payment.find(query);
        if (!currentYear) {
          console.log(`getClassStatById: class ${cls.name} has no academicYear, fetching all payments for student ${studentId}`);
        }
        
        if (payments.length === 0) {
          unpaidCount++;
          return;
        }
        
        // Check for starter pack payment
        const starterPackPayment = payments.find(p => p.paymentType === 'Starter Pack');
        if (starterPackPayment && starterPackPayment.paymentStatus === 'Paid') {
          starterPackCollectedCount++;
        }
        
        // Calculate total school fees paid
        const schoolFeePayments = payments.filter(p => p.paymentType === 'School Fee');
        if (schoolFeePayments.length > 0) {
          const totalPaid = schoolFeePayments.reduce((sum, p) => sum + p.amount, 0);
          const totalDue = schoolFeePayments[0].amountDue;
          
          if (totalPaid >= totalDue) {
            paidCount++;
          } else if (totalPaid > 0) {
            partialCount++;
          } else {
            unpaidCount++;
          }
        } else {
          unpaidCount++;
        }
      })
    );
    
    const classStat = {
      id: cls._id,
      class: cls.name,
      grade: cls.grade,
      section: cls.section,
      total: studentCount,
      paid: paidCount,
      paid_half: partialCount,
      paid_nothing: unpaidCount,
      starterpack_collected: starterPackCollectedCount,
      academicYear: cls.academicYear,
      subjects: cls.subjects,
      teacher: cls.teacher,
    };
    
    res.json({ classStat });
  } catch (error: any) {
    console.error('Error fetching class stat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
