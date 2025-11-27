import { Response, NextFunction } from 'express';
import StockTransfer from '../models/StockTransfer.model';
import Inventory from '../models/Inventory.model';
import Material from '../models/Material.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Create Stock Transfer
export const createStockTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fromLocation,
      fromLocationType,
      toLocation,
      toLocationType,
      items,
      notes,
    } = req.body;

    // Validate that source and destination are different
    if (fromLocation === toLocation && fromLocationType === toLocationType) {
      return next(new AppError('Source and destination cannot be the same', 400));
    }

    // Check stock availability for each item
    for (const item of items) {
      const inventory = await Inventory.findOne({
        material: item.material,
        location: fromLocation,
        locationType: fromLocationType,
      });

      if (!inventory || inventory.quantity < item.quantity) {
        const material = await Material.findById(item.material);
        return next(
          new AppError(
            `Insufficient stock for ${material?.name || 'material'}. Available: ${
              inventory?.quantity || 0
            }, Required: ${item.quantity}`,
            400
          )
        );
      }
    }

    // Generate transfer number
    const count = await StockTransfer.countDocuments();
    const transferNumber = `ST-${String(count + 1).padStart(6, '0')}`;

    // Create transfer
    const transfer = await StockTransfer.create({
      transferNumber,
      fromLocation,
      fromLocationType,
      toLocation,
      toLocationType,
      items,
      status: 'Pending',
      requestedBy: req.user._id,
      notes,
    });

    await transfer.populate([
      { path: 'fromLocation', select: 'projectName projectCode name code' },
      { path: 'toLocation', select: 'projectName projectCode name code' },
      { path: 'items.material', select: 'sku name unit' },
      { path: 'requestedBy', select: 'name email' },
    ]);

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

// Get All Stock Transfers
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
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('receivedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    next(error);
  }
};

// Get Stock Transfer by ID
export const getStockTransferById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id)
      .populate('fromLocation', 'projectName projectCode name code location')
      .populate('toLocation', 'projectName projectCode name code location')
      .populate('items.material', 'sku name unit avgUnitCost')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('receivedBy', 'name email');

    if (!transfer) {
      return next(new AppError('Stock transfer not found', 404));
    }

    res.json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

// Approve Stock Transfer
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

    if (transfer.status !== 'Pending') {
      return next(new AppError('Only pending transfers can be approved', 400));
    }

    // Check stock availability again
    for (const item of transfer.items) {
      const inventory = await Inventory.findOne({
        material: item.material,
        location: transfer.fromLocation,
        locationType: transfer.fromLocationType,
      });

      if (!inventory || inventory.quantity < item.quantity) {
        const material = await Material.findById(item.material);
        return next(
          new AppError(
            `Insufficient stock for ${material?.name || 'material'}`,
            400
          )
        );
      }
    }

    // Deduct from source
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

    await transfer.populate([
      { path: 'fromLocation', select: 'projectName projectCode name code' },
      { path: 'toLocation', select: 'projectName projectCode name code' },
      { path: 'items.material', select: 'sku name unit' },
      { path: 'approvedBy', select: 'name email' },
    ]);

    logger.info(`Stock transfer approved: ${transfer.transferNumber}`);

    res.json({
      success: true,
      data: transfer,
      message: 'Transfer approved and stock deducted from source',
    });
  } catch (error) {
    next(error);
  }
};

// Receive Stock Transfer
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

    if (transfer.status !== 'In Transit') {
      return next(new AppError('Only in-transit transfers can be received', 400));
    }

    // Add to destination
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
        { upsert: true, new: true }
      );
    }

    transfer.status = 'Received';
    transfer.receivedBy = req.user._id;
    transfer.receivedDate = new Date();
    await transfer.save();

    await transfer.populate([
      { path: 'fromLocation', select: 'projectName projectCode name code' },
      { path: 'toLocation', select: 'projectName projectCode name code' },
      { path: 'items.material', select: 'sku name unit' },
      { path: 'receivedBy', select: 'name email' },
    ]);

    logger.info(`Stock transfer received: ${transfer.transferNumber}`);

    res.json({
      success: true,
      data: transfer,
      message: 'Transfer received and stock added to destination',
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Stock Transfer
export const cancelStockTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id);

    if (!transfer) {
      return next(new AppError('Stock transfer not found', 404));
    }

    if (transfer.status === 'Received') {
      return next(new AppError('Cannot cancel a received transfer', 400));
    }

    // If transfer was approved (In Transit), restore stock to source
    if (transfer.status === 'In Transit') {
      for (const item of transfer.items) {
        await Inventory.findOneAndUpdate(
          {
            material: item.material,
            location: transfer.fromLocation,
            locationType: transfer.fromLocationType,
          },
          {
            $inc: { quantity: item.quantity },
            $set: { lastUpdated: new Date(), updatedBy: req.user._id },
          }
        );
      }
    }

    const wasInTransit = transfer.status === 'In Transit';
    
    transfer.status = 'Cancelled';
    await transfer.save();

    logger.info(`Stock transfer cancelled: ${transfer.transferNumber}`);

    res.json({
      success: true,
      data: transfer,
      message:
        wasInTransit
          ? 'Transfer cancelled and stock restored to source'
          : 'Transfer cancelled',
    });
  } catch (error) {
    next(error);
  }
};

// Get Inventory by Location
export const getInventoryByLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locationId, locationType } = req.params;

    const inventory = await Inventory.find({
      location: locationId,
      locationType: locationType,
    })
      .populate('material', 'sku name unit avgUnitCost reorderPoint category')
      .populate('updatedBy', 'name')
      .sort({ 'material.name': 1 });

    // Calculate total value
    const totalValue = inventory.reduce(
      (sum, item: any) =>
        sum + item.quantity * (item.material?.avgUnitCost || 0),
      0
    );

    res.json({
      success: true,
      count: inventory.length,
      data: {
        inventory,
        totalValue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Material Location Summary
export const getMaterialLocationSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { materialId } = req.params;

    const locations = await Inventory.find({ material: materialId })
      .populate('location', 'projectName projectCode name code location')
      .sort({ quantity: -1 });

    const material = await Material.findById(materialId);

    if (!material) {
      return next(new AppError('Material not found', 404));
    }

    const totalStock = locations.reduce((sum, loc) => sum + loc.quantity, 0);

    res.json({
      success: true,
      data: {
        material,
        locations,
        totalStock,
      },
    });
  } catch (error) {
    next(error);
  }
};
