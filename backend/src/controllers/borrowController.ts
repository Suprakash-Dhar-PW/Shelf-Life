import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Book } from '../models/Book.js';
import { Member } from '../models/Member.js';
import { BorrowRecord } from '../models/BorrowRecord.js';
import { AppError } from '../utils/AppError.js';

export const issueBook = async (req: Request, res: Response, next: NextFunction) => {
  const { bookId, memberId, dueDate } = req.body;

  try {
    const member = await Member.findById(memberId);
    if (!member) {
      return next(new AppError('Member not found', 404));
    }

    const session = await mongoose.startSession();
    let borrowRecord;
    
    try {
      await session.withTransaction(async () => {
        const updatedBook = await Book.findOneAndUpdate(
          { _id: bookId, availableCopies: { $gt: 0 } },
          { $inc: { availableCopies: -1 } },
          { new: true, session }
        );

        if (!updatedBook) {
          throw new AppError('No copies available.', 409);
        }

        const records = await BorrowRecord.create([{
          book: bookId,
          member: memberId,
          issueDate: new Date(),
          dueDate: new Date(dueDate),
          status: 'issued'
        }], { session });
        
        borrowRecord = records[0];
      });
    } catch (transactionError: any) {
      if (transactionError instanceof AppError) {
        throw transactionError;
      }
      
      // Fallback for standalone MongoDB environments without replica sets
      if (transactionError.message && (transactionError.message.includes('Transaction') || transactionError.message.includes('replica set'))) {
         const updatedBook = await Book.findOneAndUpdate(
            { _id: bookId, availableCopies: { $gt: 0 } },
            { $inc: { availableCopies: -1 } },
            { new: true }
         );
         
         if (!updatedBook) {
            throw new AppError('No copies available.', 409);
         }
         
         try {
           borrowRecord = await BorrowRecord.create({
             book: bookId,
             member: memberId,
             issueDate: new Date(),
             dueDate: new Date(dueDate),
             status: 'issued'
           });
         } catch (createError) {
           await Book.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } });
           throw createError;
         }
      } else {
        throw transactionError;
      }
    } finally {
      await session.endSession();
    }

    res.status(201).json({ success: true, data: borrowRecord });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
  const { borrowId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(borrowId as string)) {
    return next(new AppError('Invalid borrowId', 400));
  }

  try {
    const session = await mongoose.startSession();
    let record;
    
    try {
      await session.withTransaction(async () => {
        record = await BorrowRecord.findById(borrowId).session(session);
        if (!record) throw new AppError('Borrow record not found', 404);
        if (record.status === 'returned') throw new AppError('Book already returned', 400);

        const book = await Book.findById(record.book).session(session);
        if (!book) throw new AppError('Book not found', 404);
        if (book.availableCopies >= book.totalCopies) throw new AppError('availableCopies cannot exceed totalCopies', 400);

        record.returnDate = new Date();
        record.status = 'returned';
        await record.save({ session });

        await Book.updateOne(
          { _id: record.book },
          { $inc: { availableCopies: 1 } },
          { session }
        );
      });
    } catch (transactionError: any) {
      if (transactionError instanceof AppError) throw transactionError;

      // Fallback for standalone MongoDB environments
      if (transactionError.message && (transactionError.message.includes('Transaction') || transactionError.message.includes('replica set'))) {
         const updatedRecord = await BorrowRecord.findOneAndUpdate(
           { _id: borrowId, status: { $ne: 'returned' } },
           { $set: { returnDate: new Date(), status: 'returned' } },
           { new: true }
         );
         
         if (!updatedRecord) {
            // Either not found or already returned
            const exists = await BorrowRecord.findById(borrowId);
            if (!exists) throw new AppError('Borrow record not found', 404);
            if (exists.status === 'returned') throw new AppError('Book already returned', 400);
            throw new AppError('Failed to update borrow record', 500);
         }
         
         record = updatedRecord;

         try {
           const book = await Book.findById(record.book);
           if (!book || book.availableCopies >= book.totalCopies) {
             throw new AppError('Book not found or copies exceed total', 400);
           }
           await Book.updateOne({ _id: record.book }, { $inc: { availableCopies: 1 } });
         } catch(e) {
           await BorrowRecord.updateOne({_id: borrowId}, {$set: {returnDate: null, status: 'issued'}});
           throw e;
         }
      } else {
         throw transactionError;
      }
    } finally {
      await session.endSession();
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
