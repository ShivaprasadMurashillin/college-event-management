# Campus Events Management System - Backend

Complete Node.js/Express backend API with MySQL database and Google OAuth authentication.

## Features

- 🔐 Google OAuth 2.0 authentication
- 🎫 JWT token-based authorization (30-day expiration)
- 👥 Role-based access control (User, Organizer, Admin)
- 📅 Complete event management system
- 📝 Event registration and attendance tracking
- 📜 Automatic PDF certificate generation
- 📸 Media upload (images/videos) for events
- 🏢 Venue booking system
- 📊 Admin analytics dashboard
- 🔒 Security best practices (Helmet, CORS, Rate Limiting)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Passport.js (Google OAuth 2.0)
- **Authorization**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Security**: Helmet, CORS, Express Rate Limit

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MySQL connection pool
│   └── passport.js           # Google OAuth configuration
├── middleware/
│   ├── auth.js               # JWT authentication & authorization
│   ├── upload.js             # Multer file upload configuration
│   └── errorHandler.js       # Global error handling
├── routes/
│   ├── auth.js               # Authentication endpoints
│   ├── events.js             # Public event endpoints
│   ├── organizer.js          # Organizer-specific endpoints
│   ├── registrations.js      # Event registration endpoints
│   ├── certificates.js       # Certificate generation
│   ├── profile.js            # User profile management
│   ├── admin.js              # Admin-only endpoints
│   └── venues.js             # Venue booking endpoints
├── services/
│   └── certificateService.js # PDF certificate generator
├── database/
│   └── schema.sql            # MySQL database schema
├── uploads/                  # File uploads directory
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
├── server.js                 # Main server file
└── README.md
```

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup MySQL Database

Create a MySQL database and import the schema:

```bash
mysql -u root -p
CREATE DATABASE campus_events;
USE campus_events;
SOURCE database/schema.sql;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
copy .env.example .env
```

Edit `.env` file:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_events

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=30d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### 5. Create Master Admin User

After first Google login, update the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

## Running the Server

### Development Mode (with nodemon)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will start on `http://localhost:5000`

## API Documentation

### Authentication

#### Google OAuth Login
```
GET /api/auth/google
```
Redirects to Google OAuth consent screen.

#### OAuth Callback
```
GET /api/auth/google/callback
```
Handles Google OAuth callback and returns JWT token.

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

#### Verify Token
```
POST /api/auth/verify
Body: { token: "jwt_token" }
```

#### Refresh Token
```
POST /api/auth/refresh
Headers: Authorization: Bearer <token>
```

### Events (Public)

#### Get All Events
```
GET /api/events
Query: ?category=tech&search=workshop&page=1&limit=12
```

#### Get Event Details
```
GET /api/events/:id
```

#### Get Event Categories
```
GET /api/events/meta/categories
```

### Events (Organizer)

#### Create Event
```
POST /api/organizer/events
Headers: Authorization: Bearer <token>
Body: {
  title, description, category, date, venue, max_participants, ...
}
```

#### Update Event
```
PUT /api/organizer/events/:id
Headers: Authorization: Bearer <token>
```

#### Delete Event
```
DELETE /api/organizer/events/:id
Headers: Authorization: Bearer <token>
```

#### Get Event Registrations
```
GET /api/organizer/events/:id/registrations
Headers: Authorization: Bearer <token>
```

#### Mark Attendance (Triggers Certificate)
```
PUT /api/organizer/registrations/:id/attendance
Headers: Authorization: Bearer <token>
Body: { attended: true }
```

### Media Upload

#### Upload Banner
```
POST /api/organizer/events/:id/media/banner
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: banner (file)
```

#### Upload Gallery
```
POST /api/organizer/events/:id/media/gallery
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: media[] (multiple files)
```

### Registrations

#### Register for Event
```
POST /api/registrations
Headers: Authorization: Bearer <token>
Body: { event_id, registration_data }
```

#### Get My Registrations
```
GET /api/registrations/my
Headers: Authorization: Bearer <token>
```

#### Cancel Registration
```
DELETE /api/registrations/:id
Headers: Authorization: Bearer <token>
```

### Certificates

#### Download Certificate
```
GET /api/certificates/:registrationId
Headers: Authorization: Bearer <token>
```
Returns PDF file.

### Profile

#### Get Profile
```
GET /api/profile
Headers: Authorization: Bearer <token>
```

#### Update Profile
```
PUT /api/profile
Headers: Authorization: Bearer <token>
Body: { name, phone, department, year }
```

#### Upload Avatar
```
POST /api/profile/avatar
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: avatar (file)
```

### Admin Routes

#### Get All Users
```
GET /api/admin/users
Headers: Authorization: Bearer <admin_token>
```

#### Update User Role
```
PUT /api/admin/users/:id/role
Headers: Authorization: Bearer <admin_token>
Body: { role: "organizer" }
```

#### Get Analytics
```
GET /api/admin/analytics
Headers: Authorization: Bearer <admin_token>
```

### Venues

#### Get All Venues
```
GET /api/venues
```

#### Check Availability
```
GET /api/venues/:id/availability?date=2024-12-15
```

#### Book Venue
```
POST /api/venues/book
Headers: Authorization: Bearer <token>
Body: { venue_id, event_id, booking_date, start_time, end_time }
```

## Role-Based Access Control

### User (Default)
- View events
- Register for events
- View own profile and registrations
- Download own certificates

### Organizer
- All user permissions
- Create/edit/delete own events
- Upload event media
- View registrations for own events
- Mark attendance
- Book venues

### Admin (Master)
- All organizer permissions
- View all users and events
- Update user roles
- Approve/reject events
- View platform analytics
- Manage all venues

## Security Features

- ✅ JWT token expiration (30 days)
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ File upload validation (type, size)
- ✅ Role-based middleware
- ✅ Secure password handling (OAuth only, no passwords stored)

## File Upload Limits

- **Images**: 5MB (JPEG, PNG, GIF, WebP)
- **Videos**: 50MB (MP4, MPEG, MOV)
- **Avatar**: 5MB (JPEG, PNG, WebP)

## Certificate Generation

Certificates are automatically generated when attendance is marked. Features:
- Landscape A4 PDF format
- Organization logo from URL
- Participant name and event details
- Unique certificate ID
- Professional design with borders

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE" // Optional
}
```

## Database Schema

See `database/schema.sql` for complete schema with:
- Users (with roles)
- Events
- Registrations
- Media
- Venues
- Venue Bookings

## Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### API Root
```bash
curl http://localhost:5000/api
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db-host
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Update database credentials
- [ ] Configure CORS with production frontend URL
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure proper file upload limits
- [ ] Set up monitoring and logging
- [ ] Use environment-specific configs

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists and schema is imported

### OAuth Issues
- Verify Google OAuth credentials
- Check redirect URI matches Google Console
- Ensure correct callback URL in `.env`

### File Upload Issues
- Check `uploads/` directory permissions
- Verify file size limits
- Check disk space

## Support

For issues and questions, please check:
- Database schema documentation
- API endpoint examples above
- Error messages in console logs

## License

MIT
