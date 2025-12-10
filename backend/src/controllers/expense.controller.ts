import { Response, NextFunction } from 'express';
import Expense from '../models/Expense.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { uploadMultipleImagesToCloudinary } from '../utils/cloudinary';

export const createExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Auto-generate expense number if not provided
    let expenseNumber = req.body.expenseNumber;
    if (!expenseNumber) {
      const expenseCount = await Expense.countDocuments();
      expenseNumber = `EXP-${String(expenseCount + 1).padStart(6, '0')}`;
    }

    // Handle image uploads to Cloudinary
    let imageUrls: string[] = [];
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      try {
        imageUrls = await uploadMultipleImagesToCloudinary(req.body.images, 'expenses');
        logger.info(`Uploaded ${imageUrls.length} images to Cloudinary for expense ${expenseNumber}`);
      } catch (error) {
        logger.error('Error uploading images to Cloudinary:', error);
        // Continue with expense creation even if image upload fails
        logger.warn('Continuing expense creation without images');
      }
    }

    const expenseData = {
      ...req.body,
      expenseNumber,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      createdBy: req.user._id,
    };

    const expense = await Expense.create(expenseData);
    await expense.populate('project', 'projectName projectCode');
    await expense.populate('createdBy', 'name email');
    
    logger.info(`Expense created: ${expense.expenseNumber}`);

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Expense number already exists', 400));
    }
    next(error);
  }
};

export const getExpenses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { project, expenseType, category, paymentStatus, startDate, endDate } = req.query;

    const query: any = {};
    if (project) query.project = project;
    if (expenseType) query.expenseType = expenseType;
    if (category) query.category = category;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const expenses = await Expense.find(query)
      .populate('project', 'projectName projectCode')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('project', 'projectName projectCode client')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!expense) {
      return next(new AppError('Expense not found', 404));
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return next(new AppError('Expense not found', 404));
    }

    // If payment is being made, add to payment history
    if (req.body.amountPaid !== undefined && req.body.amountPaid > (expense.amountPaid || 0)) {
      const paymentAmount = req.body.amountPaid - (expense.amountPaid || 0);
      
      if (!expense.paymentHistory) {
        expense.paymentHistory = [];
      }

      expense.paymentHistory.push({
        amount: paymentAmount,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
        paymentMethod: req.body.paymentMethod,
        notes: req.body.notes,
        paidBy: req.user._id,
      });
    }

    // Update other fields
    Object.keys(req.body).forEach((key) => {
      if (key !== 'paymentHistory') {
        (expense as any)[key] = req.body[key];
      }
    });

    await expense.save();
    await expense.populate('project', 'projectName projectCode');
    await expense.populate('createdBy', 'name email');
    await expense.populate('paymentHistory.paidBy', 'name email');

    logger.info(`Expense updated: ${expense.expenseNumber}`);

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const approveExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!expense) {
      return next(new AppError('Expense not found', 404));
    }

    logger.info(`Expense approved: ${expense.expenseNumber}`);

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

export const getFinancialReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { project, startDate, endDate } = req.query;

    const query: any = {};
    if (project) query.project = project;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const expenses = await Expense.find(query);

    const report = expenses.reduce(
      (acc: any, expense) => {
        acc.totalExpenses += expense.amount;

        if (expense.paymentStatus === 'Paid') {
          acc.totalPaid += expense.amount;
        } else if (expense.paymentStatus === 'Pending') {
          acc.totalPending += expense.amount;
        } else if (expense.paymentStatus === 'Partially Paid') {
          const amountPaid = (expense as any).amountPaid || 0;
          acc.totalPaid += amountPaid;
          acc.totalPending += (expense.amount - amountPaid);
        }

        if (!acc.byType[expense.expenseType]) {
          acc.byType[expense.expenseType] = 0;
        }
        acc.byType[expense.expenseType] += expense.amount;

        if (!acc.byCategory[expense.category]) {
          acc.byCategory[expense.category] = 0;
        }
        acc.byCategory[expense.category] += expense.amount;

        return acc;
      },
      {
        totalExpenses: 0,
        totalPaid: 0,
        totalPending: 0,
        byType: {},
        byCategory: {},
      }
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
