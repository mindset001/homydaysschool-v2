import { Response } from 'express';
import { Attendance } from '../models/Attendance.js';
import { Class } from '../models/Class.js';
import { Staff } from '../models/Staff.js';
import { AuthRequest } from '../middleware/auth.js';

export const createAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { date, present = [], absent = [], notes } = req.body;

    // ensure class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    // Staff can only mark attendance for their assigned class
    if (req.user?.role === 'staff') {
      const staff = await Staff.findOne({ userId: req.user.userId }).lean();
      if (!staff || !staff.classes?.includes(classData.name)) {
        res.status(403).json({ message: 'You are not assigned to this class' });
        return;
      }
    }

    const attendanceDate = date ? new Date(date) : new Date();

    // upsert by class+date
    const attendance = await Attendance.findOneAndUpdate(
      { classId, date: attendanceDate },
      { classId, date: attendanceDate, teacher: req.user!.userId, present, absent, notes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Attendance recorded', attendance });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAttendanceByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const query: any = { classId };
    if (date) query.date = new Date(String(date));

    const records = await Attendance.find(query).populate('teacher', 'firstName lastName');
    res.json({ attendance: records });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
