import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Member } from '../models/Member.js';
import { BorrowRecord } from '../models/BorrowRecord.js';
import { AppError } from '../utils/AppError.js';

export const createMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, membershipId } = req.body;

    const member = await Member.create({
      name,
      email,
      membershipId,
    });

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Differentiate between email and membershipId duplicate
      const field = Object.keys(error.keyValue)[0];
      return next(new AppError(`Member with this ${field} already exists`, 409));
    }
    next(error);
  }
};

export const getAllMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await Member.find().sort({ name: 1 }).select('-__v');
    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return next(new AppError('Invalid member ID format', 400));
    }

    const member = await Member.findById(id).select('-__v');
    if (!member) {
      return next(new AppError('Member not found', 404));
    }

    const history = await BorrowRecord.find({ member: id })
      .sort({ issueDate: -1 })
      .populate('book', 'title author ISBN genre') // populate necessary book information
      .select('-__v -member'); // exclude member object id from every record to keep it clean

    res.status(200).json({
      success: true,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        membershipId: member.membershipId,
      },
      history,
    });
  } catch (error) {
    next(error);
  }
};
