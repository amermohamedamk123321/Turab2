import nodemailer from 'nodemailer';

// Initialize transporter
let transporter = null;

/**
 * Initialize email transporter with Nodemailer
 */
function initializeTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Send contact form email notification
 */
export async function sendContactFormEmail(data) {
  try {
    const mailer = initializeTransporter();

    if (!mailer) {
      console.warn('Email service not configured, skipping email notification');
      return { success: true, skipped: true };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `New Contact Form Submission: ${data.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
        <hr />
        <p><em>Sent at: ${new Date().toISOString()}</em></p>
      `,
      replyTo: data.email,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log('Contact form email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send contact form email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send project request email notification
 */
export async function sendProjectRequestEmail(data) {
  try {
    const mailer = initializeTransporter();

    if (!mailer) {
      console.warn('Email service not configured, skipping email notification');
      return { success: true, skipped: true };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `New Project Request from ${data.company_name || 'Client'}`,
      html: `
        <h2>New Project Request</h2>
        <p><strong>Company:</strong> ${escapeHtml(data.company_name || 'N/A')}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        <p><strong>Phone:</strong> ${escapeHtml(data.phone || 'N/A')}</p>
        <hr />
        <p><strong>Project Type:</strong> ${escapeHtml(data.project_type)}</p>
        <p><strong>Security Level:</strong> ${escapeHtml(data.security_level || 'N/A')}</p>
        <p><strong>Custom Features:</strong> ${escapeHtml(data.custom_features || 'N/A')}</p>
        <hr />
        <p><em>Received at: ${new Date().toISOString()}</em></p>
      `,
      replyTo: data.email,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log('Project request email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send project request email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new admin
 */
export async function sendAdminWelcomeEmail(email, username) {
  try {
    const mailer = initializeTransporter();

    if (!mailer) {
      console.warn('Email service not configured, skipping email notification');
      return { success: true, skipped: true };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to Turab Root Dashboard',
      html: `
        <h2>Welcome to Turab Root Dashboard</h2>
        <p>Hello ${escapeHtml(username)},</p>
        <p>Your admin account has been created successfully. You can now log in to the dashboard.</p>
        <p><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">${process.env.FRONTEND_URL || 'http://localhost:3000'}</a></p>
        <hr />
        <p><strong>Security Reminder:</strong></p>
        <ul>
          <li>Keep your password confidential</li>
          <li>Use a strong, unique password</li>
          <li>Do not share your login credentials</li>
        </ul>
        <hr />
        <p><em>This is an automated email, please do not reply.</em></p>
      `,
    };

    const result = await mailer.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
