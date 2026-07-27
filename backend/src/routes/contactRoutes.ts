import { Router } from 'express';
import {
  submitContactMessage,
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '../controllers/contactController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public — anyone can submit the landing page contact form
router.post('/', submitContactMessage);

// Everything below requires an authenticated admin
router.use(authenticate);

router.get('/', authorize('admin'), getContactMessages);
router.patch('/:id/read', authorize('admin'), markContactMessageRead);
router.delete('/:id', authorize('admin'), deleteContactMessage);

export default router;
