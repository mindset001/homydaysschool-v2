import { Router } from 'express';
import { getClassStats, getClassStatById } from '../controllers/classStatsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin', 'staff'), getClassStats);
router.get('/:id', authorize('admin', 'staff'), getClassStatById);

export default router;
