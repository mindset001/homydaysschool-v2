import { Router } from 'express';
import {
  getAllTimetables,
  getTimetableByClass,
  createOrUpdateTimetable,
  deleteTimetable,
} from '../controllers/timetableController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'staff', 'guardian', 'student'), getAllTimetables);
router.get('/class/:classId', authorize('admin', 'staff', 'guardian', 'student'), getTimetableByClass);
router.post('/', authorize('admin'), createOrUpdateTimetable);
router.delete('/:id', authorize('admin'), deleteTimetable);

export default router;
