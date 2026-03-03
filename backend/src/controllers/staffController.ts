import { Response } from 'express';
import { Staff } from '../models/Staff.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

export const getAllStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await Staff.find()
      .populate('userId', 'firstName lastName email phoneNumber profileImage');
    
    res.json({ staff });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStaffById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findById(id)
      .populate('userId', 'firstName lastName email phoneNumber profileImage');
    
    if (!staff) {
      res.status(404).json({ message: 'Staff not found' });
      return;
    }
    
    res.json({ staff });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// new helper: return profile for the authenticated staff user
export const getMyStaffProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId; // our AuthRequest defines userId
    if (!userId) {
      res.status(400).json({ message: 'User id missing from token' });
      return;
    }

    const staff = await Staff.findOne({ userId })
      .populate('userId', 'firstName lastName email phoneNumber profileImage');

    if (!staff) {
      res.status(404).json({ message: 'Staff profile not found' });
      return;
    }

    res.json({ staff });
  } catch (error: any) {
    console.error('Error fetching own staff profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating staff with data:', req.body);
    console.log('File uploaded:', req.file);
    
    const {
      title,
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
      qualification,
      subject,
      assigned_to,
    } = req.body;

    // Validate essential fields
    if (!email || !first_name || !last_name) {
      res.status(400).json({ message: 'Email, first name and last name are required' });
      return;
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Determine initial password: use phone if provided, else fall back to default
    const plainPassword = phone_number || 'Staff@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Handle image upload if provided
    let profileImageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'staff');
      profileImageUrl = result.url;
      // Delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    // Create User record
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'staff',
      firstName: first_name,
      lastName: last_name,
      phoneNumber: phone_number,
      profileImage: profileImageUrl,
      isActive: true,
    });
    await user.save();

    // Generate unique staffId
    const staffCount = await Staff.countDocuments();
    const staffId = `STF${String(staffCount + 1).padStart(4, '0')}`;

    // Create Staff record
    const staff = new Staff({
      userId: user._id,
      staffId,
      department: subject || 'General',
      position: title || 'Teacher',
      dateOfJoining: new Date(),
      dateOfBirth: new Date(date_of_birth),
      gender: gender.toLowerCase(),
      address: `${home_address}, ${home_town}, ${state_of_origin}, ${country}`,
      qualification: [qualification],
      subjects: subject ? [subject] : [],
      classes: assigned_to ? [assigned_to] : [],
    });
    await staff.save();

    const populatedStaff = await Staff.findById(staff._id)
      .populate('userId', 'firstName lastName email phoneNumber profileImage');

    res.status(201).json({ 
      message: 'Staff created successfully. Login with email and phone number as password.', 
      staff: populatedStaff,
    });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Updating staff with ID:', req.params.id);
    console.log('Update data:', req.body);
    console.log('File uploaded:', req.file);
    
    const { id } = req.params;
    const {
      title,
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
      qualification,
      subject,
      assigned_to,
    } = req.body;

    // Find the staff record
    const staff = await Staff.findById(id);
    if (!staff) {
      res.status(404).json({ message: 'Staff not found' });
      return;
    }

    // Handle image upload if provided
    let profileImageUrl = staff.userId ? (await User.findById(staff.userId))?.profileImage : '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'staff');
      profileImageUrl = result.url;
      // Delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    // Update User record if user data is provided
    if (staff.userId && (first_name || last_name || email || phone_number || profileImageUrl)) {
      const userUpdates: any = {};
      if (first_name) userUpdates.firstName = first_name;
      if (last_name) userUpdates.lastName = last_name;
      if (email) userUpdates.email = email.toLowerCase();
      if (phone_number) {
        userUpdates.phoneNumber = phone_number;
        // Update password to match new phone number
        userUpdates.password = await bcrypt.hash(phone_number, 10);
      }
      if (profileImageUrl) userUpdates.profileImage = profileImageUrl;

      await User.findByIdAndUpdate(staff.userId, userUpdates);
    }

    // Update Staff record
    const staffUpdates: any = {};
    if (title) staffUpdates.position = title;
    if (subject) {
      staffUpdates.department = subject;
      staffUpdates.subjects = [subject];
    }
    if (date_of_birth) staffUpdates.dateOfBirth = new Date(date_of_birth);
    if (gender) staffUpdates.gender = gender.toLowerCase();
    if (home_address || home_town || state_of_origin || country) {
      staffUpdates.address = `${home_address || ''}, ${home_town || ''}, ${state_of_origin || ''}, ${country || ''}`.trim();
    }
    if (qualification) staffUpdates.qualification = [qualification];
    if (assigned_to) staffUpdates.classes = [assigned_to];

    const updatedStaff = await Staff.findByIdAndUpdate(id, staffUpdates, { new: true })
      .populate('userId', 'firstName lastName email phoneNumber profileImage');

    res.json({ message: 'Staff updated successfully', staff: updatedStaff });
  } catch (error: any) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const staff = await Staff.findByIdAndDelete(id);
    
    if (!staff) {
      res.status(404).json({ message: 'Staff not found' });
      return;
    }
    
    res.json({ message: 'Staff deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const uploadStaffDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    const result = await uploadToCloudinary(req.file.path, 'staff/documents');
    fs.unlinkSync(req.file.path);
    
    const staff = await Staff.findByIdAndUpdate(
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
    
    if (!staff) {
      res.status(404).json({ message: 'Staff not found' });
      return;
    }
    
    res.json({ message: 'Document uploaded successfully', document: result });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetStaffPasswordsToPhoneNumbers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all staff with their user data
    const allStaff = await Staff.find().populate('userId');
    
    let updatedCount = 0;
    let errorCount = 0;
    const details: any[] = [];

    for (const staff of allStaff) {
      try {
        if (staff.userId) {
          const user = await User.findById(staff.userId);
          if (user && user.phoneNumber) {
            // Update password to phone number
            const hashedPassword = await bcrypt.hash(user.phoneNumber, 10);
            user.password = hashedPassword;
            await user.save();
            updatedCount++;
            details.push({
              email: user.email,
              phoneNumber: user.phoneNumber,
              status: 'updated'
            });
          } else {
            details.push({
              userId: staff.userId,
              status: 'no phone number'
            });
          }
        }
      } catch (err) {
        console.error(`Error updating staff ${staff._id}:`, err);
        errorCount++;
        details.push({
          staffId: staff._id,
          status: 'error',
          error: err
        });
      }
    }

    res.json({ 
      message: 'Staff passwords reset successfully',
      updated: updatedCount,
      errors: errorCount,
      total: allStaff.length,
      details: details
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const debugStaffLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    
    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.json({ 
        message: 'User not found',
        email: email,
        searchedEmail: email.toLowerCase()
      });
      return;
    }

    // Find associated staff record
    const staff = await Staff.findOne({ userId: user._id });
    
    // Test if password might be the old default
    const isOldPassword = await bcrypt.compare('Staff@123', user.password);
    const isPhonePassword = user.phoneNumber ? await bcrypt.compare(user.phoneNumber, user.password) : false;
    
    res.json({
      message: 'User found',
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
        firstName: user.firstName,
        lastName: user.lastName
      },
      staff: staff ? {
        id: staff._id,
        staffId: staff.staffId,
        department: staff.department,
        position: staff.position
      } : null,
      passwordInfo: {
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0,
        isOldDefaultPassword: isOldPassword,
        matchesPhoneNumber: isPhonePassword,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get staff by class name
export const getStaffByClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { className } = req.params;
    
    // Find staff who are assigned to the specified class
    const staff = await Staff.find({ classes: { $in: [className] } })
      .populate('userId', 'firstName lastName email phoneNumber profileImage');
    
    res.json({ 
      message: 'Staff retrieved successfully',
      staff: staff,
      className: className
    });
  } catch (error: any) {
    console.error('Error fetching staff by class:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
