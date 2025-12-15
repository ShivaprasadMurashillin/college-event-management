-- Campus Events Management System Database Schema
-- MySQL Database

-- Drop tables if exists (for clean migration)
DROP TABLE IF EXISTS venue_bookings;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  avatar_url VARCHAR(500),
  role ENUM('user', 'organizer', 'admin') DEFAULT 'user',
  club_name VARCHAR(255),
  phone VARCHAR(20),
  department VARCHAR(100),
  year VARCHAR(20),
  interests JSON,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_google_id (google_id),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events Table
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tags JSON,
  date DATETIME NOT NULL,
  end_date DATETIME,
  venue VARCHAR(255),
  venue_id INT,
  max_participants INT DEFAULT 0,
  organizer_id INT NOT NULL,
  club_name VARCHAR(255),
  banner_url VARCHAR(500),
  status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'published',
  is_featured BOOLEAN DEFAULT FALSE,
  registration_deadline DATETIME,
  registration_fee DECIMAL(10, 2) DEFAULT 0.00,
  requirements TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_organizer (organizer_id),
  INDEX idx_date (date),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media Table
CREATE TABLE media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  media_type ENUM('banner', 'gallery', 'video') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by INT NOT NULL,
  upload_phase ENUM('pre-event', 'post-event') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_event (event_id),
  INDEX idx_phase (upload_phase),
  INDEX idx_type (media_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrations Table
CREATE TABLE registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
  attended BOOLEAN DEFAULT FALSE,
  attendance_marked_at TIMESTAMP NULL,
  attendance_marked_by INT NULL,
  certificate_generated BOOLEAN DEFAULT FALSE,
  certificate_url VARCHAR(500),
  registration_data JSON,
  qr_code VARCHAR(500),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (attendance_marked_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_registration (user_id, event_id),
  INDEX idx_user (user_id),
  INDEX idx_event (event_id),
  INDEX idx_status (status),
  INDEX idx_attended (attended)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Venues Table
CREATE TABLE venues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  capacity INT,
  location VARCHAR(255),
  floor VARCHAR(50),
  building VARCHAR(100),
  facilities JSON,
  image_url VARCHAR(500),
  description TEXT,
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Venue Bookings Table
CREATE TABLE venue_bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  venue_id INT NOT NULL,
  event_id INT NOT NULL,
  booked_by INT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  purpose TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (booked_by) REFERENCES users(id),
  INDEX idx_venue_date (venue_id, booking_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample master admin user (update with actual Google ID after first OAuth login)
INSERT INTO users (google_id, email, name, role, club_name) 
VALUES ('master_admin_google_id', 'admin@college.edu', 'Master Admin', 'admin', 'Administration');

-- Insert sample venues
INSERT INTO venues (name, capacity, location, floor, building, facilities, description) VALUES
('Main Auditorium', 500, 'Ground Floor', 'Ground', 'Main Building', '["Projector", "Sound System", "AC", "WiFi", "Stage"]', 'Large auditorium for conferences and events'),
('Seminar Hall A', 100, 'First Floor', '1', 'Academic Block', '["Projector", "Whiteboard", "AC", "WiFi"]', 'Medium-sized hall for seminars and workshops'),
('Computer Lab 1', 60, 'Second Floor', '2', 'IT Building', '["Computers", "Projector", "AC", "WiFi"]', 'Computer lab with 60 workstations'),
('Open Air Theatre', 300, 'Campus Ground', 'Outdoor', 'Campus', '["Stage", "Sound System", "Lighting"]', 'Outdoor venue for cultural events'),
('Conference Room', 30, 'Third Floor', '3', 'Admin Block', '["Video Conference", "Projector", "AC", "WiFi"]', 'Small conference room for meetings');
