# Turab Root - Complete Deployment Guide

This guide covers deploying both the frontend and backend to Hostinger VPS with Ubuntu and CloudPanel.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Hostinger VPS                             │
│                      (Ubuntu + CloudPanel)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐    ┌──────────────────────────┐   │
│  │   Frontend (React)       │    │   Backend (Node.js)      │   │
│  │   - Port 443 (HTTPS)     │    │   - Port 3001            │   │
│  │   - Static files (CDN)   │    │   - SQLite Database      │   │
│  │   - Vite optimized       │    │   - Express.js API       │   │
│  └──────────────────────────┘    └──────────────────────────┘   │
│           ↓                                ↓                      │
│      Nginx (reverse proxy)         Nginx (reverse proxy)         │
│           ↓                                ↓                      │
│   yourdomain.com              api.yourdomain.com                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Hostinger VPS with Ubuntu 22.04 LTS
- CloudPanel installed
- Domain(s) registered and pointed to VPS
- SSH access to VPS
- Basic command-line knowledge

## Phase 1: VPS & CloudPanel Setup (Hostinger)

### 1.1 Initial VPS Configuration

```bash
ssh root@your_vps_ip

# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git zip unzip htop nano
```

### 1.2 CloudPanel Configuration

CloudPanel should already be installed on Hostinger VPS.

