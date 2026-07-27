import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ContactMessage } from '../models/ContactMessage.js';

// Public — submitted from the landing page contact form
export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: 'Name, email and message are required' });
      return;
    }

    const contactMessage = await ContactMessage.create({ name, email, phone, message });
    res.status(201).json({ message: 'Message sent successfully', data: contactMessage });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin — list all messages, newest first
export const getContactMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ data: messages });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin — mark a message as read
export const markContactMessageRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const contactMessage = await ContactMessage.findByIdAndUpdate(id, { status: 'read' }, { new: true });

    if (!contactMessage) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    res.json({ message: 'Message marked as read', data: contactMessage });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin — delete a message
export const deleteContactMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const contactMessage = await ContactMessage.findByIdAndDelete(id);

    if (!contactMessage) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    res.json({ message: 'Message deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
