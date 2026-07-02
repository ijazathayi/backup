@echo off
title IP Changer — Install

echo ============================================
echo   IP Changer — Installing dependencies
echo ============================================
echo.

echo [1/2] Installing Python backend dependencies...
cd /d "%~dp0backend"
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed. Make sure Python is installed.
    pause
    exit /b 1
)

echo.
echo [2/2] Installing Node frontend dependencies...
cd /d "%~dp0frontend"
npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Installation complete!
echo   Run start.bat to launch the app.
echo ============================================
echo.
pause
