import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { StudentSubmission } from '../models/StudentSubmission.js';
import { Assignment } from '../models/Assignment.js';
import { Quiz } from '../models/Quiz.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';

export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const { studentId, content } = req.body;

    // handle multipart files uploaded via multer
    const files: any[] = (req as any).files || [];
    const attachments: string[] = [];
    for (const f of files) {
      try {
        const uploaded = await uploadBufferToCloudinary(f.buffer, 'submissions', 'auto');
        attachments.push(uploaded.url);
      } catch (err) {
        console.error('Upload failed for file', f.originalname, err);
      }
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    const submission = await StudentSubmission.findOneAndUpdate(
      { assignmentId, studentId },
      { assignmentId, studentId, submittedBy: req.user!.userId, content, attachments },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ message: 'Submission saved', submission });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { studentId, content } = req.body;
    const files: any[] = (req as any).files || [];
    const attachments: string[] = [];
    for (const f of files) {
      try {
        const uploaded = await uploadBufferToCloudinary(f.buffer, 'submissions', 'auto');
        attachments.push(uploaded.url);
      } catch (err) {
        console.error('Upload failed for file', f.originalname, err);
      }
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    const submission = await StudentSubmission.findOneAndUpdate(
      { quizId, studentId },
      { quizId, studentId, submittedBy: req.user!.userId, content, attachments },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ message: 'Submission saved', submission });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSubmissionsForAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const query: any = { assignmentId };
    if (req.query.studentId) query.studentId = req.query.studentId;
    const submissions = await StudentSubmission.find(query).populate('studentId', 'userId').populate('submittedBy', 'firstName lastName');
    res.json({ submissions });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSubmissionsForQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const query: any = { quizId };
    if (req.query.studentId) query.studentId = req.query.studentId;
    const submissions = await StudentSubmission.find(query).populate('studentId', 'userId').populate('submittedBy', 'firstName lastName');
    res.json({ submissions });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
