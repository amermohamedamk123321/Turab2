import express from 'express';
import {
  listMessages,
  getMessage,
  createMessage,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { sessionAuth } from '../middleware/sessionAuth.js';
import { validateCsrfToken } from '../middleware/csrf.js';
import {
  validateMessageCreate,
  handleValidationErrors,
} from '../utils/validators.js';

const router = express.Router();

/**
 * List all messages (admin only)
 * GET /api/messages
 */
router.get('/', sessionAuth, listMessages);

/**
 * Get single message (admin only)
 * GET /api/messages/:id
 */
router.get('/:id', sessionAuth, getMessage);

/**
 * Create message (public)
 * POST /api/messages
 */
router.post('/', validateMessageCreate, handleValidationErrors, createMessage);

/**
 * Mark message as read (admin only)
 * PATCH /api/messages/:id/read
 */
router.patch('/:id/read', sessionAuth, validateCsrfToken, markMessageAsRead);

/**
 * Delete message (admin only)
 * DELETE /api/messages/:id
 */
router.delete('/:id', sessionAuth, validateCsrfToken, deleteMessage);

export default router;
