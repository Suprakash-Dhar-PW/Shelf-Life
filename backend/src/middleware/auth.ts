import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const decoded = verifyToken(token);
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return next(new AppError('Invalid token or token has expired', 401));
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
