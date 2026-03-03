import { Response } from 'express';
import { Event } from '../models/Event.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: 1 });
    
    res.json({ data: events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('createdBy', 'firstName lastName email');
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    res.json({ event });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating event with data:', req.body);
    
    const { event, date } = req.body;

    // Validate required fields
    if (!event || !date) {
      res.status(400).json({ message: 'Event name and date are required' });
      return;
    }

    // Parse the date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    // Create Event record
    const newEvent = new Event({
      event,
      date: eventDate,
      createdBy: req.user!.userId,
    });
    
    await newEvent.save();

    const populatedEvent = await Event.findById(newEvent._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({ 
      message: 'Event created successfully', 
      event: populatedEvent 
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('Updating event with ID:', id);
    console.log('Update data:', req.body);
    
    const { event, date } = req.body;
    
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Update Event record
    const eventUpdates: any = {};
    if (event) eventUpdates.event = event;
    if (date) {
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        res.status(400).json({ message: 'Invalid date format' });
        return;
      }
      eventUpdates.date = eventDate;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, eventUpdates, { new: true })
      .populate('createdBy', 'firstName lastName email');
    
    res.json({ 
      message: 'Event updated successfully', 
      event: updatedEvent 
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
