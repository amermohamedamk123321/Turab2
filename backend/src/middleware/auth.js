import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

/**
 * Verify JWT token from Authorization header
 * Header format: Authorization: Bearer {token}
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Missing authorization header', 401);
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Invalid authorization header format', 401);
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Token has expired', 401);
      }
      throw new AppError('Invalid token', 401);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is authenticated
 * Optionally verifies admin role
 */
export const requireAuth = (requireAdmin = false) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AppError('Missing authorization header', 401);
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new AppError('Invalid authorization header format', 401);
      }

      const token = parts[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (requireAdmin && req.user.role !== 'admin') {
          throw new AppError('Admin access required', 403);
        }

        next();
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          throw new AppError('Token has expired', 401);
        }
        if (err instanceof AppError) {
          throw err;
        }
        throw new AppError('Invalid token', 401);
      }
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to verify admin access
 */
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
