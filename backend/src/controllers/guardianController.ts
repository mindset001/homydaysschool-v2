import { Response } from 'express';
import { Guardian } from '../models/Guardian.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';
import { Staff } from '../models/Staff.js';

export const getAllGuardians = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const guardians = await Guardian.find()
      .populate('userId', 'firstName lastName email phoneNumber profileImage')
      .populate('students');
    
    res.json({ guardians });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGuardianById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const guardian = await Guardian.findById(id)
      .populate('userId', 'firstName lastName email phoneNumber profileImage')
      .populate('students');
    
    if (!guardian) {
      res.status(404).json({ message: 'Guardian not found' });
      return;
    }
    
    res.json({ guardian });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createGuardian = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const guardianData = req.body;
    
    const user = await User.findById(guardianData.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const guardian = new Guardian(guardianData);
    await guardian.save();
    
    res.status(201).json({ message: 'Guardian created successfully', guardian });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateGuardian = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const guardian = await Guardian.findByIdAndUpdate(id, updates, { new: true })
      .populate('userId', 'firstName lastName email phoneNumber profileImage');
    
    if (!guardian) {
      res.status(404).json({ message: 'Guardian not found' });
      return;
    }
    
    res.json({ message: 'Guardian updated successfully', guardian });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteGuardian = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const guardian = await Guardian.findByIdAndDelete(id);
    
    if (!guardian) {
      res.status(404).json({ message: 'Guardian not found' });
      return;
    }
    
    res.json({ message: 'Guardian deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all wards (students) for the authenticated guardian
export const getGuardianWards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scopedStudentId = req.user?.scopedStudentId;

    if (!scopedStudentId) {
      res.status(403).json({ message: 'No student scope in session' });
      return;
    }

    // Fetch the scoped student directly — no Guardian record needed
    const studentDoc = await Student.findById(scopedStudentId)
      .populate('userId', 'firstName lastName email phoneNumber profileImage');

    if (!studentDoc) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    const student = studentDoc.toObject() as any;
    const studentClass = student.class || '';

    // Find class teachers
    let classTeachers: any[] = [];
    if (studentClass) {
      const staffRecords = await Staff.find({ classes: { $in: [studentClass] } })
        .populate('userId', 'firstName lastName email phoneNumber profileImage department');

      classTeachers = staffRecords.map((s: any) => {
        const staffObj = s.toObject();
        const userObj = staffObj.userId || {};
        return {
          id: staffObj._id,
          staffId: staffObj.staffId,
          name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim(),
          email: userObj.email || '',
          phone: userObj.phoneNumber || '',
          image: userObj.profileImage || '',
          subject: staffObj.department || '',
          position: staffObj.position || '',
        };
      });
    }

    res.json({ wards: [{ ...student, classTeachers }] });
  } catch (error: any) {
    console.error('Error fetching guardian wards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific ward (student) by ID for the authenticated guardian
export const getGuardianWardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const scopedStudentId = req.user?.scopedStudentId;

    // Block access to any student other than the scoped one
    if (!scopedStudentId || id !== scopedStudentId) {
      res.status(403).json({ message: 'Access denied to this student record' });
      return;
    }

    const ward = await Student.findById(scopedStudentId)
      .populate('userId', 'firstName lastName email phoneNumber profileImage');

    if (!ward) {
      res.status(404).json({ message: 'Ward not found' });
      return;
    }

    res.json({ ward });
  } catch (error: any) {
    console.error('Error fetching ward by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get guardian's own profile
export const getGuardianProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scopedStudentId = req.user?.scopedStudentId;

    if (!scopedStudentId) {
      res.status(403).json({ message: 'No student scope in session' });
      return;
    }

    // Derive profile from the student's parent fields — no Guardian record needed
    const student = await Student.findById(scopedStudentId)
      .populate('userId', 'firstName lastName email phoneNumber profileImage');

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    const s = student.toObject() as any;
    const guardianName = s.fathersName || s.mothersName || 'Parent';
    const nameParts = guardianName.split(' ');

    res.json({
      profile: {
        id: s.userId?._id || null,
        firstName: nameParts[0] || 'Parent',
        lastName: nameParts.slice(1).join(' ') || '',
        email: s.userId?.email || '',
        phoneNumber: s.fathersContact || s.mothersContact || '',
        profileImage: s.userId?.profileImage || '',
        role: 'guardian',
        occupation: s.fathersOccupation || s.mothersOccupation || '',
        relationshipToStudent: s.fathersName ? 'Father' : 'Mother',
        address: s.address || '',
        studentCount: 1,
      }
    });
  } catch (error: any) {
    console.error('Error fetching guardian profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
