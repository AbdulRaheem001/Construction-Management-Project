import { Response, NextFunction } from 'express';
import Warehouse from '../models/Warehouse.model';
import Inventory from '../models/Inventory.model';
import StockTransfer from '../models/StockTransfer.model';
import InventoryAdjustment from '../models/InventoryAdjustment.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ===== WAREHOUSES =====

export const createWarehouse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    logger.info(`Warehouse created: ${warehouse.code}`);

    res.status(201).json({
      success: true,
      data: warehouse,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Warehouse code already exists', 400));
    }
    next(error);
  }
};

export const getWarehouses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true })
      .populate('manager', 'name email contact')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: warehouses.length,
      data: warehouses,
    });
  } catch (error) {
    next(error);
  }
};

export const getWarehouseById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate('manager', 'name email contact');

    if (!warehouse) {
      return next(new AppError('Warehouse not found', 404));
    }

    // Get inventory
    const inventory = await Inventory.find({
      location: warehouse._id,
      locationType: 'Warehouse',
    }).populate('material', 'sku name unit costPerUnit');

    res.json({
      success: true,
      data: {
        warehouse,
        inventory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===== STOCK TRANSFERS =====

export const createStockTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transferData = {
      ...req.body,
      requestedBy: req.user._id,
    };

    // Check if sufficient stock is available at source
    for (const item of req.body.items) {
      const inventory = await Inventory.findOne({
        material: item.material,
        location: req.body.fromLocation,
        locationType: req.body.fromLocationType,
      });

      if (!inventory || inventory.quantity < item.quantity) {
        return next(new AppError(`Insufficient stock for material: ${item.material}`, 400));
      }
    }

    const transfer = await StockTransfer.create(transferData);
    logger.info(`Stock transfer created: ${transfer.transferNumber}`);

    res.status(201).json({
      success: true,
      data: transfer,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Transfer number already exists', 400));
    }
    next(error);
  }
};

export const getStockTransfers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, fromLocation, toLocation } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (fromLocation) query.fromLocation = fromLocation;
    if (toLocation) query.toLocation = toLocation;

    const transfers = await StockTransfer.find(query)
      .populate('fromLocation', 'projectName projectCode name code')
      .populate('toLocation', 'projectName projectCode name code')
      .populate('items.material', 'sku name unit')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('receivedBy', 'name')
      .sort({ transferDate: -1 });

    res.json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    next(error);
  }
};

export const approveStockTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id);

    if (!transfer) {
      return next(new AppError('Stock transfer not found', 404));
    }

    // Deduct from source location
    for (const item of transfer.items) {
      await Inventory.findOneAndUpdate(
        {
          material: item.material,
          location: transfer.fromLocation,
          locationType: transfer.fromLocationType,
        },
        {
          $inc: { quantity: -item.quantity },
          $set: { lastUpdated: new Date(), updatedBy: req.user._id },
        }
      );
    }

    transfer.status = 'In Transit';
    transfer.approvedBy = req.user._id;
    await transfer.save();

    logger.info(`Stock transfer approved: ${transfer.transferNumber}`);

    res.json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

export const receiveStockTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id);

    if (!transfer) {
      return next(new AppError('Stock transfer not found', 404));
    }

    // Add to destination location
    for (const item of transfer.items) {
      await Inventory.findOneAndUpdate(
        {
          material: item.material,
          location: transfer.toLocation,
          locationType: transfer.toLocationType,
        },
        {
          $inc: { quantity: item.quantity },
          $set: { lastUpdated: new Date(), updatedBy: req.user._id },
        },
        { upsert: true }
      );
    }

    transfer.status = 'Received';
    transfer.receivedBy = req.user._id;
    transfer.receivedDate = new Date();
    await transfer.save();

    logger.info(`Stock transfer received: ${transfer.transferNumber}`);

    res.json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

// ===== INVENTORY ADJUSTMENTS =====

export const createInventoryAdjustment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const adjustmentData = {
      ...req.body,
      requestedBy: req.user._id,
    };

    const adjustment = await InventoryAdjustment.create(adjustmentData);
    logger.info(`Inventory adjustment created: ${adjustment.adjustmentNumber}`);

    res.status(201).json({
      success: true,
      data: adjustment,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Adjustment number already exists', 400));
    }
    next(error);
  }
};

export const approveInventoryAdjustment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const adjustment = await InventoryAdjustment.findById(req.params.id);

    if (!adjustment) {
      return next(new AppError('Inventory adjustment not found', 404));
    }

    // Apply adjustment to inventory
    const multiplier = adjustment.adjustmentType === 'Increase' ? 1 : -1;

    await Inventory.findOneAndUpdate(
      {
        material: adjustment.material,
        location: adjustment.location,
        locationType: adjustment.locationType,
      },
      {
        $inc: { quantity: adjustment.quantity * multiplier },
        $set: { lastUpdated: new Date(), updatedBy: req.user._id },
      },
      { upsert: true }
    );

    adjustment.status = 'Approved';
    adjustment.approvedBy = req.user._id;
    adjustment.approvedAt = new Date();
    await adjustment.save();

    logger.info(`Inventory adjustment approved: ${adjustment.adjustmentNumber}`);

    res.json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryAdjustments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, material } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (material) query.material = material;

    const adjustments = await InventoryAdjustment.find(query)
      .populate('material', 'sku name unit')
      .populate('location', 'projectName projectCode name code')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: adjustments.length,
      data: adjustments,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const inventory = await Inventory.find()
      .populate('material', 'sku name unit costPerUnit reorderPoint')
      .populate('location', 'projectName projectCode name code')
      .sort({ 'material.name': 1 });

    // Calculate total value
    const inventoryWithValue = inventory.map((item: any) => ({
      ...item.toObject(),
      totalValue: item.quantity * (item.material?.costPerUnit || 0),
      needsReorder: item.quantity < (item.material?.reorderPoint || 0),
    }));

    res.json({
      success: true,
      count: inventoryWithValue.length,
      data: inventoryWithValue,
    });
  } catch (error) {
    next(error);
  }
};