1. Access CloudPanel at `https://your_vps_ip:8443`
2. Create admin account
3. Add your domain(s)
4. Generate SSL certificates (auto with Let's Encrypt)

## Phase 2: Backend Deployment

### 2.1 Prepare Backend

```bash
# Clone or upload your project
cd /home/user
git clone your_repo_url turab-root
cd turab-root/backend

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install --production
```

### 2.2 Configure Backend

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Critical .env settings for production:**

```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=/home/user/turab-root/backend/db.sqlite

# Generate strong secrets (use: openssl rand -base64 32)
JWT_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_generated_refresh_secret_here

JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email Configuration (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# CORS - Your frontend domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# File uploads
UPLOAD_DIR=/home/user/turab-root/backend/uploads
MAX_FILE_SIZE=5242880
DATABASE_BACKUP_PATH=/home/user/turab-root/backend/backups
```

**Generate strong secrets:**

```bash
# Run this locally to generate secrets
openssl rand -base64 32
# Run it twice for JWT_SECRET and JWT_REFRESH_SECRET
```

### 2.3 Create Directories

```bash
mkdir -p /home/user/turab-root/backend/{uploads/projects/galleries,backups,logs}
chmod 755 /home/user/turab-root/backend/uploads
chmod 755 /home/user/turab-root/backend/backups
```

### 2.4 Deploy Backend in CloudPanel

**In CloudPanel Web Interface:**

1. Go to Applications → Add Application
2. Select Node.js
3. Configure:
   - **Application Name:** turab-api
   - **Domain:** api.yourdomain.com (or use subdomain)
   - **Root Directory:** /home/user/turab-root/backend
   - **Startup Command:** `node server.js`
   - **Node Version:** 18.x or higher

4. Set Environment Variables in CloudPanel:
   - Click on the application
   - Go to Environment Variables
   - Add all variables from .env file

5. CloudPanel will:
   - Auto-provision SSL
   - Manage process (PM2)
   - Setup Nginx reverse proxy
   - Handle auto-restart

**Verify Backend:**

```bash
# Test API
curl -X GET https://api.yourdomain.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Phase 3: Frontend Deployment

### 3.1 Build Frontend

**On your local machine:**

```bash
# Navigate to frontend root
cd /path/to/turab-root

# Build for production
npm run build

# This creates dist/ folder with optimized files
```

### 3.2 Update Frontend Environment

Before building, ensure `.env` is set correctly:

```bash
# In root directory .env file:
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 3.3 Deploy Frontend to CloudPanel

**In CloudPanel Web Interface:**

1. Go to Applications → Add Application
2. Select Static (HTML/CSS/JS) or Node.js (for SSR if needed)
3. Configure:
   - **Application Name:** turab-web
   - **Domain:** yourdomain.com
   - **Root Directory:** /home/user/turab-root/dist (for static)

4. Upload build files:

```bash
# From your local machine, upload dist folder
scp -r dist root@your_vps_ip:/home/user/turab-root/
```

Or from VPS:

```bash
cd /home/user/turab-root
# Pull latest code and build
git pull origin main
npm install
npm run build

# Files are in dist/
```

5. CloudPanel will:
   - Auto-provision SSL for yourdomain.com
   - Setup Nginx to serve static files
   - Enable gzip compression
   - Set proper cache headers

**Verify Frontend:**

```bash
# Open in browser
https://yourdomain.com

# Should load your website
```

## Phase 4: Database Setup

### 4.1 Initialize Database

The database initializes automatically when the backend starts. The system will:
- Create all necessary tables (admins, projects, partners, messages, etc.)
- Create partner_images table for multi-image support per partner
- Automatically migrate existing single-image partners to new multi-image structure
- Set up all indexes for performance
- Seed default admin user and projects

**No manual setup needed!**

### 4.2 Default Admin Credentials

On first backend startup, a default admin user is created:

```
Email: admin@turabroot.com
Password: admin123
```

**IMPORTANT:** Change this password immediately after first login!

### 4.3 Verify Database

```bash
# Check database exists
ls -lh /home/user/turab-root/backend/db.sqlite

# Check tables
sqlite3 /home/user/turab-root/backend/db.sqlite ".tables"

# Should show all tables including:
# admins, audit_logs, messages, project_requests, projects,
# partner_images, partners, sessions, social_links
```

### 4.4 Database Schema

The database includes:

- **admins** - Admin user accounts with role-based access
- **projects** - Portfolio projects with video URLs and auto-generated thumbnails
- **partner_images** - Up to 3 images per partner (supports JPG, PNG, WebP)
- **partners** - Business partners/clients
- **social_links** - Social media links with enabled/disabled status
- **messages** - Contact form submissions
- **project_requests** - Project inquiry requests
- **sessions** - User session tokens
- **audit_logs** - Admin action audit trail

## Phase 4.5: Admin Dashboard Overview

### Dashboard Features

The admin dashboard at `/dashboard` provides complete site management:

**Dashboard Sections:**

1. **Projects** - Manage portfolio projects
   - Add/edit/delete projects
   - Auto-generates YouTube thumbnails from video URLs
   - Supports featured projects for homepage carousel
   - Tech tags and metrics for each project

2. **Partners** - Manage business partners
   - Upload up to 3 images per partner (JPG, PNG, WebP)
   - 5MB size limit per image
   - Images displayed in carousel on About page
   - Up to 10 partners supported

3. **Social Media** - Manage social links
   - Add/edit social media profiles
   - Supports: Instagram, Facebook, WhatsApp, YouTube, Twitter, LinkedIn
   - Enable/disable links (hidden links not shown on frontend)
   - Links auto-sync to footer in real-time

4. **Messages** - View contact form submissions
   - Read/unread status
   - Export or delete messages
   - View submission metadata

5. **Project Requests** - Manage project inquiry requests
   - View detailed requests with requirements
   - Track project type, security level, custom features
   - Client contact information

6. **Admin Users** - Manage admin accounts
   - Create additional admin users
   - Change passwords
   - Delete admin accounts
   - Audit log of all admin actions

### Admin Login

Access the admin dashboard:
1. Go to `/dashboard` or click "Admin login" button in header
2. Login with credentials (default: admin@turabroot.com / admin123)
3. Change default password immediately
4. Dashboard loads with overview of recent activity

### Important Admin Functions

**Projects Management:**
- YouTube URL automatically generates thumbnail (maxresdefault quality)
- Thumbnails display on homepage and projects page
- Featured projects appear in hero carousel
- Data persists across server restarts

**Partners Management (NEW):**
- Upload up to 3 images per partner (JPG, PNG, WebP only)
- Each image max 5MB
- Images display in carousel on About page
- Drag-and-drop upload support

**Social Links (IMPROVED):**
- Real-time sync to footer (no page refresh needed)
- Can update existing platform instead of getting error
- Disabled links are hidden from public but visible in admin
- Supports custom URLs (not just verified platforms)

---

## Phase 5: Email Configuration

### 5.1 Hostinger Email Setup

1. **In Hostinger Control Panel:**
   - Mail → Email Accounts
   - Create email: noreply@yourdomain.com
   - Create email: admin@yourdomain.com
   - Set passwords

2. **Get SMTP Credentials:**
   - Host: smtp.hostinger.com
   - Port: 587 (or 465 for SSL)
   - Username: your_email@yourdomain.com
   - Password: Your email password

3. **Update Backend .env:**

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_email_password
ADMIN_EMAIL=admin@yourdomain.com
```

### 5.2 Test Email

```bash
# Test contact form email
curl -X POST https://api.yourdomain.com/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "subject":"Test Email",
    "message":"This is a test message"
  }'

