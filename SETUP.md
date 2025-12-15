# College Event Management System - Setup Guide

Complete setup instructions for the full-stack React + Node.js + MySQL application.

## Prerequisites

- **Node.js** v18.x or higher ([Download](https://nodejs.org/))
- **MySQL** v8.0 or higher ([Download](https://dev.mysql.com/downloads/mysql/))
- **Google Cloud Console** account for OAuth credentials
- **Git** (optional, for version control)

## Table of Contents

1. [Google OAuth Setup](#1-google-oauth-setup)
2. [Database Setup](#2-database-setup)
3. [Backend Setup](#3-backend-setup)
4. [Frontend Setup](#4-frontend-setup)
5. [Running the Application](#5-running-the-application)
6. [Project Structure](#6-project-structure)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Google OAuth Setup

### Step 1.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `College Event Management`
4. Click **"Create"**

### Step 1.2: Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### Step 1.3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type
3. Fill in the required fields:
   - **App name**: College Event Management System
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Click **"Save and Continue"**
5. Skip **Scopes** section (click "Save and Continue")
6. Add test users (your Gmail addresses for testing)
7. Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 1.4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Select **"Web application"**
4. Fill in:
   - **Name**: College Event Management OAuth
   - **Authorized JavaScript origins**: `http://localhost:5000`
   - **Authorized redirect URIs**: `http://localhost:5000/auth/google/callback`
5. Click **"Create"**
6. **Save the Client ID and Client Secret** (you'll need these for `.env` file)

---

## 2. Database Setup

### Step 2.1: Install MySQL

If not already installed:
- **Windows**: Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
- **Mac**: `brew install mysql`
- **Linux**: `sudo apt install mysql-server`

### Step 2.2: Start MySQL Service

**PowerShell (run as Administrator):**
```powershell
# Start MySQL service
Start-Service MySQL80

# Check service status
Get-Service MySQL80

# Verify MySQL version
mysql --version
```

**CMD (alternative):**
```cmd
net start MySQL80
mysql --version
```

### Step 2.3: Create Database

**PowerShell:**
```powershell
# Login to MySQL
mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE college_events;

-- Create user (optional, or use root)
CREATE USER 'event_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON college_events.* TO 'event_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 2.4: Import Database Schema

**PowerShell:**
```powershell
# Navigate to backend directory
cd c:\ThirdYear\WT\WT_SE\backend

# Import schema
Get-Content database\schema.sql | mysql -u root -p college_events

# Verify tables were created
mysql -u root -p college_events -e "SHOW TABLES;"
```

**CMD (alternative):**
```cmd
cd c:\ThirdYear\WT\WT_SE\backend
mysql -u root -p college_events < database\schema.sql
mysql -u root -p college_events -e "SHOW TABLES;"
```

You should see: `users`, `events`, `media`, `registrations`, `venues`, `venue_bookings`

---

## 3. Backend Setup

### Step 3.1: Install Dependencies

**PowerShell:**
```powershell
cd c:\ThirdYear\WT\WT_SE\backend
npm install
```

**CMD (alternative):**
```cmd
cd c:\ThirdYear\WT\WT_SE\backend
npm install
```

This installs:
- Express.js (web framework)
- MySQL2 (database driver)
- Passport.js + Google OAuth strategy
- jsonwebtoken (JWT authentication)
- Multer (file uploads)
- PDFKit (certificate generation)
- Security packages (helmet, cors, express-rate-limit)

### Step 3.2: Configure Environment Variables

Create `.env` file in `backend/` directory:

**PowerShell:**
```powershell
# Copy example file
Copy-Item .env.example .env

# Open in default editor
notepad .env
```

**CMD (alternative):**
```cmd
copy .env.example .env
notepad .env
```

Edit `backend\.env` with your actual values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_events
DB_CONNECTION_LIMIT=10

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRES_IN=30d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_from_step_1.4
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_1.4
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

**Important**: Replace placeholder values with actual credentials!

### Step 3.3: Create Upload Directory

**PowerShell:**
```powershell
# Create upload directories
New-Item -ItemType Directory -Path uploads -Force
New-Item -ItemType Directory -Path uploads\events -Force

# Verify directories were created
Get-ChildItem uploads
```

**CMD (alternative):**
```cmd
mkdir uploads
mkdir uploads\events
dir uploads
```

### Step 3.4: Test Database Connection

**PowerShell or CMD:**
```powershell
npm run dev
```

If successful, you should see:
```
[INFO] Server running on port 5000
[INFO] MySQL Database connected successfully
```

To stop the server: Press `Ctrl+C`

---

## 4. Frontend Setup

### Step 4.1: Install Dependencies

Open a **new PowerShell/CMD window**:

**PowerShell:**
```powershell
cd c:\ThirdYear\WT\WT_SE\frontend
npm install
```

**CMD (alternative):**
```cmd
cd c:\ThirdYear\WT\WT_SE\frontend
npm install
```

This installs:
- React 18 + React Router
- Vite (build tool)
- Axios (HTTP client)
- TanStack React Query (data fetching)
- Tailwind CSS (styling)
- React Hook Form (forms)
- Zustand (state management)

### Step 4.2: Configure Environment Variables

Create `.env` file in `frontend/` directory:

**PowerShell:**
```powershell
# Copy example file
Copy-Item .env.example .env

# Open in editor
notepad .env
```

**CMD (alternative):**
```cmd
copy .env.example .env
notepad .env
```

Edit `frontend\.env`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 5. Running the Application

### Step 5.1: Start Backend Server

In first PowerShell/CMD terminal:

**PowerShell or CMD:**
```powershell
cd c:\ThirdYear\WT\WT_SE\backend
npm run dev
```

Backend should be running on: **http://localhost:5000**

*Keep this terminal window open*

### Step 5.2: Start Frontend Development Server

In second PowerShell/CMD terminal:

**PowerShell or CMD:**
```powershell
cd c:\ThirdYear\WT\WT_SE\frontend
npm run dev
```

Frontend should be running on: **http://localhost:3000**

*Keep this terminal window open*

### Step 5.3: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Step 5.4: Test Google OAuth Login

1. Click **"Login with Google"** button on homepage
2. You'll be redirected to Google sign-in
3. Select your Google account (must be added as test user)
4. Grant permissions
5. You'll be redirected back to dashboard with JWT token

---

## 6. Project Structure

```
c:\ThirdYear\WT\WT_SE\
│
├── backend/                      # Node.js + Express backend
│   ├── config/                   # Database & Passport config
│   ├── database/                 # SQL schema files
│   ├── middleware/               # Auth, upload, error handlers
│   ├── routes/                   # API route handlers
│   ├── services/                 # Business logic (certificates)
│   ├── uploads/                  # File upload directory
│   ├── server.js                 # Main Express app
│   ├── package.json              # Backend dependencies
│   └── .env                      # Backend environment variables
│
├── frontend/                     # React + Vite frontend
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── common/           # LoadingSpinner, etc.
│   │   │   └── layout/           # Navbar, Footer, Layout
│   │   ├── contexts/             # React contexts (Auth, Theme)
│   │   ├── pages/                # Page components
│   │   ├── services/             # API service layer
│   │   ├── App.jsx               # Main app with routing
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS config
│   └── .env                      # Frontend environment variables
│
└── SETUP.md                      # This file
```

---

## 7. Troubleshooting

### Issue: "Cannot connect to MySQL"

**Solution**:
1. Verify MySQL is running: `net start MySQL80`
2. Check credentials in `backend/.env`
3. Test connection: `mysql -u root -p`

### Issue: "Google OAuth error - redirect_uri_mismatch"

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client
3. Ensure redirect URI is exactly: `http://localhost:5000/auth/google/callback`
4. Save and wait 5 minutes for changes to propagate

### Issue: "JWT secret not set"

**Solution**:
1. Check `backend/.env` has `JWT_SECRET` set
2. Must be at least 32 characters long
3. Generate one:

**PowerShell:**
```powershell
# Generate secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**CMD (alternative):**
```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: "Port 5000 already in use"

**PowerShell Solution:**
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess

# Kill the process (replace <PID> with actual number)
Stop-Process -Id <PID> -Force

# Or use one-liner
Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**CMD Solution (alternative):**
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue: "File upload fails"

**Solution**:

**PowerShell:**
```powershell
# Check if uploads directory exists
Test-Path backend\uploads

# Create if missing
New-Item -ItemType Directory -Path backend\uploads -Force
New-Item -ItemType Directory -Path backend\uploads\events -Force

# Check directory permissions
Get-Acl backend\uploads | Format-List
```

**CMD (alternative):**
```cmd
dir backend\uploads
mkdir backend\uploads
mkdir backend\uploads\events
```

Also verify:
- `UPLOAD_DIR` in `backend/.env` is set correctly
- File size < 5MB (default limit)

### Issue: "Tailwind CSS not working"

**Solution**:

**PowerShell or CMD:**
```powershell
# Stop Vite dev server (Ctrl+C) then restart
cd c:\ThirdYear\WT\WT_SE\frontend
npm run dev
```

Also verify:
- `tailwind.config.js` and `postcss.config.js` exist in frontend/
- `index.css` has Tailwind directives (@tailwind base; @tailwind components; @tailwind utilities;)
- Clear browser cache (Ctrl+Shift+R)

### Issue: "CORS errors"

**Solution**:
1. Verify `FRONTEND_URL` in `backend/.env` is `http://localhost:3000`
2. Check Vite proxy in `frontend/vite.config.js`
3. Restart both servers

---

## 8. Default Credentials & Test Data

### Creating Admin User

After first Google OAuth login, promote user to admin:

```sql
mysql -u root -p college_events

-- Find your user ID
SELECT id, email FROM users;

-- Promote to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@gmail.com';

-- Verify
SELECT id, email, role FROM users;
```

### Creating Test Organizer

```sql
-- Promote user to organizer
UPDATE users SET role = 'organizer' WHERE email = 'organizer-email@gmail.com';
```

---

## 9. API Testing with Postman/Thunder Client

### Example: Get All Events

```
GET http://localhost:5000/api/events
```

### Example: Create Event (Organizer only)

```
POST http://localhost:5000/api/organizer/events
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
Body (JSON):
{
  "title": "Tech Workshop",
  "description": "Learn React and Node.js",
  "category": "technical",
  "date": "2024-06-15",
  "time": "14:00",
  "location": "Room 101",
  "max_participants": 50
}
```

Get JWT token from:
1. Login via frontend
2. Check browser DevTools → Application → Local Storage → `token`

---

## 10. Production Deployment (Optional)

### Environment Variables for Production

Update `.env` files with production values:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
```

Update Google OAuth redirect URIs in Google Cloud Console.

### Build Frontend

**PowerShell or CMD:**
```powershell
cd frontend
npm run build
```

This creates optimized production build in `dist/` folder.

Serve `dist/` folder with nginx or deploy to Vercel/Netlify.

---

## 11. Additional Resources

- **Backend API Documentation**: See `backend/README.md`
- **React Router Docs**: https://reactrouter.com/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Google OAuth Guide**: https://developers.google.com/identity/protocols/oauth2

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify environment variables are set correctly

---

**Project Status**: Core infrastructure complete, page implementations in progress.

Last Updated: December 2024
