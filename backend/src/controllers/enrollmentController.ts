import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { EnrollmentApplication, ENROLLMENT_LEVELS } from '../models/EnrollmentApplication.js';

// Public — submitted from the landing page enroll form
export const submitEnrollmentApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { childFullName, dateOfBirth, desiredLevel, guardianName, guardianEmail, guardianPhone, message } = req.body;

    if (!childFullName || !desiredLevel || !guardianName || !guardianEmail || !guardianPhone) {
      res.status(400).json({ message: 'Child name, desired level, and guardian name/email/phone are required' });
      return;
    }

    if (!ENROLLMENT_LEVELS.includes(desiredLevel)) {
      res.status(400).json({ message: 'Invalid desired level' });
      return;
    }

    const application = await EnrollmentApplication.create({
      childFullName,
      dateOfBirth: dateOfBirth || undefined,
      desiredLevel,
      guardianName,
      guardianEmail,
      guardianPhone,
      message,
    });

    res.status(201).json({ message: 'Application submitted successfully', data: application });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin — list all applications, newest first
export const getEnrollmentApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await EnrollmentApplication.find().sort({ createdAt: -1 });
    res.json({ data: applications });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin — update an application's status
export const updateEnrollmentApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'contacted', 'enrolled', 'declined'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const application = await EnrollmentApplication.findByIdAndUpdate(id, { status }, { new: true });

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    res.json({ message: 'Application updated', data: application });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin — delete an application
export const deleteEnrollmentApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await EnrollmentApplication.findByIdAndDelete(id);

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    res.json({ message: 'Application deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
