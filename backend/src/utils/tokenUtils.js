import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(adminId, email) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment');
  }
  
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
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
  
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment');
  }
  
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
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment');
  }
  
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
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment');
  }
  
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
