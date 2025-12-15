# COMPLETE SETUP GUIDE - Three-Tier Authentication System

## System Overview

Your college event management system now has **3 types of users** with different login methods:

### 1. **Students** (Google OAuth)
- Login with Google account
- Can browse events, register, view dashboard
- No admin privileges

### 2. **Organizers** (Username/Password)
- Created by admin
- Can create, edit, and manage their own events
- Can upload media for events
- Cannot edit other organizers' events

### 3. **Admin** (Username/Password)
- Super user with full control
- Can create/manage organizer accounts
- Can view all events and users
- Default credentials: `admin` / `admin@admin`

---

## SETUP STEPS

### Step 1: Update Database Schema

**Using MySQL Workbench (EASIEST):**
1. Open MySQL Workbench
2. Connect with password: `ssm123`
3. File → Open SQL Script
4. Select: `backend\database\schema.sql`
5. Click Execute (⚡) or press Ctrl+Shift+Enter
6. Wait for "Action(s) completed successfully"

**Alternative - Command Line:**
```cmd
cd C:\ThirdYear\WT\WT_SE
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pssm123 college_events < backend\database\schema.sql
```

### Step 2: Update Google OAuth Redirect URI

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth Client ID (182949600440-du8809...)
3. Under **"Authorized redirect URIs"**:
   - Remove: `http://localhost:5000/auth/google/callback`
   - Add: `http://localhost:5000/api/auth/google/callback`
4. Click SAVE
5. Wait 1-2 minutes for changes to take effect

### Step 3: Start the Application

Run the startup batch file:
```cmd
cd C:\ThirdYear\WT\WT_SE
start-project.bat
```

This will:
- Start backend on port 5000
- Start frontend on port 3000
- Automatically create admin user (admin/admin@admin)
- Open browser at http://localhost:3000

---

## HOW TO USE

### As Admin

1. **Login:**
   - Go to: http://localhost:3000
   - Click "Admin / Organizer" tab
   - Username: `admin`
   - Password: `admin@admin`
   - Click "Login"

2. **Create Organizer Accounts:**
   - After login, go to Admin Dashboard
   - Click "Manage Organizers" or "Users"
   - Click "Create Organizer"
   - Fill in details:
     - Username (e.g., "techclub_admin")
     - Password (e.g., "techclub123")
     - Email
     - Name
     - Club Name (e.g., "Technical Club")
     - Phone
   - Click "Create"

3. **View All Data:**
   - See all users (students, organizers)
   - See all events from all organizers
   - View statistics and analytics

### As Organizer

1. **Login:**
   - Go to: http://localhost:3000
   - Click "Admin / Organizer" tab
   - Enter username and password (provided by admin)
   - Click "Login"

2. **Create Events:**
   - Go to "Organizer Dashboard"
   - Click "Create Event"
   - Fill in event details
   - Upload banner image
   - Click "Create Event"

3. **Manage Your Events:**
   - Edit only YOUR events
   - Upload event media (pre-event/post-event)
   - View registrations
   - Mark attendance

4. **Limitations:**
   - ❌ Cannot edit other organizers' events
   - ❌ Cannot create other organizer accounts
   - ❌ Cannot access admin panel

### As Student

1. **Login:**
   - Go to: http://localhost:3000
   - Click "Student" tab (default)
   - Click "Continue with Google"
   - Select your Google account
   - Grant permissions

2. **After Login:**
   - See "Hi, [Your Name]!" on homepage
   - Your profile picture in navbar
   - Browse all events
   - Register for events
   - View your dashboard

---

## API ENDPOINTS

### Authentication

```
POST   /api/auth/login              # Username/Password login (admin/organizers)
GET    /api/auth/google             # Google OAuth (students)
GET    /api/auth/google/callback    # OAuth callback
GET    /api/auth/me                 # Get current user
POST   /api/auth/verify             # Verify JWT token
POST   /api/auth/logout             # Logout
```

### Admin (Requires admin role)

```
GET    /api/admin/organizers        # List all organizers
POST   /api/admin/organizers        # Create organizer
PUT    /api/admin/organizers/:id    # Update organizer
DELETE /api/admin/organizers/:id    # Delete organizer
GET    /api/admin/users             # List all users
GET    /api/admin/events            # List all events
GET    /api/admin/stats             # Dashboard statistics
```

