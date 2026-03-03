import mongoose from 'mongoose';
import { Subject } from '../models/Subject.js';
import { config } from '../config/index.js';

const subjects = [
  { name: 'Mathematics', code: 'MTH', description: 'General Mathematics' },
  { name: 'English Language', code: 'ENG', description: 'English Language and Literature' },
  { name: 'Biology', code: 'BIO', description: 'Biological Sciences' },
  { name: 'Chemistry', code: 'CHM', description: 'Chemical Sciences' },
  { name: 'Physics', code: 'PHY', description: 'Physical Sciences' },
  { name: 'Agricultural Science', code: 'AGR', description: 'Agricultural Studies' },
  { name: 'Economics', code: 'ECO', description: 'Economics' },
  { name: 'Commerce', code: 'COM', description: 'Commerce and Business Studies' },
  { name: 'Accounting', code: 'ACC', description: 'Financial Accounting' },
  { name: 'Government', code: 'GOV', description: 'Government and Civics' },
  { name: 'Geography', code: 'GEO', description: 'Physical and Human Geography' },
  { name: 'Civic Education', code: 'CIV', description: 'Civic Education' },
  { name: 'Christian Religious Studies', code: 'CRS', description: 'Christian Religious Knowledge' },
  { name: 'Islamic Religious Studies', code: 'IRS', description: 'Islamic Religious Knowledge' },
  { name: 'History', code: 'HIS', description: 'History' },
  { name: 'Literature in English', code: 'LIT', description: 'Literature Studies' },
  { name: 'French', code: 'FRE', description: 'French Language' },
  { name: 'Yoruba', code: 'YOR', description: 'Yoruba Language' },
  { name: 'Igbo', code: 'IGB', description: 'Igbo Language' },
  { name: 'Hausa', code: 'HAU', description: 'Hausa Language' },
  { name: 'Computer Studies', code: 'CMP', description: 'Computer Science and ICT' },
  { name: 'Further Mathematics', code: 'F-MTH', description: 'Advanced Mathematics' },
  { name: 'Technical Drawing', code: 'TEC', description: 'Technical Drawing and Design' },
  { name: 'Home Economics', code: 'HEC', description: 'Home Economics and Food & Nutrition' },
  { name: 'Music', code: 'MUS', description: 'Music and Creative Arts' },
  { name: 'Fine Arts', code: 'ART', description: 'Fine Arts and Visual Arts' },
  { name: 'Physical Education', code: 'PHE', description: 'Physical and Health Education' },
  { name: 'Basic Science', code: 'BSC', description: 'Basic Science (Junior Secondary)' },
  { name: 'Basic Technology', code: 'BTE', description: 'Basic Technology (Junior Secondary)' },
  { name: 'Social Studies', code: 'SST', description: 'Social Studies (Junior Secondary)' },
];

const seedSubjects = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    // Insert new subjects
    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`Successfully seeded ${createdSubjects.length} subjects`);

    console.log('\nSeeded subjects:');
    createdSubjects.forEach((subject) => {
      console.log(`- ${subject.name} (${subject.code})`);
    });

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding subjects:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedSubjects();
