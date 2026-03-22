import { db } from '../config/database.js';
import { sendProjectRequestEmail } from '../utils/emailService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all project requests
 * GET /api/project-requests
 * Admin only
 */
export const listProjectRequests = asyncHandler(async (req, res) => {
  const requests = db.prepare('SELECT * FROM project_requests ORDER BY created_at DESC').all();

  res.json({
    success: true,
    data: requests,
  });
});

/**
 * Get single project request
 * GET /api/project-requests/:id
 * Admin only
 */
export const getProjectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = db.prepare('SELECT * FROM project_requests WHERE id = ?').get(id);

  if (!request) {
    throw new AppError('Project request not found', 404);
  }

  res.json({
    success: true,
    data: request,
  });
});

/**
 * Create project request
 * POST /api/project-requests
 * Public
 */
export const createProjectRequest = asyncHandler(async (req, res) => {
  const {
    project_type,
    security_level,
    custom_features,
    company_name,
    email,
    phone,
  } = req.body;

  // Insert project request
  const result = db.prepare(`
    INSERT INTO project_requests (project_type, security_level, custom_features, company_name, email, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(project_type, security_level, custom_features, company_name, email, phone);

  const projectRequest = db.prepare('SELECT * FROM project_requests WHERE id = ?').get(result.lastInsertRowid);

  // Send email notification to admin
  await sendProjectRequestEmail({
    project_type,
    security_level,
    custom_features,
    company_name,
    email,
    phone,
  });

  res.status(201).json({
    success: true,
    message: 'Project request submitted successfully. We will contact you soon.',
    data: projectRequest,
  });
});

/**
 * Delete project request
 * DELETE /api/project-requests/:id
 * Admin only
 */
export const deleteProjectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if project request exists
  const request = db.prepare('SELECT * FROM project_requests WHERE id = ?').get(id);
  if (!request) {
    throw new AppError('Project request not found', 404);
  }

  db.prepare('DELETE FROM project_requests WHERE id = ?').run(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'DELETE_PROJECT_REQUEST', 'PROJECT_REQUEST', id);

  res.json({
    success: true,
    message: 'Project request deleted successfully',
  });
});
