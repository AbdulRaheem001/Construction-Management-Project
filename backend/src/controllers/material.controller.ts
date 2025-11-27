import { Response, NextFunction } from 'express';
import Material from '../models/Material.model';
import Vendor from '../models/Vendor.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import GoodsReceipt from '../models/GoodsReceipt.model';
import Inventory from '../models/Inventory.model';
import MaterialConsumption from '../models/MaterialConsumption.model';
import Expense from '../models/Expense.model';
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
    const materialData = { ...req.body };
    const { warehouse, initialStock } = req.body;
    
    // If initialStock is provided, set currentStock and avgUnitCost
    if (initialStock && initialStock > 0) {
      materialData.currentStock = initialStock;
      materialData.avgUnitCost = materialData.costPerUnit || 0;
    } else {
      // If no initial stock, set avgUnitCost to costPerUnit for future use
      materialData.avgUnitCost = materialData.costPerUnit || 0;
      materialData.currentStock = 0;
    }
    
    // Remove warehouse from material data (not a material field)
    delete materialData.warehouse;
    
    const material = await Material.create(materialData);
    logger.info(`Material created: ${material.sku}`);

    // If warehouse and initial stock provided, create inventory record at warehouse
    if (warehouse && initialStock && initialStock > 0) {
      await Inventory.findOneAndUpdate(
        {
          material: material._id,
          location: warehouse,
          locationType: 'Warehouse',
        },
        {
          $inc: { quantity: initialStock },
          $set: {
            lastUpdated: new Date(),
            updatedBy: req.user._id,
          },
        },
        { upsert: true, new: true }
      );
      logger.info(`Inventory created at warehouse for material: ${material.sku}, Qty: ${initialStock}`);
    }

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

    let materials = await Material.find(query).sort({ name: 1 }).lean();

    // Calculate total_value for each material (stock × avgUnitCost)
    materials = materials.map((material: any) => ({
      ...material,
      totalValue: material.currentStock * material.avgUnitCost,
    }));

    // Filter for low stock if requested
    if (lowStock === 'true') {
      materials = materials.filter((m: any) => m.currentStock < m.reorderPoint);
    }

    res.json({
      success: true,
      count: materials.length,
      data: materials,
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
    // Calculate total amount from line items
    const items = req.body.items || [];
    const totalAmount = items.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.unitPrice;
      item.totalPrice = itemTotal;
      return sum + itemTotal;
    }, 0);

    const poData = {
      ...req.body,
      items,
      totalAmount,
      createdBy: req.user._id,
    };

    const purchaseOrder = await PurchaseOrder.create(poData);
    
    // Update vendor if provided
    if (purchaseOrder.vendor) {
      await Vendor.findByIdAndUpdate(purchaseOrder.vendor, {
        $inc: { 
          totalPurchases: totalAmount,
          outstandingPayments: totalAmount 
        },
      });
    }

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
    const { project, status, vendor, paymentStatus } = req.query;

    const query: any = {};
    if (project) query.project = project;
    if (status) query.status = status;
    if (vendor) query.vendor = vendor;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('project', 'projectName projectCode')
      .populate('vendor', 'name vendorCode')
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

