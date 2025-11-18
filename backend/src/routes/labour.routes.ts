import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  createTimesheet,
  getTimesheets,
  approveTimesheet,
  rejectTimesheet,
  getPayrollReport,
} from '../controllers/labour.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employees - Only Administrator
router.post('/employees', authorize(UserRole.ADMINISTRATOR), createEmployee);
router.get('/employees', getEmployees);
router.get('/employees/:id', getEmployeeById);
router.put('/employees/:id', authorize(UserRole.ADMINISTRATOR), updateEmployee);

// Timesheets - Only Administrator can approve/reject
router.post('/timesheets', createTimesheet);
router.get('/timesheets', getTimesheets);
router.put('/timesheets/:id/approve', authorize(UserRole.ADMINISTRATOR), approveTimesheet);
router.put('/timesheets/:id/reject', authorize(UserRole.ADMINISTRATOR), rejectTimesheet);

// Payroll - Only Administrator and Accountant can view
router.get('/payroll', authorize(UserRole.ADMINISTRATOR, UserRole.ACCOUNTANT), getPayrollReport);

export default router;
