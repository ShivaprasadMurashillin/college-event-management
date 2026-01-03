const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/collaborators/event/:eventId
 * @desc    Get all collaborators for an event
 * @access  Private (Organizer/Admin)
 */
router.get('/event/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify user has access to this event
    const [event] = await promisePool.query(
      'SELECT organizer_id FROM events WHERE id = ?',
      [eventId]
    );

    if (event.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is organizer, collaborator, or admin
    const isOrganizer = event[0].organizer_id === req.user.userId;
    const [collab] = await promisePool.query(
      'SELECT * FROM event_collaborators WHERE event_id = ? AND user_id = ?',
      [eventId, req.user.userId]
    );
    const isCollaborator = collab.length > 0;

    if (!isOrganizer && !isCollaborator && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [collaborators] = await promisePool.query(
      `SELECT ec.*, u.name, u.email, u.avatar_url, a.name as added_by_name
       FROM event_collaborators ec
       JOIN users u ON ec.user_id = u.id
       JOIN users a ON ec.added_by = a.id
       WHERE ec.event_id = ?`,
      [eventId]
    );

    res.json({ success: true, data: collaborators });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/collaborators
 * @desc    Add collaborator to event
 * @access  Private (Organizer/Admin)
 */
router.post('/', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { event_id, user_email, permission = 'view' } = req.body;

    // Verify organizer owns this event
    const [event] = await promisePool.query(
      'SELECT * FROM events WHERE id = ?',
      [event_id]
    );

    if (event.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event[0].organizer_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only event organizer can add collaborators' });
    }

    // Find user by email
    const [users] = await promisePool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [user_email]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found with that email' });
    }

    const collaboratorId = users[0].id;

    // Check if already a collaborator
    const [existing] = await promisePool.query(
      'SELECT * FROM event_collaborators WHERE event_id = ? AND user_id = ?',
      [event_id, collaboratorId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'User is already a collaborator' });
    }

    // Add collaborator
    await promisePool.query(
      `INSERT INTO event_collaborators (event_id, user_id, permission, added_by)
       VALUES (?, ?, ?, ?)`,
      [event_id, collaboratorId, permission, req.user.userId]
    );

    // Log activity
    await promisePool.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, details)
       VALUES (?, 'event', ?, 'update', ?)`,
      [req.user.userId, event_id, JSON.stringify({ action: 'added_collaborator', collaborator: users[0].email, permission })]
    );

    // Notify collaborator
    await promisePool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES (?, 'general', 'You were added as collaborator', ?, ?)`,
      [collaboratorId, `You've been added as a ${permission} collaborator for "${event[0].title}"`, `/events/${event_id}`]
    );

    res.status(201).json({
      success: true,
      message: 'Collaborator added successfully',
      data: { user: users[0], permission }
    });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/collaborators/:id
 * @desc    Update collaborator permission
 * @access  Private (Organizer/Admin)
 */
router.put('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { permission } = req.body;

    // Get collaborator record
    const [collab] = await promisePool.query(
      'SELECT ec.*, e.organizer_id FROM event_collaborators ec JOIN events e ON ec.event_id = e.id WHERE ec.id = ?',
      [id]
    );

    if (collab.length === 0) {
      return res.status(404).json({ success: false, message: 'Collaborator not found' });
    }

    // Verify ownership
    if (collab[0].organizer_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await promisePool.query(
      'UPDATE event_collaborators SET permission = ? WHERE id = ?',
      [permission, id]
    );

    // Log activity
    await promisePool.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, details)
       VALUES (?, 'event', ?, 'update', ?)`,
      [req.user.userId, collab[0].event_id, JSON.stringify({ action: 'updated_collaborator_permission', permission })]
    );

    res.json({ success: true, message: 'Permission updated' });
  } catch (error) {
    console.error('Error updating collaborator:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/collaborators/:id
 * @desc    Remove collaborator from event
 * @access  Private (Organizer/Admin)
 */
router.delete('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get collaborator record
    const [collab] = await promisePool.query(
      'SELECT ec.*, e.organizer_id, e.title, u.email FROM event_collaborators ec JOIN events e ON ec.event_id = e.id JOIN users u ON ec.user_id = u.id WHERE ec.id = ?',
      [id]
    );

    if (collab.length === 0) {
      return res.status(404).json({ success: false, message: 'Collaborator not found' });
    }

    // Verify ownership
    if (collab[0].organizer_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await promisePool.query('DELETE FROM event_collaborators WHERE id = ?', [id]);

    // Log activity
    await promisePool.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, details)
       VALUES (?, 'event', ?, 'update', ?)`,
      [req.user.userId, collab[0].event_id, JSON.stringify({ action: 'removed_collaborator', collaborator: collab[0].email })]
    );

    // Notify removed collaborator
    await promisePool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, 'general', 'Collaborator Access Removed', ?)`,
      [collab[0].user_id, `Your collaborator access for "${collab[0].title}" has been removed`]
    );

    res.json({ success: true, message: 'Collaborator removed' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/collaborators/my-events
 * @desc    Get events where user is a collaborator
 * @access  Private
 */
router.get('/my-events', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [events] = await promisePool.query(
      `SELECT e.*, ec.permission, u.name as organizer_name
       FROM event_collaborators ec
       JOIN events e ON ec.event_id = e.id
       JOIN users u ON e.organizer_id = u.id
       WHERE ec.user_id = ?
       ORDER BY e.date DESC`,
      [userId]
    );

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching collaborative events:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/collaborators/activity/:eventId
 * @desc    Get activity log for an event
 * @access  Private (Organizer/Admin)
 */
router.get('/activity/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = 50 } = req.query;

    const [logs] = await promisePool.query(
      `SELECT al.*, u.name as user_name
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = 'event' AND al.entity_id = ?
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [eventId, parseInt(limit)]
    );

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
