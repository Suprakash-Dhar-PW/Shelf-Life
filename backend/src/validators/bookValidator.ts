import { z } from 'zod';

export const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    ISBN: z.string().min(1, 'ISBN is required'),
    genre: z.string().min(1, 'Genre is required'),
    totalCopies: z.number().int().positive('Total copies must be a positive integer'),
  }),
});
