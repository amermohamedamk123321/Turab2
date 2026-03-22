import { db } from '../config/database.js';
import { getYouTubeThumbnail } from '../utils/youtubeUtils.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all projects or featured projects
 * GET /api/projects?featured=true
 */
export const listProjects = asyncHandler(async (req, res) => {
  const { featured } = req.query;

  let query = 'SELECT * FROM projects';
  const params = [];

  if (featured === 'true') {
    query += ' WHERE featured = 1';
  }

  query += ' ORDER BY created_at DESC';

  const projects = db.prepare(query).all(...params);

  res.json({
    success: true,
    data: projects,
  });
});

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
export const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Parse tech_tags and images if they are JSON strings
  if (project.tech_tags && typeof project.tech_tags === 'string') {
    try {
      project.tech_tags = JSON.parse(project.tech_tags);
    } catch (e) {
      project.tech_tags = [];
    }
  }

  res.json({
    success: true,
    data: project,
  });
});

/**
 * Create new project
 * POST /api/projects
 */
export const createProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    status,
    url,
    video_url,
    category,
    is_website,
    tech_tags,
    featured,
    challenge,
    solution,
    result,
    metric,
  } = req.body;

  // Generate thumbnail from video_url if provided
  let thumbnail_url = null;
  if (video_url) {
    thumbnail_url = getYouTubeThumbnail(video_url);
    if (!thumbnail_url) {
      throw new AppError('Invalid YouTube URL', 400);
    }
  }

  // Prepare tech_tags
  const techTagsJson = tech_tags ? JSON.stringify(tech_tags) : null;

  // Insert project
  const result_insert = db.prepare(`
    INSERT INTO projects (
      title,
      description,
      status,
      url,
      video_url,
      thumbnail_url,
      category,
      is_website,
      tech_tags,
      featured,
      challenge,
      solution,
      result,
      metric,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    title,
    description,
    status || 'active',
    url,
    video_url,
    thumbnail_url,
    category,
    is_website ? 1 : 0,
    techTagsJson,
    featured ? 1 : 0,
    challenge,
    solution,
    result,
    metric
  );

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result_insert.lastInsertRowid);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'CREATE_PROJECT', 'PROJECT', project.id);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

/**
 * Update project
 * PUT /api/projects/:id
 */
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    url,
    video_url,
    category,
    is_website,
    tech_tags,
    featured,
    challenge,
    solution,
    result,
    metric,
  } = req.body;

  // Check if project exists
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Generate thumbnail if video_url is provided
  let thumbnail_url = project.thumbnail_url;
  if (video_url !== undefined && video_url !== project.video_url) {
    if (video_url) {
      thumbnail_url = getYouTubeThumbnail(video_url);
      if (!thumbnail_url) {
        throw new AppError('Invalid YouTube URL', 400);
      }
    } else {
      thumbnail_url = null;
    }
  }

  // Build update query dynamically
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  if (url !== undefined) {
    updates.push('url = ?');
    values.push(url);
  }
  if (video_url !== undefined) {
    updates.push('video_url = ?');
    values.push(video_url);
  }
  if (thumbnail_url !== undefined) {
    updates.push('thumbnail_url = ?');
    values.push(thumbnail_url);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    values.push(category);
  }
  if (is_website !== undefined) {
    updates.push('is_website = ?');
    values.push(is_website ? 1 : 0);
  }
  if (tech_tags !== undefined) {
    updates.push('tech_tags = ?');
    values.push(tech_tags ? JSON.stringify(tech_tags) : null);
  }
  if (featured !== undefined) {
    updates.push('featured = ?');
    values.push(featured ? 1 : 0);
  }
  if (challenge !== undefined) {
    updates.push('challenge = ?');
    values.push(challenge);
  }
  if (solution !== undefined) {
    updates.push('solution = ?');
    values.push(solution);
  }
  if (result !== undefined) {
    updates.push('result = ?');
    values.push(result);
  }
  if (metric !== undefined) {
    updates.push('metric = ?');
    values.push(metric);
  }

  // Always update the updated_at timestamp
  updates.push("updated_at = datetime('now')");

  if (updates.length === 1) {
    // Only updated_at was set
    throw new AppError('No fields to update', 400);
  }

  values.push(id);

  const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...values);

  const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'UPDATE_PROJECT', 'PROJECT', id);

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: updatedProject,
  });
});

/**
 * Delete project
 * DELETE /api/projects/:id
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if project exists
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'DELETE_PROJECT', 'PROJECT', id);

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
});
