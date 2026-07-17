import mongoose, { Schema, Document } from 'mongoose';
import { IQuestion } from './Assignment.js';

const questionSchema = new Schema<IQuestion>(
  {
    type: { type: String, enum: ['objective', 'theory'], required: true },
    text: { type: String, required: true },
    marks: { type: Number, default: 1 },
    options: [String],
    correctAnswer: { type: Number },
    sampleAnswer: { type: String },
  },
  { _id: false }
);

export interface IQuiz extends Document {
  title: string;
  description?: string;
  classId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  questions?: IQuestion[];
  scheduledAt?: Date;
  durationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    questions: { type: [questionSchema], default: [] },
    scheduledAt: { type: Date },
    durationMinutes: { type: Number },
  },
  { timestamps: true }
);

quizSchema.index({ classId: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
