-- Create test user account
-- Password: user123

INSERT INTO users (email, name, username, password_hash, role, department, year, phone)
VALUES ('testuser@college.edu', 'Test User', 'testuser', '$2a$10$BzSU1DwZpcj.SdIFx5RtU.4yPZkADqnPTKWZXOWhHqI18PbYePpgy', 'user', 'Computer Science', '3rd Year', '9876543210')
ON DUPLICATE KEY UPDATE password_hash = '$2a$10$BzSU1DwZpcj.SdIFx5RtU.4yPZkADqnPTKWZXOWhHqI18PbYePpgy', username = 'testuser';

-- Create test organizer account  
-- Password: organizer123
INSERT INTO users (email, name, username, password_hash, role, club_name, department, phone)
VALUES ('organizer@college.edu', 'Event Organizer', 'organizer', '$2a$10$BzSU1DwZpcj.SdIFx5RtU.4yPZkADqnPTKWZXOWhHqI18PbYePpgy', 'organizer', 'Tech Club', 'Computer Science', '9876543211')
ON DUPLICATE KEY UPDATE password_hash = '$2a$10$BzSU1DwZpcj.SdIFx5RtU.4yPZkADqnPTKWZXOWhHqI18PbYePpgy', username = 'organizer';

-- Create sample events for testing
INSERT INTO events (title, description, category, date, end_date, venue, max_participants, organizer_id, club_name, status, is_featured, registration_deadline, contact_email)
VALUES 
('Tech Workshop 2026', 'Learn the latest web development technologies including React, Node.js, and more. Hands-on coding sessions included.', 'Technical', '2026-01-15 10:00:00', '2026-01-15 16:00:00', 'Computer Lab 1', 50, 1, 'Tech Club', 'published', TRUE, '2026-01-14 23:59:59', 'tech@college.edu'),
('Cultural Night', 'Annual cultural fest with music, dance, and drama performances from students across all departments.', 'Cultural', '2026-01-20 18:00:00', '2026-01-20 22:00:00', 'Main Auditorium', 500, 1, 'Cultural Committee', 'published', TRUE, '2026-01-19 23:59:59', 'cultural@college.edu'),
('Sports Meet', 'Inter-department sports competition including cricket, football, basketball, and athletics.', 'Sports', '2026-01-25 08:00:00', '2026-01-25 18:00:00', 'Open Air Theatre', 200, 1, 'Sports Club', 'published', FALSE, '2026-01-24 23:59:59', 'sports@college.edu'),
('AI/ML Seminar', 'Expert talks on Artificial Intelligence and Machine Learning trends in 2026. Networking opportunities with industry professionals.', 'Academic', '2026-01-30 14:00:00', '2026-01-30 17:00:00', 'Seminar Hall A', 100, 1, 'AI Club', 'published', TRUE, '2026-01-29 23:59:59', 'ai@college.edu'),
('Hackathon 2026', '24-hour coding competition. Build innovative solutions and win exciting prizes!', 'Technical', '2026-02-05 09:00:00', '2026-02-06 09:00:00', 'Computer Lab 1', 30, 1, 'Tech Club', 'published', TRUE, '2026-02-04 23:59:59', 'hackathon@college.edu');

-- Show all users
SELECT id, email, username, name, role FROM users;

-- Show all events
SELECT id, title, category, date, status FROM events;
