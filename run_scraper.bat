@echo off
chcp 65001 >nul
title Instagram Scraper

echo ======================
echo Instagram Scraper
echo ======================
echo.

REM Verificar Playwright
python -c "import playwright" 2>nul
if errorlevel 1 (
    echo Instalando Playwright...
    pip install playwright
    python -m playwright install chromium
)

set /p USUARIO="Usuario de Instagram: "

if "%USUARIO%"=="" (
    echo Error: Ingresa un usuario
    pause
    exit /b 1
)

echo.
echo Ejecutando scraper para: %USUARIO%
echo.

python instagram_scraper.py %USUARIO%

echo.
echo Listo! Revisa la carpeta output
pause