@echo off
setlocal enabledelayedexpansion
title INSTAGRAM SCRAPER

echo.
echo ================================================
echo    INSTAGRAM SCRAPER v1.0.0
echo    Grupo 2 - Dispositivos Moviles
echo ================================================
echo.

REM ================================================
REM Paso 1: Verificar Node.js
REM ================================================
echo [1] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo     ERROR: Node.js no esta instalado
    pause
    exit /b 1
)
echo     OK
echo.

REM ================================================
REM Paso 2: Verificar dependencias
REM ================================================
echo [2] Verificando dependencias...
if not exist "node_modules" (
    echo     Instalando...
    call npm install
    if errorlevel 1 (
        echo     ERROR
        pause
        exit /b 1
    )
)
echo     OK
echo.

REM ================================================
REM Paso 3: Obtener usuario
REM ================================================
echo [3]Configurando...

set TARGET_USER=%1

if not defined TARGET_USER (
    if not "%2"=="" (
        set TARGET_USER=%2
    )
)

if not defined TARGET_USER (
    echo.
    echo     Usuario de Instagram (sin @):
    set /p TARGET_USER=     User: 
)

if not defined TARGET_USER (
    echo     ERROR: Necesitas un usuario
    pause
    exit /b 1
)

set TARGET_USER=!TARGET_USER:@=!

echo.
echo     Objetivo: @!TARGET_USER!
echo.

REM ================================================
REM Paso 4: Ejecutar scraper
REM ================================================
echo [4]Ejecutando...
echo.

node src/index.js !TARGET_USER!

echo.
echo ================================================
echo    COMPLETADO
echo ================================================
echo.
pause
endlocal