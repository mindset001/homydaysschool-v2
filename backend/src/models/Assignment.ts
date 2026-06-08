import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  type: 'objective' | 'theory';
  text: string;
  marks?: number;
  // Objective only
  options?: string[];
  correctAnswer?: number; // index of correct option
  // Theory only
  sampleAnswer?: string;
}

export interface IAssignment extends Document {
  title: string;
  description?: string;
  classId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  questions?: IQuestion[];
  dueDate?: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

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

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    description: { type: String },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    questions: { type: [questionSchema], default: [] },
    dueDate: { type: Date },
    attachments: [String],
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
