#!/usr/bin/env node

/**
 * Reset database and create default admin
 * WARNING: This will delete all data and start fresh!
 * Run with: node backend/scripts/reset-db.js
 */

import Database from 'better-sqlite3';
import bcryptjs from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../db.sqlite');

console.log('🗑️  Database Reset Script\n');
console.log(`Database file: ${dbPath}\n`);

// Delete existing database
if (fs.existsSync(dbPath)) {
  console.log('📝 Backing up existing database...');
  const backupPath = `${dbPath}.backup.${Date.now()}`;
  fs.copyFileSync(dbPath, backupPath);
  console.log(`✅ Backup created: ${backupPath}\n`);
  
  console.log('🗑️  Deleting existing database...');
  fs.unlinkSync(dbPath);
  console.log('✅ Old database deleted\n');
}

// Create new database
console.log('📦 Creating fresh database...\n');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Create schema
console.log('📋 Creating database schema...');

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

console.log('✅ Schema created\n');

// Create default admin
console.log('👤 Creating default admin user...');

const email = 'admin@turabroot.com';
const password = 'admin123';
const username = 'admin';

const passwordHash = bcryptjs.hashSync(password, 12);

db.prepare(`
  INSERT INTO admins (username, email, password_hash, role, created_at, updated_at)
  VALUES (?, ?, ?, 'admin', datetime('now'), datetime('now'))
`).run(username, email, passwordHash);

console.log('✅ Admin user created\n');

// Verify
const admin = db.prepare('SELECT id, username, email, role FROM admins WHERE email = ?').get(email);

if (admin) {
  console.log('✅ Verification successful!\n');
  console.log('📋 Admin Credentials:');
  console.log(`   ID: ${admin.id}`);
  console.log(`   Username: ${admin.username}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`\n🔑 Login Credentials:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`\n⚠️  IMPORTANT: Change this password after first login!\n`);
} else {
  console.log('❌ Verification failed - admin not found\n');
}

// Count all records
const counts = {
  admins: db.prepare('SELECT COUNT(*) as count FROM admins').get().count,
  projects: db.prepare('SELECT COUNT(*) as count FROM projects').get().count,
  messages: db.prepare('SELECT COUNT(*) as count FROM messages').get().count,
};

console.log('📊 Database Summary:');
console.log(`   Admins: ${counts.admins}`);
console.log(`   Projects: ${counts.projects}`);
console.log(`   Messages: ${counts.messages}\n`);

db.close();
console.log('✅ Done! Database is ready to use.');
