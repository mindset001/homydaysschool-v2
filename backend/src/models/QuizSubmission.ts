import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionMark {
  questionIndex: number;
  score: number;
  feedback?: string;
}

export interface IQuizSubmission extends Document {
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  markedBy?: mongoose.Types.ObjectId;
  score?: number;
  feedback?: string;
  questionMarks?: IQuestionMark[];
  createdAt: Date;
  updatedAt: Date;
}

const questionMarkSchema = new Schema<IQuestionMark>({
  questionIndex: { type: Number, required: true },
  score: { type: Number, required: true },
  feedback: { type: String },
});

const quizSubmissionSchema = new Schema<IQuizSubmission>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'Staff' },
    score: { type: Number },
    feedback: { type: String },
    questionMarks: [questionMarkSchema],
  },
  { timestamps: true }
);

quizSubmissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export const QuizSubmission = mongoose.model<IQuizSubmission>('QuizSubmission', quizSubmissionSchema);
