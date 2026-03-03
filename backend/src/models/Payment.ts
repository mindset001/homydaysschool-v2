import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  academicYear: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  paymentType: 'School Fee' | 'Uniform' | 'Sport Wear' | 'School Bus' | 'Snack' | 'Science' | 'Games' | 'Library Fee' | 'Extra Activities' | 'Starter Pack' | 'Other';
  amount: number;
  amountDue: number;
  paymentDate: Date;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Online';
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  referenceNumber?: string;
  receivedBy: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ['First Term', 'Second Term', 'Third Term'],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ['School Fee', 'Uniform', 'Sport Wear', 'School Bus', 'Snack', 'Science', 'Games', 'Library Fee', 'Extra Activities', 'Starter Pack', 'Other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Card', 'Cheque', 'Online'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Unpaid'],
      required: true,
      default: 'Unpaid',
    },
    referenceNumber: {
      type: String,
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ studentId: 1 });
paymentSchema.index({ academicYear: 1, term: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ paymentStatus: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
