import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  approvePurchaseOrder,
  receivePurchaseOrder,
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  getMaterialAnalytics,
  createGoodsReceipt,
  recordMaterialConsumption,
  getMaterialConsumption,
} from '../controllers/material.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Materials (base path is already /api/materials) - Only Administrator
router.get('/analytics', getMaterialAnalytics);
router.post('/', authorize(UserRole.ADMINISTRATOR), createMaterial);
router.get('/', getMaterials);
router.get('/:id', getMaterialById);
router.put('/:id', authorize(UserRole.ADMINISTRATOR), updateMaterial);
router.patch('/:id', authorize(UserRole.ADMINISTRATOR), updateMaterial);

// Vendors - Only Administrator
router.post('/vendors', authorize(UserRole.ADMINISTRATOR), createVendor);
router.get('/vendors', getVendors);
router.get('/vendors/:id', getVendorById);
router.put('/vendors/:id', authorize(UserRole.ADMINISTRATOR), updateVendor);

// Purchase Orders - Only Administrator
router.post('/purchase-orders', authorize(UserRole.ADMINISTRATOR), createPurchaseOrder);
router.get('/purchase-orders', getPurchaseOrders);
router.get('/purchase-orders/:id', getPurchaseOrderById);
router.put('/purchase-orders/:id/approve', authorize(UserRole.ADMINISTRATOR), approvePurchaseOrder);
router.put('/purchase-orders/:id/receive', authorize(UserRole.ADMINISTRATOR), receivePurchaseOrder);

// Goods Receipt - Only Administrator
router.post('/goods-receipts', authorize(UserRole.ADMINISTRATOR), createGoodsReceipt);

// Material Consumption - Only Administrator
router.post('/consumption', authorize(UserRole.ADMINISTRATOR), recordMaterialConsumption);
router.get('/consumption', getMaterialConsumption);

export default router;
