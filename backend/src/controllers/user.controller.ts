import { Response, NextFunction } from 'express';
import User from '../models/User.model';
import AuditLog from '../models/AuditLog.model';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types/user.types';

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, isActive, search } = req.query;

    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users, count: users.length },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role, contact } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = await User.create({
      email,
      password,
      name,
      role,
      contact,
    });

    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      action: 'CREATE',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, role, contact, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, contact, isActive },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      action: 'UPDATE',
      resource: 'User',
      resourceId: user._id.toString(),
      changes: { name, role, contact, isActive },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      action: 'DELETE',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
