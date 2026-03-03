import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getChatMessages, postChatMessage } from '../controllers/chatController.js';

const router = express.Router();

// all authenticated users can read messages
router.get(
  '/messages',
  authenticate,
  authorize('admin', 'staff', 'guardian'),
  getChatMessages
);

// only admins can post new messages
router.post(
  '/message',
  authenticate,
  authorize('admin'),
  postChatMessage
);

export default router;
