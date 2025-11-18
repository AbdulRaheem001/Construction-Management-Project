import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User.model';
import Role from '../models/Role.model';
import Permission from '../models/Permission.model';
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
      console.log('❌ No token provided');
      throw new AppError('Authentication required', 401);
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ Invalid token');
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await User.findById(decoded.id).populate({
      path: 'roles',
      populate: {
        path: 'permissions',
        model: 'Permission'
      }
    });

    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive:', decoded.id);
      throw new AppError('User not found or inactive', 401);
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Authentication error:', error);
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

// New permission-based authorization
export const requirePermission = (...permissionCodes: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      // Administrator role has all permissions
      if (req.user.role === UserRole.ADMINISTRATOR) {
        return next();
      }

      // Check if user has the required permission through their roles
      const userPermissions: string[] = [];
      
      if (req.user.roles && req.user.roles.length > 0) {
        for (const role of req.user.roles) {
          if (role.permissions && role.permissions.length > 0) {
            role.permissions.forEach((permission: any) => {
              if (permission.code && permission.isActive) {
                userPermissions.push(permission.code);
              }
            });
          }
        }
      }

      const hasPermission = permissionCodes.some(code => 
        userPermissions.includes(code.toUpperCase())
      );

      if (!hasPermission) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
