import express from 'express';
import {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  validateAdminCreate,
  validateAdminUpdate,
  handleValidationErrors,
} from '../utils/validators.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth());
router.use(requireAdmin);

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
router.post('/', validateAdminCreate, handleValidationErrors, createAdmin);

/**
 * Update admin
 * PUT /api/admins/:id
 */
router.put('/:id', validateAdminUpdate, handleValidationErrors, updateAdmin);

/**
 * Delete admin
 * DELETE /api/admins/:id
 */
router.delete('/:id', deleteAdmin);

export default router;
