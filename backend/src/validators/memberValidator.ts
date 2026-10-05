import { z } from 'zod';

export const createMemberSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    membershipId: z.string().min(1, 'Membership ID is required'),
  }),
});
