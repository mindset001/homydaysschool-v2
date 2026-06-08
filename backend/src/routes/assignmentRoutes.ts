import { Router } from 'express';
import { createAssignment, getAssignmentsByClass, addAssignmentMarks, getAssignmentMarks } from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Specific routes must come before dynamic /:classId to avoid param capture
router.post('/marks/:assignmentId', authorize('admin', 'staff'), addAssignmentMarks);
router.get('/marks/:assignmentId', authorize('admin', 'staff', 'student', 'guardian'), getAssignmentMarks);

router.post('/:classId', authorize('admin', 'staff'), createAssignment);
router.get('/:classId', authorize('admin', 'staff', 'student', 'guardian'), getAssignmentsByClass);

export default router;
