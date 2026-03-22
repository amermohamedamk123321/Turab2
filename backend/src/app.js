import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { corsOptions } from './middleware/cors.js';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admins.js';
import projectRoutes from './routes/projects.js';
import messageRoutes from './routes/messages.js';
import projectRequestRoutes from './routes/projectRequests.js';
import socialLinkRoutes from './routes/socialLinks.js';

const app = express();

// ===== SECURITY MIDDLEWARE =====
// Helmet for HTTP security headers
app.use(helmet());

// CORS configuration
app.use(cors(corsOptions));

// Body parser middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== RATE LIMITING =====
// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

app.use(globalLimiter);

// Login rate limiter (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Contact form rate limiter
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many contact submissions, please try again later.',
  keyGenerator: (req) => {
    // Rate limit by IP
    return req.ip || req.connection.remoteAddress;
  },
});

// Project request rate limiter
const projectRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // 1 request per day per email
  message: 'You can only submit one project request per day.',
  keyGenerator: (req) => {
    // Rate limit by email
    return req.body?.email || req.ip || req.connection.remoteAddress;
  },
});

// ===== ROUTES =====
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', contactLimiter, messageRoutes);
app.use('/api/project-requests', projectRequestLimiter, projectRequestRoutes);
app.use('/api/social-links', socialLinkRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ===== ERROR HANDLER (must be last) =====
app.use(errorHandler);

export default app;
