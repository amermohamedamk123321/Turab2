# Turab Root - Quick Start Guide

This guide will get you up and running with the full stack (frontend + backend) in minutes.

## Prerequisites

- **Node.js 16+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

## Step 1: Setup Backend (in one terminal)

```bash
cd backend
npm install
npm run dev
```

**Expected output:**
```
Server running on port 3001
Database schema initialized successfully
```

The backend will be running at: **http://localhost:3001**

## Step 2: Setup Frontend (in another terminal)

```bash
# From project root (not backend folder)
npm install
npm run dev
```

**Expected output:**
```
  VITE v5.4.19  ready in 123 ms
  ➜  Local:   http://localhost:5173/
```

Click the link or open: **http://localhost:5173** in your browser

## Step 3: Verify Integration

Once both are running, you should see:
- ✅ Homepage loads without errors
- ✅ Featured projects carousel displays
- ✅ Projects page shows projects list
- ✅ Contact forms are functional

## Common Issues & Solutions

### Issue: "Cannot connect to backend" or "Failed to fetch"

**Solution:** Make sure the backend is running in another terminal:
```bash
cd backend
npm run dev
```

The frontend needs the backend running on `http://localhost:3001`

### Issue: Port 3001 or 5173 already in use

**Solution:** Use different ports:

For backend:
```bash
PORT=3002 npm run dev
```

For frontend (update .env):
```
VITE_API_BASE_URL=http://localhost:3002/api
npm run dev
```

### Issue: CORS errors in browser console

**Solution:** Restart the backend server. It will auto-update the CORS configuration.

### Issue: Database locked / "database is locked"

**Solution:** 
1. Stop the backend server (Ctrl+C)
2. Wait 2 seconds
3. Start it again

## Development Workflow

### Adding a New Project

1. Open http://localhost:5173/dashboard
2. Login with credentials (created during setup)
3. Click "Add Project"
4. Fill form with:
   - **Title:** Your project name
   - **Description:** Project details
   - **YouTube URL:** Paste a YouTube link (thumbnail auto-generates!)
   - **Technologies:** React, Node.js, etc.
   - **Status:** active, completed, or paused
   - **Challenge/Solution/Result:** Fill these in for featured projects
5. Click "Create"

### Testing API Endpoints

```bash
# Get all projects
curl http://localhost:3001/api/projects

# Login (returns access token)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@turabroot.com","password":"your_password"}'

# Submit contact form
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Your Name",
    "email":"you@example.com",
    "subject":"Test",
    "message":"Test message"
  }'
```

## YouTube Thumbnail Integration

The system automatically generates project thumbnails from YouTube URLs:

1. Go to Dashboard → Projects
2. Click "Add Project"
3. Paste a YouTube URL like:
   - `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - `https://youtu.be/dQw4w9WgXcQ`
4. The thumbnail will be auto-generated from YouTube's CDN
5. No manual image uploads needed!

## Frontend Features

### Dashboard (Admin Only)

Access at **http://localhost:5173/dashboard** after logging in:

- **Projects:** Manage your portfolio
- **Messages:** View contact form submissions
- **Admins:** Manage user accounts
- **Requests:** View project request leads
- **Social Links:** Update social media links

### Public Pages

- **Home:** Showcase with featured projects
- **Projects:** Browse all portfolio projects
- **About:** Team and company info
- **Contact:** Contact form and project request form

## Backend Features

### API Routes

All routes start with `http://localhost:3001/api`

**Public:**
- `GET /projects` - List projects
- `POST /messages` - Submit contact form
- `POST /project-requests` - Submit project request
- `POST /auth/login` - Admin login

**Protected (require login):**
- `GET /admins` - Admin management
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- And more...

## Database

SQLite database is automatically created in `backend/db.sqlite`

To inspect:
```bash
cd backend
sqlite3 db.sqlite
# Common commands:
.tables
SELECT * FROM projects;
SELECT * FROM messages;
.quit
```

## Environment Variables

**Frontend (.env in root):**
```
VITE_API_BASE_URL=http://localhost:3001/api
```

**Backend (.env in backend/):**
```
NODE_ENV=development
PORT=3001
DATABASE_PATH=./db.sqlite
JWT_SECRET=dev_secret_key
JWT_REFRESH_SECRET=dev_refresh_secret
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

## Testing API

Run automated tests (from backend folder):
```bash
bash scripts/test-api.sh
```

This will test:
- Health check
- Authentication
- Projects CRUD
- Messages
- Project requests
- Error handling

## Building for Production

### Frontend Build
```bash
npm run build
# Creates optimized files in dist/
```

### Backend

No build needed! Just deploy the files as-is with:
```bash
NODE_ENV=production npm start
```

## Next Steps

1. **Explore the dashboard** - Add projects, check messages
2. **Test the API** - Use curl or API testing tools
3. **Customize content** - Update projects, social links
4. **Prepare for deployment** - See DEPLOYMENT_GUIDE.md

## Useful Commands

```bash
# Backend development
cd backend
npm install              # Install dependencies
npm run dev            # Start dev server
npm run migrate        # Initialize database
npm start              # Start production server

# Frontend development
npm install            # Install dependencies
npm run dev           # Start dev server
npm run build         # Build for production
npm run lint          # Check code quality

# Database
sqlite3 db.sqlite     # Open database shell
.schema              # View all table structures
.exit                # Exit SQLite
```

## Getting Help

1. **Backend errors?** Check `backend/README.md`
2. **Deployment help?** See `DEPLOYMENT_GUIDE.md`
3. **Setup help?** Check `SETUP_GUIDE.md`
4. **API reference?** See `backend/README.md` API section
5. **Database issues?** See database management section above

## Security Notes

⚠️ **Development Only:**
- Default credentials are basic
- Email is not configured
- CORS is open to localhost
- Secrets are not strong

✅ **Before Production:**
- Change all default credentials
- Generate strong JWT secrets
- Configure email (SMTP)
- Set proper CORS origins
- Enable HTTPS
- See DEPLOYMENT_GUIDE.md for details

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+C | Stop server |
| Ctrl+Shift+J | Open dev tools |
| Ctrl+Shift+K | Open run command |
| F5 | Refresh page |

## Tips & Tricks

- **Hot reload enabled:** Changes automatically reload
- **Database persists:** Data survives server restarts
- **Mock data included:** Sample projects pre-loaded
- **Responsive design:** Test on mobile in dev tools (F12)
- **Dark mode:** Toggle in UI theme switcher

---

**Ready to start?** Run these in two terminals:

**Terminal 1:**
```bash
cd backend && npm install && npm run dev
```

**Terminal 2:**
```bash
npm install && npm run dev
```

Then open http://localhost:5173 🚀

---

**Questions?** Check the docs or review error messages in browser console (F12) and terminal output.

**Happy coding!**
