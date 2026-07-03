@echo off
echo ========================================
echo  TradeLearn - Starting Backend Server
echo ========================================
cd /d "%~dp0backend"
echo Installing dependencies if needed...
npm install --silent
echo.
echo Starting server on http://localhost:5000
echo.
node server.js
pause
