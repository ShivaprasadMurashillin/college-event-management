const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and authenticate user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, role, name }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Check if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - No user found'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Insufficient permissions',
        requiredRole: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Check if user is organizer of specific event
 */
const isEventOrganizer = async (req, res, next) => {
  const { promisePool } = require('../config/database');
  const eventId = req.params.id;

  try {
    // Master admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if event exists and user is the organizer
    const [events] = await promisePool.query(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found'
      });
    }

    if (events[0].organizer_id !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to modify this event'
      });
    }

    next();
  } catch (error) {
    console.error('Error in isEventOrganizer middleware:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Token invalid but continue without user
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  isEventOrganizer,
  optionalAuth
};
