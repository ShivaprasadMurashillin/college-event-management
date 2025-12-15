# Quick Start Guide - College Event Management System

## 🚀 Running the Application

### Backend (Terminal 1):
```powershell
cd backend
npm install    # Only first time
npm start      # Starts server on http://localhost:5000
```

### Frontend (Terminal 2):
```powershell
cd frontend
npm install    # Only first time
npm run dev    # Starts dev server on http://localhost:3000
```

### Database:
MySQL should be running with:
- Database: `college_events`
- Password: `ssm123`
- Schema already applied

---

## 🔑 Test Accounts

### Admin Login:
- **URL:** http://localhost:3000/login
- **Tab:** Click "Admin / Organizer" tab
- **Username:** `admin`
- **Password:** `admin@admin`
- **Access:** Admin Dashboard, Create Organizers

### Create Your First Organizer:
1. Login as admin
2. Go to Admin Dashboard
3. Click "Create Organizer"
4. Fill in:
   - Username: `techclub`
   - Password: `password123`
   - Name: `Tech Club Organizer`
   - Club Name: `Technical Club`
   - Phone: `1234567890`
5. Click "Create Organizer"

### Organizer Login:
- **URL:** http://localhost:3000/login
- **Tab:** "Admin / Organizer"
- **Username:** `techclub`
- **Password:** `password123`
- **Access:** Create Events, Upload Images

### Student Login:
- **URL:** http://localhost:3000/login
- **Tab:** "Student Login"
- **Method:** Click "Sign in with Google"
- **Access:** Browse Events, Register, Dashboard

---

## 📝 Testing the Complete Flow

### Step 1: Create an Event (As Organizer)
1. Login as organizer (`techclub` / `password123`)
2. Click "Create Event" button
3. Upload a banner image (drag & drop or click)
4. Fill in event details:
   ```
   Title: Hackathon 2024
   Description: 24-hour coding competition
   Category: Technical
   Date: [Select future date]
   Time: 09:00
   Venue: Main Auditorium
   Max Attendees: 100
   Fee: 0 (or any amount)
   Status: Published
   ```
5. Click "Create Event"
6. ✅ Event appears on Organizer Dashboard

### Step 2: Add Gallery Images
1. From Organizer Dashboard, click "Media" button on your event
2. Click to select multiple images (or drag & drop)
3. Preview images will appear
4. Click "Upload X Image(s)"
5. ✅ Images appear in Event Gallery section

### Step 3: View Event (As Student)
1. Logout from organizer account
2. Login as student (Google OAuth)
3. Go to "Events" page
4. ✅ See your event with banner image
5. Click on the event card
6. ✅ View full details with banner and gallery images

### Step 4: Register for Event
1. On Event Details page, click "Register Now"
2. ✅ See "You're registered!" message
3. Go to "My Dashboard"
4. ✅ See registered event with banner image

### Step 5: Manage Event (As Organizer)
1. Logout and login as organizer again
2. Go to Organizer Dashboard
3. ✅ See registration count increased
4. Click "Edit" button
5. Modify event details or change banner
6. Click "Update Event"
7. ✅ Changes reflect immediately on Events page

---

## 🎯 Feature Checklist

### Admin Features:
- ✅ View system statistics
- ✅ Create unlimited organizer accounts
- ✅ View all organizers with event counts
- ✅ Delete organizers (with validation)
- ✅ No email or Google account needed

### Organizer Features:
- ✅ View personal event statistics
- ✅ Create events with banner upload
- ✅ Edit own events only
- ✅ Upload multiple gallery images per event
- ✅ Delete gallery images
- ✅ Delete events
- ✅ View registration counts
- ✅ Set event capacity and fees
- ✅ Draft/publish events

### Student Features:
- ✅ Google OAuth login
- ✅ Browse all published events
- ✅ Search and filter events
- ✅ View event details with images
- ✅ View event gallery
- ✅ Register for events
- ✅ Track registrations in dashboard
- ✅ View upcoming and past events

### Dynamic Image Flow:
- ✅ Organizer uploads banner → Shows on Events page
- ✅ Organizer uploads gallery → Shows on Event Details
- ✅ Images appear immediately for students
- ✅ Registered events show banners in user dashboard
- ✅ No page refresh needed

---

## 🔍 Pages Overview

| Page | URL | Access | Purpose |
|------|-----|--------|---------|
| Home | `/` | Public | Landing page with personalized greeting |
| Login | `/login` | Public | Dual login (Student/Staff) |
| Events | `/events` | Public | Browse all events with images |
| Event Details | `/events/:id` | Public | Full event info + gallery |
| User Dashboard | `/dashboard` | Student | My registered events |
| Organizer Dashboard | `/organizer-dashboard` | Organizer | Manage my events |
| Create Event | `/create-event` | Organizer | Create with image upload |
| Edit Event | `/edit-event/:id` | Organizer | Edit own events |
| Manage Media | `/manage-media/:id` | Organizer | Upload gallery images |
| Admin Dashboard | `/admin-dashboard` | Admin | Manage organizers |

---

## 💡 Tips

### Image Uploads:
- Max file size: 5MB per image
- Supported formats: JPG, PNG, GIF, WebP
- Multiple images can be uploaded at once in Manage Media
- Images are stored in `/backend/uploads/events/`
- Preview before upload is available

### Event Management:
- Draft events are not visible to students
- Published events appear immediately on Events page
- Organizers can only edit/delete their own events
- Admin has full access to all events

### Registration:
- Students must login to register
- Registration is instant
- Status is tracked (confirmed, pending, cancelled)
- Capacity limits are enforced

### Search & Filters:
- Search works on event title and description
- Filter by category (Technical, Cultural, Sports, etc.)
- Results update dynamically

---

## 🐛 Troubleshooting

### Images not showing:
- Check if backend is serving `/uploads` folder
- Verify image path starts with `/uploads/events/`
- Check file permissions on uploads folder
- Image URL should be: `http://localhost:5000/uploads/events/filename.jpg`

### Login issues:
- Admin/Organizer: Use "Admin / Organizer" tab with username/password
- Student: Use "Student Login" tab with Google
- Check console for errors

### Event not appearing:
- Verify event status is "Published" not "Draft"
- Check if organizer is logged in
- Refresh Events page

### Registration not working:
- Ensure student is logged in
- Check event capacity not full
- Event date should be in future

---

## 📊 Success Metrics

After testing, you should see:
- ✅ Events with images on Events page
- ✅ Gallery images on Event Details page
- ✅ Registration counts updating
- ✅ Images uploaded by organizers visible to students
- ✅ Dashboard showing registered events with banners
- ✅ Statistics updating in real-time

---

## 🎉 You're All Set!

The system is fully functional and dynamic. Images uploaded by organizers immediately appear on student-facing pages, creating a seamless experience across all user roles.

**Enjoy your College Event Management System! 🚀**
