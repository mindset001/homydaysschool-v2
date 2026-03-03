import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  text: string;
  authorRole: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    text: { type: String, required: true },
    authorRole: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', chatSchema);
