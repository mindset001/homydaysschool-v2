/**
 * Seed missing academic term records for 2025/2026.
 * Run with: tsx src/scripts/seedMissingTerms.ts
 *
 * Safe to run multiple times — uses upsert so existing records are never overwritten.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { AcademicSession } from '../models/AcademicSession.js';

const MONGODB_URI = process.env.MONGODB_URI!;

const TERMS_TO_SEED = [
  {
    academicYear: '2025/2026',
    term: 'First Term' as const,
    // Approximate dates — update these if you know the exact school calendar
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-12-15'),
    isActive: false,
  },
  {
    academicYear: '2025/2026',
    term: 'Second Term' as const,
    startDate: new Date('2026-01-06'),
    endDate: new Date('2026-04-04'),
    isActive: false,
  },
  // Note: 3rd Term already exists as active — this script will skip it due to upsert
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const term of TERMS_TO_SEED) {
    const result = await AcademicSession.findOneAndUpdate(
      { academicYear: term.academicYear, term: term.term },
      { $setOnInsert: term },
      { upsert: true, new: true, rawResult: true }
    );

    if ((result as any).lastErrorObject?.updatedExisting) {
      console.log(`✓ Already exists — skipped: ${term.term} ${term.academicYear}`);
    } else {
      console.log(`✅ Created: ${term.term} ${term.academicYear}`);
    }
  }

  // Show all sessions now in DB
  const all = await AcademicSession.find().sort({ academicYear: 1 }).lean();
  console.log('\nAll academic sessions in DB:');
  all.forEach((s) =>
    console.log(`  - ${s.term} — ${s.academicYear} | active: ${s.isActive} | startDate: ${s.startDate ?? 'N/A'}`)
  );

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
