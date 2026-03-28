# Turab Root - Setup & Integration Guide

Complete guide to set up the entire Turab Root application (frontend + backend) for development and production.

## Quick Start (Local Development)

### Prerequisites

- Node.js 16+ and npm
- SQLite3
- Git

### 1. Clone Repository

```bash
git clone your_repo_url
cd turab-root
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env (email settings are optional for dev)
nano .env

# Start backend
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# In project root (not backend folder)
npm install

# Frontend will automatically use http://localhost:3001/api

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Verify Integration

```bash
# In another terminal, test the API
curl http://localhost:3001/api/health

# Should return:
# {"status":"ok","timestamp":"2024-01-01T..."}
```

## Features Overview

### ✅ Backend Features

- **Authentication:** JWT with refresh tokens
- **Secure Password Hashing:** bcryptjs (12 rounds)
- **Input Validation:** Full server-side validation with express-validator
- **Rate Limiting:** Multiple layers (login, contact forms, public endpoints)
- **Email Service:** Nodemailer integration for notifications
- **Database:** SQLite with automatic migrations
- **Security Headers:** Helmet.js for HTTP security
- **CORS Protection:** Configurable for your domain
- **Audit Logging:** All admin actions logged

### ✅ Frontend Features

- **Modern React:** With hooks and functional components
- **TypeScript:** For type safety
- **Responsive Design:** Mobile-first approach
- **Dark Mode:** Built-in theme support
- **Internationalization:** Multi-language support (EN, FA)
- **Form Validation:** Client and server-side validation
- **Toast Notifications:** User feedback system
- **API Integration:** Automatic token refresh and error handling

### ✅ YouTube Thumbnail Integration

- **Automatic Generation:** Thumbnails auto-generated from YouTube URLs
- **No Manual Uploads:** Uses YouTube's CDN for thumbnails
- **Multiple URL Formats:** Supports various YouTube URL formats
- **Embedded Player:** Videos can be embedded or linked

## API Endpoints

### Public Endpoints (No Authentication Required)

```
GET    /api/health                      - Health check
GET    /api/projects                    - List all projects
GET    /api/projects?featured=true      - List featured projects
GET    /api/projects/:id                - Get single project
POST   /api/messages                    - Submit contact form
POST   /api/project-requests            - Submit project request
GET    /api/social-links                - Get social links
POST   /api/auth/login                  - Admin login
POST   /api/auth/refresh                - Refresh token
```

### Protected Endpoints (Authentication Required)

```
GET    /api/auth/me                     - Get current user info
POST   /api/auth/logout                 - Logout
GET    /api/admins                      - List admins
GET    /api/admins/:id                  - Get admin
POST   /api/admins                      - Create admin
PUT    /api/admins/:id                  - Update admin
DELETE /api/admins/:id                  - Delete admin
GET    /api/messages                    - List messages
GET    /api/messages/:id                - Get message
PATCH  /api/messages/:id/read           - Mark message as read
DELETE /api/messages/:id                - Delete message
GET    /api/project-requests            - List project requests
GET    /api/project-requests/:id        - Get project request
DELETE /api/project-requests/:id        - Delete project request
POST   /api/social-links                - Create social link
PUT    /api/social-links/:id            - Update social link
DELETE /api/social-links/:id            - Delete social link
POST   /api/projects                    - Create project
PUT    /api/projects/:id                - Update project
DELETE /api/projects/:id                - Delete project
```

## Configuration

### Frontend (.env)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3001/api  # Development
# VITE_API_BASE_URL=https://api.yourdomain.com/api  # Production
```

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3001
DATABASE_PATH=./db.sqlite

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (optional for development)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_password
ADMIN_EMAIL=admin@yourdomain.com

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
FRONTEND_URL=http://localhost:5173
```

## Testing

### Manual API Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@turabroot.com","password":"your_password"}'

# Get projects
curl http://localhost:3001/api/projects

# Submit message
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Your Name",
    "email":"you@example.com",
    "subject":"Test",
    "message":"Test message"
  }'
```

### Automated Testing

```bash
# Run test suite (from backend directory)
cd backend
bash scripts/test-api.sh

# With custom API URL
bash scripts/test-api.sh http://localhost:3001/api
```

## Database Management

### View Database

