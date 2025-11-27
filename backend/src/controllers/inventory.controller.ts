import { Request, Response, NextFunction } from 'express';
import Inventory from '../models/Inventory.model';
import Material from '../models/Material.model';
import Warehouse from '../models/Warehouse.model';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Sync material current stock to warehouse inventory
export const syncMaterialStockToWarehouse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { warehouseId } = req.body;

    if (!warehouseId) {
      return next(new AppError('Warehouse ID is required', 400));
    }

    // Check if warehouse exists and get its project
    const warehouse = await Warehouse.findById(warehouseId).populate('project');
    if (!warehouse) {
      return next(new AppError('Warehouse not found', 404));
    }

    // Build query for materials
    let materialQuery: any = {
      isActive: true,
      currentStock: { $gt: 0 },
    };

    // If warehouse is attached to a project, only sync materials from that project's inventory
    let materials: any[] = [];
    
    if (warehouse.project) {
      // Get materials that are in the project's inventory
      const projectInventory = await Inventory.find({
        location: warehouse.project._id,
        locationType: 'Project',
        quantity: { $gt: 0 },
      }).populate('material');

      materials = projectInventory
        .map(inv => typeof inv.material === 'object' ? inv.material : null)
        .filter(mat => mat && (mat as any).isActive) as any[];
        
      logger.info(`Syncing ${materials.length} materials from project ${warehouse.project._id} to warehouse ${warehouse.name}`);
    } else {
      // If no project attached, sync all materials with current stock
      materials = await Material.find(materialQuery);
      logger.info(`Syncing ${materials.length} materials (no project filter) to warehouse ${warehouse.name}`);
    }

    let syncedCount = 0;
    let updatedCount = 0;

    for (const material of materials) {
      if (!material) continue;

      // Get the quantity from project inventory if warehouse has a project
      let quantityToSync = material.currentStock;
      if (warehouse.project) {
        const projectInv = await Inventory.findOne({
          material: material._id,
          location: warehouse.project._id,
          locationType: 'Project',
        });
        quantityToSync = projectInv?.quantity || 0;
      }

      if (quantityToSync <= 0) continue;

      // Check if inventory record already exists
      const existingInventory = await Inventory.findOne({
        material: material._id,
        location: warehouseId,
        locationType: 'Warehouse',
      });

      if (existingInventory) {
        // Update existing inventory
        existingInventory.quantity = quantityToSync;
        existingInventory.lastUpdated = new Date();
        existingInventory.updatedBy = req.user._id;
        await existingInventory.save();
        updatedCount++;
      } else {
        // Create new inventory record
        await Inventory.create({
          material: material._id,
          location: warehouseId,
          locationType: 'Warehouse',
          quantity: quantityToSync,
          binLocation: `BIN-${material.sku}`,
          updatedBy: req.user._id,
        });
        syncedCount++;
      }
    }

    logger.info(
      `Material stock synced to warehouse ${warehouse.name}: ${syncedCount} new, ${updatedCount} updated`
    );

    res.json({
      success: true,
      message: `Successfully synced ${syncedCount + updatedCount} materials to warehouse`,
      data: {
        synced: syncedCount,
        updated: updatedCount,
        total: syncedCount + updatedCount,
        projectFiltered: !!warehouse.project,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all inventory across all locations
export const getAllInventory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locationType, location } = req.query;

    const query: any = {};
    if (locationType) query.locationType = locationType;
    if (location) query.location = location;

    const inventory = await Inventory.find(query)
      .populate('material', 'sku name unit costPerUnit category')
      .populate('location', 'name code projectName projectCode')
      .populate('updatedBy', 'name')
      .sort({ lastUpdated: -1 });

    res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};
