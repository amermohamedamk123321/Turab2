import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(adminId, email) {
  return jwt.sign(
    {
      id: adminId,
      email: email,
      role: 'admin',
      type: 'access',
    },
    JWT_SECRET,
    {
      expiresIn: JWT_ACCESS_EXPIRY,
    }
  );
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(adminId) {
  return jwt.sign(
    {
      id: adminId,
      type: 'refresh',
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRY,
    }
  );
}

/**
 * Verify access token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
}

/**
 * Generate session ID
 */
export function generateSessionId() {
  return randomBytes(32).toString('hex');
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token) {
  return jwt.decode(token);
}
