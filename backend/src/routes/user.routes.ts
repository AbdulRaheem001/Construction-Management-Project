import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (Administrator and Accountant can view)
router.get(
  '/',
  authorize(UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT),
  getAllUsers
);

// Get user by ID
router.get('/:id', getUserById);

// Create user (Only Administrator)
router.post('/', authorize(UserRole.ADMINISTRATOR), createUser);

// Update user (Only Administrator)
router.put('/:id', authorize(UserRole.ADMINISTRATOR), updateUser);

// Delete/Deactivate user (Only Administrator)
router.delete('/:id', authorize(UserRole.ADMINISTRATOR), deleteUser);

export default router;
