import { Response, NextFunction } from 'express';
import DailyLog from '../models/DailyLog.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const createDailyLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const dailyLogData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const dailyLog = await DailyLog.create(dailyLogData);
    logger.info(`Daily log created for project: ${dailyLog.project}`);

    res.status(201).json({
      success: true,
      data: dailyLog,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Daily log already exists for this project and date', 400));
    }
    next(error);
  }
};

export const getDailyLogs = async (
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

    const dailyLogs = await DailyLog.find(query)
      .populate('project', 'projectName projectCode isActive')
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    // Filter out logs from deleted (inactive) projects
    const activeLogs = dailyLogs.filter(log => {
      if (!log.project) return true;
      return (log.project as any).isActive !== false;
    });

    res.json({
      success: true,
      count: activeLogs.length,
      data: activeLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyLogById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const dailyLog = await DailyLog.findById(req.params.id)
      .populate('project', 'projectName projectCode client location isActive')
      .populate('createdBy', 'name email');

    if (!dailyLog) {
      return next(new AppError('Daily log not found', 404));
    }

    // Check if the log's project is deleted (inactive)
    if (dailyLog.project && (dailyLog.project as any).isActive === false) {
      return next(new AppError('Daily log belongs to a deleted project', 404));
    }

    res.json({
      success: true,
      data: dailyLog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDailyLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const dailyLog = await DailyLog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!dailyLog) {
      return next(new AppError('Daily log not found', 404));
    }

    logger.info(`Daily log updated: ${dailyLog._id}`);

    res.json({
      success: true,
      data: dailyLog,
    });
  } catch (error) {
    next(error);
  }
};
