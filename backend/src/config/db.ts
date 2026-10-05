import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
    } else {
      console.error('❌ Unknown MongoDB Connection Error');
    }
    throw error;
  }
};
