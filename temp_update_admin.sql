UPDATE users SET password_hash = '$2a$10$W56oVJRhOFlM/WBKh64r2u98wF5WDq3YEGx8/cd2IiwcFiufH9Lo2' WHERE username = 'admin';
SELECT username, name, role, LENGTH(password_hash) as hash_length FROM users WHERE username='admin';
