import mongoose from 'mongoose';
import { config } from '../config';
import { Class } from '../models/Class';

const currentYear = new Date().getFullYear();
const academicYear = `${currentYear}/${currentYear + 1}`;

const defaultClasses = [
  { name: 'Creche', grade: 'Creche', section: 'A', academicYear },
  { name: 'KG1', grade: 'KG1', section: 'A', academicYear },
  { name: 'KG2', grade: 'KG2', section: 'A', academicYear },
  { name: 'Nur1', grade: 'Nursery 1', section: 'A', academicYear },
  { name: 'Nur2', grade: 'Nursery 2', section: 'A', academicYear },
  { name: 'Pry1', grade: 'Primary 1', section: 'A', academicYear },
  { name: 'Pry2', grade: 'Primary 2', section: 'A', academicYear },
  { name: 'Pry3', grade: 'Primary 3', section: 'A', academicYear },
  { name: 'Pry4', grade: 'Primary 4', section: 'A', academicYear },
  { name: 'Pry5', grade: 'Primary 5', section: 'A', academicYear },
  { name: 'JSS1', grade: 'Junior Secondary 1', section: 'A', academicYear },
  { name: 'JSS2', grade: 'Junior Secondary 2', section: 'A', academicYear },
  { name: 'JSS3', grade: 'Junior Secondary 3', section: 'A', academicYear },
  { name: 'SS1', grade: 'Senior Secondary 1', section: 'A', academicYear },
  { name: 'SS2', grade: 'Senior Secondary 2', section: 'A', academicYear },
  { name: 'SS3', grade: 'Senior Secondary 3', section: 'A', academicYear },
];

async function seedClasses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Check if classes already exist for this academic year
    const existingClasses = await Class.find({ 
      name: { $in: defaultClasses.map(c => c.name) },
      academicYear 
    });
    
    if (existingClasses.length > 0) {
      console.log(`Classes for academic year ${academicYear} already exist. Skipping seed...`);
      console.log('Existing classes:', existingClasses.map(c => c.name).join(', '));
      await mongoose.disconnect();
      return;
    }

    // Create classes
    const createdClasses = await Class.insertMany(defaultClasses);
    console.log(`\nSuccessfully created ${createdClasses.length} classes for ${academicYear}:`);
    createdClasses.forEach((cls) => {
      console.log(`- ${cls.name} (${cls.grade})`);
    });

    console.log('\n=== Classes Created ===');
    console.log('Academic Year:', academicYear);
    console.log('Total Classes:', createdClasses.length);
    console.log('=======================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding classes:', error);
    process.exit(1);
  }
}

// Run the seed function
seedClasses();
