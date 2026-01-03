const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const crypto = require('crypto');

/**
 * Generate unique referral code
 */
const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

/**
 * @route   POST /api/referrals/generate
 * @desc    Generate referral link for an event
 * @access  Private
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { event_id } = req.body;
    const userId = req.user.userId;

    // Check if general referral already exists (event_id is NULL for general referrals)
    const [existing] = await promisePool.query(
      event_id 
        ? 'SELECT * FROM referrals WHERE event_id = ? AND referrer_id = ?'
        : 'SELECT * FROM referrals WHERE event_id IS NULL AND referrer_id = ?',
      event_id ? [event_id, userId] : [userId]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        data: {
          code: existing[0].referral_code,
          link: event_id 
            ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event_id}?ref=${existing[0].referral_code}`
            : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup?ref=${existing[0].referral_code}`
        },
        message: 'Referral link already exists'
      });
    }

    // Generate unique code
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
      referralCode = generateReferralCode();
      const [check] = await promisePool.query(
        'SELECT id FROM referrals WHERE referral_code = ?',
        [referralCode]
      );
      if (check.length === 0) isUnique = true;
    }

    // Create referral
    const [result] = await promisePool.query(
      'INSERT INTO referrals (event_id, referrer_id, referral_code) VALUES (?, ?, ?)',
      [event_id || null, userId, referralCode]
    );

    // Initialize user rewards if not exists
    await promisePool.query(
      'INSERT IGNORE INTO user_rewards (user_id) VALUES (?)',
      [userId]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        code: referralCode,
        link: event_id 
          ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event_id}?ref=${referralCode}`
          : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup?ref=${referralCode}`
      }
    });
  } catch (error) {
    console.error('Error generating referral:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/referrals/track/:code
 * @desc    Track referral click
 * @access  Public
 */
router.post('/track/:code', async (req, res) => {
  try {
    const { code } = req.params;

    await promisePool.query(
      'UPDATE referrals SET clicks = clicks + 1 WHERE referral_code = ?',
      [code]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking referral:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/referrals/convert
 * @desc    Record referral conversion (called during registration)
 * @access  Private
 */
router.post('/convert', authenticate, async (req, res) => {
  try {
    const { referral_code, event_id } = req.body;
    const userId = req.user.userId;

    if (!referral_code) {
      return res.json({ success: true, message: 'No referral code' });
    }

    // Get referral
    const [referrals] = await promisePool.query(
      'SELECT * FROM referrals WHERE referral_code = ? AND event_id = ?',
      [referral_code, event_id]
    );

    if (referrals.length === 0) {
      return res.json({ success: true, message: 'Invalid referral code' });
    }

    const referral = referrals[0];

    // Don't allow self-referral
    if (referral.referrer_id === userId) {
      return res.json({ success: true, message: 'Cannot use own referral' });
    }

    // Check if already converted
    const [existing] = await promisePool.query(
      'SELECT * FROM referral_conversions WHERE referral_id = ? AND referred_user_id = ?',
      [referral.id, userId]
    );

    if (existing.length > 0) {
      return res.json({ success: true, message: 'Already converted' });
    }

    // Record conversion
    await promisePool.query(
      'INSERT INTO referral_conversions (referral_id, referred_user_id, converted) VALUES (?, ?, TRUE)',
      [referral.id, userId]
    );

    // Update referral stats
    await promisePool.query(
      'UPDATE referrals SET registrations = registrations + 1, points_earned = points_earned + 10 WHERE id = ?',
      [referral.id]
    );

    // Update referrer's rewards
    await promisePool.query(
      `INSERT INTO user_rewards (user_id, total_points, referral_count)
       VALUES (?, 10, 1)
       ON DUPLICATE KEY UPDATE total_points = total_points + 10, referral_count = referral_count + 1`,
      [referral.referrer_id]
    );

    // Update referrer's level based on points
    await promisePool.query(
      `UPDATE user_rewards SET level = 
       CASE 
         WHEN total_points >= 500 THEN 'platinum'
         WHEN total_points >= 200 THEN 'gold'
         WHEN total_points >= 50 THEN 'silver'
         ELSE 'bronze'
       END
       WHERE user_id = ?`,
      [referral.referrer_id]
    );

    // Notify referrer
    await promisePool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, 'general', 'Referral Success!', 'Someone registered using your referral link! +10 points')`,
      [referral.referrer_id]
    );

    res.json({
      success: true,
      message: 'Referral conversion recorded',
      points_awarded: 10
    });
  } catch (error) {
    console.error('Error converting referral:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/referrals/my
 * @desc    Get user's referrals
 * @access  Private
 */
router.get('/my', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [referrals] = await promisePool.query(
      `SELECT r.*, e.title as event_title
       FROM referrals r
       LEFT JOIN events e ON r.event_id = e.id
       WHERE r.referrer_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    // Get rewards
    const [rewards] = await promisePool.query(
      'SELECT * FROM user_rewards WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        referrals,
        stats: rewards[0] || { total_points: 0, level: 'bronze', referral_count: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/referrals/leaderboard
 * @desc    Get referral leaderboard
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [leaderboard] = await promisePool.query(
      `SELECT u.id, u.name, u.avatar_url, ur.total_points, ur.referral_count, ur.level
       FROM user_rewards ur
       JOIN users u ON ur.user_id = u.id
       WHERE ur.total_points > 0
       ORDER BY ur.total_points DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/referrals/rewards
 * @desc    Get user's rewards and badges
 * @access  Private
 */
router.get('/rewards', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    let [rewards] = await promisePool.query(
      'SELECT * FROM user_rewards WHERE user_id = ?',
      [userId]
    );

    if (rewards.length === 0) {
      // Create default rewards
      await promisePool.query(
        'INSERT INTO user_rewards (user_id) VALUES (?)',
        [userId]
      );
      [rewards] = await promisePool.query(
        'SELECT * FROM user_rewards WHERE user_id = ?',
        [userId]
      );
    }

    // Calculate badges
    const badges = [];
    const reward = rewards[0];
    
    if (reward.referral_count >= 1) badges.push({ name: 'First Referral', icon: '🎯' });
    if (reward.referral_count >= 5) badges.push({ name: 'Influencer', icon: '⭐' });
    if (reward.referral_count >= 10) badges.push({ name: 'Ambassador', icon: '🏆' });
    if (reward.events_attended >= 5) badges.push({ name: 'Event Enthusiast', icon: '🎉' });
    if (reward.events_attended >= 10) badges.push({ name: 'Super Attendee', icon: '🔥' });
    if (reward.total_points >= 100) badges.push({ name: 'Points Master', icon: '💎' });

    res.json({
      success: true,
      data: {
        ...reward,
        badges,
        next_level: getNextLevel(reward.level),
        points_to_next: getPointsToNextLevel(reward.total_points)
      }
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper functions
function getNextLevel(current) {
  const levels = ['bronze', 'silver', 'gold', 'platinum'];
  const idx = levels.indexOf(current);
  return idx < levels.length - 1 ? levels[idx + 1] : null;
}

function getPointsToNextLevel(points) {
  if (points < 50) return 50 - points;
  if (points < 200) return 200 - points;
  if (points < 500) return 500 - points;
  return 0;
}

module.exports = router;
