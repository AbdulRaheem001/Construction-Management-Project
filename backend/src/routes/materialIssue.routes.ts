import { Router } from 'express';
import {
  createMaterialIssue,
  getMaterialIssues,
  getMaterialIssuesByProject,
  getMaterialConsumptionSummary,
  getMaterialIssueById,
  deleteMaterialIssue,
} from '../controllers/materialIssue.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new material issue (consume material)
router.post('/', createMaterialIssue);

// Get all material issues (with filters)
router.get('/', getMaterialIssues);

// Get material issues by project
router.get('/project/:projectId', getMaterialIssuesByProject);

// Get material consumption summary by project
router.get('/project/:projectId/summary', getMaterialConsumptionSummary);

// Get single material issue
router.get('/:id', getMaterialIssueById);

// Delete material issue (restore stock)
router.delete('/:id', deleteMaterialIssue);

export default router;
