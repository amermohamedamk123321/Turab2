import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { sessionAuth } from '../middleware/sessionAuth.js';
import { validateCsrfToken } from '../middleware/csrf.js';
import { validateLogin, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

/**
 * Login with email and password
 * POST /api/auth/login
 * Public
 */
router.post('/login', validateLogin, handleValidationErrors, login);

/**
 * Get current user info and validate session
 * GET /api/auth/me
 * Protected - requires valid session cookie
 */
router.get('/me', sessionAuth, getMe);

/**
 * Logout - destroy session
 * POST /api/auth/logout
 * Protected - requires valid session cookie and CSRF token
 */
router.post('/logout', sessionAuth, validateCsrfToken, logout);

export default router;
