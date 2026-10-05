import { z } from 'zod';
import mongoose from 'mongoose';

export const issueBookSchema = z.object({
  body: z.object({
    bookId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), 'Invalid bookId'),
    memberId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), 'Invalid memberId'),
    dueDate: z.string().refine(val => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, 'dueDate must be a valid future date')
  })
});
