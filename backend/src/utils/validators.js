import { body, query, validationResult } from 'express-validator';
import { isValidYouTubeUrl } from './youtubeUtils.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Validation middleware to check for validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError(
        'Validation failed',
        400,
        errors.array().map(e => ({
          field: e.param,
          message: e.msg,
        }))
      )
    );
  }
  next();
};

// ===== LOGIN VALIDATION =====
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

// ===== ADMIN VALIDATION =====
export const validateAdminCreate = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one digit')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must contain at least one special character'),
];

export const validateAdminUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one digit')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must contain at least one special character'),
];

// ===== PROJECT VALIDATION =====
export const validateProjectCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused'])
    .withMessage('Status must be one of: active, completed, paused'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Invalid project URL'),
  body('video_url')
    .optional()
    .custom(value => {
      if (value && !isValidYouTubeUrl(value)) {
        throw new Error('Invalid YouTube URL');
      }
      return true;
    }),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be 100 characters or less'),
  body('is_website')
    .optional()
    .isBoolean()
    .withMessage('is_website must be a boolean'),
  body('tech_tags')
    .optional()
    .isArray()
    .withMessage('tech_tags must be an array')
    .custom(value => {
      if (value && value.length > 10) {
        throw new Error('Maximum 10 tech tags allowed');
      }
      return true;
    }),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be a boolean'),
  body('challenge')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Challenge must be 5000 characters or less'),
  body('solution')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Solution must be 5000 characters or less'),
  body('result')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Result must be 5000 characters or less'),
  body('metric')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Metric must be 500 characters or less'),
];

export const validateProjectUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused'])
    .withMessage('Status must be one of: active, completed, paused'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Invalid project URL'),
  body('video_url')
    .optional()
    .custom(value => {
      if (value && !isValidYouTubeUrl(value)) {
        throw new Error('Invalid YouTube URL');
      }
      return true;
    }),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be 100 characters or less'),
  body('is_website')
    .optional()
    .isBoolean()
    .withMessage('is_website must be a boolean'),
  body('tech_tags')
    .optional()
    .isArray()
    .withMessage('tech_tags must be an array'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be a boolean'),
  body('challenge')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Challenge must be 5000 characters or less'),
  body('solution')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Solution must be 5000 characters or less'),
  body('result')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Result must be 5000 characters or less'),
  body('metric')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Metric must be 500 characters or less'),
];

// ===== MESSAGE VALIDATION =====
export const validateMessageCreate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Message must be between 10 and 10000 characters'),
];

// ===== PROJECT REQUEST VALIDATION =====
export const validateProjectRequestCreate = [
  body('project_type')
    .trim()
    .notEmpty()
    .withMessage('Project type is required'),
  body('security_level')
    .optional()
    .trim(),
  body('custom_features')
    .optional()
    .trim(),
  body('company_name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must be 200 characters or less'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number'),
];

// ===== SOCIAL LINKS VALIDATION =====
export const validateSocialLinkCreate = [
  body('platform')
    .trim()
    .notEmpty()
    .withMessage('Platform is required')
    .isLength({ max: 50 })
    .withMessage('Platform must be 50 characters or less'),
  body('url')
    .isURL()
    .withMessage('Invalid URL'),
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('enabled must be a boolean'),
];

export const validateSocialLinkUpdate = [
  body('platform')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Platform must be 50 characters or less'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Invalid URL'),
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('enabled must be a boolean'),
];
