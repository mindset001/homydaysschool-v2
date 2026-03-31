/**
 * Migration: Replace STU prefix with HMC (JSS/SSS) or HMP (others)
 * Run: npm run migrate:studentIds
 */
import mongoose from 'mongoose';
import { config } from '../config';
import { Student } from '../models/Student';

const getPrefix = (className: string): 'HMC' | 'HMP' => {
  const upper = (className || '').toUpperCase().trim();
  return upper.startsWith('JSS') || upper.startsWith('SSS') ? 'HMC' : 'HMP';
};

const run = async () => {
  await mongoose.connect(config.mongodb.uri);
  console.log('Connected to MongoDB');

  // Fetch only students whose IDs still start with STU
  const students = await Student.find({ studentId: /^STU/ }).select('_id studentId class').lean();

  if (students.length === 0) {
    console.log('No students with STU prefix found. Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${students.length} student(s) with STU prefix. Starting migration...`);

  // Track next available number per prefix to avoid collisions
  const counters: Record<string, number> = { HMC: 0, HMP: 0 };

  // Seed counters from existing HMC/HMP IDs so we don't overwrite them
  const existingNew = await Student.find({ studentId: /^(HMC|HMP)\d+$/ }).select('studentId').lean();
  for (const s of existingNew) {
    const sid = s.studentId as string;
    const pfx = sid.substring(0, 3) as 'HMC' | 'HMP';
    const num = parseInt(sid.substring(3), 10);
    if (!isNaN(num) && num > counters[pfx]) counters[pfx] = num;
  }

  let updated = 0;
  let skipped = 0;

  for (const student of students) {
    const prefix = getPrefix(student.class as string);
    counters[prefix]++;
    let newId = `${prefix}${String(counters[prefix]).padStart(4, '0')}`;

    // Ensure no collision (edge case)
    while (await Student.exists({ studentId: newId })) {
      counters[prefix]++;
      newId = `${prefix}${String(counters[prefix]).padStart(4, '0')}`;
    }

    try {
      await Student.updateOne({ _id: student._id }, { $set: { studentId: newId } });
      console.log(`  ${student.studentId}  →  ${newId}  (class: ${student.class})`);
      updated++;
    } catch (err) {
      console.error(`  Failed to update ${student.studentId}:`, err);
      skipped++;
    }
  }

  console.log(`\nMigration complete: ${updated} updated, ${skipped} failed.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
