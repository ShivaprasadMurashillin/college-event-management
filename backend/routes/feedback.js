const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback for an event (attended users only)
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { event_id, rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user attended the event
    const [attendance] = await promisePool.query(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ? AND attended = TRUE',
      [userId, event_id]
    );

    if (attendance.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only provide feedback for events you attended'
      });
    }

    // Simple sentiment analysis based on keywords
    let sentiment = 'neutral';
    if (comment) {
      const positiveWords = ['great', 'amazing', 'excellent', 'awesome', 'fantastic', 'loved', 'best', 'wonderful', 'good', 'helpful'];
      const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'boring', 'waste', 'disappointed', 'poor', 'horrible'];
      
      const lowerComment = comment.toLowerCase();
      const hasPositive = positiveWords.some(word => lowerComment.includes(word));
      const hasNegative = negativeWords.some(word => lowerComment.includes(word));
      
      if (hasPositive && !hasNegative) sentiment = 'positive';
      else if (hasNegative && !hasPositive) sentiment = 'negative';
      else if (rating >= 4) sentiment = 'positive';
      else if (rating <= 2) sentiment = 'negative';
    } else {
      sentiment = rating >= 4 ? 'positive' : (rating <= 2 ? 'negative' : 'neutral');
    }

    // Insert or update feedback
    await promisePool.query(
      `INSERT INTO event_feedback (event_id, user_id, rating, comment, sentiment)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, comment = ?, sentiment = ?, updated_at = NOW()`,
      [event_id, userId, rating, comment, sentiment, rating, comment, sentiment]
    );

    // Update event average rating
    const [avgResult] = await promisePool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM event_feedback WHERE event_id = ?',
      [event_id]
    );

    await promisePool.query(
      'UPDATE events SET avg_rating = ?, total_ratings = ? WHERE id = ?',
      [avgResult[0].avg_rating, avgResult[0].total, event_id]
    );

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        rating,
        sentiment,
        avg_rating: parseFloat(avgResult[0].avg_rating).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/feedback/event/:eventId
 * @desc    Get all feedback for an event
 * @access  Public
 */
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get feedback with user info
    const [feedback] = await promisePool.query(
      `SELECT f.*, u.name as user_name, u.avatar_url
       FROM event_feedback f
       JOIN users u ON f.user_id = u.id
       WHERE f.event_id = ? AND f.is_visible = TRUE
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [eventId, parseInt(limit), offset]
    );

    // Get stats
    const [stats] = await promisePool.query(
      `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
        SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_count
       FROM event_feedback WHERE event_id = ?`,
      [eventId]
    );

    res.json({
      success: true,
      data: {
        feedback,
        stats: stats[0],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/feedback/my/:eventId
 * @desc    Get user's own feedback for an event
 * @access  Private
 */
router.get('/my/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const [feedback] = await promisePool.query(
      'SELECT * FROM event_feedback WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    res.json({
      success: true,
      data: feedback[0] || null
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete feedback (user's own or admin)
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check ownership or admin
    const [feedback] = await promisePool.query(
      'SELECT * FROM event_feedback WHERE id = ?',
      [id]
    );

    if (feedback.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    if (feedback[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }

    await promisePool.query('DELETE FROM event_feedback WHERE id = ?', [id]);

    // Update event rating
    const eventId = feedback[0].event_id;
    const [avgResult] = await promisePool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM event_feedback WHERE event_id = ?',
      [eventId]
    );

    await promisePool.query(
      'UPDATE events SET avg_rating = ?, total_ratings = ? WHERE id = ?',
      [avgResult[0].avg_rating || null, avgResult[0].total, eventId]
    );

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/feedback/analytics/:eventId
 * @desc    Get feedback analytics for organizers
 * @access  Private (Organizer/Admin)
 */
router.get('/analytics/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify organizer owns this event
    const [event] = await promisePool.query(
      'SELECT organizer_id FROM events WHERE id = ?',
      [eventId]
    );

    if (event.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event[0].organizer_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get comprehensive analytics
    const [analytics] = await promisePool.query(
      `SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
        SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral
       FROM event_feedback WHERE event_id = ?`,
      [eventId]
    );

    // Rating distribution
    const [distribution] = await promisePool.query(
      `SELECT rating, COUNT(*) as count 
       FROM event_feedback WHERE event_id = ? 
       GROUP BY rating ORDER BY rating DESC`,
      [eventId]
    );

    // Top comments
    const [topComments] = await promisePool.query(
      `SELECT f.*, u.name as user_name 
       FROM event_feedback f 
       JOIN users u ON f.user_id = u.id
       WHERE f.event_id = ? AND f.comment IS NOT NULL AND f.comment != ''
       ORDER BY f.rating DESC, f.created_at DESC
       LIMIT 5`,
      [eventId]
    );

    res.json({
      success: true,
      data: {
        summary: analytics[0],
        distribution,
        topComments
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

module.exports = router;
