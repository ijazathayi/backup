@echo off
cd /d "%~dp0backend"
start "Backend" cmd /k npm start

cd /d "%~dp0frontend"
start "Frontend" cmd /k npm start
