import { Response } from 'express';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllClasses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName');
    
    res.json({ classes });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getClassById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const classData = await Class.findById(id)
      .populate('teacher', 'firstName lastName email phoneNumber')
      .populate('students', 'firstName lastName studentId');
    
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    res.json({ class: classData });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classData = req.body;
    const teacherId = classData.teacher;

    const newClass = new Class(classData);
    await newClass.save();

    // if a teacher was specified, add this class to their record
    if (teacherId) {
      const name = newClass.name;
      await Staff.findByIdAndUpdate(teacherId, { $addToSet: { classes: name } });
    }

    const populated = await Class.findById(newClass._id)
      .populate('teacher', 'firstName lastName email');

    res.status(201).json({ message: 'Class created successfully', class: populated });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // fetch current class info to track teacher changes
    const oldClass = await Class.findById(id);
    const oldTeacherId = oldClass?.teacher ? oldClass.teacher.toString() : null;
    const className = oldClass?.name || '';

    const classData = await Class.findByIdAndUpdate(id, updates, { new: true })
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName');

    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    // if teacher field was part of update, maintain staff assignments
    if ('teacher' in updates) {
      const newTeacherId = updates.teacher;

      // remove class from old teacher
      if (oldTeacherId && oldTeacherId !== newTeacherId) {
        await Staff.findByIdAndUpdate(oldTeacherId, { $pull: { classes: className } });
      }

      // add class to new teacher (if provided)
      if (newTeacherId) {
        await Staff.findByIdAndUpdate(newTeacherId, { $addToSet: { classes: className } });
      }
    }

    res.json({ message: 'Class updated successfully', class: classData });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const classData = await Class.findByIdAndDelete(id);
    
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    // if class had a teacher, remove class name from their record
    if (classData.teacher) {
      const name = classData.name;
      await Staff.findByIdAndUpdate(classData.teacher, { $pull: { classes: name } });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addStudentToClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    
    const classData = await Class.findByIdAndUpdate(
      id,
      { $addToSet: { students: studentId } },
      { new: true }
    ).populate('students', 'firstName lastName');
    
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    res.json({ message: 'Student added to class successfully', class: classData });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeStudentFromClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, studentId } = req.params;
    
    const classData = await Class.findByIdAndUpdate(
      id,
      { $pull: { students: studentId } },
      { new: true }
    ).populate('students', 'firstName lastName');
    
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    res.json({ message: 'Student removed from class successfully', class: classData });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addSubjectsToClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { subjects } = req.body;
    
    if (!Array.isArray(subjects)) {
      res.status(400).json({ message: 'Subjects must be an array' });
      return;
    }
    
    const classData = await Class.findByIdAndUpdate(
      id,
      { $addToSet: { subjects: { $each: subjects } } },
      { new: true }
    );
    
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    res.json({ message: 'Subjects added to class successfully', class: classData });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeSubjectFromClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { subject } = req.body;
    
    const classData = await Class.findByIdAndUpdate(
      id,
      { $pull: { subjects: subject } },
      { new: true }
    );
    
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    res.json({ message: 'Subject removed from class successfully', class: classData });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentsByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('Fetching students for class ID:', id);

    // Find class to verify it exists and get the class name
    const classData = await Class.findById(id);
    if (!classData) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    // Find all students in this class
    const students = await Student.find({ class: classData.name })
      .populate('userId', 'firstName lastName email phoneNumber profileImage')
      .populate({
        path: 'guardianId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phoneNumber'
        }
      });

    console.log(`Found ${students.length} students for class ${classData.name}`);
    res.json({ students, class: classData });
  } catch (error: any) {
    console.error('Error fetching students by class:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
