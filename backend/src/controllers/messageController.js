import { db } from '../config/database.js';
import { sendContactFormEmail } from '../utils/emailService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all messages
 * GET /api/messages
 * Admin only
 */
export const listMessages = asyncHandler(async (req, res) => {
  const { read } = req.query;

  let query = 'SELECT * FROM messages';
  const params = [];

  if (read !== undefined) {
    query += ' WHERE read = ?';
    params.push(read === 'true' ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC';

  const messages = db.prepare(query).all(...params);

  res.json({
    success: true,
    data: messages,
  });
});

/**
 * Get single message
 * GET /api/messages/:id
 * Admin only
 */
export const getMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  res.json({
    success: true,
    data: message,
  });
});

/**
 * Create message (submit contact form)
 * POST /api/messages
 * Public
 */
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Insert message
  const result = db.prepare(`
    INSERT INTO messages (name, email, subject, message, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(name, email, subject, message);

  const insertedMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);

  // Send email notification to admin
  await sendContactFormEmail({
    name,
    email,
    subject,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Message submitted successfully. We will get back to you soon.',
    data: insertedMessage,
  });
});

/**
 * Mark message as read
 * PATCH /api/messages/:id/read
 * Admin only
 */
export const markMessageAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if message exists
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(id);

  const updatedMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);

  res.json({
    success: true,
    message: 'Message marked as read',
    data: updatedMessage,
  });
});

/**
 * Delete message
 * DELETE /api/messages/:id
 * Admin only
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if message exists
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  db.prepare('DELETE FROM messages WHERE id = ?').run(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'DELETE_MESSAGE', 'MESSAGE', id);

  res.json({
    success: true,
    message: 'Message deleted successfully',
  });
});
