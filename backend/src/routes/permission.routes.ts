import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  getAllPermissions,
  getPermissionsByModule,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from '../controllers/permission.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all permissions
router.get('/', getAllPermissions);

// Get permissions grouped by module
router.get('/by-module', getPermissionsByModule);

// Get permission by ID
router.get('/:id', getPermissionById);

// Create permission (Administrator only)
router.post('/', authorize(UserRole.ADMINISTRATOR), createPermission);

// Update permission (Administrator only)
router.put('/:id', authorize(UserRole.ADMINISTRATOR), updatePermission);

// Delete permission (Administrator only)
router.delete('/:id', authorize(UserRole.ADMINISTRATOR), deletePermission);

export default router;