// Update PO status to Received and calculate Moving Average Cost
// Now supports receiving to specific location (Project or Warehouse)
export const receivePurchaseOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { destination, destinationType } = req.body; // Can be Project ID or Warehouse ID
    
    const po = await PurchaseOrder.findById(req.params.id).populate('items.material');

    if (!po) {
      return next(new AppError('Purchase order not found', 404));
    }

    if (po.status === 'Received') {
      return next(new AppError('Purchase order already received', 400));
    }

    // If no destination specified, use the PO's project as destination
    const finalDestination = destination || po.project;
    const finalDestinationType = destinationType || 'Project';

    // Generate GR number
    const grCount = await GoodsReceipt.countDocuments();
    const grNumber = `GR-${String(grCount + 1).padStart(6, '0')}`;

    // Update material stock and calculate Moving Average Cost for each item
    for (const item of po.items) {
      const material = await Material.findById(item.material);
      
      if (material) {
        const oldStock = material.currentStock;
        const oldAvgCost = material.avgUnitCost;
        const newQuantity = item.quantity;
        const newCost = item.unitPrice;

        // Moving Average Cost Formula:
        // New Avg Cost = [(Old Stock × Old Avg Cost) + (New Qty × New Cost)] / (Old Stock + New Qty)
        let newAvgCost: number;
        
        if (oldStock === 0) {
          newAvgCost = newCost;
        } else {
          const totalOldValue = oldStock * oldAvgCost;
          const newValue = newQuantity * newCost;
          const newTotalStock = oldStock + newQuantity;
          newAvgCost = (totalOldValue + newValue) / newTotalStock;
        }

        material.currentStock = oldStock + newQuantity;
        material.avgUnitCost = newAvgCost;
        await material.save();

        // Update inventory at destination location
        await Inventory.findOneAndUpdate(
          {
            material: material._id,
            location: finalDestination,
            locationType: finalDestinationType,
          },
          {
            $inc: { quantity: newQuantity },
            $set: { lastUpdated: new Date(), updatedBy: req.user._id },
          },
          { upsert: true, new: true }
        );

        logger.info(`Material ${material.sku} updated: Stock ${oldStock} → ${material.currentStock}, Avg Cost ${oldAvgCost.toFixed(2)} → ${newAvgCost.toFixed(2)}`);
      }
    }

    // Create Goods Receipt record
    const grItems = po.items.map((item) => ({
      material: item.material,
      orderedQuantity: item.quantity,
      receivedQuantity: item.quantity,
      damagedQuantity: 0,
    }));

    await GoodsReceipt.create({
      grNumber,
      purchaseOrder: po._id,
      receivedDate: new Date(),
      receivedBy: req.user._id,
      items: grItems,
      destination: finalDestination,
      destinationType: finalDestinationType,
      status: 'Complete',
    });

    // Update PO status
    po.status = 'Received';
    po.receivedAt = new Date();
    await po.save();

    // Create expense record for the project to track material costs
    if (po.project) {
      const expenseCount = await Expense.countDocuments();
      const expenseNumber = `EXP-${String(expenseCount + 1).padStart(6, '0')}`;

      await Expense.create({
        expenseNumber,
        project: po.project,
        category: 'Other',
        expenseType: 'Material',
        description: `Material Purchase - PO: ${po.poNumber} (${po.supplier})`,
        amount: po.totalAmount,
        amountPaid: po.paidAmount || 0,
        date: new Date(),
        vendor: po.supplier,
        invoiceNumber: po.poNumber,
        paymentStatus: po.paymentStatus === 'Paid' ? 'Paid' : 
                       po.paymentStatus === 'Partial' ? 'Partially Paid' : 'Pending',
        notes: `Goods Receipt: ${grNumber}. Materials received to ${finalDestinationType === 'Project' ? 'project site' : 'warehouse'}.`,
        createdBy: req.user._id,
      });

      logger.info(`Expense record created for PO ${po.poNumber}: ${expenseNumber}`);
    }

    logger.info(`Purchase Order received: ${po.poNumber} to ${finalDestinationType}`);

    res.json({
      success: true,
      data: po,
      message: `Purchase order received and stock added to ${finalDestinationType === 'Project' ? 'project' : 'company'} store`,
    });
  } catch (error) {
    next(error);
  }
};

// ===== VENDORS =====

export const createVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendor = await Vendor.create(req.body);
    logger.info(`Vendor created: ${vendor.vendorCode}`);

    res.status(201).json({
      success: true,
      data: vendor,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Vendor code already exists', 400));
    }
    next(error);
  }
};

