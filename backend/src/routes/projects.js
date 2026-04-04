import express from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { sessionAuth } from '../middleware/sessionAuth.js';
import { validateCsrfToken } from '../middleware/csrf.js';
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
  sessionAuth,
  validateCsrfToken,
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
  sessionAuth,
  validateCsrfToken,
  validateProjectUpdate,
  handleValidationErrors,
  updateProject
);

/**
 * Delete project (admin only)
 * DELETE /api/projects/:id
 */
router.delete('/:id', sessionAuth, validateCsrfToken, deleteProject);

export default router;
