# Admin Dashboard Testing Guide

## Quick Start

**Access Admin Dashboard:**
- URL: `http://localhost:5173/dashboard` (development)
- URL: `https://turabroot.com/dashboard` (production)

**Default Login Credentials:**
```
Email: admin@turabroot.com
Password: admin123
```

⚠️ **IMPORTANT:** Change password immediately after first login in production!

---

## Test Scenarios

### Test 1: Admin Login & Dashboard Access

**Steps:**
1. Navigate to `/dashboard`
2. See login form with email and password fields
3. Enter email: `admin@turabroot.com`
4. Enter password: `admin123`
5. Click "Login"

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to dashboard overview
- ✅ See navigation menu with all sections
- ✅ No CORS errors in console
- ✅ No 401 or authentication errors

**Verify:**
```bash
# Check browser console
# Should be clean - no errors
```

---

### Test 2: Projects Management - YouTube Thumbnail Generation

**Scenario 1: Add New Project with YouTube URL**

Steps:
1. Login to dashboard
2. Go to **Projects** section
3. Click "Add Project"
4. Fill form:
   - Title: `"E-Commerce Platform Demo"`
   - Description: `"Modern e-commerce platform with React and Node.js"`
   - Category: `"Web"`
   - YouTube URL: `https://youtu.be/dQw4w9WgXcQ` (must be valid YouTube URL)
   - Tech Tags: `React`, `Node.js`, `PostgreSQL`
   - Featured: `Yes` (checkbox)
5. Click "Save"

**Expected Results:**
- ✅ Project saved successfully
- ✅ No "Invalid YouTube URL" error
- ✅ Thumbnail auto-generates from YouTube
- ✅ Thumbnail displays in projects list
- ✅ Project appears in `/projects` page
- ✅ If featured=true, appears in `/` homepage carousel

**Verify Thumbnail:**
```bash
# Open DevTools → Network tab
# Go to /projects or /
# Image request for: https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg
# Should return 200 OK
```

**Scenario 2: Update Project URL**

Steps:
1. Go to Projects section
2. Click Edit on the project you just created
3. Change YouTube URL to different video: `https://youtu.be/9bZkp7q19f0`
4. Click "Save"

**Expected Results:**
- ✅ Project updated
- ✅ Thumbnail regenerates for new video
- ✅ Old thumbnail replaced with new one
- ✅ Changes appear on `/projects` page

**Verify:**
- Refresh `/projects` page
- New thumbnail should display
- Old thumbnail should be gone

**Scenario 3: Data Persistence**

Steps:
1. Create a project with YouTube URL
2. Restart backend: `sudo systemctl restart cloudpanel` (production) or restart npm server (dev)
3. Refresh browser
4. Go to Projects section

**Expected Results:**
- ✅ Project still exists (NOT wiped)
- ✅ YouTube URL persists
- ✅ Thumbnail still displays
- ✅ All custom projects preserved

---

### Test 3: Partners Management - Multiple Images

**Scenario 1: Add Partner with 3 Images**

Steps:
1. Go to **Partners** section
2. Click "Add Partner"
3. Fill form:
   - Name: `"Global Solutions Inc"`
   - Description: `"Leading provider of enterprise software solutions serving Fortune 500 companies across 50 countries"`
4. Upload images (one at a time):
   - Image 1: Your JPG file (max 5MB)
   - Image 2: Your PNG file (max 5MB)
   - Image 3: Your WebP file (max 5MB)
5. Should see preview thumbnails in form
6. Click "Save"

**Expected Results:**
- ✅ All 3 images upload successfully
- ✅ Preview shows in form before save
- ✅ Partner created with 3 images
- ✅ Images persist in database
- ✅ Images display on `/about` page in carousel

**Verify on About Page:**
- Go to `/about`
- Find partner card
- Should see image carousel with 3 images
- Click thumbnail previews to switch images
- Image counter shows "1/3", "2/3", "3/3"

**Scenario 2: File Format Validation**

Steps:
1. Try uploading unsupported format (GIF)
2. Try uploading file >5MB
3. Try uploading 4 images (max is 3)

**Expected Results:**
- ✅ JPG, PNG, WebP accepted
- ✅ GIF rejected with error message
- ✅ File >5MB rejected with size error
- ✅ 4th image rejected with max limit error
- ✅ Clear error messages in UI

