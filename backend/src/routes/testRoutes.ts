import { Router } from 'express';
import { createTestTemplate, downloadTestTemplate } from '../controllers/testController.js';
import { User } from '../models/User.js';
import { Staff } from '../models/Staff.js'; 
import { Guardian } from '../models/Guardian.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Simple test endpoint (no authentication required)
router.get('/ping', (req, res) => {
  res.json({ message: 'Test route is working!', timestamp: new Date().toISOString() });
});

// Debug guardian data structure   
router.get('/debug-guardians', async (req, res) => {
  try {
    const guardianUsers = await User.find({ role: 'guardian' });
    const guardianRecords = await Guardian.find({});
    
    const debugData = {
      users: guardianUsers.map(u => ({
        id: u._id,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName
      })),
      records: guardianRecords.map(g => ({
        id: g._id,
        userId: g.userId,
        guardianId: g.guardianId,
        occupation: g.occupation,
        relationshipToStudent: g.relationshipToStudent,
        address: g.address,
        alternatePhoneNumber: g.alternatePhoneNumber
      }))
    };
    
    res.json(debugData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Debug staff data structure   
router.get('/debug-staff', async (req, res) => {
  try {
    const staffUsers = await User.find({ role: 'staff' });
    const staffRecords = await Staff.find({});
    
    const debugData = {
      users: staffUsers.map(u => ({
        id: u._id,
        email: u.email,
        role: u.role
      })),
      records: staffRecords.map(s => ({
        id: s._id,
        userId: s.userId,
        staffId: s.staffId,
        department: s.department,
        position: s.position,
        emergencyPhone: s.emergencyContact?.phoneNumber
      }))
    };
    
    res.json(debugData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset staff passwords to phone numbers (for development only)
router.post('/reset-staff-passwords', async (req, res) => {
  try {
    console.log('Starting staff password reset to phone numbers...');
    
    // Get all users with staff role  
    const staffUsers = await User.find({ role: 'staff' });
    console.log(`Found ${staffUsers.length} staff users`);

    // Get all staff records to match phone numbers
    const staffRecords = await Staff.find({});

    let updated = 0;
    for (const user of staffUsers) {
      console.log(`Processing staff user: ${user.email}`);
      
      // Find matching staff record by userId
      const staffRecord = staffRecords.find(s => s.userId.toString() === user._id.toString());
      const phoneNumber = staffRecord?.emergencyContact?.phoneNumber;

      if (staffRecord && phoneNumber) {
        // Hash the phone number as password
        const hashedPassword = await bcrypt.hash(phoneNumber, 10);
        
        // Update the user's password
        await User.findByIdAndUpdate(user._id, { 
          password: hashedPassword 
        });
        
        console.log(`Updated password for staff: ${user.email} -> phone: ${phoneNumber}`);
        updated++;
      } else {
        console.log(`No phone number found for staff: ${user.email}`);
      }
    }

    res.json({ 
      message: 'Staff passwords reset successfully',
      updated: updated,
      total: staffUsers.length
    });
  } catch (error: any) {
    console.error('Error resetting staff passwords:', error);
    res.status(500).json({ message: 'Error resetting passwords', error: error.message });
  }
});

// Set guardian passwords to a default value
router.post('/set-guardian-passwords', async (req, res) => {
  try {
    const guardianUsers = await User.find({ role: 'guardian' });
    const defaultPassword = 'Guardian@123'; // Strong password meeting all requirements
    
    let updated = 0;
    for (const user of guardianUsers) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      updated++;
    }
    
    res.json({
      message: `Guardian passwords set to '${defaultPassword}'`,
      updated: updated,
      total: guardianUsers.length,
      guardians: guardianUsers.map(u => ({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test password verification
router.post('/test-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: 'User not found', email });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    const isMatch12345 = await bcrypt.compare('12345', user.password);
    
    res.json({
      message: 'Password test results',
      email: user.email,
      passwordLength: user.password?.length || 0,
      testedPassword: password,
      matches: isMatch,
      matches12345: isMatch12345,
      hashedPassword: user.password.substring(0, 20) + '...', // Show first 20 chars for debugging
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manually set password for specific staff member
router.post('/set-staff-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password
    const result = await User.findOneAndUpdate(
      { email: email, role: 'staff' },
      { password: hashedPassword },
      { new: true }
    );
    
    if (result) {
      res.json({ 
        message: `Password updated for ${email}`,
        success: true
      });
    } else {
      res.status(404).json({ message: 'Staff user not found' });
    }
  } catch (error: any) {
    console.error('Error setting staff password:', error);
    res.status(500).json({ message: 'Error setting password', error: error.message });
  }
});

// Test routes (no authentication required for testing)
router.post('/create-test-template', createTestTemplate);
router.get('/download/:filename', downloadTestTemplate);

export default router;