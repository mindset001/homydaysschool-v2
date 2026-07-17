import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionMark {
  questionIndex: number;
  score: number;
  feedback?: string;
}

export interface IAssignmentSubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
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

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'Staff' },
    score: { type: Number },
    feedback: { type: String },
    questionMarks: [questionMarkSchema],
  },
  { timestamps: true }
);

assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>('AssignmentSubmission', assignmentSubmissionSchema);
