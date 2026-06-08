import { Response } from 'express';
import mongoose from 'mongoose';
import { Quiz } from '../models/Quiz.js';
import { Class } from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';
import { QuizSubmission } from '../models/QuizSubmission.js';

async function resolveClassId(param: string): Promise<mongoose.Types.ObjectId | null> {
  if (mongoose.Types.ObjectId.isValid(param)) {
    return new mongoose.Types.ObjectId(param);
  }
  const cls = await Class.findOne({ name: new RegExp(`^${param}$`, 'i') }).lean();
  return cls ? (cls._id as mongoose.Types.ObjectId) : null;
}

export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { title, description, questions = [], scheduledAt, durationMinutes } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    const quiz = new Quiz({
      title,
      description,
      classId,
      createdBy: req.user!.userId,
      questions,
      scheduledAt,
      durationMinutes,
    });
    await quiz.save();

    res.status(201).json({ message: 'Quiz created', quiz });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizzesByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const resolvedId = await resolveClassId(classId);
    if (!resolvedId) {
      res.json({ quizzes: [] });
      return;
    }
    const quizzes = await Quiz.find({ classId: resolvedId }).populate('createdBy', 'firstName lastName');
    res.json({ quizzes });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addQuizMarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const marks = req.body.marks; // expect array of { studentId, score, feedback }
    if (!Array.isArray(marks)) {
      res.status(400).json({ message: 'Invalid payload. Expected marks array.' });
      return;
    }

    const ops = marks.map((m: any) => ({
      updateOne: {
        filter: { quizId, studentId: m.studentId },
        update: { $set: { score: m.score, feedback: m.feedback, markedBy: req.user?.userId } },
        upsert: true,
      },
    }));

    await QuizSubmission.bulkWrite(ops as any[]);
    res.json({ message: 'Marks saved' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizMarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const marks = await QuizSubmission.find({ quizId }).populate('studentId', 'userId');
    res.json({ marks });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
