import express from 'express';
import { login, refresh, logout, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateLogin, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

/**
 * Login
 * POST /api/auth/login
 * Public
 */
router.post('/login', validateLogin, handleValidationErrors, login);

/**
 * Refresh token
 * POST /api/auth/refresh
 * Public (but requires refresh token)
 */
router.post('/refresh', refresh);

/**
 * Logout
 * POST /api/auth/logout
 * Protected
 */
router.post('/logout', logout);

/**
 * Get current user info
 * GET /api/auth/me
 * Protected
 */
router.get('/me', requireAuth(), getMe);

export default router;
