import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User.model';
import { AppError } from './errorHandler';
import { UserRole } from '../types/user.types';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
