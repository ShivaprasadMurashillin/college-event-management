-- ============================================
-- Campus Events Management System - Schema V2
-- New Features: Feedback, FAQ, Complaints, Notifications, Referrals, Collaboration
-- ============================================

-- 1️⃣ FEEDBACK & RATINGS TABLE
CREATE TABLE IF NOT EXISTS event_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  sentiment ENUM('positive', 'neutral', 'negative') DEFAULT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_feedback (user_id, event_id),
  INDEX idx_event (event_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2️⃣ FAQ TABLE (Per Event)
CREATE TABLE IF NOT EXISTS event_faqs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3️⃣ COMPLAINTS / SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT,
  category ENUM('event_issue', 'venue_issue', 'certificate_issue', 'registration_issue', 'technical_issue', 'other') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  assigned_to INT,
  resolution_notes TEXT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_user (user_id),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4️⃣ COMPLAINT RESPONSES TABLE
CREATE TABLE IF NOT EXISTS complaint_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  responder_id INT NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id),
  INDEX idx_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5️⃣ EVENT COLLABORATORS TABLE
CREATE TABLE IF NOT EXISTS event_collaborators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  permission ENUM('view', 'edit', 'manage_registrations', 'full') DEFAULT 'view',
  added_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id),
  UNIQUE KEY unique_collaborator (event_id, user_id),
  INDEX idx_event (event_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6️⃣ ACTIVITY LOG TABLE (Who edited what)
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  entity_type ENUM('event', 'registration', 'venue', 'user', 'complaint') NOT NULL,
  entity_id INT NOT NULL,
  action ENUM('create', 'update', 'delete', 'view', 'approve', 'reject') NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7️⃣ NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('event_approval', 'registration_confirmed', 'event_reminder', 'venue_change', 'certificate_ready', 'feedback_request', 'complaint_update', 'general') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8️⃣ NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  telegram_enabled BOOLEAN DEFAULT FALSE,
  telegram_chat_id VARCHAR(100),
  event_reminders BOOLEAN DEFAULT TRUE,
  registration_updates BOOLEAN DEFAULT TRUE,
  certificate_alerts BOOLEAN DEFAULT TRUE,
  promotional_emails BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9️⃣ REFERRALS TABLE
CREATE TABLE IF NOT EXISTS referrals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  referrer_id INT NOT NULL,
  referral_code VARCHAR(50) NOT NULL UNIQUE,
  clicks INT DEFAULT 0,
  registrations INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_code (referral_code),
  INDEX idx_referrer (referrer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 🔟 REFERRAL TRACKING TABLE
CREATE TABLE IF NOT EXISTS referral_conversions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  referral_id INT NOT NULL,
  referred_user_id INT NOT NULL,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1️⃣1️⃣ USER POINTS / REWARDS TABLE
CREATE TABLE IF NOT EXISTS user_rewards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  total_points INT DEFAULT 0,
  badges JSON,
  referral_count INT DEFAULT 0,
  events_attended INT DEFAULT 0,
  level ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1️⃣2️⃣ USER INTERESTS TABLE (For AI Recommendations)
CREATE TABLE IF NOT EXISTS user_interests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  preferred_categories JSON,
  clicked_categories JSON,
  registered_categories JSON,
  preferred_time ENUM('morning', 'afternoon', 'evening', 'any') DEFAULT 'any',
  interests_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1️⃣3️⃣ EVENT CLICK TRACKING (For Recommendations)
CREATE TABLE IF NOT EXISTS event_clicks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  event_id INT NOT NULL,
  session_id VARCHAR(100),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MODIFY EXISTING TABLES
-- ============================================

-- Add target audience fields to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS target_semester VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_department VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_audience ENUM('all', 'department_specific', 'semester_specific', 'invite_only') DEFAULT 'all',
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_ratings INT DEFAULT 0;

-- Add venue category to venues table
ALTER TABLE venues
ADD COLUMN IF NOT EXISTS category ENUM('auditorium', 'classroom', 'lab', 'outdoor', 'conference_room', 'other') DEFAULT 'other',
ADD COLUMN IF NOT EXISTS booking_restrictions JSON DEFAULT NULL;

-- Add semester field to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS semester VARCHAR(20) DEFAULT NULL;

-- ============================================
-- SHOW SUCCESS MESSAGE
-- ============================================
SELECT 'Schema V2 Applied Successfully!' as status;
SHOW TABLES;
