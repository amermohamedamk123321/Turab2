# Production Deployment Quick Start Guide

## Security Fixes Applied ✅

### 1. Protected Logout Endpoint
- **Issue:** Anyone could logout any user
- **Fix:** Added `requireAuth()` middleware to `/api/auth/logout`
- **File:** `backend/src/routes/auth.js`

### 2. Mandatory JWT Secrets
- **Issue:** App could run with weak default secrets
- **Fix:** Startup validation - fails in production without strong secrets
- **File:** `backend/server.js`

### 3. Secure CORS Configuration
- **Issue:** Production allowed dev URLs
- **Fix:** Requires explicit CORS_ORIGINS in production
- **File:** `backend/src/middleware/cors.js`

### 4. Code Cleanup
- **Issue:** Unused function in codebase
- **Fix:** Removed `listAllSocialLinks` dead code
- **File:** `backend/src/controllers/socialLinkController.js`

---

## Production Environment Setup

### Step 1: Generate Strong JWT Secrets

Run these commands to generate secure random secrets:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

### Step 2: Create Production .env File

Create `backend/.env` with these values:

```env
# CRITICAL - Must be set and strong
NODE_ENV=production
JWT_SECRET=<paste-first-openssl-output-here>
JWT_REFRESH_SECRET=<paste-second-openssl-output-here>

# IMPORTANT - Must match your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database
DATABASE_PATH=./db.sqlite
PORT=3001

# Email Configuration (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
DATABASE_BACKUP_PATH=./backups
```

### Step 3: Frontend Configuration

Ensure `VITE_API_BASE_URL` is set in frontend `.env`:

```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

Or use relative paths (proxy `/api` to backend on server).

### Step 4: SSL/TLS Certificate

For Hostinger VPS:
1. Obtain SSL certificate (free via Let's Encrypt or Hostinger)
2. Configure Nginx/Apache to use HTTPS
3. Redirect HTTP → HTTPS
4. Set HSTS headers (Helmet already configured)

### Step 5: Start Application

```bash
# Install dependencies
npm install
cd backend && npm install

# Start backend only
cd backend && npm start

# Or use with PM2 for production
pm2 start "node server.js" --name turab-api
pm2 start "npm run build && npm run preview" --name turab-frontend
```

---

## Security Validation

### Test Login Flow
```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@turabroot.com","password":"admin123"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "admin": { "id": 1, "email": "...", "username": "..." }
  }
}
```

### Test Protected Endpoint
```bash
curl -X GET https://yourdomain.com/api/admins \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Test Logout Protection
```bash
# This should FAIL (return 401)
curl -X POST https://yourdomain.com/api/auth/logout \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"xyz"}'

# This should SUCCEED (with valid token)
curl -X POST https://yourdomain.com/api/auth/logout \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

---

## Security Checklist Before Going Live

- [ ] JWT_SECRET and JWT_REFRESH_SECRET are strong random strings
- [ ] NODE_ENV is set to "production"
- [ ] CORS_ORIGINS matches your domain
- [ ] FRONTEND_URL matches your domain
- [ ] SMTP credentials configured (or email disabled gracefully)
- [ ] SSL/TLS certificate installed
- [ ] HTTP redirects to HTTPS
- [ ] Database file is NOT world-readable
- [ ] Backups configured and tested
- [ ] Monitoring/logging configured
- [ ] Admin password changed from default
- [ ] Rate limiting tested under load
- [ ] Error messages don't leak sensitive info
- [ ] All endpoints tested from production domain

---

## Rate Limiting (Already Configured)

- **Global:** 100 requests/minute per IP
- **Login:** 5 attempts/15 minutes (skips successful attempts)
- **Contact Form:** 3 submissions/hour per IP
- **Project Requests:** 1 submission/day per email

---

## Monitoring in Production

### Key Logs to Watch
```bash
# View backend logs
tail -f backend.log

# Look for auth errors
grep "UNAUTHORIZED\|Unauthorized" backend.log

# Look for validation errors
grep "Validation failed" backend.log

# Check rate limiting
grep "Too many requests" backend.log
```

### Audit Log
The application logs all admin actions:
- CREATE_ADMIN, UPDATE_ADMIN, DELETE_ADMIN
- CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT
- CREATE_SOCIAL_LINK, UPDATE_SOCIAL_LINK, DELETE_SOCIAL_LINK
- LOGIN, LOGOUT

Query via database:
```sql
SELECT * FROM audit_logs WHERE created_at > datetime('now', '-24 hours');
```

---

## Troubleshooting

### "Missing or invalid environment variables"
**Solution:** Check that JWT_SECRET and JWT_REFRESH_SECRET are set and not starting with "your_"

### "Not allowed by CORS"
**Solution:** Add your domain to CORS_ORIGINS in .env

### Login fails but credentials are correct
**Solution:** Check that backend is running and accessible

### Email notifications not sending
**Solution:** Check SMTP credentials - email is optional and gracefully fails

---

## Support

For issues or questions:
1. Check the FINAL_SECURITY_REPORT.md for detailed technical info
2. Review error logs in backend console
3. Verify all environment variables are set correctly
4. Ensure SSL certificate is valid
5. Test from production domain (not localhost)

---

**Status:** ✅ Production Ready
**Last Updated:** March 2026
