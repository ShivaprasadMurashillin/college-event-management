# DATABASE ACCESS GUIDE

## How to Access Your MySQL Database

You have multiple ways to access and manage your college_events database:

### Option 1: MySQL Workbench (GUI - Recommended for Beginners)
1. Open MySQL Workbench
2. Click on your local MySQL connection
3. Password: `ssm123`
4. You'll see the database browser on the left
5. Click `college_events` to expand and see tables

**To run queries:**
- Click "SQL" tab or press Ctrl+T
- Type your SQL query
- Press Ctrl+Enter to execute

### Option 2: MySQL Command Line
```cmd
# Open Command Prompt and run:
mysql -u root -pssm123 college_events

# You're now in the MySQL shell
# Try these commands:
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM events;
DESCRIBE users;
```

### Option 3: PowerShell with MySQL
```powershell
# Run queries from PowerShell:
mysql -u root -pssm123 college_events -e "SELECT * FROM users;"
mysql -u root -pssm123 college_events -e "SHOW TABLES;"
```

### Option 4: PHP MyAdmin (if installed with XAMPP/WAMP)
1. Open browser: http://localhost/phpmyadmin
2. Username: `root`
3. Password: `ssm123`
4. Click `college_events` database on the left

---

## Database Credentials
- **Host:** localhost
- **Port:** 3306
- **Username:** root
- **Password:** ssm123
- **Database Name:** college_events

---

## UPDATE DATABASE SCHEMA

To apply the new schema with username/password fields:

### Method 1: MySQL Workbench (RECOMMENDED)
1. Open MySQL Workbench
2. Connect to your local server
3. Go to: File → Open SQL Script
4. Navigate to: `backend\database\schema.sql`
5. Click Execute (⚡ lightning icon) or press Ctrl+Shift+Enter
6. Wait for completion message

### Method 2: Command Line
```cmd
mysql -u root -pssm123 college_events < backend\database\schema.sql
```

### Method 3: PowerShell
```powershell
Get-Content backend\database\schema.sql | & 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' -u root -pssm123 college_events
```

---

## Useful SQL Queries

### View all users
```sql
SELECT id, username, email, name, role FROM users;
```

### View admin user
```sql
SELECT * FROM users WHERE role = 'admin';
```

### View all organizers
```sql
SELECT username, name, email, club_name FROM users WHERE role = 'organizer';
```

### View all events
```sql
SELECT id, title, organizer_id, status, date FROM events;
```

### Count users by role
```sql
SELECT role, COUNT(*) as count FROM users GROUP BY role;
```

### View event registrations
```sql
SELECT e.title, u.name as student, r.status, r.created_at
FROM registrations r
JOIN events e ON r.event_id = e.id
JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC;
```

---

## Admin Account (After Schema Update)

The admin account will be automatically created when you start the backend:

**Username:** admin  
**Password:** admin@admin  
**Email:** admin@college.edu  
**Role:** admin

---

## Troubleshooting

### "mysql is not recognized"
MySQL bin folder is not in PATH. Use full path:
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pssm123 college_events
```

### Access Denied
- Check if MySQL service is running (Services → MySQL80)
- Verify password is correct: `ssm123`
- Try resetting MySQL root password if needed

### Cannot connect
- Make sure MySQL server is running
- Check if port 3306 is not blocked by firewall
- Verify backend\.env has correct DB credentials

---

## Next Steps

1. **Update Database Schema**
   - Use MySQL Workbench to run schema.sql (Method 1 above)

2. **Start Backend Server**
   - The admin user will be created automatically
   - Run: `start-project.bat`

3. **Login as Admin**
   - Go to: http://localhost:3000
   - Click "Admin / Organizer" tab
   - Username: admin
   - Password: admin@admin

4. **Create Organizer Accounts**
   - After logging in as admin
   - Navigate to Admin Dashboard
   - Click "Manage Organizers"
   - Create new organizer accounts
