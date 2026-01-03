const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * Track event click for recommendations
 */
const trackEventClick = async (userId, eventId, sessionId) => {
  try {
    await promisePool.query(
      'INSERT INTO event_clicks (user_id, event_id, session_id) VALUES (?, ?, ?)',
      [userId, eventId, sessionId]
    );

    // Update user interests based on event category
    if (userId) {
      const [event] = await promisePool.query(
        'SELECT category FROM events WHERE id = ?',
        [eventId]
      );

      if (event.length > 0 && event[0].category) {
        // Update clicked categories
        await promisePool.query(
          `INSERT INTO user_interests (user_id, clicked_categories)
           VALUES (?, JSON_ARRAY(?))
           ON DUPLICATE KEY UPDATE 
           clicked_categories = JSON_ARRAY_APPEND(
             COALESCE(clicked_categories, JSON_ARRAY()), 
             '$', 
             ?
           )`,
          [userId, event[0].category, event[0].category]
        );
      }
    }
  } catch (error) {
    console.error('Error tracking click:', error);
  }
};

/**
 * @route   POST /api/recommendations/track-click
 * @desc    Track event click
 * @access  Public
 */
router.post('/track-click', optionalAuth, async (req, res) => {
  try {
    const { event_id, session_id } = req.body;
    const userId = req.user?.userId || null;

    await trackEventClick(userId, event_id, session_id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/recommendations/personalized
 * @desc    Get personalized event recommendations for user
 * @access  Private
 */
router.get('/personalized', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10 } = req.query;

    // Get user interests
    const [interests] = await promisePool.query(
      'SELECT * FROM user_interests WHERE user_id = ?',
      [userId]
    );

    // Get user profile
    const [user] = await promisePool.query(
      'SELECT department, semester FROM users WHERE id = ?',
      [userId]
    );

    // Get registered categories
    const [registeredCategories] = await promisePool.query(
      `SELECT DISTINCT e.category 
       FROM registrations r 
       JOIN events e ON r.event_id = e.id 
       WHERE r.user_id = ?`,
      [userId]
    );

    // Build preference weights
    let preferredCategories = [];
    
    if (interests.length > 0 && interests[0].clicked_categories) {
      try {
        const clicked = JSON.parse(interests[0].clicked_categories);
        preferredCategories = [...preferredCategories, ...clicked];
      } catch (e) {}
    }

    registeredCategories.forEach(rc => {
      if (rc.category) preferredCategories.push(rc.category);
    });

    // Count category frequency
    const categoryWeights = {};
    preferredCategories.forEach(cat => {
      categoryWeights[cat] = (categoryWeights[cat] || 0) + 1;
    });

    // Get recommended events
    let query = `
      SELECT e.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND status != 'cancelled') as registrations_count,
        CASE 
          WHEN e.category IN (${Object.keys(categoryWeights).length > 0 ? Object.keys(categoryWeights).map(() => '?').join(',') : "''"}) THEN 10
          ELSE 0
        END as preference_score,
        CASE 
          WHEN e.target_department = ? OR e.target_department IS NULL OR e.target_audience = 'all' THEN 5
          ELSE 0
        END as department_score,
        CASE 
          WHEN e.is_featured = TRUE THEN 3
          ELSE 0
        END as featured_score
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.status = 'published' AND e.date >= NOW()
      AND e.id NOT IN (SELECT event_id FROM registrations WHERE user_id = ?)
      ORDER BY (preference_score + department_score + featured_score) DESC, e.date ASC
      LIMIT ?
    `;

    const params = [
      ...Object.keys(categoryWeights),
      user[0]?.department || '',
      userId,
      parseInt(limit)
    ];

    const [events] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: events,
      interests: {
        preferred_categories: Object.keys(categoryWeights),
        department: user[0]?.department
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/recommendations/similar/:eventId
 * @desc    Get similar events
 * @access  Public
 */
router.get('/similar/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = 4 } = req.query;

    // Get current event details
    const [currentEvent] = await promisePool.query(
      'SELECT category, organizer_id FROM events WHERE id = ?',
      [eventId]
    );

    if (currentEvent.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Find similar events
    const [similar] = await promisePool.query(
      `SELECT e.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registrations_count
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id != ? 
         AND e.status = 'published'
         AND e.date >= NOW()
         AND (e.category = ? OR e.organizer_id = ?)
       ORDER BY 
         CASE WHEN e.category = ? THEN 1 ELSE 2 END,
         e.date ASC
       LIMIT ?`,
      [eventId, currentEvent[0].category, currentEvent[0].organizer_id, currentEvent[0].category, parseInt(limit)]
    );

    res.json({ success: true, data: similar });
  } catch (error) {
    console.error('Error getting similar events:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending events (most registrations recently)
 * @access  Public
 */
router.get('/trending', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const [trending] = await promisePool.query(
      `SELECT e.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND registered_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as recent_registrations,
        (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as total_registrations
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.status = 'published' AND e.date >= NOW()
       ORDER BY recent_registrations DESC, total_registrations DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({ success: true, data: trending });
  } catch (error) {
    console.error('Error getting trending events:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/recommendations/interests
 * @desc    Update user interests/preferences
 * @access  Private
 */
router.put('/interests', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferred_categories, preferred_time } = req.body;

    await promisePool.query(
      `INSERT INTO user_interests (user_id, preferred_categories, preferred_time)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       preferred_categories = ?, preferred_time = ?`,
      [userId, JSON.stringify(preferred_categories), preferred_time, JSON.stringify(preferred_categories), preferred_time]
    );

    res.json({ success: true, message: 'Interests updated' });
  } catch (error) {
    console.error('Error updating interests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/recommendations/for-you
 * @desc    Get "For You" section events
 * @access  Public/Private
 */
router.get('/for-you', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { limit = 8 } = req.query;

    if (!userId) {
      // Return featured events for non-logged in users
      const [featured] = await promisePool.query(
        `SELECT e.*, u.name as organizer_name
         FROM events e
         LEFT JOIN users u ON e.organizer_id = u.id
         WHERE e.status = 'published' AND e.date >= NOW()
         ORDER BY e.is_featured DESC, e.date ASC
         LIMIT ?`,
        [parseInt(limit)]
      );
      return res.json({ success: true, data: featured, personalized: false });
    }

    // Get personalized recommendations for logged in users
    const [user] = await promisePool.query(
      'SELECT department, semester FROM users WHERE id = ?',
      [userId]
    );

    const [events] = await promisePool.query(
      `SELECT e.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registrations_count
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.status = 'published' AND e.date >= NOW()
         AND e.id NOT IN (SELECT event_id FROM registrations WHERE user_id = ?)
       ORDER BY 
         CASE WHEN e.target_department = ? OR e.target_audience = 'all' THEN 0 ELSE 1 END,
         e.is_featured DESC,
         e.date ASC
       LIMIT ?`,
      [userId, user[0]?.department || '', parseInt(limit)]
    );

    res.json({ success: true, data: events, personalized: true });
  } catch (error) {
    console.error('Error getting for-you events:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
module.exports.trackEventClick = trackEventClick;
