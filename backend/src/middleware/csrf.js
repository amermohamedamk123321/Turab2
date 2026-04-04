import { db } from '../config/database.js';

/**
 * CSRF protection middleware
 * Validates CSRF token from request header or body
 * Token must match the session's stored CSRF token
 */
export const validateCsrfToken = (req, res, next) => {
  // Only check state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  try {
    // Extract CSRF token from header (x-csrf-token) or body (csrfToken)
    const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken;

    if (!csrfToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token required',
      });
    }

    // Get session from request (set by sessionAuth middleware)
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid session',
      });
    }

    // Verify CSRF token matches session's stored token
    const session = db.prepare('SELECT csrf_token FROM sessions WHERE id = ?').get(sessionId);

    if (!session) {
      return res.status(403).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.csrf_token !== csrfToken) {
      console.warn(`[CSRF] Invalid CSRF token for session ${sessionId}`);
      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token',
      });
    }

    next();
  } catch (error) {
    console.error('[CSRF ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'CSRF validation error',
    });
  }
};
