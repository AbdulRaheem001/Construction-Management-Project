import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/user.types';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectSummary,
} from '../controllers/project.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Project CRUD - Only Administrator can create/update/delete
router.post('/', authorize(UserRole.ADMINISTRATOR), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', authorize(UserRole.ADMINISTRATOR), updateProject);
router.delete('/:id', authorize(UserRole.ADMINISTRATOR), deleteProject);

// Project reports
router.get('/:id/summary', getProjectSummary);

export default router;
