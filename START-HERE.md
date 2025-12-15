# 🎓 College Event Management System - YOUR PROJECT

## ⚡ INSTANT START (3 Steps)

### Step 1: Setup MySQL Database
Open **MySQL Workbench** → Connect to Local MySQL → Run this:
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS college_events;
```

Then: **File** → **Open SQL Script** → Select `backend\database\schema.sql` → **Execute ⚡**

### Step 2: Update MySQL Password
Edit `backend\.env` file → Change this line to your MySQL password:
```env
DB_PASSWORD=root  ← Change 'root' to your actual password
```

### Step 3: Start the Project
Double-click: **`start-project.bat`**

That's it! Open: http://localhost:3000

---

## 📁 Your Project Structure

```
C:\ThirdYear\WT\WT_SE\
│
├── 📄 start-project.bat       ← DOUBLE-CLICK THIS TO RUN
├── 📄 QUICKSTART.md            ← Detailed instructions
├── 📄 SETUP.md                 ← Full documentation
│
├── backend/                    ← Node.js + Express server
│   ├── .env                    ← ✅ Already configured!
│   ├── server.js               ← Main server file
│   ├── database/
│   │   └── schema.sql          ← MySQL tables
│   ├── routes/                 ← API endpoints
│   └── uploads/                ← ✅ Already created!
│
└── frontend/                   ← React + Vite app
    ├── .env                    ← ✅ Already configured!
    ├── src/
    │   ├── App.jsx             ← Main app
    │   ├── pages/              ← Page components
    │   └── components/         ← UI components
    └── package.json
```

---

## ✅ What's Already Done For You

- ✅ All npm packages installed (backend + frontend)
- ✅ `.env` files created and configured
- ✅ JWT secret key generated
- ✅ Upload directories created
- ✅ Database schema ready to import
- ✅ Start script created

---

## 🚀 What You Need To Do

1. **Setup database in MySQL Workbench** (5 minutes)
2. **Update MySQL password in backend\.env** (30 seconds)
3. **Run start-project.bat** (1 click)

---

## 🔍 Testing Your Setup

### Check Backend is Running
Open: http://localhost:5000/health

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-13..."
}
```

### Check Frontend is Running
Open: http://localhost:3000

You should see:
- Beautiful home page
- Navbar with "Login with Google"
- Event categories
- Hero section

---

## 🎨 Features You Built

### Backend (Node.js + Express)
- ✅ Google OAuth 2.0 authentication
- ✅ JWT token system (30-day expiration)
- ✅ Role-based access (User, Organizer, Admin)
- ✅ Event management API
- ✅ File upload system
- ✅ Certificate PDF generation
- ✅ Venue booking system

### Frontend (React + Vite)
- ✅ Modern React 18 with hooks
- ✅ Tailwind CSS styling
- ✅ Responsive design
- ✅ Dark/Light theme support
- ✅ Protected routes
- ✅ API integration

### Database (MySQL)
- ✅ 6 tables (users, events, media, registrations, venues, venue_bookings)
- ✅ Foreign key relationships
- ✅ Indexes for performance

---

## 🛠️ Commands You'll Use

### Start Everything (Recommended)
```
start-project.bat
```

### Or Start Manually:

**Backend:**
```powershell
cd backend
npm run dev
```

**Frontend:**
```powershell
cd frontend  
npm run dev
```

### Stop Servers
Close the terminal windows or press `Ctrl+C`

---

## 📝 Important Files to Know

### Configuration Files
- `backend\.env` - Backend settings (database, JWT, OAuth)
- `frontend\.env` - Frontend settings (API URL)

### Main Code Files
- `backend\server.js` - Express server entry point
- `backend\routes\*.js` - API endpoints
- `frontend\src\App.jsx` - React app with routing
- `frontend\src\pages\*.jsx` - Page components

### Database
- `backend\database\schema.sql` - Database structure

---

## 🎯 What Works Right Now

- ✅ Home page with full UI
- ✅ Navigation bar
- ✅ API backend (all endpoints ready)
- ✅ Database ready to use
- ⏳ Google login (needs OAuth setup - optional for now)

---

## 📞 If You Get Errors

### "Cannot connect to database"
➡️ Make sure:
1. MySQL Workbench can connect to local MySQL
2. Database 'college_events' exists (run schema.sql)
3. Password in `backend\.env` is correct

### "Port already in use"
➡️ Close other programs using port 5000 or 3000

### Frontend shows errors
➡️ Make sure backend is running first (port 5000)

---

## 🎓 Google OAuth Setup (Optional - Do Later)

For Google login to work:
1. Go to: https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. Create OAuth credentials
4. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend\.env`
5. Restart backend

**Don't worry about this now - test the app first!**

---

## 📊 Your Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | React Query + Zustand |
| Backend | Node.js + Express |
| Database | MySQL 8.0 |
| Auth | Google OAuth + JWT |
| Files | Multer |
| PDFs | PDFKit |

---

## 🏆 You Did It!

You've built a complete full-stack college event management system with:
- Modern React frontend
- RESTful API backend  
- MySQL database
- Authentication system
- File uploads
- PDF certificates

**Now run it and see your work come to life! 🚀**

---

**Questions? Check QUICKSTART.md or SETUP.md for detailed help!**
