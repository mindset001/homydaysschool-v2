import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User } from '../models/User';

const defaultUsers = [
  {
    email: 'admin@school.com',
    password: 'Admin@123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '+1234567890',
    isActive: true,
  },
  {
    email: 'staff@school.com',
    password: 'Staff@123',
    role: 'staff',
    firstName: 'Staff',
    lastName: 'Member',
    phoneNumber: '+1234567891',
    isActive: true,
  },
  {
    email: 'student@school.com',
    password: 'Student@123',
    role: 'student',
    firstName: 'Test',
    lastName: 'Student',
    phoneNumber: '+1234567892',
    isActive: true,
  },
  {
    email: 'guardian@school.com',
    password: 'Guardian@123',
    role: 'guardian',
    firstName: 'Test',
    lastName: 'Guardian',
    phoneNumber: '+1234567893',
    isActive: true,
  },
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.find({ email: { $in: defaultUsers.map(u => u.email) } });
    
    if (existingUsers.length > 0) {
      console.log('Default users already exist. Skipping seed...');
      console.log('Existing users:', existingUsers.map(u => u.email));
      await mongoose.disconnect();
      return;
    }

    // Hash passwords and create users
    const usersToCreate = await Promise.all(
      defaultUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`Successfully created ${createdUsers.length} users:`);
    createdUsers.forEach((user) => {
      console.log(`- ${user.role}: ${user.email}`);
    });

    console.log('\n=== Default Login Credentials ===');
    defaultUsers.forEach((user) => {
      console.log(`\n${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
    });
    console.log('\n================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

// Run the seed function
seedUsers();
