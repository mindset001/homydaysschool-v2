import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import { AuthRequest } from '../middleware/auth.js';

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Chat.find().sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching chat messages', err);
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
};

export const postChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Message text is required' });
    }
    const role = req.user?.role || 'unknown';
    const message = new Chat({ text, authorRole: role, readBy: [] });
    await message.save();
    res.status(201).json({ message });
  } catch (err) {
    console.error('Error posting chat message', err);
    res.status(500).json({ message: 'Error posting chat message' });
  }
};

/** Mark all admin messages as read for the current user */
export const markMessagesRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    await Chat.updateMany(
      { authorRole: 'admin', readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read', err);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

/** Return count of admin messages not yet read by the current user */
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const count = await Chat.countDocuments({
      authorRole: 'admin',
      readBy: { $ne: userId },
    });
    res.json({ count });
  } catch (err) {
    console.error('Error fetching unread count', err);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};
