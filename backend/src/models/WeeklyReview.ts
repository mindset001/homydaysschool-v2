import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentNote {
  studentId: mongoose.Types.ObjectId;
  note: string;
}

export interface IWeeklyReview extends Document {
  classId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  weekOf: Date; // Monday of the review week (stored as date)
  term: string;
  academicYear: string;
  message: string; // class-wide update shown to all students
  studentNotes?: IStudentNote[];
  createdAt: Date;
  updatedAt: Date;
}

const studentNoteSchema = new Schema<IStudentNote>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    note: { type: String, required: true },
  },
  { _id: false }
);

const weeklyReviewSchema = new Schema<IWeeklyReview>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekOf: { type: Date, required: true },
    term: { type: String, required: true },
    academicYear: { type: String, required: true },
    message: { type: String, required: true },
    studentNotes: { type: [studentNoteSchema], default: [] },
  },
  { timestamps: true }
);

// one review per class per week
weeklyReviewSchema.index({ classId: 1, weekOf: 1 }, { unique: true });

export const WeeklyReview = mongoose.model<IWeeklyReview>('WeeklyReview', weeklyReviewSchema);
