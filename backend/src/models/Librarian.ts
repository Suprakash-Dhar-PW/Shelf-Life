import mongoose, { Schema, Document } from 'mongoose';

export interface ILibrarian extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'librarian';
}

const LibrarianSchema = new Schema<ILibrarian>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['librarian'], default: 'librarian' },
}, { timestamps: true });

LibrarianSchema.index({ email: 1 });

export const Librarian = mongoose.models.Librarian || mongoose.model<ILibrarian>('Librarian', LibrarianSchema);
