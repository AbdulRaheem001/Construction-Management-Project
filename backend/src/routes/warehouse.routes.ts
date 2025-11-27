import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateInventory,
  createStockTransfer,
  getStockTransfers,
  approveStockTransfer,
  receiveStockTransfer,
  createInventoryAdjustment,
  approveInventoryAdjustment,
  getInventoryAdjustments,
  getInventoryReport,
} from '../controllers/warehouse.controller';
import {
  syncMaterialStockToWarehouse,
  getAllInventory,
} from '../controllers/inventory.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Warehouses - Only Administrator
router.post('/', authorize(UserRole.ADMINISTRATOR), createWarehouse);
router.get('/', getWarehouses);
router.get('/inventory', getInventoryReport);
router.post('/sync-stock', authorize(UserRole.ADMINISTRATOR), syncMaterialStockToWarehouse);
router.put('/inventory/:id', authorize(UserRole.ADMINISTRATOR), updateInventory);
router.get('/:id', getWarehouseById);

// Stock Transfers - Only Administrator
router.post('/transfers', authorize(UserRole.ADMINISTRATOR), createStockTransfer);
router.get('/transfers', getStockTransfers);
router.put('/transfers/:id/approve', authorize(UserRole.ADMINISTRATOR), approveStockTransfer);
router.put('/transfers/:id/receive', authorize(UserRole.ADMINISTRATOR), receiveStockTransfer);

// Inventory Adjustments - Only Administrator
router.post('/adjustments', authorize(UserRole.ADMINISTRATOR), createInventoryAdjustment);
router.get('/adjustments', getInventoryAdjustments);
router.put('/adjustments/:id/approve', authorize(UserRole.ADMINISTRATOR), approveInventoryAdjustment);

// Inventory Reports
router.get('/inventory/report', getInventoryReport);

export default router;
