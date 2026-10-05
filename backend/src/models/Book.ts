import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
}

const BookSchema = new Schema<IBook>({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  ISBN: { type: String, required: true, unique: true, trim: true },
  genre: { type: String, required: true, trim: true },
  totalCopies: { 
    type: Number, 
    required: true, 
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'totalCopies must be an integer'
    }
  },
  availableCopies: { 
    type: Number, 
    required: true, 
    min: 0,
    validate: [
      {
        validator: Number.isInteger,
        message: 'availableCopies must be an integer'
      },
      {
        validator: function(this: IBook, v: number) {
          // availableCopies must never exceed totalCopies
          return v <= this.totalCopies;
        },
        message: 'availableCopies must never exceed totalCopies'
      }
    ]
  }
}, { timestamps: true });

BookSchema.index({ ISBN: 1 });

export const Book = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);
