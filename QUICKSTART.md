# 🚀 QUICK START GUIDE

## ✅ What's Already Done
- ✅ Node.js installed (v22.13.1)
- ✅ npm installed (v10.9.2)
- ✅ MySQL Workbench installed
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ Configuration files created

## 📋 What You Need to Do Now

### STEP 1: Setup MySQL Database (5 minutes)

**Option A: Using MySQL Workbench (Recommended)**
1. Open **MySQL Workbench**
2. Click on your **Local instance MySQL**
3. Enter your MySQL root password
4. Click **File** → **Open SQL Script**
5. Navigate to: `C:\ThirdYear\WT\WT_SE\backend\database\schema.sql`
6. Click **Execute** (⚡ lightning bolt icon)
7. You should see: "6 tables created successfully"

**Option B: Using Command Line**
```powershell
# Open PowerShell as Administrator
cd C:\ThirdYear\WT\WT_SE
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < backend\database\schema.sql
# Enter your MySQL password when prompted
```

**Verify Database Created:**
In MySQL Workbench, run:
```sql
USE college_events;
SHOW TABLES;
```
You should see: users, events, media, registrations, venues, venue_bookings

---

### STEP 2: Configure MySQL Password

**Edit backend\.env file:**
1. Open: `C:\ThirdYear\WT\WT_SE\backend\.env`
2. Find line: `DB_PASSWORD=root`
3. Change `root` to your actual MySQL root password
4. Save the file

Example:
```env
DB_PASSWORD=your_actual_mysql_password
```

---

### STEP 3: Run the Project

**Method 1: Using Batch Script (Easiest)**
1. Double-click: `start-project.bat` in `C:\ThirdYear\WT\WT_SE`
2. Two windows will open (Backend and Frontend)
3. Wait 10-15 seconds for servers to start
4. Open browser: http://localhost:3000

**Method 2: Manual Start**

Terminal 1 (Backend):
```powershell
cd C:\ThirdYear\WT\WT_SE\backend
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd C:\ThirdYear\WT\WT_SE\frontend
npm run dev
```

---

### STEP 4: Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"
**Solution:**
1. Make sure MySQL service is running (check MySQL Workbench connection)
2. Verify password in `backend\.env` matches your MySQL root password
3. Check database exists: Run `SHOW DATABASES;` in MySQL Workbench

### Error: "Port 5000 already in use"
**Solution:**
```powershell
# Find and kill process using port 5000
Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Error: "Port 3000 already in use"
**Solution:**
```powershell
# Find and kill process using port 3000
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Frontend shows blank page
**Solution:**
1. Press `Ctrl + Shift + R` to hard refresh browser
2. Open Browser DevTools (F12) → Check Console for errors
3. Make sure backend is running on port 5000

---

## 🎯 Next Steps (Google OAuth Setup)

The app will run but Google login won't work yet. To enable it:

1. Go to: https://console.cloud.google.com/
2. Create a new project: "College Event Management"
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Authorized JavaScript origins: `http://localhost:5000`
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
5. Copy Client ID and Client Secret
6. Update `backend\.env`:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   ```
7. Restart backend server

**For now, you can test the app without Google login - just explore the UI!**

---

## 📊 What to Expect

When you first open http://localhost:3000:
- ✅ You should see the home page with hero section
- ✅ Navbar with "Login with Google" button
- ✅ Event categories and features
- ❌ Login won't work until Google OAuth is set up (that's okay!)

---

## 🆘 Need Help?

If you encounter errors:
1. Check the Backend terminal for error messages
2. Check the Frontend terminal for error messages
3. Open Browser Console (F12) → Console tab
4. Copy the error message and I'll help fix it!

---

## ✨ Files Created for You

- `setup-mysql.bat` - Instructions for MySQL setup
- `start-project.bat` - One-click project starter
- `backend\.env` - Backend configuration (JWT secret already generated!)
- `frontend\.env` - Frontend configuration (already configured!)
- `backend\uploads\` - Directory for file uploads (already created!)

---

**Ready? Run `start-project.bat` and let's go! 🚀**
