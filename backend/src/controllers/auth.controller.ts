import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import AuditLog from '../models/AuditLog.model';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role, contact } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      contact,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    // Log the action
    await AuditLog.create({
      userId: user._id,
      action: 'CREATE',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Log the action
    await AuditLog.create({
      userId: user._id,
      action: 'LOGIN',
      resource: 'Auth',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id);

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

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, contact } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, contact },
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
      changes: { name, contact },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};
