import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createStockTransfer,
  getStockTransfers,
  getStockTransferById,
  approveStockTransfer,
  receiveStockTransfer,
  cancelStockTransfer,
  getInventoryByLocation,
  getMaterialLocationSummary,
} from '../controllers/stockTransfer.controller';

const router = express.Router();

// Stock Transfer Routes
router.post('/', authenticate, createStockTransfer);
router.get('/', authenticate, getStockTransfers);
router.get('/:id', authenticate, getStockTransferById);
router.put('/:id/approve', authenticate, approveStockTransfer);
router.put('/:id/receive', authenticate, receiveStockTransfer);
router.put('/:id/cancel', authenticate, cancelStockTransfer);

// Inventory Routes
router.get('/inventory/:locationType/:locationId', authenticate, getInventoryByLocation);
router.get('/material-locations/:materialId', authenticate, getMaterialLocationSummary);

export default router;
