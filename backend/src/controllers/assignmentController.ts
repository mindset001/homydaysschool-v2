import { Response } from 'express';
import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.js';
import { Class } from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';
import { AssignmentSubmission } from '../models/AssignmentSubmission.js';

async function resolveClassId(param: string): Promise<mongoose.Types.ObjectId | null> {
  if (mongoose.Types.ObjectId.isValid(param)) {
    return new mongoose.Types.ObjectId(param);
  }
  const cls = await Class.findOne({ name: new RegExp(`^${param}$`, 'i') }).lean();
  return cls ? (cls._id as mongoose.Types.ObjectId) : null;
}

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { title, description, questions = [], dueDate, attachments } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    const assignment = new Assignment({
      title,
      description,
      questions,
      classId,
      assignedBy: req.user!.userId,
      dueDate,
      attachments,
    });
    await assignment.save();

    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAssignmentsByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const resolvedId = await resolveClassId(classId);
    if (!resolvedId) {
      res.json({ assignments: [] });
      return;
    }
    const assignments = await Assignment.find({ classId: resolvedId }).populate('assignedBy', 'firstName lastName');
    res.json({ assignments });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addAssignmentMarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const marks = req.body.marks; // expect array of { studentId, score, feedback }
    if (!Array.isArray(marks)) {
      res.status(400).json({ message: 'Invalid payload. Expected marks array.' });
      return;
    }

    const ops = marks.map((m: any) => ({
      updateOne: {
        filter: { assignmentId, studentId: m.studentId },
        update: { $set: { score: m.score, feedback: m.feedback, markedBy: req.user?.userId } },
        upsert: true,
      },
    }));

    await AssignmentSubmission.bulkWrite(ops as any[]);
    res.json({ message: 'Marks saved' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAssignmentMarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const marks = await AssignmentSubmission.find({ assignmentId }).populate('studentId', 'userId');
    res.json({ marks });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
