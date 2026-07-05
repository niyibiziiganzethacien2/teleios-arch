@echo off
cd /d "%~dp0"

echo Starting TELEIOS Architecture Backend...
echo.

:: Check if MySQL/MariaDB is responding
mysql -u root -e "SELECT 1" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting MariaDB...
    start /B "" "C:\xampp\mysql\bin\mysqld.exe" --datadir="C:\xampp\mysql\data"
    timeout /t 5 /nobreak >nul
)

:: Start backend
cd backend
node index.js

pause