**Scenario 3: Edit Partner Images**

Steps:
1. Go to Partners section
2. Click Edit on an existing partner
3. Form shows current images as thumbnails
4. Remove 1 image (click X button)
5. Add 2 new images
6. Click "Save"

**Expected Results:**
- ✅ Images update correctly
- ✅ Old images replaced with new ones
- ✅ Changes appear on `/about` page
- ✅ Carousel updates

---

### Test 4: Social Media Links - Real-Time Sync

**Scenario 1: Add Social Link**

Steps:
1. Go to **Social Media** section
2. Click "Add Link"
3. Select Platform: `Instagram`
4. Enter URL: `https://instagram.com/turabroot`
5. Enable: `Yes` (checkbox checked)
6. Click "Save"

**Expected Results:**
- ✅ Link saved successfully
- ✅ No "already exists" error
- ✅ Appears in social links list

**Verify in Footer (Real-Time):**
- Open homepage `/` in another tab
- Scroll to footer
- Instagram icon should appear within 1-2 seconds
- No page refresh needed!

**Scenario 2: Update Existing Social Link**

Steps:
1. Go to Social Media section
2. Try adding Instagram again (new URL)
3. Instead of error, should UPDATE existing link
4. Save with new URL

**Expected Results:**
- ✅ Link updated (not duplicate error)
- ✅ Old behavior: Would throw "already exists" error ❌
- ✅ New behavior: Updates automatically ✅

**Verify:**
- Footer updates in real-time
- Old Instagram URL replaced with new one

**Scenario 3: Disable/Enable Link**

Steps:
1. Toggle "Enabled" switch to OFF
2. Look at footer
3. Link disappears from footer
4. Toggle "Enabled" back to ON
5. Link reappears in footer

**Expected Results:**
- ✅ Disabled links hidden from public
- ✅ Still visible in admin panel
- ✅ Real-time footer updates

---

### Test 5: Messages - Contact Form Integration

**Scenario 1: Receive Contact Form Message**

Steps:
1. Open `/contact` page
2. Fill contact form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Subject: `Test Message`
   - Message: `This is a test contact message`
3. Submit form

**Expected Results:**
- ✅ Form submits successfully
- ✅ Success toast notification appears
- ✅ Form clears

**In Admin Dashboard:**
1. Go to **Messages** section
2. New message should appear in list
3. Click message to view details
4. Should show all fields

**Expected Results:**
- ✅ Message appears in admin list
- ✅ Admin receives email notification (if configured)
- ✅ All message fields visible

---

### Test 6: Security Features

**Scenario 1: Rate Limiting**

Steps:
1. Try logging in with wrong password 5+ times
2. Observe 6th attempt

**Expected Results:**
- ✅ Attempts 1-5: Show "Invalid email or password"
- ✅ Attempt 6+: Show "Too many attempts, try again later"
- ✅ Rate limit resets after 15 minutes

**Scenario 2: Session Management**

Steps:
1. Login to dashboard
2. Keep browser open but idle for 30 minutes
3. Try to access admin section

**Expected Results:**
- ✅ Session expires after 30 minutes
- ✅ Redirected to login page
- ✅ Must login again

**Scenario 3: CORS Security**

Steps:
1. Open browser DevTools → Console
2. Try calling API from different domain
3. Inspect network requests

**Expected Results:**
- ✅ CORS errors appear in console if from wrong domain
- ✅ API only accepts requests from configured domains
- ✅ No security headers missing

---

### Test 7: Data Persistence Across Restarts

**Scenario: All Data Survives Server Restart**

Steps:
1. Create test data:
   - Add 1 project with YouTube URL
   - Add 1 partner with 2 images
   - Add 2 social links
2. Restart backend server
3. Check if all data persists

**Expected Results:**
- ✅ Project with YouTube URL still exists
- ✅ Partner with 2 images still exists
- ✅ Social links still exist
- ✅ Thumbnails still generate correctly
- ✅ NO data loss on restart

---

## Manual Testing Checklist

