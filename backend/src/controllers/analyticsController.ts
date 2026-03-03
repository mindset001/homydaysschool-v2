import { Response } from 'express';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { Guardian } from '../models/Guardian.js';
import { Class } from '../models/Class.js';
import { Payment } from '../models/Payment.js';
import { Event } from '../models/Event.js';
import { Subject } from '../models/Subject.js';
import { AuthRequest } from '../middleware/auth.js';

export const getHomeAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
      const totalFee = (cls.schoolFee || 0) + (cls.uniform || 0) + (cls.sportWear || 0) + 
                       (cls.schoolBus || 0) + (cls.snack || 0) + (cls.science || 0) + 
                       (cls.games || 0) + (cls.libraryFee || 0) + (cls.extraActivities || 0);
      classFeesMap.set(cls._id.toString(), totalFee);
    });

    // Get all payments grouped by student
    const payments = await Payment.aggregate([
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

    // Calculate payment statistics
    let completedTuition = 0;
    let incompleteTuition = 0;
    let voidTuition = 0;
    let starterPackCollected = 0;

    students.forEach((student: any) => {
      const studentId = student._id.toString();
      const classId = student.class?._id?.toString() || student.class?.toString();
      const totalFee = classFeesMap.get(classId) || 0;
      const totalPaid = studentPaymentMap.get(studentId) || 0;

      if (totalFee === 0) {
        // If no fee set for class, count as void
        voidTuition++;
      } else if (totalPaid >= totalFee) {
        // Fully paid
        completedTuition++;
      } else if (totalPaid > 0) {
        // Partially paid
        incompleteTuition++;
      } else {
        // Not paid
        voidTuition++;
      }

      // Check starter pack status (assuming it's a field on student)
      if (student.starterPackCollected === true) {
        starterPackCollected++;
      }
    });

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
        events: formattedEvents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching home analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
