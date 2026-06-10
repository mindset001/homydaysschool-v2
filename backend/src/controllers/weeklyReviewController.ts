import { Response } from 'express';
import mongoose from 'mongoose';
import { WeeklyReview } from '../models/WeeklyReview.js';
import { Class } from '../models/Class.js';
import { Staff } from '../models/Staff.js';
import { Student } from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

function mondayOf(dateStr: string): Date {
  const d = new Date(dateStr);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// POST /api/weekly-reviews — create or update review for a class+week
export const upsertWeeklyReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, weekOf: weekOfStr, term, academicYear, message, studentNotes } = req.body;

    if (!classId || !weekOfStr || !term || !academicYear || !message) {
      res.status(400).json({ message: 'classId, weekOf, term, academicYear, and message are required' });
      return;
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    // Staff can only review their assigned class
    if (req.user?.role === 'staff') {
      const staff = await Staff.findOne({ userId: req.user.userId }).lean();
      if (!staff || !staff.classes?.includes(classData.name)) {
        res.status(403).json({ message: 'You are not assigned to this class' });
        return;
      }
    }

    const weekOf = mondayOf(weekOfStr);

    const review = await WeeklyReview.findOneAndUpdate(
      { classId, weekOf },
      { classId, author: req.user!.userId, weekOf, term, academicYear, message, studentNotes: studentNotes ?? [] },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Review saved', review });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/weekly-reviews/class/:classId — list reviews for a class (recent first)
export const getReviewsByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const reviews = await WeeklyReview.find({ classId })
      .populate('author', 'firstName lastName')
      .sort({ weekOf: -1 })
      .limit(20)
      .lean();
    res.json({ reviews });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/weekly-reviews/ward/:studentId — guardian gets reviews for ward's class
export const getReviewsForWard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).lean();
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // student.class is the class name string — resolve to ObjectId
    let classId: mongoose.Types.ObjectId | null = null;
    if (mongoose.Types.ObjectId.isValid(student.class as string)) {
      classId = new mongoose.Types.ObjectId(student.class as string);
    } else {
      const cls = await Class.findOne({ name: new RegExp(`^${student.class}$`, 'i') }).lean();
      classId = cls ? (cls._id as mongoose.Types.ObjectId) : null;
    }

    if (!classId) {
      res.json({ reviews: [] });
      return;
    }

    const reviews = await WeeklyReview.find({ classId })
      .populate('author', 'firstName lastName')
      .sort({ weekOf: -1 })
      .limit(20)
      .lean();

    // Attach the individual note for this student (if any) to each review
    const enriched = reviews.map((r) => ({
      ...r,
      myNote: (r.studentNotes ?? []).find(
        (n: any) => n.studentId.toString() === studentId
      )?.note ?? null,
    }));

    res.json({ reviews: enriched });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
