import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { Librarian } from '../models/Librarian.js';
import { connectDB } from '../config/db.js';

const seedLibrarian = async () => {
  try {
    await connectDB();

    const email = 'librarian@shelflife.com';
    const password = env.SEED_LIBRARIAN_PASSWORD;

    if (!password) {
      console.error('❌ SEED_LIBRARIAN_PASSWORD is not set in environment variables.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const existingLibrarian = await Librarian.findOne({ email });

    if (existingLibrarian) {
      existingLibrarian.passwordHash = passwordHash;
      await existingLibrarian.save();
      console.log('✅ Development librarian existed, updated password successfully.');
    } else {
      await Librarian.create({
        name: 'ShelfLife Librarian',
        email,
        passwordHash,
        role: 'librarian',
      });
      console.log('✅ Development librarian seeded successfully.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed librarian:', error);
    process.exit(1);
  }
};

seedLibrarian();
