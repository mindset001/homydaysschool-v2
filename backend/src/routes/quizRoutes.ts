import { Router } from 'express';
import { createQuiz, getQuizzesByClass, addQuizMarks, getQuizMarks } from '../controllers/quizController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Specific routes must come before dynamic /:classId to avoid param capture
router.post('/marks/:quizId', authorize('admin', 'staff'), addQuizMarks);
router.get('/marks/:quizId', authorize('admin', 'staff', 'student', 'guardian'), getQuizMarks);

router.post('/:classId', authorize('admin', 'staff'), createQuiz);
router.get('/:classId', authorize('admin', 'staff', 'student', 'guardian'), getQuizzesByClass);

export default router;
