@echo off
setlocal
title INSTAGRAM SCRAPER

echo.
echo ================================================
echo    INSTAGRAM SCRAPER v1.0.0
echo ================================================
echo.

REM Node.js
echo [1] Node.js...
node --version >nul 2>&1
if errorlevel 1 (echo ERROR && pause && exit /b 1)
echo OK

REM Dependencias
echo [2] Dependencias...
if not exist "node_modules" (call npm install)
echo OK

REM Usuario
echo [3] Usuario...

set "USER=%~1"
if "%USER%"=="" (
    echo    Usage: run.bat username
    echo    Example: run.bat natgeo
    pause
    exit /b 1
)

set USER=%USER:@=%
echo   @%USER%
echo.

REM Ejecutar
echo [4] Ejecutar...
echo.
node src\index.js --no-cookies %USER%

echo.
echo COMPLETADO
pause
endlocal