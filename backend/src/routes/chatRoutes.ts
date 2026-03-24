import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getChatMessages,
  postChatMessage,
  markMessagesRead,
  getUnreadCount,
} from '../controllers/chatController.js';

const router = express.Router();

// all authenticated users can read messages
router.get(
  '/messages',
  authenticate,
  authorize('admin', 'staff', 'guardian'),
  getChatMessages
);

// unread count (guardian / staff)
router.get(
  '/messages/unread-count',
  authenticate,
  authorize('guardian', 'staff'),
  getUnreadCount
);

// mark all admin messages as read
router.post(
  '/messages/read',
  authenticate,
  authorize('guardian', 'staff'),
  markMessagesRead
);

// only admins can post new messages
router.post(
  '/message',
  authenticate,
  authorize('admin'),
  postChatMessage
);

export default router;
