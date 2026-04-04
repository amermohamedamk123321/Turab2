import express from 'express';
import {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { sessionAuth } from '../middleware/sessionAuth.js';
import { validateCsrfToken } from '../middleware/csrf.js';
import {
  validateAdminCreate,
  validateAdminUpdate,
  handleValidationErrors,
} from '../utils/validators.js';

const router = express.Router();

// All admin routes require authentication and session validation
router.use(sessionAuth);

/**
 * List all admins
 * GET /api/admins
 */
router.get('/', listAdmins);

/**
 * Get single admin
 * GET /api/admins/:id
 */
router.get('/:id', getAdmin);

/**
 * Create admin
 * POST /api/admins
 */
router.post('/', validateCsrfToken, validateAdminCreate, handleValidationErrors, createAdmin);

/**
 * Update admin
 * PUT /api/admins/:id
 */
router.put('/:id', validateCsrfToken, validateAdminUpdate, handleValidationErrors, updateAdmin);

/**
 * Delete admin
 * DELETE /api/admins/:id
 */
router.delete('/:id', validateCsrfToken, deleteAdmin);

export default router;
