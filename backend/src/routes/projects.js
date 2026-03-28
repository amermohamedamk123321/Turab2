import express from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  validateProjectCreate,
  validateProjectUpdate,
  handleValidationErrors,
} from '../utils/validators.js';

const router = express.Router();

/**
 * List all projects (public)
 * GET /api/projects
 * GET /api/projects?featured=true
 */
router.get('/', listProjects);

/**
 * Get single project (public)
 * GET /api/projects/:id
 */
router.get('/:id', getProject);

/**
 * Create project (admin only)
 * POST /api/projects
 */
router.post(
  '/',
  requireAuth(),
  requireAdmin,
  validateProjectCreate,
  handleValidationErrors,
  createProject
);

/**
 * Update project (admin only)
 * PUT /api/projects/:id
 */
router.put(
  '/:id',
  requireAuth(),
  requireAdmin,
  validateProjectUpdate,
  handleValidationErrors,
  updateProject
);

/**
 * Delete project (admin only)
 * DELETE /api/projects/:id
 */
router.delete('/:id', requireAuth(), requireAdmin, deleteProject);

export default router;
