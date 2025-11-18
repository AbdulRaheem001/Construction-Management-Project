import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  createDailyLog,
  getDailyLogs,
  getDailyLogById,
  updateDailyLog,
} from '../controllers/dailyLog.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Daily Logs
router.post('/', authorize(UserRole.ADMINISTRATOR, UserRole.SITE_MANAGER), createDailyLog);
router.get('/', getDailyLogs);
router.get('/:id', getDailyLogById);
router.put('/:id', authorize(UserRole.ADMINISTRATOR, UserRole.SITE_MANAGER), updateDailyLog);

export default router;
