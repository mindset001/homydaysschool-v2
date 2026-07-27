import { Router } from 'express';
import {
  submitEnrollmentApplication,
  getEnrollmentApplications,
  updateEnrollmentApplicationStatus,
  deleteEnrollmentApplication,
} from '../controllers/enrollmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public — anyone can submit the landing page enroll form
router.post('/', submitEnrollmentApplication);

// Everything below requires an authenticated admin
router.use(authenticate);

router.get('/', authorize('admin'), getEnrollmentApplications);
router.patch('/:id/status', authorize('admin'), updateEnrollmentApplicationStatus);
router.delete('/:id', authorize('admin'), deleteEnrollmentApplication);

export default router;
