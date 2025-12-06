@echo off
title AnimTrack AI Launcher

echo Starting AnimTrack AI...

REM --- Set your project path ---
set PROJECT_DIR=Z:\good times\ai-animation-pipeline\animtrack-ai

REM --- Start backend ---
echo Starting backend...
start cmd /k "cd /d %PROJECT_DIR%\backend && node server.js"

REM --- Start frontend ---
echo Starting frontend...
start cmd /k "cd /d %PROJECT_DIR% && npm run dev"

REM --- Give frontend a moment to start ---
timeout /t 3 >nul

REM --- Open application in browser ---
start http://localhost:3000

echo AnimTrack AI is running.
exit
