import { Response } from 'express';
import { Subject } from '../models/Subject.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    
    res.json({ 
      data: subjects.map(subject => ({
        id: subject._id,
        name: subject.name,
        description: subject.description || '',
        code: subject.code || '',
      }))
    });
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSubjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findById(id);
    
    if (!subject) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }
    
    res.json({ 
      data: {
        id: subject._id,
        name: subject.name,
        description: subject.description || '',
        code: subject.code || '',
      }
    });
  } catch (error: any) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, code } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Subject name is required' });
      return;
    }

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      res.status(400).json({ message: 'Subject already exists' });
      return;
    }

    const subject = new Subject({
      name,
      description,
      code,
    });

    await subject.save();

    res.status(201).json({ 
      message: 'Subject created successfully', 
      data: {
        id: subject._id,
        name: subject.name,
        description: subject.description || '',
        code: subject.code || '',
      }
    });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, code } = req.body;

    const subject = await Subject.findById(id);
    
    if (!subject) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }

    if (name && name !== subject.name) {
      const existingSubject = await Subject.findOne({ name });
      if (existingSubject) {
        res.status(400).json({ message: 'Subject name already exists' });
        return;
      }
      subject.name = name;
    }

    if (description !== undefined) subject.description = description;
    if (code !== undefined) subject.code = code;

    await subject.save();

    res.json({ 
      message: 'Subject updated successfully', 
      data: {
        id: subject._id,
        name: subject.name,
        description: subject.description || '',
        code: subject.code || '',
      }
    });
  } catch (error: any) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByIdAndDelete(id);
    
    if (!subject) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
