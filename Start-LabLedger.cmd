@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 24 or newer, then open this file again.
 pause
 exit /b 1
)
start "" http://localhost:8903
node scripts/dev.mjs
pause
