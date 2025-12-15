const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/registrations
 * @desc    Register for an event
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { event_id, registration_data } = req.body;

    if (!event_id) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Check if event exists and is accepting registrations
    const [events] = await promisePool.query(
      'SELECT * FROM events WHERE id = ? AND status = ?',
      [event_id, 'published']
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not available for registration'
      });
    }

    const event = events[0];

    // Check if registration deadline passed
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if event is full
    if (event.max_participants > 0) {
      const [regCount] = await promisePool.query(
        'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?',
        [event_id, 'cancelled']
      );

      if (regCount[0].count >= event.max_participants) {
        return res.status(400).json({
          success: false,
          message: 'Event is full'
        });
      }
    }

    // Check if already registered
    const [existing] = await promisePool.query(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
      [req.user.userId, event_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Already registered for this event',
        data: existing[0]
      });
    }

    // Create registration
    const [result] = await promisePool.query(
      'INSERT INTO registrations (user_id, event_id, registration_data, status) VALUES (?, ?, ?, ?)',
      [req.user.userId, event_id, JSON.stringify(registration_data || {}), 'registered']
    );

    // Get created registration
    const [registrations] = await promisePool.query(
      `SELECT r.*, e.title as event_title, e.date as event_date, e.venue
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: registrations[0]
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/registrations/my
 * @desc    Get current user's registrations
 * @access  Private
 */
router.get('/my', authenticate, async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    let query = `SELECT r.*, e.title, e.description, e.date, e.end_date, e.venue, e.banner_url, e.category, e.status as event_status
                 FROM registrations r
                 JOIN events e ON r.event_id = e.id
                 WHERE r.user_id = ?`;
    const params = [req.user.userId];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (upcoming === 'true') {
      query += ' AND e.date >= NOW()';
    }

    query += ' ORDER BY e.date DESC';

    const [registrations] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/registrations/:id
 * @desc    Get registration details
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [registrations] = await promisePool.query(
      `SELECT r.*, e.title, e.description, e.date, e.end_date, e.venue, e.banner_url, e.category,
              u.name as user_name, u.email
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = registrations[0];

    // Check if user owns this registration or is admin/organizer
    if (req.user.role === 'user' && registration.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this registration'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/registrations/:id
 * @desc    Cancel registration
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get registration
    const [registrations] = await promisePool.query(
      'SELECT * FROM registrations WHERE id = ?',
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = registrations[0];

    // Check if user owns this registration
    if (registration.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
    }

    // Check if already attended
    if (registration.attended) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel - attendance already marked'
      });
    }

    // Update status to cancelled
    await promisePool.query(
      'UPDATE registrations SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
