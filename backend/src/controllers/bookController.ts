import { Request, Response, NextFunction } from 'express';
import { Book } from '../models/Book.js';
import { AppError } from '../utils/AppError.js';

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, author, ISBN, genre, totalCopies } = req.body;
    
    // Create the book (duplicate ISBN handled by unique index + error handler or explicit check)
    const book = await Book.create({
      title,
      author,
      ISBN,
      genre,
      totalCopies,
      availableCopies: totalCopies,
    });

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error: any) {
    if (error.code === 11000) {
       return next(new AppError('Book with this ISBN already exists', 409));
    }
    next(error);
  }
};

export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const genre = req.query.genre as string;
    const search = req.query.search as string;

    const query: any = {};
    if (genre) {
      query.genre = genre;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      Book.find(query).skip(skip).limit(limit),
      Book.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
