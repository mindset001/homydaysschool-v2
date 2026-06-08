import { Router } from 'express';
import { createAttendance, getAttendanceByClass } from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Teachers and admins can create attendance; others can view
router.post('/:classId', authorize('admin', 'staff'), createAttendance);
router.get('/:classId', authorize('admin', 'staff', 'student', 'guardian'), getAttendanceByClass);

export default router;
