import { Response, NextFunction } from 'express';
import Expense from '../models/Expense.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const createExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const expenseData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const expense = await Expense.create(expenseData);
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
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return next(new AppError('Expense not found', 404));
    }

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
