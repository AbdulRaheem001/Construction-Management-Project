import { Response, NextFunction } from 'express';
import Equipment from '../models/Equipment.model';
import EquipmentUsage from '../models/EquipmentUsage.model';
import Maintenance from '../models/Maintenance.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ===== EQUIPMENT =====

export const createEquipment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const equipment = await Equipment.create(req.body);
    logger.info(`Equipment created: ${equipment.assetId}`);

    res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Asset ID already exists', 400));
    }
    next(error);
  }
};

export const getEquipment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, condition, location, search } = req.query;

    const query: any = { isActive: true };
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (location) query.location = location;
    if (search) {
      query.$or = [
        { assetId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const equipment = await Equipment.find(query)
      .populate('location', 'projectName projectCode name code')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: equipment.length,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

export const getEquipmentById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('location', 'projectName projectCode name code');

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    // Get maintenance history
    const maintenanceHistory = await Maintenance.find({ equipment: equipment._id })
      .sort({ scheduledDate: -1 })
      .limit(10);

    // Get usage history
    const usageHistory = await EquipmentUsage.find({ equipment: equipment._id })
      .populate('project', 'projectName projectCode')
      .sort({ startDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        equipment,
        maintenanceHistory,
        usageHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEquipment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return next(new AppError('Equipment not found', 404));
    }

    logger.info(`Equipment updated: ${equipment.assetId}`);

    res.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

// ===== EQUIPMENT USAGE =====

export const recordEquipmentUsage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const usageData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const usage = await EquipmentUsage.create(usageData);
    logger.info(`Equipment usage recorded: ${usage._id}`);

    res.status(201).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

export const getEquipmentUsage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { equipment, project } = req.query;

    const query: any = {};
    if (equipment) query.equipment = equipment;
    if (project) query.project = project;

    const usage = await EquipmentUsage.find(query)
      .populate('equipment', 'assetId name')
      .populate('project', 'projectName projectCode')
      .populate('operator', 'employeeId name')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      count: usage.length,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

// ===== MAINTENANCE =====

export const scheduleMaintenance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const maintenanceData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const maintenance = await Maintenance.create(maintenanceData);
    logger.info(`Maintenance scheduled: ${maintenance._id}`);

    res.status(201).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaintenance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { equipment, status } = req.query;

    const query: any = {};
    if (equipment) query.equipment = equipment;
    if (status) query.status = status;

    const maintenance = await Maintenance.find(query)
      .populate('equipment', 'assetId name category')
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      count: maintenance.length,
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!maintenance) {
      return next(new AppError('Maintenance record not found', 404));
    }

    logger.info(`Maintenance updated: ${maintenance._id}`);

    res.json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};
