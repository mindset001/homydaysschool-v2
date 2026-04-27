/**
 * Diagnostic script — show admission dates vs applicable sessions for each student.
 * Run: cd backend && npx tsx src/scripts/diagnoseBilling.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { Class } from '../models/Class.js';

const MONGODB_URI = process.env.MONGODB_URI!;

const TERM_ORDER: Record<string, number> = {
  'First Term': 1, 'Second Term': 2, 'Third Term': 3,
};

function sessionRefDate(session: any): Date {
  return session.startDate ? new Date(session.startDate) : new Date(session.createdAt);
}
function studentAdmissionDate(student: any): Date {
  return student.admissionDate ? new Date(student.admissionDate) : new Date(student.createdAt);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const allSessions = (await AcademicSession.find().lean()).sort((a, b) => {
    if (a.academicYear !== b.academicYear) return a.academicYear.localeCompare(b.academicYear);
    return (TERM_ORDER[a.term] ?? 0) - (TERM_ORDER[b.term] ?? 0);
  });

  console.log('=== Academic Sessions in DB ===');
  allSessions.forEach(s => {
    const ref = sessionRefDate(s);
    console.log(`  ${s.term} ${s.academicYear} | ref date: ${ref.toLocaleDateString()} | active: ${s.isActive}`);
  });
  console.log('');

  const students = await Student.find().populate('userId', 'firstName lastName').lean();
  console.log(`=== Students (${students.length} total) ===`);

  const classDoc = await Class.findOne({ name: /creche/i }).lean();
  const termFee = classDoc ? (
    (classDoc as any).schoolFee + (classDoc as any).uniform + (classDoc as any).sportWear +
    (classDoc as any).schoolBus + (classDoc as any).snack + (classDoc as any).science +
    (classDoc as any).games + (classDoc as any).libraryFee + (classDoc as any).extraActivities +
    (classDoc as any).starterPack
  ) : 0;
  console.log(`Creche termFee: ₦${termFee?.toLocaleString()}\n`);

  let shown = 0;
  for (const student of students) {
    if (shown >= 10) break; // limit output
    const admDate = studentAdmissionDate(student);
    const applicable = allSessions.filter(s => sessionRefDate(s) >= admDate);
    const user = student.userId as any;
    console.log(`${user?.firstName} ${user?.lastName} (${student.class})`);
    console.log(`  admissionDate: ${student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'MISSING'} | createdAt: ${new Date(student.createdAt).toLocaleDateString()}`);
    console.log(`  Applicable sessions: ${applicable.length} → totalDue: ₦${(termFee * applicable.length).toLocaleString()}`);
    applicable.forEach(s => console.log(`    ✓ ${s.term} ${s.academicYear}`));
    if (applicable.length < allSessions.length) {
      const skipped = allSessions.filter(s => sessionRefDate(s) < admDate);
      skipped.forEach(s => console.log(`    ✗ ${s.term} ${s.academicYear} (skipped — before admission)`));
    }
    console.log('');
    shown++;
  }

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
