const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate, authorize, isEventOrganizer } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

/**
 * @route   GET /api/organizer/stats
 * @desc    Get organizer's statistics
 * @access  Private (Organizer, Admin)
 */
router.get('/stats', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const organizerId = req.user.userId;

    const [total] = await promisePool.query(
      'SELECT COUNT(*) as count FROM events WHERE organizer_id = ?',
      [organizerId]
    );

    const [upcoming] = await promisePool.query(
      'SELECT COUNT(*) as count FROM events WHERE organizer_id = ? AND date >= CURDATE()',
      [organizerId]
    );

    const [past] = await promisePool.query(
      'SELECT COUNT(*) as count FROM events WHERE organizer_id = ? AND date < CURDATE()',
      [organizerId]
    );

    const [registrations] = await promisePool.query(
      'SELECT COUNT(*) as count FROM registrations r JOIN events e ON r.event_id = e.id WHERE e.organizer_id = ?',
      [organizerId]
    );

    res.json({
      success: true,
      stats: {
        total: total[0].count,
        upcoming: upcoming[0].count,
        past: past[0].count,
        registrations: registrations[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching organizer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

/**
 * @route   GET /api/organizer/events
 * @desc    Get organizer's own events
 * @access  Private (Organizer, Admin)
 */
router.get('/events', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = 'SELECT e.*, (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND status != "cancelled") as registrations_count FROM events e WHERE 1=1';
    const params = [];

    // Admin sees all events, organizer sees only their own
    if (req.user.role !== 'admin') {
      query += ' AND e.organizer_id = ?';
      params.push(req.user.userId);
    }

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

    if (req.user.role !== 'admin') {
      countQuery += ' AND organizer_id = ?';
      countParams.push(req.user.userId);
    }

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
    console.error('Error fetching organizer events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/organizer/events
 * @desc    Create new event
 * @access  Private (Organizer, Admin)
 */
router.get('/events/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT e.*, 
        (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND status != 'cancelled') as registrations_count
      FROM events e 
      WHERE e.id = ?
    `;

    const [events] = await promisePool.query(query, [id]);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = events[0];

    // Check if user has permission (organizer can only access their own events, admin can access all)
    if (req.user.role === 'organizer' && event.organizer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
});

/**
 * @route   POST /api/organizer/events
 * @desc    Create new event
 * @access  Private (Organizer, Admin)
 */
router.post('/events', authenticate, authorize('organizer', 'admin'), upload.single('banner'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      date,
      end_date,
      venue,
      venue_id,
      max_participants,
      club_name,
      status = 'published',
      is_featured = false,
      registration_deadline,
      registration_fee = 0,
      requirements,
      contact_email,
      contact_phone
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, date'
      });
    }

    // Get banner URL if uploaded
    const banner_url = req.file ? `/uploads/events/${req.file.filename}` : null;

    // Insert event
    const [result] = await promisePool.query(
      `INSERT INTO events (title, description, category, tags, date, end_date, venue, venue_id, 
       max_participants, organizer_id, club_name, banner_url, status, is_featured, registration_deadline, 
       registration_fee, requirements, contact_email, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, category, JSON.stringify(tags || []), date, end_date, venue, venue_id,
        max_participants, req.user.userId, club_name, banner_url, status, is_featured, registration_deadline,
        registration_fee, requirements, contact_email, contact_phone
      ]
    );

    // Get created event
    const [events] = await promisePool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: events[0]
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/organizer/events/:id
 * @desc    Update event
 * @access  Private (Event Organizer, Admin)
 */
router.put('/events/:id', authenticate, authorize('organizer', 'admin'), isEventOrganizer, upload.single('banner'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = [];
    const params = [];

    // Handle banner upload if provided
    if (req.file) {
      updateFields.push('banner_url = ?');
      params.push(`/uploads/events/${req.file.filename}`);
    }

    const allowedFields = [
      'title', 'description', 'category', 'tags', 'date', 'end_date', 'venue', 'venue_id',
      'max_participants', 'club_name', 'status', 'is_featured', 'registration_deadline',
      'registration_fee', 'requirements', 'contact_email', 'contact_phone'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        // Handle JSON fields
        if (field === 'tags') {
          params.push(JSON.stringify(req.body[field]));
        } else {
          params.push(req.body[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id);

    await promisePool.query(
      `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated event
    const [events] = await promisePool.query('SELECT * FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: events[0]
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/organizer/events/:id
 * @desc    Delete event
 * @access  Private (Event Organizer, Admin)
 */
router.delete('/events/:id', authenticate, authorize('organizer', 'admin'), isEventOrganizer, async (req, res) => {
  try {
    const { id } = req.params;

    await promisePool.query('DELETE FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   GET /api/organizer/events/:id/registrations
 * @desc    Get registrations for event
 * @access  Private (Event Organizer, Admin)
 */
router.get('/events/:id/registrations', authenticate, authorize('organizer', 'admin'), isEventOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, attended } = req.query;

    let query = `SELECT r.*, u.name, u.email, u.phone, u.department, u.year 
                 FROM registrations r 
                 LEFT JOIN users u ON r.user_id = u.id 
                 WHERE r.event_id = ?`;
    const params = [id];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (attended !== undefined) {
      query += ' AND r.attended = ?';
      params.push(attended === 'true' ? 1 : 0);
    }

    query += ' ORDER BY r.registered_at DESC';

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
 * @route   PUT /api/organizer/registrations/:id/attendance
 * @desc    Mark attendance and trigger certificate
 * @access  Private (Organizer, Admin)
 */
router.put('/registrations/:id/attendance', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { attended } = req.body;

    // Get registration with event and user details
    const [registrations] = await promisePool.query(
      `SELECT r.*, e.title as event_name, e.date as event_date, e.organizer_id, u.name as user_name, u.email
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

    // Check if user is organizer of this event (unless admin)
    if (req.user.role !== 'admin' && registration.organizer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark attendance for this event'
      });
    }

    // Update attendance
    await promisePool.query(
      'UPDATE registrations SET attended = ?, attendance_marked_at = NOW(), attendance_marked_by = ?, status = ? WHERE id = ?',
      [attended ? 1 : 0, req.user.userId, attended ? 'attended' : 'registered', id]
    );

    // If marked as attended, generate certificate
    if (attended) {
      try {
        const { generateCertificate } = require('../services/certificateService');
        const certificate = await generateCertificate(
          { ...registration, id },
          { title: registration.event_name, date: registration.event_date },
          { name: registration.user_name }
        );

        // Update registration with certificate URL
        await promisePool.query(
          'UPDATE registrations SET certificate_generated = TRUE, certificate_url = ? WHERE id = ?',
          [certificate.url, id]
        );

        // Get updated registration
        const [updated] = await promisePool.query('SELECT * FROM registrations WHERE id = ?', [id]);

        res.json({
          success: true,
          message: 'Attendance marked and certificate generated',
          data: updated[0]
        });
      } catch (certError) {
        console.error('Error generating certificate:', certError);
        // Still mark attendance even if certificate fails
        const [updated] = await promisePool.query('SELECT * FROM registrations WHERE id = ?', [id]);
        res.json({
          success: true,
          message: 'Attendance marked but certificate generation failed',
          data: updated[0],
          certificateError: certError.message
        });
      }
    } else {
      const [updated] = await promisePool.query('SELECT * FROM registrations WHERE id = ?', [id]);
      res.json({
        success: true,
        message: 'Attendance updated',
        data: updated[0]
      });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/organizer/events/:id/media/banner
 * @desc    Upload event banner
 * @access  Private (Event Organizer, Admin)
 */
router.post('/events/:id/media/banner', authenticate, authorize('organizer', 'admin'), isEventOrganizer, upload.single('banner'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/events/${id}/${req.file.filename}`;

    // Update event banner
    await promisePool.query('UPDATE events SET banner_url = ? WHERE id = ?', [fileUrl, id]);

    // Save to media table
    await promisePool.query(
      'INSERT INTO media (event_id, media_type, file_url, file_name, file_size, mime_type, uploaded_by, upload_phase) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, 'banner', fileUrl, req.file.filename, req.file.size, req.file.mimetype, req.user.userId, 'pre-event']
    );

    res.json({
      success: true,
      message: 'Banner uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Error uploading banner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/organizer/events/:id/media/gallery
 * @desc    Upload event gallery images/videos
 * @access  Private (Event Organizer, Admin)
 */
router.post('/events/:id/media/gallery', authenticate, authorize('organizer', 'admin'), isEventOrganizer, upload.array('media', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { phase = 'post-event' } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileUrl = `/uploads/events/${file.filename}`;
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'gallery';

      await promisePool.query(
        'INSERT INTO media (event_id, media_type, file_url, file_name, file_size, mime_type, uploaded_by, upload_phase) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, mediaType, fileUrl, file.filename, file.size, file.mimetype, req.user.userId, phase]
      );

      uploadedFiles.push({
        url: fileUrl,
        filename: file.filename,
        type: mediaType
      });
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   DELETE /api/organizer/media/:id
 * @desc    Delete media file
 * @access  Private (Organizer, Admin)
 */
router.delete('/media/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get media details
    const [media] = await promisePool.query('SELECT * FROM media WHERE id = ?', [id]);

    if (media.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if user has permission
    if (req.user.role !== 'admin' && media[0].uploaded_by !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this media'
      });
    }

    // Delete file from filesystem
    const fs = require('fs');
    const path = require('path');
    const filepath = path.join(__dirname, '..', media[0].file_url);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete from database
    await promisePool.query('DELETE FROM media WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
