@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   College Event Management System
echo   Network Access Configuration
echo ========================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    set IP=!IP:~1!
    goto :gotip
)
:gotip

echo Detected Local IP: %IP%
echo.
echo Share these URLs with your peers:
echo   Frontend: http://%IP%:3000
echo   Backend:  http://%IP%:5000
echo.
echo NOTE: Frontend will auto-detect the correct backend URL
echo       - From localhost: uses Vite proxy
echo       - From network: uses http://%IP%:5000/api
echo.
echo ========================================
echo Starting servers...
echo ========================================
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo.
echo Press any key to exit this window...
pause >nul
