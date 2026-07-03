@echo off
cd /d "%~dp0"

echo Starting Desktop Launcher...
start /b cmd /c "node launcher.js"

echo Starting AI Server...
start /b cmd /c "cd server && npm run start"

echo Starting Frontend...
start /b cmd /c "npm run dev"

echo Waiting for services to start...
timeout /t 5 /nobreak >nul

echo Opening Voice Assistant...
start http://localhost:5173

exit
