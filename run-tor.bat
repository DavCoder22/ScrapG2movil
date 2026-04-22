@echo off
setlocal
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
REM Paso 3: Verificar TOR
REM ================================================
echo [3] Verificando TOR...

set TOR_READY=0

REM Verificar puerto 9050
netstat -ano | findstr ":9050" | findstr "LISTENING" >nul
if not errorlevel 1 (
    set TOR_READY=1
    echo     OK: TOR detectando
    goto :get_user
)

REM Intentar Docker
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
        goto :get_user
    )
)

echo     ERROR: TOR no disponible
echo.
echo     Instala Docker y ejecuta:
echo     docker run -d -p 9050:9050 dperson/torproxy
echo.
pause
exit /b 1

:get_user

REM ================================================
REM Paso 4: Obtener usuario
REM ================================================
echo [4] Configurando...

set "TARGET_USER=%~1"

if "%TARGET_USER%"=="" (
    set /p "TARGET_USER=     Usuario de Instagram (sin @): "
)

if "%TARGET_USER%"=="" (
    echo     ERROR: Necesitas un usuario
    pause
    exit /b 1
)

set "TARGET_USER=%TARGET_USER:@=%"

echo.
echo     Objetivo: @%TARGET_USER%
echo     Modo: TOR
echo.

REM ================================================
REM Paso 5: Ejecutar scraper
REM ================================================
echo [5] Ejecutando...
echo.

node src\index.js --tor %TARGET_USER%

echo.
echo ================================================
echo    COMPLETADO
echo ================================================
echo.
pause
endlocal