import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  grade: string;
  section?: string;
  teacher?: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  subjects: string[];
  academicYear: string;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
  }[];
  // Tuition fee fields
  schoolFee?: number;
  uniform?: number;
  sportWear?: number;
  schoolBus?: number;
  snack?: number;
  science?: number;
  games?: number;
  libraryFee?: number;
  extraActivities?: number;
  starterPack?: number;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    subjects: [String],
    academicYear: {
      type: String,
      required: true,
    },
    schedule: [
      {
        day: String,
        startTime: String,
        endTime: String,
        subject: String,
      },
    ],
    // Tuition fee fields (in Naira)
    schoolFee: {
      type: Number,
      default: 0,
    },
    uniform: {
      type: Number,
      default: 0,
    },
    sportWear: {
      type: Number,
      default: 0,
    },
    schoolBus: {
      type: Number,
      default: 0,
    },
    snack: {
      type: Number,
      default: 0,
    },
    science: {
      type: Number,
      default: 0,
    },
    games: {
      type: Number,
      default: 0,
    },
    libraryFee: {
      type: Number,
      default: 0,
    },
    extraActivities: {
      type: Number,
      default: 0,
    },
    starterPack: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index({ name: 1, academicYear: 1 });
classSchema.index({ grade: 1 });

export const Class = mongoose.model<IClass>('Class', classSchema);
