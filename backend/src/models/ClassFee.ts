import mongoose, { Schema, Document } from 'mongoose';

// Common presets offered in the UI — not enforced. An admin can type any
// custom fee name (e.g. "Excursion Fee", "PTA Levy") and it's stored as-is.
export const FEE_TYPES = [
  'School Fee',
  'Uniform',
  'Sport Wear',
  'School Bus',
  'Snack',
  'Science',
  'Games',
  'Library Fee',
  'Extra Activities',
  'Starter Pack',
  'Other',
] as const;

/**
 * One fee line item for a class in one specific term/session — replaces the
 * old flat Class.termFee (which applied the same single number to every term
 * forever). A class/term can have several line items (School Fee, Uniform,
 * Bus, or any custom name an admin types); a term with no ClassFee records
 * at all has nothing due, so it can never carry debt or block results —
 * see getStudentTermSummary in paymentController.
 */
export interface IClassFee extends Document {
  className: string;
  academicYear: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  feeType: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const classFeeSchema = new Schema<IClassFee>(
  {
    className: { type: String, required: true },
    academicYear: { type: String, required: true },
    term: { type: String, enum: ['First Term', 'Second Term', 'Third Term'], required: true },
    feeType: { type: String, required: true, trim: true, default: 'School Fee' },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

classFeeSchema.index({ className: 1, academicYear: 1, term: 1, feeType: 1 }, { unique: true });

export const ClassFee = mongoose.model<IClassFee>('ClassFee', classFeeSchema);
