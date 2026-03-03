import mongoose, { Schema, Document } from 'mongoose';

export interface IGuardian extends Document {
  userId: mongoose.Types.ObjectId;
  guardianId: string;
  occupation?: string;
  relationshipToStudent: string;
  students: mongoose.Types.ObjectId[];
  address: string;
  alternatePhoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const guardianSchema = new Schema<IGuardian>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guardianId: {
      type: String,
      required: true,
      unique: true,
    },
    occupation: {
      type: String,
    },
    relationshipToStudent: {
      type: String,
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    address: {
      type: String,
      required: true,
    },
    alternatePhoneNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

guardianSchema.index({ guardianId: 1 });
guardianSchema.index({ userId: 1 });

export const Guardian = mongoose.model<IGuardian>('Guardian', guardianSchema);
