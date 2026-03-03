import { Router } from 'express';
import { getHomeAnalytics } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/homeanalytic', authorize('admin', 'staff', 'guardian', 'student'), getHomeAnalytics);

export default router;
