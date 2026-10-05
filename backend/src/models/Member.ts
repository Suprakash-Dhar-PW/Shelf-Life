import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  name: string;
  email: string;
  membershipId: string;
  joinedDate: Date;
}

const MemberSchema = new Schema<IMember>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  membershipId: { type: String, required: true, unique: true, trim: true },
  joinedDate: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

MemberSchema.index({ email: 1 });
MemberSchema.index({ membershipId: 1 });

export const Member = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);
