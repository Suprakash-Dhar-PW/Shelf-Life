import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (payload: { userId: string, role: string }): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET);
};
