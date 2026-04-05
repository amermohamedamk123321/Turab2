import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { db } from '../config/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Generate a random session ID
 */
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Login admin user - Session-based authentication
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 [LOGIN] Attempt for email: ${email}`);

  // Find admin by email
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

  if (!admin) {
    // Log failed attempt without exposing admin existence
    console.warn(`[AUTH] Failed login attempt for email: ${email}`);
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password using bcrypt
  const isPasswordValid = await bcryptjs.compare(password, admin.password_hash);

  if (!isPasswordValid) {
    // Log failed attempt without storing password
    console.warn(`[AUTH] Failed login attempt for email: ${email} (invalid password)`);
    throw new AppError('Invalid email or password', 401);
  }

  // Verify admin role
  if (admin.role !== 'admin') {
    console.warn(`[AUTH] Login attempt with non-admin role for email: ${email}`);
    throw new AppError('Invalid email or password', 401);
  }

  // Create secure session
  const sessionId = generateSessionId();
  const csrfToken = generateCsrfToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store session in database
  db.prepare(`
    INSERT INTO sessions (id, admin_id, csrf_token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, admin.id, csrfToken, expiresAt.toISOString());

  // Log successful login
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type)
    VALUES (?, ?, ?)
  `).run(admin.id, 'LOGIN', 'AUTH');

  // Set secure HTTP-only session cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Return admin data and CSRF token (no session ID or tokens in body)
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
      csrfToken,
    },
  });
});

/**
 * Get current session info - Validates session and returns fresh CSRF token
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  // req.user and req.sessionId are set by sessionAuth middleware
  if (!req.user || !req.sessionId) {
    throw new AppError('Unauthorized', 401);
  }

  // Get fresh CSRF token
  const csrfToken = generateCsrfToken();

  // Update session with new CSRF token
  db.prepare(`
    UPDATE sessions SET csrf_token = ? WHERE id = ?
  `).run(csrfToken, req.sessionId);

  // Return admin data
  res.status(200).json({
    success: true,
    data: {
      admin: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
      },
      csrfToken,
    },
  });
});

/**
 * Logout admin user - Destroys session
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  // req.sessionId is set by sessionAuth middleware
  if (!req.sessionId) {
    throw new AppError('Unauthorized', 401);
  }

  // Log logout event
  if (req.user) {
    db.prepare(`
      INSERT INTO audit_logs (admin_id, action, resource_type)
      VALUES (?, ?, ?)
    `).run(req.user.id, 'LOGOUT', 'AUTH');
  }

  // Delete session from database
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.sessionId);

  // Clear session cookie
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});
