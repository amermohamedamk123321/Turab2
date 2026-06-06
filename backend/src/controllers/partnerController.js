import { db } from '../config/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const MAX_PARTNERS = 10;

/**
 * Get all partners with their images
 * GET /api/partners
 * Public
 */
export const listPartners = asyncHandler(async (req, res) => {
  const partners = db.prepare('SELECT * FROM partners ORDER BY created_at DESC').all();

  // Get images for each partner
  const partnersWithImages = partners.map(partner => {
    const images = db.prepare(`
      SELECT image_base64 FROM partner_images
      WHERE partner_id = ?
      ORDER BY display_order ASC
      LIMIT 3
    `).all(partner.id);

    return {
      ...partner,
      images: images.map(img => img.image_base64),
    };
  });

  res.json({
    success: true,
    data: partnersWithImages,
  });
});

/**
 * Get single partner by ID with images
 * GET /api/partners/:id
 * Public
 */
export const getPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);

  if (!partner) {
    throw new AppError('Partner not found', 404);
  }

  // Get images for this partner
  const images = db.prepare(`
    SELECT image_base64 FROM partner_images
    WHERE partner_id = ?
    ORDER BY display_order ASC
    LIMIT 3
  `).all(id);

  res.json({
    success: true,
    data: {
      ...partner,
      images: images.map(img => img.image_base64),
    },
  });
});

/**
 * Create new partner with up to 3 images
 * POST /api/partners
 * Admin only
 */
export const createPartner = asyncHandler(async (req, res) => {
  const { name, description, images = [] } = req.body;

  // Check max partners constraint
  const count = db.prepare('SELECT COUNT(*) as total FROM partners').get();
  if (count.total >= MAX_PARTNERS) {
    throw new AppError(`Maximum ${MAX_PARTNERS} partners allowed`, 400);
  }

  // Validate images array
  if (!Array.isArray(images)) {
    throw new AppError('Images must be an array', 400);
  }
  if (images.length > 3) {
    throw new AppError('Maximum 3 images per partner allowed', 400);
  }

  // Insert partner
  const result = db.prepare(`
    INSERT INTO partners (name, description, created_at, updated_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `).run(name, description);

  const partnerId = result.lastInsertRowid;

  // Insert images in order
  images.forEach((image, index) => {
    if (image && typeof image === 'string') {
      db.prepare(`
        INSERT INTO partner_images (partner_id, image_base64, display_order, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `).run(partnerId, image, index);
    }
  });

  // Get partner with images
  const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(partnerId);
  const partnerImages = db.prepare(`
    SELECT image_base64 FROM partner_images
    WHERE partner_id = ?
    ORDER BY display_order ASC
    LIMIT 3
  `).all(partnerId);

  const responseData = {
    ...partner,
    images: partnerImages.map(img => img.image_base64),
  };

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'CREATE_PARTNER', 'PARTNER', partnerId);

  res.status(201).json({
    success: true,
    message: 'Partner created successfully',
    data: responseData,
  });
});

/**
 * Update partner with up to 3 images
 * PUT /api/partners/:id
 * Admin only
 */
export const updatePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, images } = req.body;

  // Check if partner exists
  const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);
  if (!partner) {
    throw new AppError('Partner not found', 404);
  }

  // Build update query
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }

  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }

  if (updates.length === 0 && images === undefined) {
    throw new AppError('No fields to update', 400);
  }

  // Update partner info if any changed
  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(id);

    const query = `UPDATE partners SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
  }

  // Update images if provided
  if (images !== undefined) {
    if (!Array.isArray(images)) {
      throw new AppError('Images must be an array', 400);
    }
    if (images.length > 3) {
      throw new AppError('Maximum 3 images per partner allowed', 400);
    }

    // Delete old images
    db.prepare('DELETE FROM partner_images WHERE partner_id = ?').run(id);

    // Insert new images in order
    images.forEach((image, index) => {
      if (image && typeof image === 'string') {
        db.prepare(`
          INSERT INTO partner_images (partner_id, image_base64, display_order, created_at)
          VALUES (?, ?, ?, datetime('now'))
        `).run(id, image, index);
      }
    });

    // Update partner's updated_at
    db.prepare("UPDATE partners SET updated_at = datetime('now') WHERE id = ?").run(id);
  }

  // Get updated partner with images
  const updatedPartner = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);
  const partnerImages = db.prepare(`
    SELECT image_base64 FROM partner_images
    WHERE partner_id = ?
    ORDER BY display_order ASC
    LIMIT 3
  `).all(id);

  const responseData = {
    ...updatedPartner,
    images: partnerImages.map(img => img.image_base64),
  };

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'UPDATE_PARTNER', 'PARTNER', id);

  res.json({
    success: true,
    message: 'Partner updated successfully',
    data: responseData,
  });
});

/**
 * Delete partner
 * DELETE /api/partners/:id
 * Admin only
 */
export const deletePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if partner exists
  const partner = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);
  if (!partner) {
    throw new AppError('Partner not found', 404);
  }

  db.prepare('DELETE FROM partners WHERE id = ?').run(id);

  // Log audit event
  db.prepare(`
    INSERT INTO audit_logs (admin_id, action, resource_type, resource_id)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, 'DELETE_PARTNER', 'PARTNER', id);

  res.json({
    success: true,
    message: 'Partner deleted successfully',
  });
});
