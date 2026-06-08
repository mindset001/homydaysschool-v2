import express from 'express';
import {
  submitAssignment,
  submitQuiz,
  getSubmissionsForAssignment,
  getSubmissionsForQuiz,
} from '../controllers/submissionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Students or guardians submit assignment answers
router.post('/assignment/:assignmentId', authenticate, submitAssignment);
router.get('/assignment/:assignmentId', authenticate, getSubmissionsForAssignment);

// Quiz submissions
router.post('/quiz/:quizId', authenticate, submitQuiz);
router.get('/quiz/:quizId', authenticate, getSubmissionsForQuiz);

export default router;
