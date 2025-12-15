const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const [users] = await promisePool.query(
      'SELECT id, google_id, email, name, avatar_url, role, club_name, phone, department, year, interests, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const [regStats] = await promisePool.query(
      'SELECT COUNT(*) as total_registrations, SUM(attended) as attended_count FROM registrations WHERE user_id = ?',
      [req.user.userId]
    );

    const [certStats] = await promisePool.query(
      'SELECT COUNT(*) as certificates_count FROM registrations WHERE user_id = ? AND certificate_generated = TRUE',
      [req.user.userId]
    );

    const profile = {
      ...users[0],
      stats: {
        total_registrations: regStats[0].total_registrations || 0,
        attended_events: regStats[0].attended_count || 0,
        certificates_earned: certStats[0].certificates_count || 0
      }
    };

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', authenticate, async (req, res) => {
  try {
    const updateFields = [];
    const params = [];

    const allowedFields = ['name', 'phone', 'department', 'year', 'club_name'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(req.user.userId);

    await promisePool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated profile
    const [users] = await promisePool.query(
      'SELECT id, google_id, email, name, avatar_url, role, club_name, phone, department, year, interests FROM users WHERE id = ?',
      [req.user.userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/profile/interests
 * @desc    Update user interests
 * @access  Private
 */
router.put('/interests', authenticate, async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: 'Interests must be an array'
      });
    }

    await promisePool.query(
      'UPDATE users SET interests = ? WHERE id = ?',
      [JSON.stringify(interests), req.user.userId]
    );

    res.json({
      success: true,
      message: 'Interests updated successfully',
      data: { interests }
    });
  } catch (error) {
    console.error('Error updating interests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/profile/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar
    await promisePool.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar_url: avatarUrl
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/profile/registrations
 * @desc    Get user's event registrations
 * @access  Private
 */
router.get('/registrations', authenticate, async (req, res) => {
  try {
    const { status } = req.query;

    let query = `SELECT r.*, e.title, e.date, e.venue, e.banner_url, e.category
                 FROM registrations r
                 JOIN events e ON r.event_id = e.id
                 WHERE r.user_id = ?`;
    const params = [req.user.userId];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
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
 * @route   GET /api/profile/certificates
 * @desc    Get user's certificates
 * @access  Private
 */
router.get('/certificates', authenticate, async (req, res) => {
  try {
    const [certificates] = await promisePool.query(
      `SELECT r.id, r.certificate_url, r.attended, r.attendance_marked_at,
              e.title, e.date, e.category
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ? AND r.certificate_generated = TRUE
       ORDER BY e.date DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
