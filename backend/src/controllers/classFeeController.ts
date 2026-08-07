import { Response } from 'express';
import { ClassFee } from '../models/ClassFee.js';
import { AuthRequest } from '../middleware/auth.js';

// GET /api/class-fees?academicYear=2026/2027&term=First Term
// Omit query params to list every fee ever set.
export const getClassFees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { academicYear, term } = req.query as { academicYear?: string; term?: string };
    const filter: any = {};
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;

    const fees = await ClassFee.find(filter).sort({ className: 1 });
    res.json({ fees });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/class-fees
// Body: { className, academicYear, term, amount } — upserts the fee for
// that exact (class, session) combination. Does not touch any other term.
export const setClassFee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { className, academicYear, term, amount } = req.body;

    if (!className || !academicYear || !term || amount === undefined) {
      res.status(400).json({ message: 'className, academicYear, term and amount are required' });
      return;
    }

    const fee = await ClassFee.findOneAndUpdate(
      { className, academicYear, term },
      { $set: { amount: Number(amount) } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Fee saved successfully', fee });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/class-fees/:id — clears a fee so that term goes back to $0 due
export const deleteClassFee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const fee = await ClassFee.findByIdAndDelete(id);
    if (!fee) {
      res.status(404).json({ message: 'Fee not found' });
      return;
    }
    res.json({ message: 'Fee deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
