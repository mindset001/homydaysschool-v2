import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      phoneNumber,
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, password: password ? '[PROVIDED]' : '[MISSING]' });

    // Find user (case insensitive email)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found with email:', email.toLowerCase());
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    console.log('User found:', { 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      isActive: user.isActive,
      hasPassword: !!user.password 
    });

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is deactivated');
      res.status(403).json({ message: 'Account is deactivated' });
      return;
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    console.log('Login successful for user:', user.email);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Guardian login via student credentials.
 * The parent/guardian enters their ward's email + password.
 * On success the system returns tokens scoped to the GUARDIAN account.
 */
export const guardianLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, password } = req.body;

    console.log('Guardian login attempt via studentId:', studentId);

    // 1. Find the Student record by studentId
    const student = await Student.findOne({ studentId: studentId.trim().toUpperCase() });
    if (!student) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 2. Find the student User account
    const studentUser = await User.findById(student.userId);
    if (!studentUser || studentUser.role !== 'student') {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!studentUser.isActive) {
      res.status(403).json({ message: 'Student account is deactivated' });
      return;
    }

    // 3. Verify password against student's password
    const isMatch = await comparePassword(password, studentUser.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 4. Issue a guardian-role token scoped to this student — no Guardian record needed
    const payload = {
      userId: studentUser._id.toString(),
      email: studentUser.email,
      role: 'guardian',
      scopedStudentId: student._id.toString(),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    studentUser.refreshToken = refreshToken;
    await studentUser.save();

    console.log('Guardian login successful via studentId:', studentId);

    // Derive a display name from student parent info
    const parentFirstName = student.fathersName?.split(' ')[0] || student.mothersName?.split(' ')[0] || 'Parent';
    const parentLastName = student.fathersName?.split(' ').slice(1).join(' ') || student.mothersName?.split(' ').slice(1).join(' ') || '';

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: studentUser._id,
        email: studentUser.email,
        role: 'guardian',
        firstName: parentFirstName,
        lastName: parentLastName,
        profileImage: studentUser.profileImage,
      },
    });
  } catch (error: any) {
    console.error('Guardian login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    console.log('Refresh token attempt:', { 
      hasToken: !!token, 
      tokenLength: token?.length || 0,
      bodyKeys: Object.keys(req.body)
    });

    if (!token) {
      console.log('No refresh token provided');
      res.status(401).json({ message: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    console.log('Attempting to verify refresh token...');
    const decoded = verifyRefreshToken(token);
    console.log('Token decoded successfully:', { userId: decoded.userId });

    // Find user and verify refresh token
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found for decoded token:', decoded.userId);
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }

    console.log('User found, checking refresh token match:', {
      storedTokenLength: user.refreshToken?.length || 0,
      providedTokenLength: token.length,
      hasStoredToken: !!user.refreshToken
    });

    if (user.refreshToken !== token) {
      console.log('Refresh token mismatch - tokens do not match');
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }

    // Generate new access token
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    console.log('New access token generated for user:', user.email);

    res.json({ accessToken });
  } catch (error: any) {
    console.error('Refresh token error:', error.message);
    res.status(403).json({ message: 'Invalid refresh token', error: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    // Clear refresh token
    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: 'New password must be at least 8 characters' });
      return;
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const adminResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestingUser = (req as any).user;
    if (!requestingUser || requestingUser.role !== 'admin') {
      res.status(403).json({ message: 'Only admins can reset passwords' });
      return;
    }

    const { targetType, targetId, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' });
      return;
    }

    let userDocId: string | undefined;

    if (targetType === 'student') {
      const student = await Student.findById(targetId).populate('userId');
      if (!student) { res.status(404).json({ message: 'Student not found' }); return; }
      userDocId = (student.userId as any)?._id?.toString() || (student.userId as any)?.toString();
    } else if (targetType === 'staff') {
      const staff = await Staff.findById(targetId).populate('userId');
      if (!staff) { res.status(404).json({ message: 'Staff not found' }); return; }
      userDocId = (staff.userId as any)?._id?.toString() || (staff.userId as any)?.toString();
    } else {
      res.status(400).json({ message: 'Invalid targetType. Must be student or staff' });
      return;
    }

    if (!userDocId) {
      res.status(404).json({ message: 'User account not found for this record' });
      return;
    }

    const user = await User.findById(userDocId);
    if (!user) { res.status(404).json({ message: 'User account not found' }); return; }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: `Password reset successfully for ${user.firstName} ${user.lastName}` });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const testCredentials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.json({ 
        success: false,
        message: 'User not found with this email',
        email: email
      });
      return;
    }

    // Check password match
    const isMatch = await comparePassword(password, user.password);
    
    res.json({
      success: isMatch,
      message: isMatch ? 'Credentials are valid' : 'Password does not match',
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive,
        firstName: user.firstName,
        lastName: user.lastName
      },
      passwordTest: {
        inputPassword: password,
        storedPasswordLength: user.password?.length || 0,
        passwordMatches: isMatch
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
