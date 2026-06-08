import { Router } from 'express';
import { getHomeAnalytics, getDebtors, resetTermData, migrateTermFees } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/homeanalytic', authorize('admin', 'staff', 'guardian', 'student'), getHomeAnalytics);
router.get('/debtors', authorize('admin'), getDebtors);
router.delete('/reset-term', authorize('admin'), resetTermData);
router.post('/migrate-term-fees', authorize('admin'), migrateTermFees);

export default router;