### Projects
- [ ] Add project with valid YouTube URL
- [ ] Thumbnail auto-generates
- [ ] Thumbnail displays on homepage
- [ ] Thumbnail displays on projects page
- [ ] Edit project and change URL
- [ ] Thumbnail updates for new URL
- [ ] Delete project and verify removal
- [ ] Mark as featured and appears in carousel
- [ ] Create multiple projects and they all persist

### Partners
- [ ] Add partner with 1 image
- [ ] Add partner with 2 images
- [ ] Add partner with 3 images
- [ ] Try adding 4th image (rejected)
- [ ] Upload JPG (accepted)
- [ ] Upload PNG (accepted)
- [ ] Upload WebP (accepted)
- [ ] Try GIF (rejected)
- [ ] Try file >5MB (rejected)
- [ ] Images display on about page
- [ ] Can switch between images using thumbnails
- [ ] Edit partner and add/remove images
- [ ] Delete partner and verify removal
- [ ] All partners persist after restart

### Social Links
- [ ] Add Instagram link
- [ ] Link appears in footer immediately
- [ ] Add Facebook link to different platform
- [ ] Add second Instagram link (updates, doesn't error)
- [ ] Edit link and change URL
- [ ] Link updates in footer immediately
- [ ] Disable link and disappears from footer
- [ ] Enable link and reappears in footer
- [ ] Delete link and it's gone from footer
- [ ] All links persist after restart

### Security
- [ ] Login with wrong password shows error
- [ ] Rate limiting active (429 after 5+ attempts)
- [ ] Session expires after 30 minutes
- [ ] CORS errors for unauthorized domains
- [ ] API returns 401 when token invalid
- [ ] Admin actions logged in audit_logs

### Performance
- [ ] Dashboard loads within 2 seconds
- [ ] Projects load within 1 second
- [ ] Partners load within 1 second
- [ ] Social links load within 1 second
- [ ] Image uploads complete within 10 seconds (for 5MB)
- [ ] Footer updates with social links <2 seconds (real-time)

---

## Troubleshooting During Testing

### "Invalid YouTube URL" Error
- Check URL format: Must be https://youtube.com/watch?v=ID or https://youtu.be/ID
- Check video exists and is public
- Try different video

### Images Not Uploading
- Check file size: Maximum 5MB
- Check format: JPG, PNG, or WebP only
- Try different browser or incognito window
- Check browser console for errors

### Data Disappears After Restart
- Check database file exists: `ls -lh db.sqlite`
- Check all tables exist: `sqlite3 db.sqlite ".tables"`
- Check data in database: `sqlite3 db.sqlite "SELECT COUNT(*) FROM projects;"`

### Footer Links Not Updating
- Check backend is running: `curl https://api.yourdomain.com/api/health`
- Clear browser cache
- Check console for API errors
- Try in incognito window

---

## Success Criteria ✅

The admin dashboard is **production-ready** when:

1. **✅ All CRUD operations work** (Create, Read, Update, Delete)
   - Projects: Add, edit, delete, display
   - Partners: Add 3 images, edit, delete, display
   - Social Links: Add, edit, disable/enable, delete, display

2. **✅ Real-time functionality works**
   - Social links appear in footer <2 seconds
   - No manual refresh needed

3. **✅ Data persistence works**
   - All custom data survives server restart
   - No data loss on restart

4. **✅ Image handling works**
   - Partners accept 3 JPG/PNG/WebP images
   - 5MB limit enforced
   - Images display in carousel on About page

5. **✅ Video handling works**
   - YouTube URLs save and persist
   - Thumbnails auto-generate
   - Thumbnails display on homepage carousel

6. **✅ Security works**
   - Rate limiting active
   - Session timeout active
   - CORS configured
   - No console errors

7. **✅ Performance is good**
   - Pages load <3 seconds
   - API responses <1 second
   - Database queries efficient

---

## Production Deployment Verification

Before going live on turabroot.com:

```bash
# 1. Run all tests above
# 2. Verify all checklist items pass
# 3. Run security audit
curl -I https://turabroot.com
curl -I https://api.turabroot.com/api/health

# 4. Test admin login
curl -X POST https://api.turabroot.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@turabroot.com","password":"admin123"}'

# 5. Verify database backups
ls -lh backend/backups/

# 6. Test disaster recovery
# Restore backup and verify data
```

---

**Last Updated:** June 9, 2024
**Status:** Production Ready ✅
