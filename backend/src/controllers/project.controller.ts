import { Response, NextFunction } from 'express';
import Project from '../models/Project.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Create a new project
export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const project = await Project.create(projectData);
    logger.info(`Project created: ${project.projectCode}`);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Project code already exists', 400));
    }
    next(error);
  }
};

// Get all projects with optional filters
export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, siteManager, search } = req.query;

    const query: any = { isActive: true };

    if (status) query.status = status;
    if (siteManager) query.siteManager = siteManager;
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { projectCode: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query)
      .populate('siteManager', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// Get project by ID with budget details
export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('siteManager', 'name email role contact')
      .populate('createdBy', 'name email');

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Calculate budget utilization
    const Expense = require('../models/Expense.model').default;
    const MaterialConsumption = require('../models/MaterialConsumption.model').default;
    const Timesheet = require('../models/Timesheet.model').default;
    const EquipmentUsage = require('../models/EquipmentUsage.model').default;

    const [expenses, materialCosts, labourCosts, equipmentCosts] = await Promise.all([
      Expense.aggregate([
        { $match: { project: project._id, paymentStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      MaterialConsumption.aggregate([
        { $match: { project: project._id } },
        {
          $lookup: {
            from: 'materials',
            localField: 'material',
            foreignField: '_id',
            as: 'materialInfo',
          },
        },
        { $unwind: '$materialInfo' },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', '$materialInfo.costPerUnit'] } },
          },
        },
      ]),
      Timesheet.aggregate([
        { $match: { project: project._id, status: 'Approved' } },
        {
          $lookup: {
            from: 'employees',
            localField: 'employee',
            foreignField: '_id',
            as: 'employeeInfo',
          },
        },
        { $unwind: '$employeeInfo' },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$hoursWorked', '$employeeInfo.payRate'] } },
          },
        },
      ]),
      EquipmentUsage.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } },
      ]),
    ]);

    const totalExpenses = expenses[0]?.total || 0;
    const totalMaterialCosts = materialCosts[0]?.total || 0;
    const totalLabourCosts = labourCosts[0]?.total || 0;
    const totalEquipmentCosts = equipmentCosts[0]?.total || 0;

    const actualSpent = totalExpenses + totalMaterialCosts + totalLabourCosts + totalEquipmentCosts;
    const remainingBudget = project.initialBudget - actualSpent;
    const budgetUtilization = (actualSpent / project.initialBudget) * 100;

    res.json({
      success: true,
      data: {
        project,
        budget: {
          initialBudget: project.initialBudget,
          actualSpent,
          remainingBudget,
          budgetUtilization: budgetUtilization.toFixed(2),
          breakdown: {
            materialCosts: totalMaterialCosts,
            labourCosts: totalLabourCosts,
            equipmentCosts: totalEquipmentCosts,
            generalExpenses: totalExpenses,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update project
export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    logger.info(`Project updated: ${project.projectCode}`);

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Delete (soft delete) project
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    logger.info(`Project deleted: ${project.projectCode}`);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get project summary report
export const getProjectSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Import models dynamically to avoid circular dependencies
    const Expense = require('../models/Expense.model').default;
    const MaterialConsumption = require('../models/MaterialConsumption.model').default;
    const Timesheet = require('../models/Timesheet.model').default;
    const EquipmentUsage = require('../models/EquipmentUsage.model').default;
    const DailyLog = require('../models/DailyLog.model').default;

    const [
      totalExpenses,
      materialConsumption,
      labourHours,
      equipmentUsage,
      dailyLogsCount,
    ] = await Promise.all([
      Expense.countDocuments({ project: project._id }),
      MaterialConsumption.countDocuments({ project: project._id }),
      Timesheet.aggregate([
        { $match: { project: project._id, status: 'Approved' } },
        { $group: { _id: null, totalHours: { $sum: '$hoursWorked' } } },
      ]),
      EquipmentUsage.countDocuments({ project: project._id }),
      DailyLog.countDocuments({ project: project._id }),
    ]);

    res.json({
      success: true,
      data: {
        project: {
          name: project.projectName,
          code: project.projectCode,
          status: project.status,
          client: project.client,
        },
        statistics: {
          totalExpenses,
          materialConsumptionRecords: materialConsumption,
          totalLabourHours: labourHours[0]?.totalHours || 0,
          equipmentUsageRecords: equipmentUsage,
          dailyLogsSubmitted: dailyLogsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
