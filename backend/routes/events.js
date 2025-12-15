const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/events
 * @desc    Get all events with filters
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      search,
      status = 'published',
      featured,
      upcoming,
      page = 1,
      limit = 12,
      sortBy = 'date',
      order = 'ASC'
    } = req.query;

    let query = 'SELECT e.*, u.name as organizer_name, u.club_name FROM events e LEFT JOIN users u ON e.organizer_id = u.id WHERE 1=1';
    const params = [];

    // Apply filters
    if (category) {
      query += ' AND e.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (featured === 'true') {
      query += ' AND e.is_featured = TRUE';
    }

    if (upcoming === 'true') {
      query += ' AND e.date >= NOW()';
    }

    // Add sorting
    const allowedSortFields = ['date', 'title', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY e.${sortField} ${sortOrder}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    // Get events
    const [events] = await promisePool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM events e WHERE 1=1';
    const countParams = [];

    if (category) {
      countQuery += ' AND e.category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      countQuery += ' AND e.status = ?';
      countParams.push(status);
    }

    if (featured === 'true') {
      countQuery += ' AND e.is_featured = TRUE';
    }

    if (upcoming === 'true') {
      countQuery += ' AND e.date >= NOW()';
    }

    const [countResult] = await promisePool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get single event details
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get event with organizer info
    const [events] = await promisePool.query(
      `SELECT e.*, u.name as organizer_name, u.club_name, u.email as organizer_email, u.phone as organizer_phone
       FROM events e 
       LEFT JOIN users u ON e.organizer_id = u.id 
       WHERE e.id = ?`,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = events[0];

    // Get registration count
    const [regCount] = await promisePool.query(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?',
      [id, 'cancelled']
    );
    event.registrations_count = regCount[0].count;

    // Get media
    const [media] = await promisePool.query(
      'SELECT * FROM media WHERE event_id = ? ORDER BY created_at DESC',
      [id]
    );
    event.media = media;

    // Check if current user is registered
    if (req.user) {
      const [userReg] = await promisePool.query(
        'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
        [id, req.user.userId]
      );
      event.user_registered = userReg.length > 0;
      event.user_registration = userReg[0] || null;
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/events/categories
 * @desc    Get all event categories
 * @access  Public
 */
router.get('/meta/categories', async (req, res) => {
  try {
    const [categories] = await promisePool.query(
      'SELECT DISTINCT category FROM events WHERE category IS NOT NULL AND status = ? ORDER BY category',
      ['published']
    );

    res.json({
      success: true,
      data: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/events/:id/media
 * @desc    Get all media for an event
 * @access  Public
 */
router.get('/:id/registration-status', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [registrations] = await promisePool.query(
      'SELECT * FROM registrations WHERE event_id = ? AND user_id = ? AND status != "cancelled"',
      [id, userId]
    );

    res.json({
      success: true,
      isRegistered: registrations.length > 0
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check registration status'
    });
  }
});

/**
 * @route   GET /api/events/:id/media
 * @desc    Get all media for an event
 * @access  Public
 */
router.get('/:id/media', async (req, res) => {
  try {
    const { id } = req.params;
    const { phase, type } = req.query;

    let query = 'SELECT m.*, u.name as uploaded_by_name FROM media m LEFT JOIN users u ON m.uploaded_by = u.id WHERE m.event_id = ?';
    const params = [id];

    if (phase) {
      query += ' AND m.upload_phase = ?';
      params.push(phase);
    }

    if (type) {
      query += ' AND m.media_type = ?';
      params.push(type);
    }

    query += ' ORDER BY m.created_at DESC';

    const [media] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
