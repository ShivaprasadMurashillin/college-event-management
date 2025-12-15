const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/venues
 * @desc    Get all venues
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { available, capacity_min } = req.query;

    let query = 'SELECT * FROM venues WHERE 1=1';
    const params = [];

    if (available === 'true') {
      query += ' AND is_available = TRUE';
    }

    if (capacity_min) {
      query += ' AND capacity >= ?';
      params.push(parseInt(capacity_min));
    }

    query += ' ORDER BY name ASC';

    const [venues] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: venues
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/venues/:id
 * @desc    Get venue details
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [venues] = await promisePool.query('SELECT * FROM venues WHERE id = ?', [id]);

    if (venues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    res.json({
      success: true,
      data: venues[0]
    });
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/venues/:id/availability
 * @desc    Check venue availability for a date
 * @access  Public
 */
router.get('/:id/availability', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter required'
      });
    }

    // Get bookings for the specified date
    const [bookings] = await promisePool.query(
      `SELECT b.*, e.title as event_title 
       FROM venue_bookings b
       LEFT JOIN events e ON b.event_id = e.id
       WHERE b.venue_id = ? AND b.booking_date = ? AND b.status != 'cancelled'
       ORDER BY b.start_time ASC`,
      [id, date]
    );

    res.json({
      success: true,
      data: {
        date,
        bookings,
        available_slots: bookings.length === 0
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/venues/book
 * @desc    Book a venue
 * @access  Private (Organizer, Admin)
 */
router.post('/book', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const {
      venue_id,
      event_id,
      booking_date,
      start_time,
      end_time,
      purpose
    } = req.body;

    // Validate required fields
    if (!venue_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if venue exists
    const [venues] = await promisePool.query('SELECT * FROM venues WHERE id = ?', [venue_id]);

    if (venues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Check for conflicting bookings
    const [conflicts] = await promisePool.query(
      `SELECT * FROM venue_bookings 
       WHERE venue_id = ? AND booking_date = ? AND status != 'cancelled'
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [venue_id, booking_date, start_time, start_time, end_time, end_time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Venue already booked for this time slot',
        conflicts
      });
    }

    // Create booking
    const [result] = await promisePool.query(
      'INSERT INTO venue_bookings (venue_id, event_id, booked_by, booking_date, start_time, end_time, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [venue_id, event_id, req.user.userId, booking_date, start_time, end_time, purpose, 'pending']
    );

    // Get created booking
    const [bookings] = await promisePool.query(
      'SELECT * FROM venue_bookings WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Venue booking created successfully',
      data: bookings[0]
    });
  } catch (error) {
    console.error('Error booking venue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/venues/bookings/my
 * @desc    Get user's venue bookings
 * @access  Private (Organizer, Admin)
 */
router.get('/bookings/my', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    let query = `SELECT b.*, v.name as venue_name, v.location, v.capacity, e.title as event_title
                 FROM venue_bookings b
                 LEFT JOIN venues v ON b.venue_id = v.id
                 LEFT JOIN events e ON b.event_id = e.id
                 WHERE b.booked_by = ?
                 ORDER BY b.booking_date DESC, b.start_time ASC`;
    
    const [bookings] = await promisePool.query(query, [req.user.userId]);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/venues/bookings/:id/status
 * @desc    Update booking status (Admin only)
 * @access  Private (Admin)
 */
router.put('/bookings/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'confirmed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await promisePool.query('UPDATE venue_bookings SET status = ? WHERE id = ?', [status, id]);

    const [bookings] = await promisePool.query('SELECT * FROM venue_bookings WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: bookings[0]
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