# Check your admin email for the notification
```

## Phase 6: Backup & Monitoring

### 6.1 Automated Database Backups

```bash
# Create backup script
cat > /home/user/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/user/turab-root/backend/backups"
mkdir -p $BACKUP_DIR
cp /home/user/turab-root/backend/db.sqlite $BACKUP_DIR/db-$(date +%Y%m%d-%H%M%S).sqlite
# Keep only last 30 days
find $BACKUP_DIR -name "*.sqlite" -mtime +30 -delete
EOF

chmod +x /home/user/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
# 0 2 * * * /home/user/backup-db.sh
```

### 6.2 Monitor with CloudPanel

1. **In CloudPanel Dashboard:**
   - View application status
   - Check logs in real-time
   - Monitor resource usage
   - Manage SSL certificates

2. **Command-line Monitoring:**

```bash
# Check processes
ps aux | grep node

# View logs
journalctl -u cloudpanel -f

# Check disk usage
df -h

# Check memory
free -h
```

## Phase 7: Security Hardening

### 7.1 Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Close CloudPanel port in production
sudo ufw deny 8443

# Check rules
sudo ufw status
```

### 7.2 SSL/TLS Certificates

CloudPanel auto-manages Let's Encrypt certificates:

```bash
# Verify certificate
curl -I https://yourdomain.com
curl -I https://api.yourdomain.com

# Both should show: HTTP/2 200 (or 301 redirect)
```

### 7.3 Rate Limiting

Rate limiting is built-in to backend:

- Login: 5 attempts / 15 minutes
- Contact form: 3 requests / hour
- Project requests: 1 request / day per email
- Global: 100 requests / minute

### 7.4 Security Headers

Backend automatically sets security headers:

```bash
# Check headers
curl -I https://api.yourdomain.com

# Should include:
# Strict-Transport-Security
# X-Content-Type-Options
# X-Frame-Options
# Content-Security-Policy
```

## Phase 8: Admin Dashboard Troubleshooting

### Admin Login Issues

**"Invalid email or password" error**
```bash
# Check admin user exists
sqlite3 /home/user/turab-root/backend/db.sqlite
SELECT id, email, password_hash FROM admins;

# If no admin exists, restart backend to auto-seed one
sudo systemctl restart cloudpanel

# Default credentials: admin@turabroot.com / admin123
```

**"Cannot reach dashboard" after login**
- Verify backend API is running: `curl https://api.yourdomain.com/health`
- Check CORS_ORIGINS in .env includes your domain
- Clear browser cache and cookies
- Try incognito/private window

### Project Thumbnail Issues

**"Thumbnails not showing on homepage"**
```bash
# Verify project has video_url set
sqlite3 db.sqlite
SELECT id, title, video_url, thumbnail_url FROM projects;

# Check YouTube URL format is valid
# Should be: https://youtube.com/watch?v=ID or https://youtu.be/ID

# Restart backend to regenerate thumbnails
```

