@echo off
title IJAZ Tools
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "READY_FLAG=%BACKEND%\.deps_installed"

echo.
echo  ==========================================
echo   IJAZ Tools
echo  ==========================================
echo.

:: ── Check Python ─────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.9+ and re-run.
    pause & exit /b 1
)

:: ── Check Node ───────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install Node.js 18+ and re-run.
    pause & exit /b 1
)

:: ── Install deps only if flag file missing ────
if exist "!READY_FLAG!" goto :launch

echo [Setup] First run - installing dependencies...
echo.

echo   Installing Python packages...
pip install -r "!BACKEND!\requirements.txt" --quiet
if errorlevel 1 (
    echo [ERROR] pip install failed.
    pause & exit /b 1
)

echo   Installing Node packages...
cd /d "!FRONTEND!"
npm install --silent
if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause & exit /b 1
)

type nul > "!READY_FLAG!"
echo   Setup complete.
echo.

:launch
echo [Setup] Dependencies ready.
echo.

echo [1/2] Starting Python backend on port 8000...
start "IJAZ Backend" cmd /k "cd /d "!BACKEND!" && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting React frontend on port 5173...
start "IJAZ Frontend" cmd /k "cd /d "!FRONTEND!" && npm run dev"

echo.
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:8000
echo  API docs : http://localhost:8000/docs
echo.
echo  Press any key to close this window.
pause >nul
