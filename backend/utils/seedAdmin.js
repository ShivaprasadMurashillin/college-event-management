const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/database');

/**
 * Seed the admin user if it doesn't exist
 * Username: admin
 * Password: admin@admin
 */
async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const [existingAdmin] = await promisePool.query(
      'SELECT id FROM users WHERE username = ? OR role = ?',
      ['admin', 'admin']
    );

    if (existingAdmin.length > 0) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('admin@admin', 10);

    // Insert admin user
    await promisePool.query(
      `INSERT INTO users (username, email, name, password_hash, role, club_name, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'admin',
        'admin@college.edu',
        'System Administrator',
        passwordHash,
        'admin',
        'Administration',
        '1234567890'
      ]
    );

    console.log('✓ Admin user created successfully');
    console.log('  Username: admin');
    console.log('  Password: admin@admin');
  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  }
}

module.exports = { seedAdminUser };
