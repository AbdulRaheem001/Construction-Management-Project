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

// IMPORTANT: Define specific routes BEFORE generic /:id routes

// Material Analytics (must be before /:id)
router.get('/analytics', getMaterialAnalytics);

// Purchase Orders - Only Administrator (must be before /:id)
router.post('/purchase-orders', authorize(UserRole.ADMINISTRATOR), createPurchaseOrder);
router.get('/purchase-orders', getPurchaseOrders);
router.get('/purchase-orders/:id', getPurchaseOrderById);
router.put('/purchase-orders/:id/approve', authorize(UserRole.ADMINISTRATOR), approvePurchaseOrder);
router.put('/purchase-orders/:id/receive', authorize(UserRole.ADMINISTRATOR), receivePurchaseOrder);

// Vendors - Only Administrator (must be before /:id)
router.post('/vendors', authorize(UserRole.ADMINISTRATOR), createVendor);
router.get('/vendors', getVendors);
router.get('/vendors/:id', getVendorById);
router.put('/vendors/:id', authorize(UserRole.ADMINISTRATOR), updateVendor);

// Goods Receipt - Only Administrator (must be before /:id)
router.post('/goods-receipts', authorize(UserRole.ADMINISTRATOR), createGoodsReceipt);

// Material Consumption - Only Administrator (must be before /:id)
router.post('/consumption', authorize(UserRole.ADMINISTRATOR), recordMaterialConsumption);
router.get('/consumption', getMaterialConsumption);
router.post('/consume', authorize(UserRole.ADMINISTRATOR, UserRole.SITE_MANAGER), recordMaterialConsumption);
router.get('/consumption/history/:materialId', getMaterialConsumption);

// Materials CRUD - Only Administrator (/:id must be LAST)
router.post('/', authorize(UserRole.ADMINISTRATOR), createMaterial);
router.get('/', getMaterials);
router.get('/:id', getMaterialById);
router.put('/:id', authorize(UserRole.ADMINISTRATOR), updateMaterial);
router.patch('/:id', authorize(UserRole.ADMINISTRATOR), updateMaterial);

export default router;
