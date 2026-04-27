import mongoose, { Schema, Document } from 'mongoose';

export interface IDaySchedule {
  day: string;
  first_period: string;
  second_period: string;
  third_period: string;
  fourth_period: string;
  fifth_period: string;
  six_period: string;
  eight_period: string;
  nineth_period: string;
  tenth_period: string;
}

export interface ITimetable extends Document {
  classId: mongoose.Types.ObjectId;
  className: string;
  academicYear: string;
  term: string;
  schedule: IDaySchedule[];
  timings: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const dayScheduleSchema = new Schema<IDaySchedule>(
  {
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    first_period:  { type: String, default: '' },
    second_period: { type: String, default: '' },
    third_period:  { type: String, default: '' },
    fourth_period: { type: String, default: '' },
    fifth_period:  { type: String, default: '' },
    six_period:    { type: String, default: '' },
    eight_period:  { type: String, default: '' },
    nineth_period: { type: String, default: '' },
    tenth_period:  { type: String, default: '' },
  },
  { _id: false }
);

const timetableSchema = new Schema<ITimetable>(
  {
    classId:      { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    className:    { type: String, required: true },
    academicYear: { type: String, required: true },
    term:         { type: String, required: true, enum: ['First Term', 'Second Term', 'Third Term'] },
    schedule:     [dayScheduleSchema],
    // Custom time labels per period/break — stored as a flexible key→label map.
    // Keys match period keys (e.g. 'first_period') and break keys ('break_1', 'break_2').
    timings:      { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

// One timetable per class per term per year
timetableSchema.index({ classId: 1, term: 1, academicYear: 1 }, { unique: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', timetableSchema);
