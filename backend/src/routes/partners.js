import express from 'express';
import {
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
} from '../controllers/partnerController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  validatePartnerCreate,
  validatePartnerUpdate,
  handleValidationErrors,
} from '../utils/validators.js';

const router = express.Router();

// Public endpoints
router.get('/', listPartners);
router.get('/:id', getPartner);

// Admin-only endpoints
router.post('/', requireAuth(), requireAdmin, validatePartnerCreate, handleValidationErrors, createPartner);
router.put('/:id', requireAuth(), requireAdmin, validatePartnerUpdate, handleValidationErrors, updatePartner);
router.delete('/:id', requireAuth(), requireAdmin, deletePartner);

export default router;
