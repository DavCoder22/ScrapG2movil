@echo off
setlocal enabledelayedexpansion
title INSTAGRAM SCRAPER - TOR MODE

echo.
echo ================================================
echo    INSTAGRAM SCRAPER - TOR MODE
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
    echo     Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)
echo     OK
echo.

REM ================================================
REM Paso 2: Verificar dependencias instaladas
REM ================================================
echo [2] Verificando dependencias...
if not exist "node_modules" (
    echo     Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo     ERROR al instalar
        pause
        exit /b 1
    )
)
echo     OK
echo.

REM ================================================
REM Paso 3: Verificar TOR
REM ================================================
echo [3] Verificando TOR...

set TOR_READY=0

REM Verificar si el puerto 9050 acepta conexiones
netstat -ano | findstr ":9050" | findstr "LISTENING" >nul
if not errorlevel 1 (
    set TOR_READY=1
    echo     OK: TOR detectando
    goto :check_user
)

REM Intentar iniciar contenedor Docker
docker info >nul 2>&1
if not errorlevel 1 (
    echo     Iniciando TOR container...
    docker start tor_proxy >nul 2>&1
    if errorlevel 1 (
        docker run -d --name tor_proxy -p 9050:9050 --restart unless-stopped dperson/torproxy >nul 2>&1
    )
    timeout /t 5 /nobreak >nul
    
    netstat -ano | findstr ":9050" | findstr "LISTENING" >nul
    if not errorlevel 1 (
        set TOR_READY=1
        echo     OK: TOR iniciado
        goto :check_user
    )
)

echo     ERROR: TOR no esta disponible
echo.
echo     Para usar TOR:
echo     1. Instala Docker: https://docker.com/desktop
echo     2. Ejecuta: docker run -d -p 9050:9050 dperson/torproxy
echo.
pause
exit /b 1

:check_user

REM ================================================
REM Paso 4: Obtener usuario
REM ================================================
echo [4] Configurando...

set TARGET_USER=%1

if defined TARGET_USER (
    if "!TARGET_USER!"=="--tor" (
        set TARGET_USER=
    )
)

if not defined TARGET_USER (
    if not "%2"=="" (
        set TARGET_USER=%2
    )
)

if not defined TARGET_USER (
    echo.
    echo     Ingresa el usuario de Instagram (sin @):
    set /p TARGET_USER=     User: 
)

if not defined TARGET_USER (
    echo     ERROR: Necesitas especificar un usuario
    pause
    exit /b 1
)

REM Limpiar @ si lo incluyen
set TARGET_USER=!TARGET_USER:@=!

echo.
echo     Usuario: @!TARGET_USER!
echo.

REM ================================================
REM Paso 5: Ejecutar scraper
REM ================================================
echo [5] Ejecutando scraper...
echo.

node src/index.js --tor !TARGET_USER!

echo.
echo ================================================
echo    COMPLETADO
echo ================================================
echo.
pause
endlocal