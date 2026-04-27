import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByStudent,
  getPaymentsByClass,
  createPayment,
  updatePayment,
  deletePayment,
  getStudentTermSummary,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ── Specific routes MUST come before the generic /:id catch-all ──────────────
// Class-level payments
router.get('/class/:classId', authorize('admin', 'staff'), getPaymentsByClass);

// Student-level routes (both must be before /:id)
router.get('/student/:studentId/term-summary', authorize('admin', 'staff', 'guardian'), getStudentTermSummary);
router.get('/student/:studentId', authorize('admin', 'staff', 'guardian'), getPaymentsByStudent);

// ── Generic routes ────────────────────────────────────────────────────────────
router.get('/', authorize('admin', 'staff'), getAllPayments);
router.get('/:id', authorize('admin', 'staff'), getPaymentById);
router.post('/', authorize('admin', 'staff'), createPayment);
router.put('/:id', authorize('admin', 'staff'), updatePayment);
router.patch('/:id', authorize('admin', 'staff'), updatePayment);
router.delete('/:id', authorize('admin'), deletePayment);

export default router;