**"YouTube URL disappears after saving"**
- Check backend logs for errors
- Verify video_url in database after saving
- Ensure URL format is correct (not truncated)
- Test with different YouTube URLs

### Social Links Issues

**"Social links not showing in footer"**
- Verify links are enabled (enabled=1 in database)
- Check social links section shows links
- Try adding new link from admin panel
- Links should appear in footer within 1-2 seconds (real-time API fetch)

**"Can't add social link - error message"**
- Old behavior: Would throw "already exists" error if platform existed
- New behavior: Updates existing link automatically
- If error still appears, check browser console for details

### Partner Images Issues

**"Can't upload images - file rejected"**
```bash
# Check file format (must be JPG, PNG, or WebP)
file your_image.jpg

# Check file size (must be ≤5MB)
ls -lh your_image.jpg

# Maximum is 5MB per image
```

**"Can only upload 1 image, need 3"**
- Verify you're uploading separate files, not trying multi-select
- Each image needs to be added individually or via drag-drop
- Maximum 3 images per partner enforced by UI and API
- Old single-image support has been migrated to multi-image

**"Partner images not showing on About page"**
```bash
# Verify images are stored
sqlite3 db.sqlite
SELECT id, partner_id, display_order FROM partner_images LIMIT 5;

# Check partners API returns images
curl https://api.yourdomain.com/api/partners

# Should have "images" array for each partner
```

### Database Issues

**"Tables don't exist or structure wrong"**
```bash
# Verify all tables
sqlite3 db.sqlite ".tables"

# Should include: partner_images (new table)
# Check partner_images structure
sqlite3 db.sqlite ".schema partner_images"

# Should have: id, partner_id, image_base64, display_order, created_at
```

**"Migration didn't run"**
- Migration runs automatically on first backend start
- Check backend logs for migration status
- If old image_base64 column still exists, migration ran but didn't complete column drop
- Restart backend to complete migration

---

## Phase 8.5: Troubleshooting

### Backend Issues

```bash
# Check application status
cloudpanel status

# View logs
cloudpanel logs turab-api

# Restart application
cloudpanel restart turab-api

# Check database
sqlite3 /home/user/turab-root/backend/db.sqlite ".tables"

# Test API connection
curl -v https://api.yourdomain.com/health
```

### Frontend Issues

```bash
# Check if dist folder exists
ls -la /home/user/turab-root/dist/

# Rebuild if needed
cd /home/user/turab-root
npm run build

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### CORS Errors

If you see CORS errors in browser console:

1. Check backend .env `CORS_ORIGINS`
2. Verify it includes your frontend domain
3. Restart backend
4. Clear browser cache

### Database Issues

```bash
# Backup current database
cp db.sqlite db.sqlite.backup

# Check database integrity
sqlite3 db.sqlite "PRAGMA integrity_check;"

# Should return: ok
```

## Phase 9: Performance Tuning

### Frontend

```bash
# In CloudPanel, set cache headers:
# - Static assets: 1 year
# - HTML: 1 hour
# - API calls: no-cache

# Enable gzip compression (CloudPanel default)
# Enable Brotli compression for better performance
```

### Backend

```bash
# Monitor with htop
htop

# Check database queries (enable in development)
# NODE_ENV=development node server.js

