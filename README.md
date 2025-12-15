# College Event Management System

A full-stack web application for managing college events with role-based access control, Google OAuth authentication, and automated certificate generation.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

## 🚀 Features

### For All Users
- 🔐 **Google OAuth 2.0 Authentication** - Secure login with Google accounts
- 📅 **Event Discovery** - Browse events by category (Technical, Cultural, Sports, Academic)
- 🎟️ **Event Registration** - Easy registration with QR code confirmation
- 📜 **Digital Certificates** - Automatic PDF certificate generation for attended events
- 👤 **Profile Management** - Update personal information and view registration history
- 🌓 **Dark/Light Mode** - Toggle between themes

### For Organizers
- ✨ **Create & Manage Events** - Full CRUD operations for events
- 📸 **Media Management** - Upload pre-event and post-event photos/videos
- ✅ **Attendance Tracking** - Mark participant attendance via QR scan or manual entry
- 📊 **Event Analytics** - View registration counts and participant lists
- 🏢 **Venue Booking** - Reserve college venues for events

### For Admins
- 👥 **User Management** - Manage user roles (User/Organizer/Admin)
- 📈 **System Analytics** - Dashboard with event statistics and trends
- 🎯 **Content Moderation** - Review and approve event submissions
- 📋 **Reports** - Generate comprehensive reports

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **TanStack React Query** - Data fetching and caching
- **React Hook Form** - Form validation
- **Zustand** - State management
- **Lucide React** - Icon library

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL 8.0** - Relational database
- **Passport.js** - Google OAuth strategy
- **JWT** - JSON Web Tokens (30-day expiration)
- **Multer** - File upload handling
- **PDFKit** - Certificate generation
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS protection

## 📁 Project Structure

```
college-event-management/
├── backend/                 # Node.js + Express backend
│   ├── config/              # Database & auth configuration
│   ├── database/            # SQL schema files
│   ├── middleware/          # Auth, upload, error handlers
│   ├── routes/              # API endpoints (8 modules)
│   ├── services/            # Business logic
│   ├── uploads/             # File storage
│   ├── server.js            # Express app entry point
│   └── README.md            # API documentation
│
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Theme)
│   │   ├── pages/           # Page components (13 pages)
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main app with routing
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS config
│
├── SETUP.md                 # Detailed setup instructions
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ ([Download](https://nodejs.org/))
- MySQL v8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))
- Google Cloud account for OAuth credentials

### 1. Clone Repository (or navigate to existing directory)
```cmd
cd c:\ThirdYear\WT\WT_SE
```

### 2. Database Setup
**PowerShell:**
```powershell
# Create database
mysql -u root -p
# Then run: CREATE DATABASE college_events; EXIT;

# Import schema
cd c:\ThirdYear\WT\WT_SE\backend
Get-Content database\schema.sql | mysql -u root -p college_events
```

**CMD (alternative):**
```cmd
mysql -u root -p
CREATE DATABASE college_events;
EXIT;

mysql -u root -p college_events < backend\database\schema.sql
```

### 3. Backend Setup
**PowerShell:**
```powershell
cd backend
npm install
Copy-Item .env.example .env
# Edit backend\.env with your credentials (see SETUP.md)
npm run dev
```

**CMD (alternative):**
```cmd
cd backend
npm install
copy .env.example .env
npm run dev
```

### 4. Frontend Setup (in new terminal)
**PowerShell:**
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

**CMD (alternative):**
```cmd
cd frontend
npm install
copy .env.example .env
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

**📖 For detailed setup instructions including Google OAuth configuration, see [SETUP.md](SETUP.md)**

## 🔑 Key Features Explained

### Authentication Flow
1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. After approval, receives JWT token (30-day validity)
4. Token stored in localStorage and used for API requests
5. Automatic refresh on expiration

### Role-Based Access Control
- **User** - Browse events, register, view certificates
- **Organizer** - Create events, manage participants, upload media
- **Admin** - Full system access, user management, analytics

### Certificate Generation
- Automatic generation upon event attendance confirmation
- Landscape A4 format with college logo
- Includes participant name, event details, certificate ID
- Download as PDF

### File Upload System
- Max 5MB per file
- Supports images (JPG, PNG) and videos (MP4)
- Organized by event ID
- Pre-event and post-event media separation

## 📚 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback handler
- `GET /auth/verify` - Verify JWT token
- `POST /auth/logout` - Logout user

### Events (Public)
- `GET /api/events` - List all events (with filters)
- `GET /api/events/:id` - Get event details
- `GET /api/events/category/:category` - Events by category
- `GET /api/events/:id/media` - Get event media

