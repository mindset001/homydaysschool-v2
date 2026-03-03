import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin', 'staff', 'student', 'guardian'), getAllEvents);
router.get('/:id', authorize('admin', 'staff', 'student', 'guardian'), getEventById);
router.post('/', authorize('admin', 'staff'), createEvent);
router.put('/:id', authorize('admin', 'staff'), updateEvent);
router.patch('/:id', authorize('admin', 'staff'), updateEvent);
router.delete('/:id', authorize('admin', 'staff'), deleteEvent);

export default router;
