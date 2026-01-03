const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { unread_only, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [notifications] = await promisePool.query(query, params);

    // Get unread count
    const [unreadCount] = await promisePool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      data: notifications,
      unread_count: unreadCount[0].count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await promisePool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    await promisePool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    console.error('Error marking all notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await promisePool.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get user's notification preferences
 * @access  Private
 */
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    let [prefs] = await promisePool.query(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );

    // Create default preferences if not exists
    if (prefs.length === 0) {
      await promisePool.query(
        'INSERT INTO notification_preferences (user_id) VALUES (?)',
        [userId]
      );
      [prefs] = await promisePool.query(
        'SELECT * FROM notification_preferences WHERE user_id = ?',
        [userId]
      );
    }

    res.json({ success: true, data: prefs[0] });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      email_enabled,
      in_app_enabled,
      telegram_enabled,
      telegram_chat_id,
      event_reminders,
      registration_updates,
      certificate_alerts,
      promotional_emails
    } = req.body;

    await promisePool.query(
      `INSERT INTO notification_preferences 
       (user_id, email_enabled, in_app_enabled, telegram_enabled, telegram_chat_id, 
        event_reminders, registration_updates, certificate_alerts, promotional_emails)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       email_enabled = ?, in_app_enabled = ?, telegram_enabled = ?, telegram_chat_id = ?,
       event_reminders = ?, registration_updates = ?, certificate_alerts = ?, promotional_emails = ?`,
      [
        userId, email_enabled, in_app_enabled, telegram_enabled, telegram_chat_id,
        event_reminders, registration_updates, certificate_alerts, promotional_emails,
        email_enabled, in_app_enabled, telegram_enabled, telegram_chat_id,
        event_reminders, registration_updates, certificate_alerts, promotional_emails
      ]
    );

    res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// NOTIFICATION HELPER (for internal use)
// ==========================================
const createNotification = async (userId, type, title, message, link = null) => {
  try {
    await promisePool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, link]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = router;
module.exports.createNotification = createNotification;
