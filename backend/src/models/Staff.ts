import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  userId: mongoose.Types.ObjectId;
  staffId: string;
  department: string;
  position: string;
  dateOfJoining: Date;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  qualification: string[];
  experience?: number;
  salary?: number;
  subjects?: string[];
  classes?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  documents?: {
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    staffId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    qualification: [String],
    experience: {
      type: Number,
    },
    salary: {
      type: Number,
    },
    subjects: [String],
    classes: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
    },
    documents: [
      {
        type: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

staffSchema.index({ staffId: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ userId: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
