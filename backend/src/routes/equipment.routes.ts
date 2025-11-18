import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  createEquipment,
  getEquipment,
  getEquipmentById,
  updateEquipment,
  recordEquipmentUsage,
  getEquipmentUsage,
  scheduleMaintenance,
  getMaintenance,
  updateMaintenance,
} from '../controllers/equipment.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Equipment - Only Administrator
router.post('/', authorize(UserRole.ADMINISTRATOR), createEquipment);
router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.put('/:id', authorize(UserRole.ADMINISTRATOR), updateEquipment);

// Equipment Usage - Only Administrator
router.post('/usage', authorize(UserRole.ADMINISTRATOR), recordEquipmentUsage);
router.get('/usage', getEquipmentUsage);

// Maintenance - Only Administrator
router.post('/maintenance', authorize(UserRole.ADMINISTRATOR), scheduleMaintenance);
router.get('/maintenance', getMaintenance);
router.put('/maintenance/:id', authorize(UserRole.ADMINISTRATOR), updateMaintenance);

export default router;
