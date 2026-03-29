import bcryptjs from 'bcryptjs';
import { db } from '../config/database.js';
import { generateAccessToken, generateRefreshToken, generateSessionId } from '../utils/tokenUtils.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Login admin user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find admin by email
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

  if (!admin) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await bcryptjs.compare(password, admin.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(admin.id, admin.email);
  const refreshToken = generateRefreshToken(admin.id);
  const sessionId = generateSessionId();

  // Store refresh token in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  db.prepare(`
    INSERT INTO sessions (id, admin_id, refresh_token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, admin.id, refreshToken, expiresAt.toISOString());

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type)
    VALUES (?, ?, ?)
  `).run(admin.id, 'LOGIN', 'AUTH');

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    },
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Find session with refresh token
  const session = db.prepare('SELECT * FROM sessions WHERE refresh_token = ?').get(refreshToken);

  if (!session) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
    throw new AppError('Refresh token has expired', 401);
  }

  // Get admin info
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(session.admin_id);

  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(admin.id, admin.email);

  res.json({
    success: true,
    message: 'Token refreshed',
    data: {
      accessToken: newAccessToken,
    },
  });
});

/**
 * Logout admin user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // Require authentication
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (refreshToken) {
    // Delete session from database
    db.prepare('DELETE FROM sessions WHERE refresh_token = ?').run(refreshToken);
  }

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type)
    VALUES (?, ?, ?)
  `).run(req.user.id, 'LOGOUT', 'AUTH');

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Get current session info
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const admin = db.prepare('SELECT id, username, email, created_at FROM admins WHERE id = ?').get(req.user.id);

  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  res.json({
    success: true,
    data: admin,
  });
});