### Organizer (Requires organizer/admin role)

```
GET    /api/organizer/events        # Get own events
POST   /api/organizer/events        # Create event
PUT    /api/organizer/events/:id    # Update own event
DELETE /api/organizer/events/:id    # Delete own event
POST   /api/organizer/events/:id/media  # Upload media
```

### Events (Public/User)

```
GET    /api/events                  # List all events
GET    /api/events/:id              # Get event details
POST   /api/events/:id/register     # Register for event (requires auth)
```

---

## TESTING CHECKLIST

### ✅ Admin Tests

- [ ] Login with admin/admin@admin
- [ ] Access admin dashboard
- [ ] Create organizer account
- [ ] View all organizers list
- [ ] Update organizer details
- [ ] View all events from all organizers
- [ ] Logout

### ✅ Organizer Tests

- [ ] Login with organizer credentials
- [ ] Create new event
- [ ] Upload event banner
- [ ] Edit own event
- [ ] Try to edit another organizer's event (should fail)
- [ ] Upload event media
- [ ] View event registrations
- [ ] Logout

### ✅ Student Tests

- [ ] Login with Google
- [ ] See personalized greeting ("Hi, Name!")
- [ ] Browse events
- [ ] Register for event
- [ ] View dashboard
- [ ] Try to access organizer panel (should redirect)
- [ ] Logout

---

## DATABASE SCHEMA CHANGES

### New Columns in `users` table:
- `username` VARCHAR(100) UNIQUE - For admin/organizer login
- `password_hash` VARCHAR(255) - Hashed password (bcrypt)
- `created_by` INT - ID of admin who created organizer
- `google_id` - Now NULLABLE (not required for admin/organizers)

### Key Points:
- Students have `google_id`, no username/password
- Admin/Organizers have username/password, no `google_id`
- Role can be: 'user', 'organizer', or 'admin'

---

## SECURITY FEATURES

✅ Password hashing with bcrypt (10 rounds)
✅ JWT tokens for session management
✅ Role-based access control (RBAC)
✅ Event ownership verification
✅ Google OAuth 2.0 for students
✅ Separate login flows for different user types

---

## TROUBLESHOOTING

### "Invalid username or password"
- Check credentials are correct
- Ensure backend server is running
- Check browser console (F12) for errors

### "Access Denied" when creating event
- Make sure you're logged in as organizer or admin
- JWT token might be expired - try logging in again

### "Cannot edit this event"
- You can only edit events you created
- Admin can edit all events

### Database errors
- Ensure schema.sql was run successfully
- Check if MySQL server is running
- Verify database connection in backend/.env

### Google OAuth still not working
- Verify redirect URI in Google Cloud Console
- Check if backend is running on port 5000
- Clear browser cache and cookies

---

## FILES CREATED/MODIFIED

### Backend:
- ✅ `backend/routes/auth.js` - Added POST /login endpoint
- ✅ `backend/routes/admin.js` - Added organizer CRUD endpoints
- ✅ `backend/database/schema.sql` - Updated users table
- ✅ `backend/utils/seedAdmin.js` - Auto-create admin user
- ✅ `backend/server.js` - Call seedAdmin on startup

### Frontend:
- ✅ `frontend/src/pages/Login.jsx` - Dual login (student/staff)
- ✅ `frontend/src/pages/Home.jsx` - Personalized greeting
- ✅ `frontend/src/pages/AuthCallback.jsx` - Fixed token handling

---

## NEXT STEPS

1. Run schema.sql in MySQL Workbench
2. Update Google OAuth redirect URI
3. Start servers with start-project.bat
4. Login as admin (admin/admin@admin)
5. Create your first organizer account
6. Test all three login types
7. Create some events
8. Test with student Google login

---

## Support

For issues:
1. Check DATABASE-ACCESS.md for database help
2. Check browser console (F12) for frontend errors
3. Check terminal for backend errors
4. Verify all credentials in backend/.env file

Default credentials:
- MySQL: root / ssm123
- Admin: admin / admin@admin
- Google OAuth: Your Google account
