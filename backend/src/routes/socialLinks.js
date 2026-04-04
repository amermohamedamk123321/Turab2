import express from 'express';
import {
  listSocialLinks,
  getSocialLink,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../controllers/socialLinkController.js';
import { sessionAuth } from '../middleware/sessionAuth.js';
import { validateCsrfToken } from '../middleware/csrf.js';
import {
  validateSocialLinkCreate,
  validateSocialLinkUpdate,
  handleValidationErrors,
} from '../utils/validators.js';

const router = express.Router();

/**
 * List enabled social links (public)
 * GET /api/social-links
 */
router.get('/', listSocialLinks);

/**
 * Get single social link (public)
 * GET /api/social-links/:id
 */
router.get('/:id', getSocialLink);

/**
 * Create social link (admin only)
 * POST /api/social-links
 */
router.post(
  '/',
  sessionAuth,
  validateCsrfToken,
  validateSocialLinkCreate,
  handleValidationErrors,
  createSocialLink
);

/**
 * Update social link (admin only)
 * PUT /api/social-links/:id
 */
router.put(
  '/:id',
  sessionAuth,
  validateCsrfToken,
  validateSocialLinkUpdate,
  handleValidationErrors,
  updateSocialLink
);

/**
 * Delete social link (admin only)
 * DELETE /api/social-links/:id
 */
router.delete('/:id', sessionAuth, validateCsrfToken, deleteSocialLink);

export default router;
