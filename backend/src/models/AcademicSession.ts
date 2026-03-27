import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicSession extends Document {
  academicYear: string;   // e.g. "2025/2026"
  term: 'First Term' | 'Second Term' | 'Third Term';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const academicSessionSchema = new Schema<IAcademicSession>(
  {
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    term: {
      type: String,
      enum: ['First Term', 'Second Term', 'Third Term'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound unique index — only one record per year + term
academicSessionSchema.index({ academicYear: 1, term: 1 }, { unique: true });

export const AcademicSession = mongoose.model<IAcademicSession>(
  'AcademicSession',
  academicSessionSchema
);