### Organizer (Protected)
- `POST /api/organizer/events` - Create event
- `PUT /api/organizer/events/:id` - Update event
- `DELETE /api/organizer/events/:id` - Delete event
- `POST /api/organizer/events/:id/media` - Upload media
- `POST /api/organizer/events/:id/attendance` - Mark attendance

### Registrations (Protected)
- `POST /api/registrations/:eventId` - Register for event
- `GET /api/registrations/my` - User's registrations
- `GET /api/registrations/event/:eventId` - Event participants

### Certificates (Protected)
- `GET /api/certificates/:registrationId` - Download certificate

### Profile (Protected)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Admin (Admin Only)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/analytics` - System analytics

### Venues (Organizer/Admin)
- `GET /api/venues` - List venues
- `GET /api/venues/:id/availability` - Check availability
- `POST /api/venues/:id/book` - Book venue

**📖 See [backend/README.md](backend/README.md) for complete API documentation**

## 🗄️ Database Schema

### Tables
- **users** - User accounts with roles
- **events** - Event details with organizer reference
- **media** - Event photos/videos (pre/post event)
- **registrations** - User-event registrations with attendance tracking
- **venues** - College venue information
- **venue_bookings** - Venue reservation records

## 🎨 Design System

### Colors
- **Primary**: #6C63FF (Purple) - Buttons, links
- **Accent**: #FF6B6B (Coral Red) - CTAs, highlights
- **Technical**: #4ECDC4 (Turquoise)
- **Cultural**: #FF6B9D (Pink)
- **Sports**: #95E1D3 (Mint)
- **Academic**: #FFA07A (Light Salmon)

### Typography
- **Headings**: Poppins (600-700 weight)
- **Body**: Inter (400-500 weight)

## 🔒 Security Features

- **JWT Authentication** with HttpOnly cookie support
- **Rate Limiting** - 100 requests per 15 minutes
- **Helmet.js** - Secure HTTP headers
- **CORS** - Configured for frontend domain
- **Input Validation** - Parameterized SQL queries
- **File Upload Validation** - Type and size restrictions
- **Role-Based Access** - Middleware protection

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly buttons and navigation
- Optimized images and lazy loading

## 🧪 Testing

### Manual Testing Checklist
- [ ] Google OAuth login flow
- [ ] Event creation and editing
- [ ] Event registration
- [ ] Certificate generation
- [ ] File uploads
- [ ] Role-based access restrictions
- [ ] Responsive design on mobile

### Future Enhancements
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Cypress
- Load testing with Artillery

## 🚀 Deployment

### Backend (Node.js)
- Deploy to **Railway**, **Render**, or **Heroku**
- Set environment variables in platform dashboard
- Use production MySQL instance (PlanetScale, AWS RDS)

### Frontend (React)
- Deploy to **Vercel**, **Netlify**, or **Cloudflare Pages**
- Set `VITE_API_URL` to production backend URL
- Build command: `npm run build`
- Output directory: `dist`

### Database
- Use managed MySQL service (AWS RDS, Google Cloud SQL)
- Import `backend/database/schema.sql`
- Set up automated backups

**Update Google OAuth redirect URIs with production URLs!**

## 📝 Environment Variables

### Backend `.env`
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=college_events
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

### Frontend `.env`
```env
VITE_API_URL=https://api.yourdomain.com
```

## 🤝 Contributing

This is an academic project for Third Year Web Technology coursework.

### Development Workflow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "Add new feature"`
4. Push and create pull request

### Code Style
- Use ESLint and Prettier for formatting
- Follow React best practices (hooks, functional components)
- Write clear comments for complex logic
- Use meaningful variable/function names

## 📄 License

This project is for educational purposes as part of Third Year B.Tech coursework.

## 👥 Team

- **Project Type**: Web Technology Semester End Project
- **Course**: Third Year B.Tech
- **Institution**: [Your College Name]

## 📞 Support

For issues or questions:
1. Check [SETUP.md](SETUP.md) troubleshooting section
2. Review [backend/README.md](backend/README.md) for API details
3. Check browser console and backend logs for errors

## 🎯 Project Status

### ✅ Completed
- Backend API (100% complete)
- Database schema and relationships
- Google OAuth integration
- JWT authentication
- File upload system
- Certificate generation
- Frontend infrastructure (routing, API service, contexts)
- Layout components (Navbar, Footer)
- Authentication pages (Login, Callback)
- Home page

### 🚧 In Progress
- Remaining React page components (Dashboard, Events, Profile, etc.)
- Form components with validation
- Media upload UI
- Admin and Organizer dashboards

### 📋 Planned
- Email notifications for event reminders
- Push notifications for updates
- Event calendar view
- Social sharing features
- Mobile app (React Native)

---

## 📸 Screenshots

*(Add screenshots after completing UI implementation)*

---

**Built with ❤️ for Third Year Web Technology Project**

Last Updated: December 2024
