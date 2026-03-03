import { Response } from 'express';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Guardian } from '../models/Guardian.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await Student.find()
      .populate('userId', 'firstName lastName email phoneNumber profileImage')
      .populate('guardianId');
    
    res.json({ students });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id)
      .populate('userId', 'firstName lastName email phoneNumber profileImage')
      .populate('guardianId');
    
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    res.json({ student });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating student with data:', req.body);
    console.log('File uploaded:', req.file);
    
    const {
      first_name,
      last_name,
      middle_name,
      email,
      phone_number,
      date_of_birth,
      gender,
      home_address,
      home_town,
      state_of_origin,
      country,
      class: studentClass,
      student_class,
      guardian,
      guardian_email,
      fathers_name,
      fathers_occupation,
      fathers_contact,
      mothers_name,
      mothers_occupation,
      mothers_contact,
      religion,
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      res.status(400).json({ message: 'First name and last name are required' });
      return;
    }

    // Generate unique email if not provided
    let generatedEmail: string = '';
    if (email) {
      generatedEmail = email.toLowerCase();
      // Check if provided email already exists
      const existingUser = await User.findOne({ email: generatedEmail });
      if (existingUser) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      }
    } else {
      // Auto-generate unique email
      const baseEmail = `${first_name.toLowerCase()}.${last_name.toLowerCase()}`;
      let emailSuffix = 1;
      let emailExists = true;
      
      while (emailExists) {
        generatedEmail = `${baseEmail}.${emailSuffix}@student.school.com`;
        const existingUser = await User.findOne({ email: generatedEmail });
        if (!existingUser) {
          emailExists = false;
        } else {
          emailSuffix++;
        }
      }
      console.log('Generated unique email:', generatedEmail);
    }

    // Generate a temporary password
    const tempPassword = 'Student@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Handle image upload if provided
    let profileImageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'students');
      profileImageUrl = result.url;
      fs.unlinkSync(req.file.path);
    }

    // Create User record
    const user = new User({
      email: generatedEmail,
      password: hashedPassword,
      role: 'student',
      firstName: first_name,
      lastName: last_name,
      phoneNumber: phone_number,
      profileImage: profileImageUrl,
      isActive: true,
    });
    await user.save();

    // Generate unique studentId
    const studentCount = await Student.countDocuments();
    const studentId = `STU${String(studentCount + 1).padStart(4, '0')}`;

    // Handle guardian creation/lookup if guardian_email is provided
    let guardianId;
    let guardianCreated = false;
    let guardianCredentials = null;
    
    if (guardian_email) {
      // Determine which parent is the guardian
      let guardianName = '';
      let guardianOccupation = '';
      let guardianContact = '';
      let relationshipToStudent = 'Guardian';

      if (guardian && guardian.toLowerCase().includes('father')) {
        guardianName = fathers_name || 'Guardian';
        guardianOccupation = fathers_occupation || '';
        guardianContact = fathers_contact || '';
        relationshipToStudent = 'Father';
      } else if (guardian && guardian.toLowerCase().includes('mother')) {
        guardianName = mothers_name || 'Guardian';
        guardianOccupation = mothers_occupation || '';
        guardianContact = mothers_contact || '';
        relationshipToStudent = 'Mother';
      } else {
        guardianName = fathers_name || mothers_name || 'Guardian';
        guardianOccupation = fathers_occupation || mothers_occupation || '';
        guardianContact = fathers_contact || mothers_contact || '';
      }

      // Check if guardian user already exists (any role)
      let guardianUser = await User.findOne({ email: guardian_email.toLowerCase() });
      
      if (guardianUser && guardianUser.role !== 'guardian') {
        // User exists but with different role - cannot use as guardian
        console.log(`Email ${guardian_email} already exists with role ${guardianUser.role}`);
        res.status(400).json({ 
          message: `Email ${guardian_email} is already registered as ${guardianUser.role}. Please use a different email for guardian.` 
        });
        return;
      }
      
      if (!guardianUser) {
        // Create guardian user account
        const guardianTempPassword = 'Guardian@123';
        const guardianHashedPassword = await bcrypt.hash(guardianTempPassword, 10);
        
        // Split guardian name into first and last name
        const nameParts = guardianName.split(' ');
        const guardianFirstName = nameParts[0] || 'Guardian';
        const guardianLastName = nameParts.slice(1).join(' ') || 'User';

        guardianUser = new User({
          email: guardian_email.toLowerCase(),
          password: guardianHashedPassword,
          role: 'guardian',
          firstName: guardianFirstName,
          lastName: guardianLastName,
          phoneNumber: guardianContact,
          isActive: true,
        });
        await guardianUser.save();
        guardianCreated = true;
        guardianCredentials = {
          email: guardian_email.toLowerCase(),
          password: guardianTempPassword,
        };
        console.log('Created new guardian user:', guardianUser.email);
      }

      // Check if Guardian record exists
      let guardianRecord = await Guardian.findOne({ userId: guardianUser._id });
      
      if (!guardianRecord) {
        // Generate unique guardianId
        const guardianCount = await Guardian.countDocuments();
        const newGuardianId = `GRD${String(guardianCount + 1).padStart(4, '0')}`;

        guardianRecord = new Guardian({
          userId: guardianUser._id,
          guardianId: newGuardianId,
          occupation: guardianOccupation,
          relationshipToStudent: relationshipToStudent,
          students: [],
          address: `${home_address || ''}, ${home_town || ''}, ${state_of_origin || ''}, ${country || ''}`.trim(),
          alternatePhoneNumber: guardianContact,
        });
        await guardianRecord.save();
        console.log('Created new guardian record:', guardianRecord.guardianId);
      }

      guardianId = guardianRecord._id;
    }

    // Use student_class if class is not provided (frontend sends student_class)
    const assignedClass = studentClass || student_class || 'Not Assigned';

    // Create Student record
    const student = new Student({
      userId: user._id,
      studentId,
      class: assignedClass,
      section: 'A',
      admissionDate: new Date(),
      dateOfBirth: date_of_birth ? new Date(date_of_birth) : undefined,
      gender: gender ? gender.toLowerCase() : 'other',
      address: `${home_address || ''}, ${home_town || ''}, ${state_of_origin || ''}, ${country || ''}`.trim(),
      guardianId: guardianId || null,
      // Parent/Guardian Details
      fathersName: fathers_name || '',
      fathersOccupation: fathers_occupation || '',
      fathersContact: fathers_contact || '',
      mothersName: mothers_name || '',
      mothersOccupation: mothers_occupation || '',
      mothersContact: mothers_contact || '',
      homeTown: home_town || '',
      stateOfOrigin: state_of_origin || '',
      country: country || '',
      religion: religion || '',
    });
    await student.save();

    // Add student to guardian's students array if guardian exists
    if (guardianId) {
      await Guardian.findByIdAndUpdate(
        guardianId,
        { $addToSet: { students: student._id } },
        { new: true }
      );
      console.log('Added student to guardian\'s students array');
    }

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'firstName lastName email phoneNumber profileImage')
      .populate({
        path: 'guardianId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phoneNumber profileImage'
        }
      });

    const response: any = { 
      message: 'Student created successfully', 
      student: populatedStudent,
      studentCredentials: {
        email: generatedEmail,
        password: tempPassword,
      },
    };

    if (guardianCreated && guardianCredentials) {
      response.guardianCreated = true;
      response.guardianCredentials = guardianCredentials;
    }

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('Updating student with ID:', id);
    console.log('Update data:', req.body);
    console.log('File uploaded:', req.file);
    
    const {
      first_name,
      last_name,
      middle_name,
      email,
      phone_number,
      date_of_birth,
      gender,
      home_address,
      home_town,
      state_of_origin,
      country,
      class: studentClass,
      guardian_email,
      fathers_name,
      fathers_occupation,
      fathers_contact,
      mothers_name,
      mothers_occupation,
      mothers_contact,
      religion,
    } = req.body;
    
    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Handle image upload if provided
    let profileImageUrl;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'students');
      profileImageUrl = result.url;
      fs.unlinkSync(req.file.path);
    }

    // Update User record
    const userUpdates: any = {};
    if (first_name) userUpdates.firstName = first_name;
    if (last_name) userUpdates.lastName = last_name;
    if (email) userUpdates.email = email.toLowerCase();
    if (phone_number) userUpdates.phoneNumber = phone_number;
    if (profileImageUrl) userUpdates.profileImage = profileImageUrl;

    await User.findByIdAndUpdate(student.userId, userUpdates);

    // Update Student record
    const studentUpdates: any = {};
    if (studentClass) studentUpdates.class = studentClass;
    if (date_of_birth) studentUpdates.dateOfBirth = new Date(date_of_birth);
    if (gender) studentUpdates.gender = gender.toLowerCase();
    if (home_address || home_town || state_of_origin || country) {
      studentUpdates.address = `${home_address || ''}, ${home_town || ''}, ${state_of_origin || ''}, ${country || ''}`.trim();
    }
    // Update parent/guardian details
    if (fathers_name !== undefined) studentUpdates.fathersName = fathers_name;
    if (fathers_occupation !== undefined) studentUpdates.fathersOccupation = fathers_occupation;
    if (fathers_contact !== undefined) studentUpdates.fathersContact = fathers_contact;
    if (mothers_name !== undefined) studentUpdates.mothersName = mothers_name;
    if (mothers_occupation !== undefined) studentUpdates.mothersOccupation = mothers_occupation;
    if (mothers_contact !== undefined) studentUpdates.mothersContact = mothers_contact;
    if (home_town !== undefined) studentUpdates.homeTown = home_town;
    if (state_of_origin !== undefined) studentUpdates.stateOfOrigin = state_of_origin;
    if (country !== undefined) studentUpdates.country = country;
    if (religion !== undefined) studentUpdates.religion = religion;

    // Find guardian if guardian_email is provided
    if (guardian_email) {
      const guardianUser = await User.findOne({ email: guardian_email.toLowerCase(), role: 'guardian' });
      if (guardianUser) {
        const guardian = await Student.findOne({ userId: guardianUser._id });
        if (guardian) {
          studentUpdates.guardianId = guardian._id;
        }
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, studentUpdates, { new: true })
      .populate('userId', 'firstName lastName email phoneNumber profileImage')
      .populate('guardianId');
    
    res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error: any) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByIdAndDelete(id);
    
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const uploadStudentDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'students/documents');
    
    // Delete local file
    fs.unlinkSync(req.file.path);
    
    // Update student document
    const student = await Student.findByIdAndUpdate(
      id,
      {
        $push: {
          documents: {
            type,
            url: result.url,
            uploadedAt: new Date(),
          },
        },
      },
      { new: true }
    );
    
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    res.json({ message: 'Document uploaded successfully', document: result });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
