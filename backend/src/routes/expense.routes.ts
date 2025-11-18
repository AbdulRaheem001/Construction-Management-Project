import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  approveExpense,
  getFinancialReport,
} from '../controllers/expense.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Expenses - Only Administrator can create/update/approve
router.post('/', authorize(UserRole.ADMINISTRATOR), createExpense);
router.get('/', getExpenses);
router.get('/reports/financial', authorize(UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT), getFinancialReport);
router.get('/:id', getExpenseById);
router.put('/:id', authorize(UserRole.ADMINISTRATOR), updateExpense);
router.put('/:id/approve', authorize(UserRole.ADMINISTRATOR), approveExpense);

export default router;
