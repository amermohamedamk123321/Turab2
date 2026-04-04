import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';

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

/**
 * Migrate database schema if needed
 * Handles transition from JWT-based to session-based auth
 */
function migrateSchema() {
  try {
    // Check if sessions table has refresh_token column (old schema)
    const sessionTableInfo = db.prepare("PRAGMA table_info(sessions)").all();
    const hasRefreshToken = sessionTableInfo.some(col => col.name === 'refresh_token');

    if (hasRefreshToken) {
      console.log('Migrating sessions table from JWT to session-based auth...');

      // Drop old sessions table and create new one
      db.exec('DROP TABLE IF EXISTS sessions');
      db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          admin_id INTEGER NOT NULL,
          csrf_token TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
        )
      `);

      console.log('✅ Sessions table migrated successfully');
    }
  } catch (error) {
    console.warn('⚠️  Schema migration check failed:', error.message);
    // Continue anyway - schema might already be correct
  }
}

// Initialize schema
function initializeSchema() {
  // Check if tables exist
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all();

  if (tables.length > 0) {
    console.log('Database schema already initialized');
    // Run migration for existing databases
    migrateSchema();
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
      csrf_token TEXT NOT NULL,
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
 * Clean up expired sessions
 * Runs on startup and periodically
 */
function cleanupExpiredSessions() {
  try {
    const now = new Date().toISOString();
    const result = db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
    if (result.changes > 0) {
      console.log(`🧹 Cleaned up ${result.changes} expired session(s)`);
    }
  } catch (error) {
    console.warn('⚠️  Error cleaning up expired sessions:', error.message);
  }
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

// Initialize on import
initializeSchema();
cleanupExpiredSessions();
seedDefaultAdmin();

export { db };
