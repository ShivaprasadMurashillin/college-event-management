@echo off
echo ========================================
echo MySQL Password Test
echo ========================================
echo.
echo This will test your MySQL connection.
echo.
set /p password="Enter your MySQL root password: "
echo.
echo Testing connection...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p%password% -e "SELECT 'Connection successful!' AS Status;"
echo.
if %errorlevel% == 0 (
    echo ========================================
    echo ✓ SUCCESS! Your password works!
    echo ========================================
    echo.
    echo Now update backend\.env file:
    echo 1. Open: backend\.env
    echo 2. Change this line:
    echo    DB_PASSWORD=root
    echo    to:
    echo    DB_PASSWORD=%password%
    echo 3. Save the file
    echo.
    echo Then restart the servers with: start-project.bat
    echo.
) else (
    echo ========================================
    echo ✗ FAILED! Password is incorrect
    echo ========================================
    echo.
    echo Please try again or check MySQL Workbench
    echo for the correct password.
    echo.
)
pause
