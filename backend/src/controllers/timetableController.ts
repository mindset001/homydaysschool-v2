import { Request, Response } from 'express';
import { Timetable } from '../models/Timetable.js';
import { Class } from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// GET /api/timetables — return all timetables (admin/staff) or filter by classId query param
export const getAllTimetables = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, term, academicYear } = req.query;
    const filter: Record<string, any> = {};
    if (classId) filter.classId = classId;
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;

    const timetables = await Timetable.find(filter).sort({ className: 1, term: 1 }).lean();

    // Shape data to match the format the frontend expects:
    // [{ id, name, timetable: [{ days, first_period, ... }] }]
    const shaped = timetables.map((t) => ({
      id: t.classId.toString(),
      name: t.className,
      term: t.term,
      academicYear: t.academicYear,
      timetableId: t._id,
      // Convert Mongoose Map to a plain object so the frontend can read it
      timings: t.timings ? Object.fromEntries(t.timings as Map<string, string>) : {},
      // rename 'day' -> 'days' to match the frontend transform function
      timetable: t.schedule.map((s: any) => ({ ...s, days: s.day })),
    }));

    res.json({ data: shaped });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/timetables/class/:classId
export const getTimetableByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { term, academicYear } = req.query;
    const filter: Record<string, any> = { classId };
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;

    const timetable = await Timetable.findOne(filter).lean();
    if (!timetable) {
      res.status(404).json({ message: 'Timetable not found for this class' });
      return;
    }

    res.json({
      data: {
        id: timetable.classId.toString(),
        name: timetable.className,
        term: timetable.term,
        academicYear: timetable.academicYear,
        timetableId: timetable._id,
        timetable: timetable.schedule,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/timetables — create or replace a timetable for a class+term+year
export const createOrUpdateTimetable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, term, academicYear, schedule, timings } = req.body;

    if (!classId || !term || !academicYear) {
      res.status(400).json({ message: 'classId, term, and academicYear are required' });
      return;
    }

    // Verify class exists
    const cls = await Class.findById(classId).lean();
    if (!cls) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    // Build a full schedule (ensure all 5 days present)
    const builtSchedule = DAYS.map((day) => {
      const existing = (schedule || []).find((s: any) => s.day === day) || {};
      return {
        day,
        first_period:  existing.first_period  || '',
        second_period: existing.second_period || '',
        third_period:  existing.third_period  || '',
        fourth_period: existing.fourth_period || '',
        fifth_period:  existing.fifth_period  || '',
        six_period:    existing.six_period    || '',
        eight_period:  existing.eight_period  || '',
        nineth_period: existing.nineth_period || '',
        tenth_period:  existing.tenth_period  || '',
      };
    });

    const timetable = await Timetable.findOneAndUpdate(
      { classId, term, academicYear },
      { classId, className: (cls as any).name, term, academicYear, schedule: builtSchedule, timings: timings ?? {} },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Timetable saved successfully', data: timetable });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ message: 'Timetable already exists for this class/term/year combination' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// DELETE /api/timetables/:id
export const deleteTimetable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Timetable.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: 'Timetable not found' });
      return;
    }
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