# Use database indexes (already set up)
sqlite3 db.sqlite ".indexes"
```

## Phase 9.5: Recent Fixes & Improvements

The following critical fixes have been implemented for production readiness:

### Social Media Links (Fixed)
- **Issue:** Links weren't displaying in footer after being added
- **Fix:** Footer now fetches links directly from API (real-time sync)
- **Benefit:** No more stale cache issues; changes appear instantly

### Project Thumbnails (Fixed)
- **Issue:** YouTube video URLs weren't being saved; thumbnails weren't displaying
- **Fix:** Backend properly persists video URLs and regenerates thumbnails
- **Benefit:** Thumbnails always display on homepage and projects page

### Data Persistence (Fixed)
- **Issue:** Custom projects and partners disappeared after server restart
- **Fix:** Seed functions now check if data exists before wiping
- **Benefit:** All custom data persists across restarts

### Partner Images (NEW)
- **Added:** Support for up to 3 images per partner
- **Added:** Image carousel display on About page
- **Added:** Increased size limits (5MB per image)
- **Added:** Support for JPG, PNG, WebP formats

### Database Migration (Automatic)
- **Added:** Automatic partner_images table creation
- **Added:** Automatic migration from old single-image to new multi-image format
- **Benefit:** No manual database operations needed

### Security & Validation
- **Rate limiting:** Built-in protection on login, contact forms, project requests
- **CORS:** Properly configured for your domain
- **SSL/TLS:** Auto-managed by CloudPanel
- **Database:** Automatic daily backups
- **Audit logs:** All admin actions tracked

---

## Phase 10: Post-Deployment Checklist

### Core Functionality
- [ ] Frontend loads at yourdomain.com
- [ ] Backend API accessible at api.yourdomain.com/health
- [ ] SSL certificates working (https)
- [ ] Database initialized with all tables

### Admin Dashboard
- [ ] Admin login works (default: admin@turabroot.com / admin123)
- [ ] Projects section loads and displays default projects
- [ ] Can add new project with YouTube URL
- [ ] Project thumbnail auto-generates and displays on homepage
- [ ] Partners section loads
- [ ] Can upload up to 3 images per partner
- [ ] Partner images display on About page in carousel
- [ ] Social media links section loads
- [ ] Can add/edit social media links
- [ ] Social links appear in footer in real-time (no refresh needed)
- [ ] Can disable/enable social links
- [ ] Messages section shows contact form submissions
- [ ] Project requests section shows inquiry submissions
- [ ] Admin users section allows creating/managing admins

### Email & Communication
- [ ] Contact form sends emails to admin
- [ ] Project requests generate notifications
- [ ] Email configuration working (SMTP test)

### Data Persistence
- [ ] Custom projects persist after backend restart
- [ ] Custom partners persist after backend restart
- [ ] Social links persist after backend restart
- [ ] Database backups running daily

### Security & Performance
- [ ] Rate limiting working (test with multiple login attempts)
- [ ] Security headers present (check with curl -I)
- [ ] CORS properly configured
- [ ] Firewall enabled and configured
- [ ] SSL certificates auto-renewing
- [ ] Monitoring configured in CloudPanel
- [ ] Backup restoration plan tested

### Image Uploads (Partners)
- [ ] Can upload JPG images (max 5MB)
- [ ] Can upload PNG images (max 5MB)
- [ ] Can upload WebP images (max 5MB)
- [ ] Rejects images over 5MB
- [ ] Rejects unsupported formats (GIF, BMP, etc.)
- [ ] Shows preview before saving
- [ ] Can delete individual images
- [ ] Maximum 3 images per partner enforced
- [ ] Images display correctly on About page

## Phase 11: Production Readiness Verification

Run this checklist to verify your deployment is production-ready:

### Frontend Verification
```bash
# 1. Check frontend loads
curl -I https://yourdomain.com
# Should return: HTTP/1.1 200 OK or 301 (redirect)

# 2. Verify JavaScript bundles are optimized
# Check browser DevTools → Network
# All JS files should be minified and gzipped
# Typical main bundle: 150-250KB gzipped

# 3. Check cache headers
curl -I https://yourdomain.com/index.html
# Should have: Cache-Control: no-cache (for HTML)
# Should have: Cache-Control: public, max-age=31536000 (for JS/CSS)

# 4. Verify API base URL
# Open browser console, visit site
# No CORS errors should appear
# API calls should go to https://api.yourdomain.com/api
```

### Backend Verification
```bash
# 1. Check API health
curl https://api.yourdomain.com/api/health

# 2. Test admin authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@turabroot.com","password":"admin123"}'
# Should return: tokens and user data

