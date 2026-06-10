import { Router } from 'express';
import { upsertWeeklyReview, getReviewsByClass, getReviewsForWard } from '../controllers/weeklyReviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize('admin', 'staff'), upsertWeeklyReview);
router.get('/class/:classId', authorize('admin', 'staff'), getReviewsByClass);
router.get('/ward/:studentId', authorize('admin', 'staff', 'guardian'), getReviewsForWard);

export default router;
