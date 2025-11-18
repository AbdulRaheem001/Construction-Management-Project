import { Response, NextFunction } from 'express';
import Material from '../models/Material.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import GoodsReceipt from '../models/GoodsReceipt.model';
import Inventory from '../models/Inventory.model';
import MaterialConsumption from '../models/MaterialConsumption.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ===== MATERIALS =====

export const createMaterial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const material = await Material.create(req.body);
    logger.info(`Material created: ${material.sku}`);

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('SKU already exists', 400));
    }
    next(error);
  }
};

export const getMaterials = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, search, lowStock } = req.query;

    const query: any = { isActive: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await Material.find(query).sort({ name: 1 });

    // Filter for low stock if requested
    let result: any[] = materials;
    if (lowStock === 'true') {
      result = [];
      for (const material of materials) {
        const totalStock = await Inventory.aggregate([
          { $match: { material: material._id } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);
        const stock = totalStock[0]?.total || 0;
        if (stock < material.reorderPoint) {
          result.push({ ...material.toObject(), currentStock: stock } as any);
        }
      }
    }

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaterialById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return next(new AppError('Material not found', 404));
    }

    // Get current stock levels
    const stockLevels = await Inventory.find({ material: material._id })
      .populate('location', 'projectName projectCode name code')
      .select('quantity location locationType binLocation');

    res.json({
      success: true,
      data: {
        material,
        stockLevels,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMaterial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!material) {
      return next(new AppError('Material not found', 404));
    }

    logger.info(`Material updated: ${material.sku}`);

    res.json({
      success: true,
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

// ===== PURCHASE ORDERS =====

export const createPurchaseOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const poData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const purchaseOrder = await PurchaseOrder.create(poData);
    logger.info(`Purchase Order created: ${purchaseOrder.poNumber}`);

    res.status(201).json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('PO number already exists', 400));
    }
    next(error);
  }
};

export const getPurchaseOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { project, status } = req.query;

    const query: any = {};
    if (project) query.project = project;
    if (status) query.status = status;

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('project', 'projectName projectCode')
      .populate('items.material', 'sku name unit')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: purchaseOrders.length,
      data: purchaseOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('project', 'projectName projectCode client')
      .populate('items.material', 'sku name unit costPerUnit')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!purchaseOrder) {
      return next(new AppError('Purchase order not found', 404));
    }

    // Get goods receipts for this PO
    const goodsReceipts = await GoodsReceipt.find({ purchaseOrder: purchaseOrder._id })
      .populate('receivedBy', 'name')
      .select('grNumber receivedDate status items');

    res.json({
      success: true,
      data: {
        purchaseOrder,
        goodsReceipts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const approvePurchaseOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!purchaseOrder) {
      return next(new AppError('Purchase order not found', 404));
    }

    logger.info(`Purchase Order approved: ${purchaseOrder.poNumber}`);

    res.json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    next(error);
  }
};

// ===== GOODS RECEIPT =====

export const createGoodsReceipt = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { purchaseOrder, items, destination, destinationType, notes, status } = req.body;

    // Create goods receipt
    const grData = {
      grNumber: req.body.grNumber,
      purchaseOrder,
      receivedDate: new Date(),
      receivedBy: req.user._id,
      items,
      destination,
      destinationType,
      notes,
      status,
    };

    const goodsReceipt = await GoodsReceipt.create(grData);

    // Update inventory for each item
    for (const item of items) {
      const netQuantity = item.receivedQuantity - (item.damagedQuantity || 0);

      await Inventory.findOneAndUpdate(
        {
          material: item.material,
          location: destination,
          locationType: destinationType,
        },
        {
          $inc: { quantity: netQuantity },
          $set: { lastUpdated: new Date(), updatedBy: req.user._id },
        },
        { upsert: true, new: true }
      );
    }

    // Update PO status
    const allReceipts = await GoodsReceipt.find({ purchaseOrder });
    const po = await PurchaseOrder.findById(purchaseOrder);
    
    if (po) {
      let allReceived = true;
      for (const poItem of po.items) {
        const totalReceived = allReceipts.reduce((sum, gr) => {
          const grItem = gr.items.find(
            (i: any) => i.material.toString() === poItem.material.toString()
          );
          return sum + (grItem?.receivedQuantity || 0);
        }, 0);

        if (totalReceived < poItem.quantity) {
          allReceived = false;
          break;
        }
      }

      po.status = allReceived ? 'Fully Received' : 'Partially Received';
      await po.save();
    }

    logger.info(`Goods Receipt created: ${goodsReceipt.grNumber}`);

    res.status(201).json({
      success: true,
      data: goodsReceipt,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('GR number already exists', 400));
    }
    next(error);
  }
};

// ===== MATERIAL CONSUMPTION =====

export const recordMaterialConsumption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { project, material, quantity, purpose, notes } = req.body;

    // Check if enough stock is available
    const inventory = await Inventory.findOne({
      material,
      location: project,
      locationType: 'Project',
    });

    if (!inventory || inventory.quantity < quantity) {
      return next(new AppError('Insufficient stock available', 400));
    }

    // Create consumption record
    const consumption = await MaterialConsumption.create({
      consumptionNumber: req.body.consumptionNumber,
      project,
      material,
      quantity,
      purpose,
      consumedBy: req.user._id,
      notes,
    });

    // Deduct from inventory
    inventory.quantity -= quantity;
    inventory.lastUpdated = new Date();
    inventory.updatedBy = req.user._id;
    await inventory.save();

    logger.info(`Material consumption recorded: ${consumption.consumptionNumber}`);

    res.status(201).json({
      success: true,
      data: consumption,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Consumption number already exists', 400));
    }
    next(error);
  }
};

export const getMaterialConsumption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { project, material } = req.query;

    const query: any = {};
    if (project) query.project = project;
    if (material) query.material = material;

    const consumption = await MaterialConsumption.find(query)
      .populate('project', 'projectName projectCode')
      .populate('material', 'sku name unit costPerUnit')
      .populate('consumedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: consumption.length,
      data: consumption,
    });
  } catch (error) {
    next(error);
  }
};
