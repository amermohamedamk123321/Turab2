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

The database initializes automatically when the backend starts. No manual setup needed!

### 4.2 Create First Admin

You have three options:

**Option A: Via API (Recommended)**

```bash
# First, create a default admin through dashboard
# Or manually insert via SQL:

sqlite3 /home/user/turab-root/backend/db.sqlite

# In SQLite prompt:
INSERT INTO admins (username, email, password_hash, role, created_at, updated_at)
VALUES ('admin', 'admin@yourdomain.com', 'HASH_HERE', 'admin', datetime('now'), datetime('now'));

# Exit SQLite
.quit
```

**Option B: Via Frontend**

Once frontend is running, there should be a setup wizard or initial admin creation.

**Option C: Direct SQL**

```bash
# Connect to database
cd /home/user/turab-root/backend
sqlite3 db.sqlite

# Create initial admin with bcryptjs hash
# Password: Admin@2024! hashed with bcryptjs

INSERT INTO admins (username, email, password_hash, role) 
VALUES ('admin', 'admin@yourdomain.com', '$2a$12$...', 'admin');
```

### 4.3 Verify Database

```bash
# Check database exists
ls -lh /home/user/turab-root/backend/db.sqlite

# Check tables
sqlite3 /home/user/turab-root/backend/db.sqlite ".tables"

# Should show: admins, audit_logs, messages, project_requests, projects, sessions, social_links
```

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

## Phase 8: Troubleshooting

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

## Phase 10: Post-Deployment Checklist

- [ ] Frontend loads at yourdomain.com
- [ ] Backend API accessible at api.yourdomain.com/health
- [ ] SSL certificates working (https)
- [ ] Admin login works
- [ ] Contact form sends emails
- [ ] Database backups running
- [ ] Email notifications configured
- [ ] Rate limiting working
- [ ] Security headers present
- [ ] CORS properly configured
- [ ] Firewall enabled
- [ ] Monitoring configured
- [ ] Backup restoration tested

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

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready
