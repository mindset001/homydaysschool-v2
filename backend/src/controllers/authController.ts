import { Request, Response } from 'express';
import { User } from '../models/User.js';
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
