const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { generateCertificate } = require('../services/certificateService');
const path = require('path');
const fs = require('fs');

/**
 * @route   GET /api/certificates/:registrationId
 * @desc    Generate and download certificate
 * @access  Private
 */
router.get('/:registrationId', authenticate, async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Get registration with event and user details
    const [registrations] = await promisePool.query(
      `SELECT r.*, e.title as event_name, e.date as event_date, e.organizer_id,
              u.name as user_name, u.email, u.id as user_id
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [registrationId]
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
        message: 'Not authorized to access this certificate'
      });
    }

    // Check if attended
    if (!registration.attended) {
      return res.status(400).json({
        success: false,
        message: 'Certificate not available - attendance not marked'
      });
    }

    // Check if certificate already generated
    if (registration.certificate_url) {
      const certificatePath = path.join(__dirname, '..', registration.certificate_url);
      
      if (fs.existsSync(certificatePath)) {
        // Serve existing certificate
        return res.sendFile(certificatePath);
      }
    }

    // Generate new certificate
    const certificate = await generateCertificate(
      { ...registration, id: registrationId },
      { title: registration.event_name, date: registration.event_date },
      { name: registration.user_name }
    );

    // Update registration with certificate URL
    await promisePool.query(
      'UPDATE registrations SET certificate_generated = TRUE, certificate_url = ? WHERE id = ?',
      [certificate.url, registrationId]
    );

    // Send certificate file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.filename}"`);
    res.sendFile(certificate.filepath);

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/certificates/:registrationId/regenerate
 * @desc    Regenerate certificate (admin/organizer only)
 * @access  Private (Admin, Organizer)
 */
router.post('/:registrationId/regenerate', authenticate, async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Get registration
    const [registrations] = await promisePool.query(
      `SELECT r.*, e.title as event_name, e.date as event_date, e.organizer_id,
              u.name as user_name
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [registrationId]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const registration = registrations[0];

    // Check permissions
    if (req.user.role !== 'admin' && registration.organizer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to regenerate this certificate'
      });
    }

    // Check if attended
    if (!registration.attended) {
      return res.status(400).json({
        success: false,
        message: 'Cannot regenerate certificate - attendance not marked'
      });
    }

    // Delete old certificate if exists
    if (registration.certificate_url) {
      const oldCertPath = path.join(__dirname, '..', registration.certificate_url);
      if (fs.existsSync(oldCertPath)) {
        fs.unlinkSync(oldCertPath);
      }
    }

    // Generate new certificate
    const certificate = await generateCertificate(
      { ...registration, id: registrationId },
      { title: registration.event_name, date: registration.event_date },
      { name: registration.user_name }
    );

    // Update registration
    await promisePool.query(
      'UPDATE registrations SET certificate_url = ?, certificate_generated = TRUE WHERE id = ?',
      [certificate.url, registrationId]
    );

    res.json({
      success: true,
      message: 'Certificate regenerated successfully',
      data: {
        certificate_url: certificate.url
      }
    });

  } catch (error) {
    console.error('Error regenerating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating certificate'
    });
  }
});

module.exports = router;
