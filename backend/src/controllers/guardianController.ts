import { Response } from 'express';
import { Guardian } from '../models/Guardian.js';
import { User } from '../models/User.js';
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
    const userId = req.user?.userId;
    
    // Find guardian by user ID
    const guardian = await Guardian.findOne({ userId })
      .populate({
        path: 'students',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phoneNumber profileImage'
        }
      });
    
    if (!guardian) {
      res.status(404).json({ message: 'Guardian profile not found' });
      return;
    }

    // For each student, also find their class teachers
    const studentsWithTeachers = await Promise.all(
      (guardian.students || []).map(async (studentDoc: any) => {
        const student = studentDoc.toObject ? studentDoc.toObject() : studentDoc;
        const studentClass = student.class || '';
        
        // Find staff assigned to this class
        let classTeachers: any[] = [];
        if (studentClass) {
          const staffRecords = await Staff.find({ 
            classes: { $in: [studentClass] }
          }).populate('userId', 'firstName lastName email phoneNumber profileImage department');
          
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

        return {
          ...student,
          classTeachers,
        };
      })
    );
    
    res.json({ wards: studentsWithTeachers });
  } catch (error: any) {
    console.error('Error fetching guardian wards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific ward (student) by ID for the authenticated guardian
export const getGuardianWardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    // Find guardian by user ID
    const guardian = await Guardian.findOne({ userId })
      .populate({
        path: 'students',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phoneNumber profileImage'
        }
      });
    
    if (!guardian) {
      res.status(404).json({ message: 'Guardian profile not found' });
      return;
    }
    
    // Find the specific ward/student
    const ward = guardian.students?.find((student: any) => student._id.toString() === id);
    
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
    const userId = req.user?.userId;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const guardian = await Guardian.findOne({ userId })
      .populate({
        path: 'students',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phoneNumber profileImage'
        }
      });

    res.json({
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        role: user.role,
        guardianId: guardian?.guardianId,
        occupation: guardian?.occupation,
        relationshipToStudent: guardian?.relationshipToStudent,
        address: guardian?.address,
        alternatePhoneNumber: guardian?.alternatePhoneNumber,
        studentCount: guardian?.students?.length || 0,
      }
    });
  } catch (error: any) {
    console.error('Error fetching guardian profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
