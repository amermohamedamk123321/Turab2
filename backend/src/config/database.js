import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';
import { getYouTubeThumbnail } from '../utils/youtubeUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../db.sqlite');

// Ensure database directory exists
const dbDir = dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Test database integrity
try {
  const testQuery = db.prepare("SELECT 1 as test").get();
  console.log('✅ Database integrity check passed');
} catch (error) {
  console.error('❌ Database error:', error.message);
  // If there's an issue, close and try to recover
  db.close();
  throw error;
}

// Initialize schema
function initializeSchema() {
  // Check if tables exist
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all();

  if (tables.length > 0) {
    console.log('Database schema already initialized');
    return;
  }

  console.log('Initializing database schema...');

  // Create admins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
      url TEXT,
      category TEXT,
      is_website BOOLEAN DEFAULT 0,
      video_url TEXT,
      thumbnail_url TEXT,
      tech_tags TEXT,
      featured BOOLEAN DEFAULT 0,
      challenge TEXT,
      solution TEXT,
      result TEXT,
      metric TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create project_requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_type TEXT NOT NULL,
      security_level TEXT,
      custom_features TEXT,
      company_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create social_links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT UNIQUE NOT NULL,
      url TEXT NOT NULL,
      enabled BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      admin_id INTEGER NOT NULL,
      refresh_token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
  `);

  // Create audit_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id INTEGER,
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE SET NULL
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
    CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
  `);

  console.log('Database schema initialized successfully');
}

/**
 * Seed default admin user on first run
 * Ensures admin always has correct credentials for login testing
 */
function seedDefaultAdmin() {
  try {
    const email = 'admin@turabroot.com';
    const password = 'admin123';
    const username = 'admin';

    // Hash the password with fresh salt each time
    const passwordHash = bcryptjs.hashSync(password, 12);

    console.log('🔧 Setting up default admin user...');

    // Force DELETE and recreate to ensure password is correct
    // This is necessary because the password hash might be stale
    try {
      db.prepare('DELETE FROM admins WHERE email = ?').run(email);
    } catch (e) {
      // Ignore if delete fails (admin might not exist)
    }

    // Create fresh admin with correct password hash
    const result = db.prepare(`
      INSERT INTO admins (username, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, 'admin', datetime('now'), datetime('now'))
    `).run(username, email, passwordHash);

    console.log(`✅ Admin user ready (ID: ${result.lastInsertRowid})`);
    console.log(`📋 Login Credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('   ⚠️  Change this password after first login!\n');

  } catch (error) {
    console.error('❌ Error during admin setup:', error.message);
    console.error('   Stack:', error.stack);
    // Try to continue even if this fails
  }
}

/**
 * Seed default projects for admin dashboard
 * Removes old projects and adds 4 new featured projects
 */
function seedDefaultProjects() {
  try {
    // Clear existing projects to start fresh
    db.prepare('DELETE FROM projects').run();

    console.log('🔧 Setting up default projects...');

    const projectsData = [
      {
        title: 'Modern Restaurant Application',
        description: 'A modern web application for restaurant management and online ordering. Built with React, JavaScript, CSS for frontend and Django for backend.',
        videoUrl: 'https://youtu.be/hMkDj9jS2KE?si=SvKNpP25vw-L290Z',
        techTags: ['React', 'JavaScript', 'CSS', 'Django'],
        featured: 1,
        status: 'active',
        category: 'Web Application',
        isWebsite: 1,
        challenge: 'Creating an intuitive interface for restaurant operations and customer ordering',
        solution: 'Developed a responsive web app with real-time order management and inventory tracking',
        result: 'Streamlined restaurant operations and increased online orders by 45%',
      },
      {
        title: 'Exchange System Dashboard',
        description: 'An advanced dashboard for managing currency exchange operations. Built with React, JavaScript, CSS for frontend and Django for backend.',
        videoUrl: 'https://youtu.be/L-kgSy6TUtU?si=_A_1-DZiqjkJmfvs',
        techTags: ['React', 'JavaScript', 'CSS', 'Django'],
        featured: 1,
        status: 'active',
        category: 'Dashboard',
        isWebsite: 1,
        challenge: 'Handling real-time exchange rate updates and transaction processing',
        solution: 'Built a responsive dashboard with real-time data visualization and secure transactions',
        result: 'Reduced transaction processing time by 60% and improved user experience',
      },
      {
        title: 'Gold Shop Dashboard Desktop App',
        description: 'A desktop application for managing gold shop inventory and sales. Built with React, JavaScript, CSS for frontend and Django for backend.',
        videoUrl: 'https://youtu.be/_tFqUCoTZ00?si=J9q2_sQZFeuI9EeJ',
        techTags: ['React', 'JavaScript', 'CSS', 'Django'],
        featured: 1,
        status: 'active',
        category: 'Desktop Application',
        isWebsite: 0,
        challenge: 'Managing complex inventory tracking and real-time price updates',
        solution: 'Developed a robust desktop app with offline capabilities and local data sync',
        result: 'Improved inventory accuracy by 35% and reduced manual reconciliation time',
      },
      {
        title: 'Dental Desktop App with Dashboard',
        description: 'A comprehensive desktop application for dental clinic management with patient records and appointment scheduling. Built with React, JavaScript, CSS for frontend and Django for backend.',
        videoUrl: 'https://youtu.be/C5kfmonCKcM?si=0LfYvyLXU79Auf1k',
        techTags: ['React', 'JavaScript', 'CSS', 'Django'],
        featured: 1,
        status: 'active',
        category: 'Desktop Application',
        isWebsite: 0,
        challenge: 'Handling patient data security and managing complex appointment scheduling',
        solution: 'Created a HIPAA-compliant application with secure patient records and automated reminders',
        result: 'Improved patient satisfaction by 40% and reduced no-shows by 30%',
      },
    ];

    // Insert projects
    projectsData.forEach((project) => {
      const techTagsJson = JSON.stringify(project.techTags);
      db.prepare(`
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
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        project.title,
        project.description,
        project.status,
        project.url || null,
        project.videoUrl,
        getYouTubeThumbnail(project.videoUrl),
        project.category,
        project.isWebsite ? 1 : 0,
        techTagsJson,
        project.featured ? 1 : 0,
        project.challenge,
        project.solution,
        project.result
      );
    });

    console.log(`✅ Default projects created (${projectsData.length} projects)`);
  } catch (error) {
    console.error('❌ Error during projects setup:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Initialize on import
initializeSchema();
seedDefaultAdmin();
seedDefaultProjects();

export { db };
