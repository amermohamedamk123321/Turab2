import bcryptjs from 'bcryptjs';
import { db } from '../config/database.js';
import { sendAdminWelcomeEmail } from '../utils/emailService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all admins
 * GET /api/admins
 * Admin only
 */
export const listAdmins = asyncHandler(async (req, res) => {
  const admins = db.prepare('SELECT id, username, email, role, created_at, updated_at FROM admins ORDER BY created_at DESC').all();

  res.json({
    success: true,
    data: admins,
  });
});

/**
 * Get single admin
 * GET /api/admins/:id
 * Admin only
 */
export const getAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = db.prepare('SELECT id, username, email, role, created_at, updated_at FROM admins WHERE id = ?').get(id);

  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  res.json({
    success: true,
    data: admin,
  });
});

/**
 * Create admin user
 * POST /api/admins
 * Admin only
 */
export const createAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ? OR username = ?').get(email, username);

  if (existingAdmin) {
    throw new AppError('Email or username already exists', 400);
  }

  // Hash password
  const passwordHash = await bcryptjs.hash(password, 12);

  // Insert admin
  const result = db.prepare(`
    INSERT INTO admins (username, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(username, email, passwordHash, 'admin');

  const admin = db.prepare('SELECT id, username, email, role, created_at, updated_at FROM admins WHERE id = ?').get(result.lastInsertRowid);

  // Send welcome email
  await sendAdminWelcomeEmail(email, username);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'CREATE_ADMIN', 'ADMIN', admin.id);

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: admin,
  });
});

/**
 * Update admin
 * PUT /api/admins/:id
 * Admin only
 */
export const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  // Check if admin exists
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  // Check if new email or username is already taken
  if (email && email !== admin.email) {
    const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
    if (existing) {
      throw new AppError('Email already exists', 400);
    }
  }

  if (username && username !== admin.username) {
    const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
    if (existing) {
      throw new AppError('Username already exists', 400);
    }
  }

  // Build update query
  const updates = [];
  const values = [];

  if (username !== undefined) {
    updates.push('username = ?');
    values.push(username);
  }

  if (email !== undefined) {
    updates.push('email = ?');
    values.push(email);
  }

  if (password !== undefined) {
    const passwordHash = await bcryptjs.hash(password, 12);
    updates.push('password_hash = ?');
    values.push(passwordHash);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  const query = `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...values);

  const updatedAdmin = db.prepare('SELECT id, username, email, role, created_at, updated_at FROM admins WHERE id = ?').get(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'UPDATE_ADMIN', 'ADMIN', id);

  res.json({
    success: true,
    message: 'Admin updated successfully',
    data: updatedAdmin,
  });
});

/**
 * Delete admin
 * DELETE /api/admins/:id
 * Admin only
 * Prevents deleting the last admin
 */
export const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user.id === parseInt(id)) {
    throw new AppError('Cannot delete your own account', 400);
  }

  // Check if admin exists
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  // Check if this is the last admin
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (adminCount.count <= 1) {
    throw new AppError('Cannot delete the last admin user', 400);
  }

  db.prepare('DELETE FROM admins WHERE id = ?').run(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'DELETE_ADMIN', 'ADMIN', id);

  res.json({
    success: true,
    message: 'Admin deleted successfully',
  });
});
