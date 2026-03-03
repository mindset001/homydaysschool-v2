import { Request, Response } from 'express';
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
    const message = new Chat({ text, authorRole: role });
    await message.save();
    res.status(201).json({ message });
  } catch (err) {
    console.error('Error posting chat message', err);
    res.status(500).json({ message: 'Error posting chat message' });
  }
};
