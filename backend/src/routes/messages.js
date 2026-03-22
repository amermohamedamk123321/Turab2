import express from 'express';
import {
  listMessages,
  getMessage,
  createMessage,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  validateMessageCreate,
  handleValidationErrors,
} from '../utils/validators.js';

const router = express.Router();

/**
 * List all messages (admin only)
 * GET /api/messages
 */
router.get('/', requireAuth(), requireAdmin, listMessages);

/**
 * Get single message (admin only)
 * GET /api/messages/:id
 */
router.get('/:id', requireAuth(), requireAdmin, getMessage);

/**
 * Create message (public)
 * POST /api/messages
 */
router.post('/', validateMessageCreate, handleValidationErrors, createMessage);

/**
 * Mark message as read (admin only)
 * PATCH /api/messages/:id/read
 */
router.patch('/:id/read', requireAuth(), requireAdmin, markMessageAsRead);

/**
 * Delete message (admin only)
 * DELETE /api/messages/:id
 */
router.delete('/:id', requireAuth(), requireAdmin, deleteMessage);

export default router;
