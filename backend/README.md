# Turab Root Backend - Deployment Guide

This backend serves the Turab Root portfolio website. It provides secure authentication, project management, and contact form handling.

## Prerequisites

- Node.js 16+ and npm/yarn
- SQLite3
- Hostinger VPS with Ubuntu (recommended)
- CloudPanel or similar hosting control panel

## Installation

### 1. Local Development Setup

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update these critical values:
- `JWT_SECRET` - Generate a strong random string
- `JWT_REFRESH_SECRET` - Generate another random string
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Your Hostinger email credentials
- `ADMIN_EMAIL` - Where to receive notifications

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001` by default.

### 4. Test the API

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@turabroot.com","password":"YourPassword123!"}'

# Get projects (no auth required)
curl http://localhost:3001/api/projects
```

## Database

The SQLite database automatically initializes on first run. All tables and indexes are created automatically.

### Seeding Initial Data

To add a default admin user manually:

```bash
npm run migrate
```

## Security Features

✅ **Authentication**
- JWT with short-lived access tokens (15 minutes)
- Refresh tokens with database invalidation
- bcryptjs password hashing (12 salt rounds)

✅ **Input Validation**
- All inputs validated with express-validator
- Whitelist validation (not blacklist)
- Email, URL, phone validation

✅ **Rate Limiting**
- Login: 5 attempts per 15 minutes
- Contact form: 3 requests per hour
- Project requests: 1 per day per email
- Global: 100 requests per minute

✅ **Security Headers**
- Helmet.js for HTTP security headers
- CORS restricted to specified origins
- HSTS, X-Frame-Options, X-Content-Type-Options, etc.

✅ **Database Security**
- Parameterized queries (SQL injection prevention)
- Foreign key constraints
- Audit logging for all admin actions

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Projects (Public Read, Admin Write)
- `GET /api/projects` - List all projects
- `GET /api/projects?featured=true` - Get featured projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)

### Admin Users (Admin Only)
- `GET /api/admins` - List admins
- `GET /api/admins/:id` - Get single admin
- `POST /api/admins` - Create admin
- `PUT /api/admins/:id` - Update admin
- `DELETE /api/admins/:id` - Delete admin

### Messages (Public Write, Admin Read)
- `POST /api/messages` - Submit contact form (public)
- `GET /api/messages` - List messages (admin only)
- `GET /api/messages/:id` - Get message (admin only)
- `PATCH /api/messages/:id/read` - Mark as read (admin only)
- `DELETE /api/messages/:id` - Delete message (admin only)

### Project Requests (Public Write, Admin Read)
- `POST /api/project-requests` - Submit request (public)
- `GET /api/project-requests` - List requests (admin only)
- `GET /api/project-requests/:id` - Get request (admin only)
- `DELETE /api/project-requests/:id` - Delete request (admin only)

### Social Links (Public Read, Admin Write)
- `GET /api/social-links` - Get enabled links (public)
- `POST /api/social-links` - Create link (admin only)
- `PUT /api/social-links/:id` - Update link (admin only)
- `DELETE /api/social-links/:id` - Delete link (admin only)

## Deployment to Hostinger VPS

### Step 1: Connect to VPS

```bash
ssh root@your_vps_ip
```

### Step 2: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 3: Clone Repository or Upload Files

```bash
cd /home/user
git clone your_repo_url
# OR
scp -r backend root@your_vps_ip:/home/user/turab-backend
```

### Step 4: Install Dependencies

```bash
cd /home/user/turab-backend/backend
npm install --production
```

### Step 5: Configure Environment

```bash
nano .env
```

Update all environment variables for production:
- Change `NODE_ENV=production`
- Set strong JWT secrets
- Configure SMTP credentials
- Set CORS_ORIGINS to your domain
- Set FRONTEND_URL to your domain

### Step 6: Using CloudPanel

1. **Create Application in CloudPanel**
   - Go to Applications → Create Application
   - Select Node.js
   - Set root directory to backend folder
   - Set startup command: `node server.js`

2. **Set Environment Variables**
   - In CloudPanel, add environment variables from `.env`
   - CloudPanel will handle process management

3. **Configure SSL**
   - CloudPanel auto-provisions SSL with Let's Encrypt
   - HTTPS is automatically enabled

### Step 7: Using PM2 (Alternative)

If not using CloudPanel:

```bash
sudo npm install -g pm2

# Start application
pm2 start server.js --name "turab-api"

# Configure to restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Step 8: Set Up Reverse Proxy (Nginx)

If using Nginx:

```bash
sudo nano /etc/nginx/sites-available/api.yourdomain.com

# Add this configuration
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Database Backup

Set up automated backups:

```bash
# Create backup script
nano ~/backup-db.sh

#!/bin/bash
BACKUP_DIR="/home/user/backups"
mkdir -p $BACKUP_DIR
cp /home/user/turab-backend/backend/db.sqlite $BACKUP_DIR/db-$(date +%Y%m%d-%H%M%S).sqlite
# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete

# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * ~/backup-db.sh
```

## Monitoring

### Check Application Status

```bash
# If using PM2
pm2 status

# If using CloudPanel
cloudpanel status

# Check logs
tail -f logs/app.log
```

### Monitor Performance

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check process resources
htop
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

### Database Locked

SQLite has built-in locking. If you see "database is locked":

```bash
# Ensure no other processes are accessing db
ps aux | grep node

# Check file permissions
ls -la db.sqlite

# Set proper permissions
chmod 644 db.sqlite
```

### Email Not Sending

1. Check SMTP credentials in `.env`
2. Verify Hostinger email account is active
3. Check firewall allows port 587
4. Test with simple curl:

```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test message"}'
```

### CORS Errors

Ensure `CORS_ORIGINS` includes your frontend domain:

```bash
# In .env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Performance Optimization

### Database Indexes

Indexes are automatically created on commonly queried fields:
- projects.featured
- projects.status
- messages.read, messages.created_at
- audit_logs.admin_id, audit_logs.timestamp

### Caching Headers

Configure CloudPanel or Nginx to set caching headers for static resources.

### Load Balancing

For high traffic, consider:
- Using CloudPanel's load balancing
- Setting up multiple Node.js instances with Nginx
- Using a CDN for static assets

## Disaster Recovery

### Restore from Backup

```bash
# Stop application
pm2 stop turab-api

# Restore database
cp ~/backups/db-YYYYMMDD-HHMMSS.sqlite ./db.sqlite

# Restart application
pm2 start turab-api
```

## Support

For issues:
1. Check logs: `pm2 logs turab-api`
2. Test API endpoints with curl
3. Verify environment variables
4. Check server resources (disk, memory)

---

**Last Updated:** 2024
**Version:** 1.0.0
