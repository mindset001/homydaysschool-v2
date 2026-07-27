import mongoose, { Schema, Document } from 'mongoose';

export const ENROLLMENT_LEVELS = [
  'Creche',
  'Nursery',
  'Kindergarten',
  'Primary',
  'Secondary',
] as const;

export type EnrollmentLevel = (typeof ENROLLMENT_LEVELS)[number];

export interface IEnrollmentApplication extends Document {
  childFullName: string;
  dateOfBirth?: Date;
  desiredLevel: EnrollmentLevel;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  message?: string;
  status: 'new' | 'contacted' | 'enrolled' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentApplicationSchema = new Schema<IEnrollmentApplication>(
  {
    childFullName: { type: String, required: true },
    dateOfBirth: { type: Date },
    desiredLevel: { type: String, enum: ENROLLMENT_LEVELS, required: true },
    guardianName: { type: String, required: true },
    guardianEmail: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    message: { type: String },
    status: { type: String, enum: ['new', 'contacted', 'enrolled', 'declined'], default: 'new' },
  },
  { timestamps: true }
);

enrollmentApplicationSchema.index({ createdAt: -1 });

export const EnrollmentApplication = mongoose.model<IEnrollmentApplication>(
  'EnrollmentApplication',
  enrollmentApplicationSchema
);
