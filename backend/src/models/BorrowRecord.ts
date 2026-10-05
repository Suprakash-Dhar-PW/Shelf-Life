import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBorrowRecord extends Document {
  book: Types.ObjectId;
  member: Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: 'issued' | 'returned' | 'overdue';
}

// DESIGN DECISION: OVERDUE LOGIC
// An active record is effectively overdue when:
// returnDate == null AND dueDate < current time
// We keep the stored 'status' compatible with the assignment requirements (issued | returned | overdue),
// but we do NOT create a background process yet that constantly changes issued records to overdue.
const BorrowRecordSchema = new Schema<IBorrowRecord>({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['issued', 'returned', 'overdue'],
    required: true 
  },
}, { timestamps: true });

// Add appropriate indexes for frequently queried fields
BorrowRecordSchema.index({ member: 1, issueDate: -1 }); // Compound index for member history
BorrowRecordSchema.index({ book: 1 });
BorrowRecordSchema.index({ status: 1 });
BorrowRecordSchema.index({ dueDate: 1 });

export const BorrowRecord = mongoose.models.BorrowRecord || mongoose.model<IBorrowRecord>('BorrowRecord', BorrowRecordSchema);
