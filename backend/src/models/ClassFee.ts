import mongoose, { Schema, Document } from 'mongoose';

/**
 * A class's tuition fee for one specific term/session — replaces the old
 * flat Class.termFee (which applied the same number to every term forever).
 * A term with no ClassFee record has no fee due, so it can never carry
 * debt or block results — see getStudentTermSummary in paymentController.
 */
export interface IClassFee extends Document {
  className: string;
  academicYear: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const classFeeSchema = new Schema<IClassFee>(
  {
    className: { type: String, required: true },
    academicYear: { type: String, required: true },
    term: { type: String, enum: ['First Term', 'Second Term', 'Third Term'], required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

classFeeSchema.index({ className: 1, academicYear: 1, term: 1 }, { unique: true });

export const ClassFee = mongoose.model<IClassFee>('ClassFee', classFeeSchema);
