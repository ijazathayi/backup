@echo off
title IP Changer
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "READY_FLAG=%BACKEND%\.deps_installed"

echo ============================================
echo   IP Changer
echo ============================================
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

:: Write flag file to skip install next time
type nul > "!READY_FLAG!"
echo   Setup complete.
echo.

:launch
echo [Setup] Dependencies ready.
echo.

:: ── Launch backend ────────────────────────────
echo [1/2] Starting backend on port 8001...
start "IP Changer - Backend" cmd /k "cd /d "!BACKEND!" && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 2 /nobreak >nul

:: ── Launch frontend ───────────────────────────
echo [2/2] Starting frontend on port 5174...
start "IP Changer - Frontend" cmd /k "cd /d "!FRONTEND!" && npm run dev"

echo.
echo ============================================
echo   Open: http://localhost:5174
echo ============================================
echo.
echo   Press any key to close this window.
echo   Backend and frontend keep running.
echo.
pause >nul
