const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// ==========================================
// FAQ ROUTES
// ==========================================

/**
 * @route   GET /api/support/faq/:eventId
 * @desc    Get FAQs for an event
 * @access  Public
 */
router.get('/faq/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const [faqs] = await promisePool.query(
      `SELECT id, question, answer, display_order 
       FROM event_faqs 
       WHERE event_id = ? AND is_active = TRUE 
       ORDER BY display_order ASC`,
      [eventId]
    );

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/support/faq
 * @desc    Add FAQ to event (Organizer)
 * @access  Private (Organizer/Admin)
 */
router.post('/faq', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { event_id, question, answer, display_order = 0 } = req.body;

    // Verify organizer owns this event
    const [event] = await promisePool.query(
      'SELECT organizer_id FROM events WHERE id = ?',
      [event_id]
    );

    if (event.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event[0].organizer_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO event_faqs (event_id, question, answer, display_order, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [event_id, question, answer, display_order, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'FAQ added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error adding FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/support/faq/:id
 * @desc    Update FAQ
 * @access  Private (Organizer/Admin)
 */
router.put('/faq/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, display_order, is_active } = req.body;

    await promisePool.query(
      `UPDATE event_faqs SET question = ?, answer = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [question, answer, display_order, is_active, id]
    );

    res.json({
      success: true,
      message: 'FAQ updated successfully'
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/support/faq/:id
 * @desc    Delete FAQ
 * @access  Private (Organizer/Admin)
 */
router.delete('/faq/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await promisePool.query('DELETE FROM event_faqs WHERE id = ?', [id]);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// COMPLAINT ROUTES
// ==========================================

/**
 * @route   POST /api/support/complaints
 * @desc    Submit a complaint/support ticket
 * @access  Private
 */
router.post('/complaints', authenticate, async (req, res) => {
  try {
    const { event_id, category, subject, description, priority = 'medium' } = req.body;
    const userId = req.user.userId;

    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, subject, and description are required'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO complaints (user_id, event_id, category, subject, description, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, event_id || null, category, subject, description, priority]
    );

    // Create notification for admins
    const [admins] = await promisePool.query(
      "SELECT id FROM users WHERE role = 'admin'"
    );

    for (const admin of admins) {
      await promisePool.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES (?, 'general', 'New Support Ticket', ?, ?)`,
        [admin.id, `New ${category} complaint: ${subject}`, `/admin/complaints/${result.insertId}`]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: { ticket_id: result.insertId }
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/support/complaints/my
 * @desc    Get user's own complaints
 * @access  Private
 */
router.get('/complaints/my', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [complaints] = await promisePool.query(
      `SELECT c.*, e.title as event_title
       FROM complaints c
       LEFT JOIN events e ON c.event_id = e.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/support/complaints/:id
 * @desc    Get complaint details with responses
 * @access  Private
 */
router.get('/complaints/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const [complaints] = await promisePool.query(
      `SELECT c.*, e.title as event_title, u.name as user_name
       FROM complaints c
       LEFT JOIN events e ON c.event_id = e.id
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const complaint = complaints[0];

    // Only owner or admin can view
    if (complaint.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get responses
    const [responses] = await promisePool.query(
      `SELECT r.*, u.name as responder_name, u.role as responder_role
       FROM complaint_responses r
       JOIN users u ON r.responder_id = u.id
       WHERE r.complaint_id = ? AND (r.is_internal = FALSE OR ? = 'admin')
       ORDER BY r.created_at ASC`,
      [id, userRole]
    );

    res.json({
      success: true,
      data: { ...complaint, responses }
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/support/complaints/:id/respond
 * @desc    Add response to complaint
 * @access  Private
 */
router.post('/complaints/:id/respond', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, is_internal = false } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get complaint
    const [complaints] = await promisePool.query(
      'SELECT * FROM complaints WHERE id = ?',
      [id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const complaint = complaints[0];

    // Only owner or admin can respond
    if (complaint.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await promisePool.query(
      `INSERT INTO complaint_responses (complaint_id, responder_id, message, is_internal)
       VALUES (?, ?, ?, ?)`,
      [id, userId, message, is_internal && userRole === 'admin']
    );

    // Update status to in_progress if still open
    if (complaint.status === 'open' && userRole === 'admin') {
      await promisePool.query(
        "UPDATE complaints SET status = 'in_progress', assigned_to = ? WHERE id = ?",
        [userId, id]
      );
    }

    // Notify the other party
    const notifyUserId = userRole === 'admin' ? complaint.user_id : null;
    if (notifyUserId && !is_internal) {
      await promisePool.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES (?, 'complaint_update', 'Complaint Updated', ?, ?)`,
        [notifyUserId, `Your complaint "${complaint.subject}" has a new response`, `/support/complaints/${id}`]
      );
    }

    res.json({ success: true, message: 'Response added' });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/support/complaints/:id/status
 * @desc    Update complaint status (Admin)
 * @access  Private (Admin)
 */
router.put('/complaints/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    const updateData = { status };
    if (status === 'resolved') {
      updateData.resolved_at = new Date();
      updateData.resolution_notes = resolution_notes;
    }

    await promisePool.query(
      `UPDATE complaints SET status = ?, resolution_notes = ?, resolved_at = ?
       WHERE id = ?`,
      [status, resolution_notes || null, status === 'resolved' ? new Date() : null, id]
    );

    // Notify user
    const [complaint] = await promisePool.query('SELECT user_id, subject FROM complaints WHERE id = ?', [id]);
    if (complaint.length > 0) {
      await promisePool.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES (?, 'complaint_update', 'Complaint Status Updated', ?, ?)`,
        [complaint[0].user_id, `Your complaint "${complaint[0].subject}" is now ${status}`, `/support/complaints/${id}`]
      );
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/support/complaints/admin/all
 * @desc    Get all complaints (Admin)
 * @access  Private (Admin)
 */
router.get('/complaints/admin/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT c.*, e.title as event_title, u.name as user_name, a.name as assigned_name
                 FROM complaints c
                 LEFT JOIN events e ON c.event_id = e.id
                 JOIN users u ON c.user_id = u.id
                 LEFT JOIN users a ON c.assigned_to = a.id
                 WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND c.category = ?';
      params.push(category);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [complaints] = await promisePool.query(query, params);

    // Get stats
    const [stats] = await promisePool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count
       FROM complaints`
    );

    res.json({
      success: true,
      data: complaints,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
