require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const passport = require('./config/passport');
const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - allow local network access dynamically
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any origin from local network (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
    const isLocalNetwork = /^http:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)[0-9.:]+$/.test(origin);
    
    if (isLocalNetwork || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Passport initialization
app.use(passport.initialize());

// Rate limiting - relaxed for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes (increased from 100)
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/organizer', require('./routes/organizer'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/venues', require('./routes/venues'));

// New Enhanced Feature Routes
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/support', require('./routes/support'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/collaborators', require('./routes/collaborators'));
app.use('/api/recommendations', require('./routes/recommendations'));

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Campus Events Management System API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      organizer: '/api/organizer',
      registrations: '/api/registrations',
      certificates: '/api/certificates',
      profile: '/api/profile',
      admin: '/api/admin',
      venues: '/api/venues',
      feedback: '/api/feedback',
      support: '/api/support',
      notifications: '/api/notifications',
      referrals: '/api/referrals',
      collaborators: '/api/collaborators',
      recommendations: '/api/recommendations'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Seed admin user (only creates if doesn't exist)
    const { seedAdminUser } = require('./utils/seedAdmin');
    await seedAdminUser();

    // Start listening on all network interfaces
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Local: http://localhost:${PORT}/api`);
      console.log(`\n✅ Server accessible on local network via your IP address!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;

// Restart trigger

