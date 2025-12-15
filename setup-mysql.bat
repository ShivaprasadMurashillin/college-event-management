@echo off
echo ========================================
echo MySQL Database Setup
echo ========================================
echo.
echo STEP 1: Open MySQL Workbench
echo STEP 2: Connect to your local MySQL server
echo STEP 3: Create a new SQL tab
echo STEP 4: Copy and paste the following commands:
echo.
echo ----- START COPYING FROM HERE -----
echo CREATE DATABASE IF NOT EXISTS college_events;
echo USE college_events;
echo.
echo Then run the schema file:
echo In MySQL Workbench: File -^> Open SQL Script
echo Navigate to: %~dp0backend\database\schema.sql
echo Click Execute (lightning bolt icon)
echo ----- END COPYING HERE -----
echo.
echo.
echo OR use this command (if MySQL is in PATH):
echo "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p ^< "%~dp0backend\database\schema.sql"
echo.
echo After setting up the database, run:
echo   start-project.bat
echo.
pause
