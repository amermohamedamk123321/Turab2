import express from 'express';
import {
  listProjectRequests,
  getProjectRequest,
  createProjectRequest,
  deleteProjectRequest,
} from '../controllers/projectRequestController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  validateProjectRequestCreate,
  handleValidationErrors,
} from '../utils/validators.js';

const router = express.Router();

/**
 * List all project requests (admin only)
 * GET /api/project-requests
 */
router.get('/', requireAuth(), requireAdmin, listProjectRequests);

/**
 * Get single project request (admin only)
 * GET /api/project-requests/:id
 */
router.get('/:id', requireAuth(), requireAdmin, getProjectRequest);

/**
 * Create project request (public)
 * POST /api/project-requests
 */
router.post(
  '/',
  validateProjectRequestCreate,
  handleValidationErrors,
  createProjectRequest
);

/**
 * Delete project request (admin only)
 * DELETE /api/project-requests/:id
 */
router.delete('/:id', requireAuth(), requireAdmin, deleteProjectRequest);

export default router;
