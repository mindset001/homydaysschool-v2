/**
 * Seed First Term 2025/2026 payments for ALL students.
 *
 * - Uses each student's class fee as the full payment amount (fully Paid).
 * - Skips students who already have a First Term 2025/2026 payment.
 * - Uses the first admin user found as "receivedBy".
 *
 * Run: cd backend && npx tsx src/scripts/seedFirstTermPayments.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Class } from '../models/Class.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI!;

const ACADEMIC_YEAR = '2025/2026';
const TERM = 'First Term' as const;

function computeTermFee(classDoc: any): number {
  return (
    (classDoc.schoolFee || 0) +
    (classDoc.uniform || 0) +
    (classDoc.sportWear || 0) +
    (classDoc.schoolBus || 0) +
    (classDoc.snack || 0) +
    (classDoc.science || 0) +
    (classDoc.games || 0) +
    (classDoc.libraryFee || 0) +
    (classDoc.extraActivities || 0) +
    (classDoc.starterPack || 0)
  );
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Find an admin user to attach as receivedBy
  const adminUser = await User.findOne({ role: 'admin' }).lean();
  if (!adminUser) {
    console.error('❌ No admin user found. Cannot seed payments.');
    process.exit(1);
  }
  console.log(`👤 Using admin: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})\n`);

  // Fetch all classes and build a fee map by class name (lowercase)
  const allClasses = await Class.find().lean();
  const classFeeMap = new Map<string, number>();
  allClasses.forEach((c: any) => {
    classFeeMap.set(c.name.toLowerCase(), computeTermFee(c));
  });

  // Fetch all students
  const students = await Student.find().lean();
  console.log(`📋 Total students found: ${students.length}\n`);

  let created = 0;
  let skipped = 0;
  let missingClass = 0;

  for (const student of students) {
    // Check if a First Term 2025/2026 payment already exists
    const existing = await Payment.findOne({
      studentId: student._id,
      academicYear: ACADEMIC_YEAR,
      term: TERM,
    }).lean();

    if (existing) {
      console.log(`  ⏭  Skip (already paid): studentId=${student._id} class=${student.class}`);
      skipped++;
      continue;
    }

    // Look up class fee
    const termFee = classFeeMap.get(student.class?.toLowerCase() ?? '');
    if (!termFee) {
      console.log(`  ⚠️  No class fee found for class "${student.class}" — skipping student ${student._id}`);
      missingClass++;
      continue;
    }

    // Create the payment
    await Payment.create({
      studentId: student._id,
      academicYear: ACADEMIC_YEAR,
      term: TERM,
      paymentType: 'School Fee',
      amount: termFee,
      amountDue: termFee,
      paymentDate: new Date('2025-09-05'), // approximate First Term payment date
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      receivedBy: adminUser._id,
      remarks: 'First Term fee — seeded from script',
    });

    console.log(`  ✅ Created payment: ${student.class} | ₦${termFee.toLocaleString()} | student ${student._id}`);
    created++;
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary
  Payments created : ${created}
  Skipped (existed): ${skipped}
  Missing class fee: ${missingClass}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
