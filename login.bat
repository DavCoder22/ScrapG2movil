@echo off
setlocal
title INSTAGRAM LOGIN

echo.
echo ================================================
echo    INSTAGRAM LOGIN
echo    Save session cookies
echo ================================================
echo.

REM Node.js
echo [1] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (echo ERROR && pause && exit /b 1)
echo OK

echo.
echo Usage:
echo   1. Enter your Instagram username
echo   2. Enter your password
echo   3. Complete 2FA if enabled
echo.
echo [2] Opening login...
echo.

node src\login.js

echo.
pause
endlocal