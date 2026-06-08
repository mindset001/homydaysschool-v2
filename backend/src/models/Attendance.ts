import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  classId: mongoose.Types.ObjectId;
  date: Date;
  teacher: mongoose.Types.ObjectId;
  present: mongoose.Types.ObjectId[];
  absent: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: Date, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    present: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    absent: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    notes: { type: String },
  },
  { timestamps: true }
);

attendanceSchema.index({ classId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
