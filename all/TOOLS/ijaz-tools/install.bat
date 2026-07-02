@echo off
title IJAZ Tools - Install

echo.
echo  ==========================================
echo   IJAZ Tools - Installing dependencies
echo  ==========================================
echo.

:: ── Python backend ───────────────────────────
echo [1/2] Installing Python packages...
cd /d "%~dp0backend"
pip install -r requirements.txt
if errorlevel 1 (
  echo.
  echo  ERROR: pip install failed. Make sure Python is installed.
  pause
  exit /b 1
)

:: ── Node frontend ────────────────────────────
echo.
echo [2/2] Installing Node packages...
cd /d "%~dp0frontend"
npm install
if errorlevel 1 (
  echo.
  echo  ERROR: npm install failed. Make sure Node.js is installed.
  pause
  exit /b 1
)

echo.
echo  ==========================================
echo   All done! Run start.bat to launch.
echo  ==========================================
echo.
pause
