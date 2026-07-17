import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentSubmission extends Document {
  assignmentId?: mongoose.Types.ObjectId;
  quizId?: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId; // could be guardian/staff/student
  content?: string; // textual answers or summary
  attachments?: string[]; // URLs to uploaded files
  createdAt: Date;
  updatedAt: Date;
}

const studentSubmissionSchema = new Schema<IStudentSubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

studentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { sparse: true });
studentSubmissionSchema.index({ quizId: 1, studentId: 1 }, { sparse: true });

export const StudentSubmission = mongoose.model<IStudentSubmission>('StudentSubmission', studentSubmissionSchema);