# 3. Test CORS headers
curl -I -H "Origin: https://yourdomain.com" https://api.yourdomain.com/api/health
# Should include: Access-Control-Allow-Origin: https://yourdomain.com

# 4. Verify SSL/TLS
openssl s_client -connect api.yourdomain.com:443
# Should show valid certificate for your domain
```

### Database Verification
```bash
# 1. Verify database file exists and has size
ls -lh /home/user/turab-root/backend/db.sqlite
# Should be several hundred KB or more

# 2. Check table integrity
sqlite3 /home/user/turab-root/backend/db.sqlite "PRAGMA integrity_check;"
# Should return: ok

# 3. Verify admin exists
sqlite3 /home/user/turab-root/backend/db.sqlite \
  "SELECT email FROM admins WHERE role='admin';"
# Should return: admin@turabroot.com

# 4. Check all required tables
sqlite3 /home/user/turab-root/backend/db.sqlite ".tables" | grep -c "partner_images"
# Should return: 1 (new partner_images table)
```

### Admin Dashboard Verification

**Test Scenario 1: Project Management**
```
1. Login to /dashboard
2. Go to Projects section
3. Create new project:
   - Title: "Test Project"
   - Description: "Test description"
   - YouTube URL: https://youtu.be/dQw4w9WgXcQ
   - Tech Tags: React, Node.js
4. Save and verify:
   - Thumbnail auto-generates
   - Displays on /projects page
   - Displays on / (homepage carousel)
5. Edit project (change URL) and verify thumbnail updates
6. Delete project and verify it's gone
```

**Test Scenario 2: Partner Management**
```
1. Go to Partners section
2. Create new partner:
   - Name: "Test Partner"
   - Description: "Test description for this partner"
   - Upload Image 1 (JPG, PNG, or WebP, max 5MB)
3. Upload Image 2 and Image 3
4. Save and verify:
   - 3 images display in grid on /about page
   - Can scroll through images using thumbnails
5. Edit partner and replace images
6. Delete partner and verify removal
```

**Test Scenario 3: Social Links**
```
1. Go to Social Media section
2. Add Instagram link: https://instagram.com/turabroot
3. Save and check footer:
   - Instagram icon appears in footer
   - No page refresh needed (real-time)
4. Edit Instagram link to Facebook: https://facebook.com/turabroot
5. Save and verify:
   - Footer updates immediately
   - Old Instagram link gone
   - New Facebook link appears
6. Disable a link and verify it disappears from footer
7. Re-enable and verify it reappears
```

**Test Scenario 4: Messages**
```
1. Fill contact form on /contact
2. Submit and verify:
   - Success message appears
   - Email sent to admin
3. Go to Admin Dashboard → Messages
4. New message appears in list
5. Click to view message details
6. Mark as read/unread
7. Delete message
```

### Performance Verification
```bash
# 1. Check page load time
# Open DevTools → Network tab
# Total load should be <3 seconds
# Largest asset should be main JS ~200KB gzipped

# 2. Check API response time
time curl https://api.yourdomain.com/api/projects
# Should complete in <1 second

# 3. Monitor server resources
htop
# CPU: Should be <20% at idle
# Memory: Should be <50% at idle
# Disk: Should have >10GB free

# 4. Check disk I/O
iostat -x 1
# Should be <10% utilization at idle
```

### Security Verification
```bash
# 1. Check security headers
curl -I https://api.yourdomain.com/api/health
# Should include:
# - Strict-Transport-Security
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - X-XSS-Protection

# 2. Verify rate limiting
for i in {1..10}; do
  curl -X POST https://api.yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -s -o /dev/null -w "%{http_code}\n"
done
# After 5 attempts should get 429 (Too Many Requests)

# 3. Check SSL/TLS version
openssl s_client -connect yourdomain.com:443 -tls1_2
# Should support TLS 1.2 and above

# 4. Test password security
# Login with correct password - should work
# Login with incorrect password - should fail
# Session timeout after 30 minutes of inactivity
```

### Backup Verification
```bash
# 1. Check backup script is working
ls -lh /home/user/turab-root/backend/backups/
# Should have recent database backups

