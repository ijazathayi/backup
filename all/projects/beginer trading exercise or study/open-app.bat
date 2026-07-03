@echo off
echo ========================================
echo  TradeLearn - Starting React Frontend
echo ========================================
cd /d "%~dp0frontend"
echo Installing frontend dependencies if needed...
npm install --silent --cache .\.npm-cache
echo.
echo Starting React app on http://localhost:3000
echo.
npm run dev
pause