```bash
cd backend

# Open SQLite
sqlite3 db.sqlite

# Common commands in SQLite prompt:
.tables                     # List all tables
.schema TABLE_NAME         # View table structure
SELECT * FROM projects;    # Query data
.quit                      # Exit
```

### Backup Database

```bash
cd backend
cp db.sqlite db.sqlite.backup
```

### Reset Database (Development Only)

```bash
cd backend
rm db.sqlite
npm run dev  # Will recreate fresh database
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### Database Locked

```bash
# Ensure only one backend instance running
ps aux | grep "node"

# Restart backend
# Check file permissions
chmod 644 db.sqlite
```

### CORS Errors

1. Check browser console for exact error
2. Verify `CORS_ORIGINS` in backend .env includes frontend URL
3. Restart backend
4. Clear browser cache (Ctrl+Shift+Del)

```bash
# Expected CORS headers in response:
curl -I http://localhost:3001/api/projects

# Should show:
# Access-Control-Allow-Origin: http://localhost:5173
```

### Email Not Sending (Development)

Email is optional for development. If you need email testing:

1. Get Hostinger email credentials
2. Update SMTP settings in .env
3. Test with:

```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test"}'

# Check your email
```

## File Structure

```
turab-root/
├── frontend code (React)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service (api.js)
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilities and validation
│   │   └── i18n/              # Translations
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                    # Express.js backend
    ├── src/
    │   ├── app.js             # Express app setup
    │   ├── server.js          # Entry point
    │   ├── config/            # Database, email config
    │   ├── middleware/        # Auth, validation, CORS
    │   ├── routes/            # API routes
    │   ├── controllers/       # Route handlers
    │   ├── utils/             # Utilities
    │   │   ├── tokenUtils.js
    │   │   ├── youtubeUtils.js
    │   │   ├── validators.js
    │   │   └── emailService.js
    │   └── models/            # Database models
    ├── .env                   # Environment variables
    ├── .env.example           # Environment template
    ├── db.sqlite              # SQLite database
    ├── package.json
    ├── README.md              # Backend documentation
    └── scripts/
        ├── setup.sh           # Setup script
        └── test-api.sh        # Test script
```

## Production Deployment

### Before Deploying

- [ ] Update JWT secrets in .env
- [ ] Configure SMTP for production email
- [ ] Set CORS_ORIGINS to your domain
- [ ] Set FRONTEND_URL to your domain
- [ ] Generate strong API keys
- [ ] Set NODE_ENV=production
- [ ] Test all endpoints
- [ ] Backup database
- [ ] Review security settings

### Deploy to Hostinger VPS

See `DEPLOYMENT_GUIDE.md` for complete Hostinger VPS deployment instructions.

Quick summary:
1. SSH into VPS
2. Install Node.js
3. Clone repository
4. Configure .env for production
5. Setup with CloudPanel or PM2
6. Build and deploy frontend
7. Test all endpoints
8. Setup automated backups
9. Monitor logs and performance

## Security Checklist

- ✅ JWT tokens with expiry
- ✅ Password hashing (bcryptjs)
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS prevention (HTML escaping)
- ✅ Security headers (Helmet.js)
- ✅ HTTPS/SSL
- ✅ Audit logging
- ✅ Environment variables for secrets
- ✅ Database backups

## Performance Tips

### Frontend

- Uses Vite for fast builds
- Code splitting for faster loading
- Image optimization
- Lazy loading for routes
- Minification in production

### Backend

- Database indexes on common queries
- Connection pooling
- Response compression
- Caching headers
- Parameterized queries (prevents SQL injection)

## Maintenance

### Daily

```bash
# Check if services are running
ps aux | grep node

# Monitor logs
tail -f logs/app.log
```

### Weekly

```bash
# Verify backups
ls -lh backend/backups/

# Check disk space
df -h
```

### Monthly

```bash
# Update dependencies
npm audit
npm update

# Review access logs
# Check for suspicious activity
```

## Support Resources

- **Backend Documentation:** backend/README.md
- **Deployment Guide:** DEPLOYMENT_GUIDE.md
- **API Documentation:** See API Endpoints section above
- **Express.js:** https://expressjs.com
- **SQLite:** https://www.sqlite.org
- **Node.js:** https://nodejs.org

## Getting Help

1. Check logs for errors
2. Test endpoints with curl
3. Verify environment variables
4. Check file permissions
5. Review database integrity
6. Check network connectivity (for email)

## License

This project is proprietary. All rights reserved.

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready
