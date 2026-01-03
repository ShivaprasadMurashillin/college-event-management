-- Create or update admin user with password login
-- Password: admin123 (bcrypt hashed)

UPDATE users 
SET 
  username = 'admin',
  password_hash = '$2a$10$SpAnl5p/bzXbN9Wj0PRaLelhRmmsZF/IJ8T1Jd4uweB0Gw1H0g66C'
WHERE email = 'admin@college.edu';

-- If no admin exists, create one
INSERT INTO users (email, name, username, password_hash, role, club_name)
SELECT 'admin@college.edu', 'System Admin', 'admin', '$2a$10$SpAnl5p/bzXbN9Wj0PRaLelhRmmsZF/IJ8T1Jd4uweB0Gw1H0g66C', 'admin', 'Administration'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@college.edu');

-- Show admin users
SELECT id, email, username, name, role FROM users WHERE role = 'admin';
