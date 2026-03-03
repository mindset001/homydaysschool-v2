import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByStudent,
  getPaymentsByClass,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin', 'staff'), getAllPayments);
router.get('/:id', authorize('admin', 'staff'), getPaymentById);
router.get('/student/:studentId', authorize('admin', 'staff', 'guardian'), getPaymentsByStudent);
router.get('/class/:classId', authorize('admin', 'staff'), getPaymentsByClass);
router.post('/', authorize('admin', 'staff'), createPayment);
router.put('/:id', authorize('admin', 'staff'), updatePayment);
router.patch('/:id', authorize('admin', 'staff'), updatePayment);
router.delete('/:id', authorize('admin'), deletePayment);

export default router;
