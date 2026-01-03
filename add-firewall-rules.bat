@echo off
REM Run this script as Administrator (Right-click -> Run as administrator)

echo Adding Windows Firewall rules for network access...
echo.

netsh advfirewall firewall add rule name="College Events - Backend (5000)" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="College Events - Frontend (3000)" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="College Events - Frontend (3001)" dir=in action=allow protocol=TCP localport=3001

echo.
echo ✓ Firewall rules added successfully!
echo.
echo Your peers can now access:
echo   http://10.1.27.166:3000  (or :3001)
echo.
pause