export const getVendors = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;

    const query: any = { isActive: true };
    if (search) {
      query.$or = [
        { vendorCode: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const vendors = await Vendor.find(query).sort({ name: 1 }).lean();

    // Calculate ledger from expenses for each vendor
    const vendorsWithLedger = await Promise.all(
      vendors.map(async (vendor) => {
        const expenses = await Expense.find({ vendor: vendor._id });
        
        const totalPurchases = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const totalPaid = expenses.reduce((sum, exp) => sum + (exp.amountPaid || 0), 0);
        const outstandingPayments = totalPurchases - totalPaid;

        return {
          ...vendor,
          totalPurchases,
          outstandingPayments,
        };
      })
    );

    res.json({
      success: true,
      count: vendorsWithLedger.length,
      data: vendorsWithLedger,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendor = await Vendor.findById(req.params.id).lean();

    if (!vendor) {
      return next(new AppError('Vendor not found', 404));
    }

    // Calculate ledger from expenses
    const expenses = await Expense.find({ vendor: vendor._id });
    const totalPurchases = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalPaid = expenses.reduce((sum, exp) => sum + (exp.amountPaid || 0), 0);
    const outstandingPayments = totalPurchases - totalPaid;

    // Get vendor's purchase orders
    const purchaseOrders = await PurchaseOrder.find({ vendor: vendor._id })
      .populate('project', 'projectName')
      .select('poNumber totalAmount status orderDate')
      .sort({ orderDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        vendor: {
          ...vendor,
          totalPurchases,
          outstandingPayments,
        },
        recentPurchaseOrders: purchaseOrders,
        expenses: expenses.slice(0, 10), // Last 10 expenses
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return next(new AppError('Vendor not found', 404));
    }

    logger.info(`Vendor updated: ${vendor.vendorCode}`);

    res.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

// ===== MATERIAL ANALYTICS =====

export const getMaterialAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Calculate total inventory value
    const materials = await Material.find({ isActive: true });
    const totalInventoryValue = materials.reduce((sum, m) => sum + (m.currentStock * m.avgUnitCost), 0);

    // Get outstanding payments from POs
    const outstandingPos = await PurchaseOrder.aggregate([
      {
        $match: {
          status: { $in: ['Approved', 'Received', 'Partially Received'] },
          paymentStatus: { $in: ['Pending', 'Partial'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
        },
      },
    ]);
    const outstandingPayments = outstandingPos[0]?.total || 0;

    // Calculate monthly spend (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlySpend = await PurchaseOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: startOfMonth },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Low stock items
    const lowStockCount = materials.filter(m => m.currentStock < m.reorderPoint).length;

    // Total materials
    const totalMaterials = materials.length;

    res.json({
      success: true,
      data: {
        totalInventoryValue,
        outstandingPayments,
        monthlySpend: monthlySpend[0]?.total || 0,
        lowStockCount,
        totalMaterials,
      },
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

      po.status = allReceived ? 'Received' : 'Partially Received';
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
    const { projectId, materialId, warehouseId, quantity, usedBy, purpose, notes } = req.body;
    
    // Support both old and new field names
    const project = projectId || req.body.project;
    const material = materialId || req.body.material;

    if (!project || !material || !quantity) {
      return next(new AppError('Project, material, and quantity are required', 400));
    }

    // Determine source location (warehouse or project)
    const sourceLocationType = warehouseId ? 'Warehouse' : 'Project';
    const sourceLocation = warehouseId || project;

    // Check if enough stock is available at source
    const inventory = await Inventory.findOne({
      material,
      location: sourceLocation,
      locationType: sourceLocationType,
    });

    if (!inventory || inventory.quantity < quantity) {
      return next(new AppError(`Insufficient stock available at ${sourceLocationType.toLowerCase()}`, 400));
    }

    // Get material info for cost calculation
    const materialDoc = await Material.findById(material);
    if (!materialDoc) {
      return next(new AppError('Material not found', 404));
    }

    const totalCost = quantity * (materialDoc.costPerUnit || 0);

    // Generate consumption number if not provided
    const consumptionNumber = req.body.consumptionNumber || `MC-${Date.now()}`;

    // Create consumption record
    const consumption = await MaterialConsumption.create({
      consumptionNumber,
      project,
      material,
      quantity,
      unitCost: materialDoc.costPerUnit || 0,
      totalCost,
      purpose: purpose || req.body.purpose,
      consumedBy: req.user._id,
      notes,
      usedBy,
      issuedFrom: warehouseId ? 'Warehouse' : 'Project',
      warehouseId: warehouseId || null,
    });

    // Deduct from source inventory
    inventory.quantity -= quantity;
    inventory.lastUpdated = new Date();
    inventory.updatedBy = req.user._id;
    await inventory.save();

    // If issuing from warehouse to project, add to project inventory
    if (warehouseId && warehouseId !== project) {
      await Inventory.findOneAndUpdate(
        {
          material,
          location: project,
          locationType: 'Project',
        },
        {
          $inc: { quantity },
          $set: { lastUpdated: new Date(), updatedBy: req.user._id },
        },
        { upsert: true }
      );
    }

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
    const { materialId } = req.params;

    const query: any = {};
    if (project) query.project = project;
    if (material || materialId) query.material = material || materialId;

    const consumption = await MaterialConsumption.find(query)
      .populate('project', 'projectName projectCode location')
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
