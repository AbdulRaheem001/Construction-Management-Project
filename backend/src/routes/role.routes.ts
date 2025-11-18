import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
} from '../controllers/role.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all roles
router.get('/', getAllRoles);

// Get role by ID
router.get('/:id', getRoleById);

// Create role (Administrator only)
router.post('/', authorize(UserRole.ADMINISTRATOR), createRole);

// Update role (Administrator only)
router.put('/:id', authorize(UserRole.ADMINISTRATOR), updateRole);

// Delete role (Administrator only)
router.delete('/:id', authorize(UserRole.ADMINISTRATOR), deleteRole);

// Assign permissions to role (Administrator only)
router.put('/:id/permissions', authorize(UserRole.ADMINISTRATOR), assignPermissions);

export default router;
