import { db } from '../config/database.js';
import { AppError } from './errorHandler.js';

/**
 * Session-based authentication middleware
 * Validates sessionId from cookie against database
 * Attaches admin info and sessionId to request
 */
export const sessionAuth = (req, res, next) => {
  try {
    // Extract session ID from cookie
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No session',
      });
    }

    // Query session from database
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid session',
      });
    }

    // Check if session is expired
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // Clean up expired session
      db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Session expired',
      });
    }

    // Get admin info
    const admin = db.prepare('SELECT id, username, email, role FROM admins WHERE id = ?').get(
      session.admin_id
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin not found',
      });
    }

    // Verify admin role
    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin role required',
      });
    }

    // Attach to request for downstream use
    req.user = admin;
    req.sessionId = sessionId;
    req.session = session;

    next();
  } catch (error) {
    console.error('[AUTH ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Require authenticated session
 * Returns 401 if not authenticated
 */
export const requireSession = () => {
  return sessionAuth;
};
