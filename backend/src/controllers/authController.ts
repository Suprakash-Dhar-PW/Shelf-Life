import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Librarian } from '../models/Librarian.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const librarian = await Librarian.findOne({ email });
    if (!librarian) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await bcrypt.compare(password, librarian.passwordHash);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = signToken({
      userId: librarian._id.toString(),
      role: librarian.role,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: librarian._id,
        name: librarian.name,
        email: librarian.email,
        role: librarian.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