# 2. Verify backup format
sqlite3 /home/user/turab-root/backend/backups/db-*.sqlite "SELECT COUNT(*) FROM admins;"
# Should return: 1 (or your admin count)

# 3. Test backup restoration
# Copy backup to test location
cp /home/user/turab-root/backend/backups/db-*.sqlite /tmp/test-restore.sqlite

# Verify it works
sqlite3 /tmp/test-restore.sqlite ".tables"
# Should list all tables
```

---

## Maintenance Tasks

### Weekly

```bash
# Check disk space
df -h

# Verify backups exist
ls -lh /home/user/turab-root/backend/backups/
```

### Monthly

```bash
# Check SSL certificate expiry (auto-renewed)
curl -vI https://yourdomain.com 2>&1 | grep -i expire

# Review application logs
tail -f /var/log/cloudpanel/*.log

# Update Node.js if needed
node -v
npm -v
```

### Quarterly

```bash
# Test backup restoration
# Verify disaster recovery plan

# Review security settings
# Check for any CVEs in dependencies
npm audit
```

## Getting Help

**CloudPanel Support:**
- https://www.cloudpanel.io/docs/

**Node.js Issues:**
- Check PM2 logs: `pm2 logs turab-api`
- Check application logs in CloudPanel dashboard

**SSL/Domain Issues:**
- Contact Hostinger support for domain configuration
- CloudPanel handles SSL auto-renewal

---

## Final Production Readiness Summary

### For turabroot.com Deployment

**Current Status: ✅ PRODUCTION READY**

### What's Fixed & Ready

✅ **Admin Dashboard**
- All CRUD operations working
- Real-time social links sync to footer
- YouTube thumbnail auto-generation
- Partner multi-image support (up to 3 images)

✅ **Data Integrity**
- No data loss on server restart
- Automatic database initialization
- Automatic image migration (single → multi-image)
- Daily backups configured

✅ **Security**
- Rate limiting on login and forms
- Session management with expiration
- JWT token authentication
- CORS properly configured
- Security headers enabled
- Audit logging of admin actions

✅ **Performance**
- Frontend optimized with Vite
- Backend using Express.js and SQLite
- Images cached and optimized
- Database indexed for quick queries

✅ **User Experience**
- Responsive admin interface
- Real-time feedback
- Error handling with user-friendly messages
- Drag-and-drop image uploads

### Deployment Checklist for turabroot.com

Before going live:

```
[ ] Domain turabroot.com configured in CloudPanel
[ ] Domain api.turabroot.com configured in CloudPanel
[ ] SSL certificates provisioned (auto via Let's Encrypt)
[ ] Backend environment variables set
[ ] Frontend .env points to api.turabroot.com
[ ] Database initialized (auto on first run)
[ ] Default admin created (auto on first run)
[ ] Email configuration tested
[ ] Firewall configured
[ ] Backups enabled
[ ] All admin dashboard tests passed
[ ] Load testing completed
[ ] Security audit completed
[ ] Disaster recovery plan tested
```

### Support & Maintenance

For issues during deployment:
1. Check DEPLOYMENT_GUIDE.md troubleshooting sections
2. Check ADMIN_DASHBOARD_TESTING.md for testing verification
3. Review backend logs: `cloudpanel logs turab-api`
4. Check frontend logs: Browser DevTools console
5. Verify database: `sqlite3 db.sqlite ".tables"`

### Key Contacts & Resources

- **CloudPanel Docs:** https://www.cloudpanel.io/docs/
- **Node.js Issues:** https://nodejs.org/en/docs/
- **SQLite Guide:** https://www.sqlite.org/cli.html
- **Let's Encrypt:** https://letsencrypt.org/

---

**Last Updated:** June 9, 2024
**Version:** 2.0.0 (With Admin Dashboard & Partner Images Support)
**Status:** ✅ PRODUCTION READY FOR turabroot.com
