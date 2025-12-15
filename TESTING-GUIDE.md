# Testing Guide - College Event Management System

## Quick Test Flow

### 1️⃣ Test Admin Functions

**Login as Admin:**
- URL: `http://localhost:3000/login`
- Click **"Admin / Organizer"** tab
- Username: `admin`
- Password: `admin@admin`

**Create an Organizer:**
1. Go to Admin Dashboard
2. Click **"Create Organizer"** button
3. Fill the form:
   - Username: `codeclub` (or anything you want)
   - Password: `cc123` (or anything you want)
   - Name: `Code Club Manager`
   - Club Name: `Code Club` (optional)
   - Phone: `1234567890` (optional)
4. Click **"Create Organizer"**
5. ✅ **A popup will show the username and password** - Save these!
6. You'll see the organizer in the table below

**View All Organizers:**
- The table shows: Username, Name, Club, Phone, Events Posted
- You can delete any organizer (if they have no events)

---

### 2️⃣ Test Organizer Functions

**Logout and Login as Organizer:**
1. Logout from admin
2. Login with the credentials you created:
   - Username: `codeclub`
   - Password: `cc123`

**Organizer Dashboard:**
- You'll see statistics: Total Events, Upcoming, Past, Registrations
- Initially all will be 0

**Create an Event:**
1. Click **"Create Event"** button
2. Fill the form:
   - **Upload a banner image** (click the upload area)
   - Event Title: `Hackathon 2024`
   - Description: `24-hour coding competition`
   - Category: `Competition`
   - Event Date: Pick any future date
   - Event Time: `10:00`
   - Venue: `Main Auditorium`
   - Max Attendees: `100` (or leave empty for unlimited)
   - Registration Fee: `0` (for free event)
   - Status: **Published** (so students can see it)
3. Click **"Create Event"**
4. ✅ You'll be redirected to Organizer Dashboard and see your event!

**Add Gallery Images:**
1. On your event card, click **"Media"** button
2. Click the upload area and select **multiple images**
3. Preview will show, click **"Upload"**
4. ✅ Images will appear in the gallery!

**Edit Event:**
1. Click **"Edit"** button on any event
2. Change details or replace banner
3. Click **"Update Event"**

**Delete Event:**
1. Click the **trash icon** on any event
2. Confirm deletion

---

### 3️⃣ Test Student Functions

**Logout and Login with Google:**
1. Logout from organizer account
2. Click **"Student"** tab
3. Click **"Continue with Google"**
4. Choose your Google account

**Browse Events:**
1. Click **"Events"** in navigation
2. ✅ You'll see the event you created with the **banner image**!
3. Use search and filters to find events
4. Click on an event card

**View Event Details:**
1. See the full event page with:
   - **Banner image** at the top
   - Event description
   - **Gallery images** (if you uploaded any)
   - Registration button
2. Click **"Register Now"**
3. ✅ You'll be registered!

**View Your Dashboard:**
1. Click **"Dashboard"** in navigation
2. See all your registered events with images
3. Filter by: All, Upcoming, Past Events

---

## Common Issues & Solutions

### ❌ "Not able to add events"

**Check these:**

1. **Are you logged in as Organizer?**
   - Admin cannot create events directly
   - Only organizers can create events

2. **Did you fill all required fields?**
   - Title ✅
   - Description ✅
   - Category ✅
   - Date ✅
   - Time ✅
   - Venue ✅

3. **Is the backend running?**
   - Open: `http://localhost:5000/health`
   - Should see: `{"status":"ok"}`

4. **Check browser console:**
   - Press F12
   - Go to "Console" tab
   - Look for red error messages
   - Share error if needed

5. **Date format:**
   - Make sure date is in future
   - Time should be in HH:MM format

---

### ❌ Images not showing

**Check:**
- Backend folder `uploads/events/` exists
- Images are less than 5MB
- Image format is jpg, png, gif, etc.

---

### ❌ Login issues

**Admin:**
- Username: `admin` (lowercase)
- Password: `admin@admin` (exactly)

**Organizer:**
- Use credentials shown when admin created the account
- Check Admin Dashboard table for username

**Student:**
- Must use Google OAuth
- No username/password option

---

## Feature Checklist

### ✅ Admin Features
- [x] Login with username/password
- [x] View system statistics
- [x] Create organizer accounts
- [x] See organizer credentials when creating
- [x] View all organizers with event counts
- [x] Delete organizers

### ✅ Organizer Features
- [x] Login with username/password (created by admin)
- [x] View dashboard with statistics
- [x] Create events with banner upload
- [x] Edit own events
- [x] Delete own events
- [x] Upload gallery images for events
- [x] View list of own events

### ✅ Student Features
- [x] Login with Google
- [x] Browse all published events
- [x] Search and filter events
- [x] View event details with images
- [x] See event gallery
- [x] Register for events
- [x] View registered events in dashboard
- [x] See event banners everywhere

---

## Quick Test Scenario

**Full Flow Test (5 minutes):**

1. **Admin:** Create organizer `testclub` / `test123`
2. **Organizer:** Login, create event with banner + gallery images
3. **Student:** Login with Google, see event, register
4. **Verify:** Student dashboard shows registered event with image

✅ If all steps work, **your system is 100% functional!**

---

## URLs Reference

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **API Docs:** http://localhost:5000/api

## Default Credentials

**Admin:**
- Username: `admin`
- Password: `admin@admin`

**Organizers:**
- Created by admin with custom credentials
- Example: `codeclub` / `cc123`

**Students:**
- Google OAuth only (no password)
