const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [usersCount] = await promisePool.query("SELECT COUNT(*) as count FROM users WHERE role='user'");
    const [organizersCount] = await promisePool.query("SELECT COUNT(*) as count FROM users WHERE role='organizer'");
    const [eventsCount] = await promisePool.query("SELECT COUNT(*) as count FROM events");
    const [registrationsCount] = await promisePool.query("SELECT COUNT(*) as count FROM registrations");

    res.json({
      success: true,
      stats: {
        users: usersCount[0].count,
        organizers: organizersCount[0].count,
        events: eventsCount[0].count,
        registrations: registrationsCount[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    let query = 'SELECT id, google_id, email, name, avatar_url, role, club_name, phone, department, year, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR club_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await promisePool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR club_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await promisePool.query(countQuery, countParams);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.put('/users/:id/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['user', 'organizer', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed roles: user, organizer, admin'
      });
    }

    // Check if user exists
    const [users] = await promisePool.query('SELECT * FROM users WHERE id = ?', [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update role
    await promisePool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    // Get updated user
    const [updated] = await promisePool.query(
      'SELECT id, google_id, email, name, avatar_url, role, club_name, phone FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user exists
    const [users] = await promisePool.query('SELECT * FROM users WHERE id = ?', [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    await promisePool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/events
 * @desc    Get all events (admin view)
 * @access  Private (Admin only)
 */
router.get('/events', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = `SELECT e.*, u.name as organizer_name, u.email as organizer_email, u.club_name,
                 (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND status != 'cancelled') as registrations_count
                 FROM events e
                 LEFT JOIN users u ON e.organizer_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    query += ' ORDER BY e.created_at DESC';

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [events] = await promisePool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM events WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await promisePool.query(countQuery, countParams);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parseInt(limit))
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
 * @route   PUT /api/admin/events/:id/status
 * @desc    Update event status (approve/reject)
 * @access  Private (Admin only)
 */
router.put('/events/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['draft', 'published', 'cancelled', 'completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await promisePool.query('UPDATE events SET status = ? WHERE id = ?', [status, id]);

    // Get updated event
    const [events] = await promisePool.query('SELECT * FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Event status updated successfully',
      data: events[0]
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/analytics
 * @desc    Get platform analytics
 * @access  Private (Admin only)
 */
router.get('/analytics', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Total users by role
    const [userStats] = await promisePool.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    // Total events by status
    const [eventStats] = await promisePool.query(
      'SELECT status, COUNT(*) as count FROM events GROUP BY status'
    );

    // Total registrations
    const [regStats] = await promisePool.query(
      'SELECT COUNT(*) as total, SUM(attended) as attended, COUNT(*) - SUM(attended) as pending FROM registrations WHERE status != "cancelled"'
    );

    // Events by category
    const [categoryStats] = await promisePool.query(
      'SELECT category, COUNT(*) as count FROM events WHERE status = "published" GROUP BY category'
    );

    // Recent activity
    const [recentEvents] = await promisePool.query(
      'SELECT id, title, date, status, created_at FROM events ORDER BY created_at DESC LIMIT 10'
    );

    const [recentRegistrations] = await promisePool.query(
      `SELECT r.id, r.registered_at, u.name as user_name, e.title as event_name
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN events e ON r.event_id = e.id
       ORDER BY r.registered_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        users: userStats,
        events: eventStats,
        registrations: regStats[0],
        categories: categoryStats,
        recentEvents,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/admin/organizers
 * @desc    Get all organizers
 * @access  Private (Admin only)
 */
router.get('/organizers', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [organizers] = await promisePool.query(
      `SELECT u.id, u.username, u.name, u.email, u.club_name, u.phone, u.created_at,
       (SELECT COUNT(*) FROM events WHERE organizer_id = u.id) as events_count
       FROM users u
       WHERE u.role = 'organizer'
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      data: organizers
    });
  } catch (error) {
    console.error('Error fetching organizers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/admin/organizers
 * @desc    Create new organizer account
 * @access  Private (Admin only)
 */
router.post('/organizers', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { username, password, email, name, club_name, phone } = req.body;

    // Validate input - only username, password, and name are required
    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and name are required'
      });
    }

    // Check if username already exists
    const [existing] = await promisePool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create organizer (email is optional)
    const [result] = await promisePool.query(
      `INSERT INTO users (username, password_hash, email, name, role, club_name, phone, created_by) 
       VALUES (?, ?, ?, ?, 'organizer', ?, ?, ?)`,
      [username, passwordHash, email || null, name, club_name, phone, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Organizer created successfully',
      data: {
        id: result.insertId,
        username,
        email,
        name,
        club_name,
        phone,
        role: 'organizer'
      }
    });
  } catch (error) {
    console.error('Error creating organizer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/admin/organizers/:id
 * @desc    Update organizer account
 * @access  Private (Admin only)
 */
router.put('/organizers/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { password, email, name, club_name, phone } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (club_name !== undefined) {
      updates.push('club_name = ?');
      values.push(club_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await promisePool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND role = 'organizer'`,
      values
    );

    res.json({
      success: true,
      message: 'Organizer updated successfully'
    });
  } catch (error) {
    console.error('Error updating organizer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/admin/organizers/:id
 * @desc    Delete organizer account
 * @access  Private (Admin only)
 */
router.delete('/organizers/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if organizer has events
    const [[{ event_count }]] = await promisePool.query(
      'SELECT COUNT(*) as event_count FROM events WHERE organizer_id = ?',
      [id]
    );

    if (event_count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete organizer with ${event_count} existing events. Please reassign or delete events first.`
      });
    }

    // Delete organizer
    await promisePool.query(
      'DELETE FROM users WHERE id = ? AND role = \'organizer\'',
      [id]
    );

    res.json({
      success: true,
      message: 'Organizer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting organizer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
