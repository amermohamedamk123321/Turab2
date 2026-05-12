import { db } from '../config/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const MAX_PARTNERS = 10;

/**
 * Get all partners
 * GET /api/partners
 * Public
 */
export const listPartners = asyncHandler(async (req, res) => {
  const partners = db.prepare('SELECT * FROM partners ORDER BY created_at DESC').all();

  res.json({
    success: true,
    data: partners,
  });
});

/**
 * Get single partner by ID
 * GET /api/partners/:id
 * Public
 */
export const getPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);

  if (!partner) {
    throw new AppError('Partner not found', 404);
  }

  res.json({
    success: true,
    data: partner,
  });
});

/**
 * Create new partner
 * POST /api/partners
 * Admin only
 */
export const createPartner = asyncHandler(async (req, res) => {
  const { name, description, image_base64 } = req.body;

  // Check max partners constraint
  const count = db.prepare('SELECT COUNT(*) as total FROM partners').get();
  if (count.total >= MAX_PARTNERS) {
    throw new AppError(`Maximum ${MAX_PARTNERS} partners allowed`, 400);
  }

  // Insert partner
  const result = db.prepare(`
    INSERT INTO partners (name, description, image_base64, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `).run(name, description, image_base64);

  const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(result.lastInsertRowid);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'CREATE_PARTNER', 'PARTNER', partner.id);

  res.status(201).json({
    success: true,
    message: 'Partner created successfully',
    data: partner,
  });
});

/**
 * Update partner
 * PUT /api/partners/:id
 * Admin only
 */
export const updatePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image_base64 } = req.body;

  // Check if partner exists
  const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);
  if (!partner) {
    throw new AppError('Partner not found', 404);
  }

  // Build update query
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }

  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }

  if (image_base64 !== undefined) {
    updates.push('image_base64 = ?');
    values.push(image_base64);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  const query = `UPDATE partners SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...values);

  const updatedPartner = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'UPDATE_PARTNER', 'PARTNER', id);

  res.json({
    success: true,
    message: 'Partner updated successfully',
    data: updatedPartner,
  });
});

/**
 * Delete partner
 * DELETE /api/partners/:id
 * Admin only
 */
export const deletePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if partner exists
  const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);
  if (!partner) {
    throw new AppError('Partner not found', 404);
  }

  db.prepare('DELETE FROM partners WHERE id = ?').run(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'DELETE_PARTNER', 'PARTNER', id);

  res.json({
    success: true,
    message: 'Partner deleted successfully',
  });
});
