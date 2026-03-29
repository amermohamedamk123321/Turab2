import { db } from '../config/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all social links
 * GET /api/social-links
 * Public
 */
export const listSocialLinks = asyncHandler(async (req, res) => {
  const links = db.prepare('SELECT * FROM social_links WHERE enabled = 1 ORDER BY platform ASC').all();

  res.json({
    success: true,
    data: links,
  });
});

/**
 * Get single social link
 * GET /api/social-links/:id
 * Public
 */
export const getSocialLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const link = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);

  if (!link) {
    throw new AppError('Social link not found', 404);
  }

  res.json({
    success: true,
    data: link,
  });
});

/**
 * Create social link
 * POST /api/social-links
 * Admin only
 */
export const createSocialLink = asyncHandler(async (req, res) => {
  const { platform, url, enabled } = req.body;

  // Check if platform already exists
  const existing = db.prepare('SELECT id FROM social_links WHERE platform = ?').get(platform);
  if (existing) {
    throw new AppError('Social link for this platform already exists', 400);
  }

  // Insert social link
  const result = db.prepare(`
    INSERT INTO social_links (platform, url, enabled, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `).run(platform, url, enabled !== false ? 1 : 0);

  const socialLink = db.prepare('SELECT * FROM social_links WHERE id = ?').get(result.lastInsertRowid);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'CREATE_SOCIAL_LINK', 'SOCIAL_LINK', socialLink.id);

  res.status(201).json({
    success: true,
    message: 'Social link created successfully',
    data: socialLink,
  });
});

/**
 * Update social link
 * PUT /api/social-links/:id
 * Admin only
 */
export const updateSocialLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { platform, url, enabled } = req.body;

  // Check if social link exists
  const socialLink = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
  if (!socialLink) {
    throw new AppError('Social link not found', 404);
  }

  // Check if platform is being changed and if it already exists elsewhere
  if (platform && platform !== socialLink.platform) {
    const existing = db.prepare('SELECT id FROM social_links WHERE platform = ?').get(platform);
    if (existing) {
      throw new AppError('Social link for this platform already exists', 400);
    }
  }

  // Build update query
  const updates = [];
  const values = [];

  if (platform !== undefined) {
    updates.push('platform = ?');
    values.push(platform);
  }

  if (url !== undefined) {
    updates.push('url = ?');
    values.push(url);
  }

  if (enabled !== undefined) {
    updates.push('enabled = ?');
    values.push(enabled ? 1 : 0);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  const query = `UPDATE social_links SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...values);

  const updatedSocialLink = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'UPDATE_SOCIAL_LINK', 'SOCIAL_LINK', id);

  res.json({
    success: true,
    message: 'Social link updated successfully',
    data: updatedSocialLink,
  });
});

/**
 * Delete social link
 * DELETE /api/social-links/:id
 * Admin only
 */
export const deleteSocialLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if social link exists
  const socialLink = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
  if (!socialLink) {
    throw new AppError('Social link not found', 404);
  }

  db.prepare('DELETE FROM social_links WHERE id = ?').run(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'DELETE_SOCIAL_LINK', 'SOCIAL_LINK', id);

  res.json({
    success: true,
    message: 'Social link deleted successfully',
  });
});
