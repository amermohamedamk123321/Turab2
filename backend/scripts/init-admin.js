#!/usr/bin/env node

/**
 * Initialize admin user in database
 * Run with: node scripts/init-admin.js
 */

import Database from 'better-sqlite3';
import bcryptjs from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../db.sqlite');

console.log(`📦 Initializing admin user in database: ${dbPath}\n`);

const db = new Database(dbPath);

try {
  // Check if admin already exists
  const existingAdmin = db.prepare('SELECT id, email FROM admins WHERE email = ?').get('admin@turabroot.com');

  if (existingAdmin) {
    console.log(`⚠️  Admin user already exists:`);
    console.log(`   ID: ${existingAdmin.id}`);
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`\n💡 To reset password, run:`);
    console.log(`   UPDATE admins SET password_hash = '<hash>' WHERE email = 'admin@turabroot.com'`);
  } else {
    // Create default admin user
    const email = 'admin@turabroot.com';
    const password = 'admin123';
    const username = 'admin';

    // Hash the password
    const passwordHash = bcryptjs.hashSync(password, 12);

    // Insert admin
    const result = db.prepare(`
      INSERT INTO admins (username, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, 'admin', datetime('now'), datetime('now'))
    `).run(username, email, passwordHash);

    console.log(`✅ Admin user created successfully!\n`);
    console.log(`📋 Login Credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Username: ${username}\n`);
    console.log(`⚠️  IMPORTANT: Change this password after first login!\n`);
  }

  // Display all admins
  const admins = db.prepare('SELECT id, username, email, role, created_at FROM admins').all();
  console.log(`\n📊 All admin users in database:`);
  console.log(`${admins.length} admin(s) found:`);
  admins.forEach(admin => {
    console.log(`  - ${admin.username} (${admin.email}) - Role: ${admin.role}`);
  });

  db.close();
  console.log(`\n✅ Done!`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  db.close();
  process.exit(1);
}
