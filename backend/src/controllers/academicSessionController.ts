import { Response } from 'express';
import { AcademicSession } from '../models/AcademicSession.js';
import { AuthRequest } from '../middleware/auth.js';

/** GET /api/academic-sessions — all sessions, newest first */
export const getAllSessions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await AcademicSession.find().sort({ createdAt: -1 });
    res.json({ data: sessions });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** GET /api/academic-sessions/active — the currently active session (any authenticated user) */
export const getActiveSession = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await AcademicSession.findOne({ isActive: true });
    res.json({ data: session ?? null });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** POST /api/academic-sessions — create a new session (admin only) */
export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { academicYear, term, startDate, endDate, setActive } = req.body;

    if (!academicYear || !term) {
      res.status(400).json({ message: 'academicYear and term are required' });
      return;
    }

    // If setActive, deactivate all others first
    if (setActive) {
      await AcademicSession.updateMany({}, { isActive: false });
    }

    const session = await AcademicSession.create({
      academicYear: academicYear.trim(),
      term,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      isActive: !!setActive,
    });

    res.status(201).json({ message: 'Session created', data: session });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'A session for that academic year and term already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** PATCH /api/academic-sessions/:id/activate — set a session as active (admin only) */
export const activateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Deactivate all, then activate the chosen one atomically
    await AcademicSession.updateMany({}, { isActive: false });
    const session = await AcademicSession.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    res.json({ message: 'Session activated', data: session });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** PUT /api/academic-sessions/:id — update dates (admin only) */
export const updateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate, academicYear, term } = req.body;

    const session = await AcademicSession.findByIdAndUpdate(
      id,
      { startDate, endDate, academicYear, term },
      { new: true, runValidators: true }
    );

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    res.json({ message: 'Session updated', data: session });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'A session for that academic year and term already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/** DELETE /api/academic-sessions/:id — admin only, cannot delete active session */
export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await AcademicSession.findById(id);

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    if (session.isActive) {
      res.status(400).json({ message: 'Cannot delete the active session. Activate another session first.' });
      return;
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
