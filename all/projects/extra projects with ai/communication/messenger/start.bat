@echo off
title Messenger Launcher
echo ============================================
echo  MESSENGER - Google Sign-In Chat App
echo ============================================
echo  Backend  : http://localhost:3002
echo  Frontend : http://localhost:5174
echo ============================================
echo.

start "Messenger Backend" cmd /k "cd /d "%~dp0backend" && node index.js"
timeout /t 2 /nobreak >nul
start "Messenger Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers starting...
echo Open your browser at: http://localhost:5174
echo.
pause
