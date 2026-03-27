import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllSessions,
  getActiveSession,
  createSession,
  activateSession,
  updateSession,
  deleteSession,
} from '../controllers/academicSessionController.js';

const router = Router();

// All authenticated users can read sessions
router.get('/', authenticate, authorize('admin', 'staff', 'guardian'), getAllSessions);
router.get('/active', authenticate, authorize('admin', 'staff', 'guardian'), getActiveSession);

// Admin-only mutations
router.post('/', authenticate, authorize('admin'), createSession);
router.patch('/:id/activate', authenticate, authorize('admin'), activateSession);
router.put('/:id', authenticate, authorize('admin'), updateSession);
router.delete('/:id', authenticate, authorize('admin'), deleteSession);

export default router;
