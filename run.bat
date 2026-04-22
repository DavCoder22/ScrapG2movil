@echo off
REM =====================================================
REM INSTAGRAM SCRAPER - GRUPO 2
REM Script Unificado v2.0
REM =====================================================
setlocal EnableDelayedExpansion
title INSTAGRAM SCRAPER

REM =====================================================
REM VARIABLES
REM =====================================================
set "PROJECT_DIR=%~dp0"
set "DATA_DIR=%PROJECT_DIR%data"
set "SRC_DIR=%PROJECT_DIR%src"
set "COOKIES=%DATA_DIR%\cookies.json"

REM =====================================================
REM ENCABEZADO
REM =====================================================
:header
cls
echo.
echo  ============================================================
echo  =          INSTAGRAM SCRAPER v2.0                    =
echo  =    Dispositivos Mobiles - Grupo 2                 =
echo  ============================================================
echo.
goto :eof

REM =====================================================
REM VERIFICAR NODE.JS
REM =====================================================
:check_node
echo [1] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js no esta instalado
    echo  Descarga: https://nodejs.org/
    pause >nul
    exit /b 1
)
echo  OK: Node.js
echo.
goto :eof

REM =====================================================
REM VERIFICAR DEPENDENCIAS
REM =====================================================
:check_deps
echo [2] Verificando dependencias...
if not exist "%PROJECT_DIR%node_modules" (
    echo  Instalando...
    call npm install >nul 2>&1
)
echo  OK
echo.
goto :eof

REM =====================================================
REM VERIFICAR VPN
REM =====================================================
:check_vpn
echo [3] Verificando VPN...

set "VPN=0"

REM Buscar procesos VPN
tasklist 2^>nul | findstr /i "urban-vpn nordvpn ExpressVPN" >nul
if not errorlevel 1 set VPN=1

ipconfig 2^>nul | findstr "TAP" >nul
if not errorlevel 1 set VPN=1

if !VPN!==1 (echo  OK: VPN activa) else (echo  AVISO: Sin VPN)
echo.
goto :eof

REM =====================================================
REM VERIFICAR TOR
REM =====================================================
:check_tor
echo [4] Verificando Tor...

set "TOR=0"
netstat -ano 2^>nul | findstr ":9050" | findstr "LISTENING" >nul
if not errorlevel 1 set TOR=1

if !TOR!==0 (
    echo  OK: Tor activo
    goto :eof
)

REM Intentar Docker
docker info >nul 2>&1
if not errorlevel 1 (
    docker start tor_proxy >nul 2>&1
    timeout /t 3 /nobreak >nul
    netstat -ano 2^>nul | findstr ":9050" | findstr "LISTENING" >nul
    if not errorlevel 1 set TOR=1
)

if !TOR!==1 echo  AVISO: Tor no disponible
echo.
goto :eof

REM =====================================================
REM VERIFICAR COOKIES
REM =====================================================
:check_cookies
echo [5] Verificando sesion...

if not exist "%COOKIES%" (
    echo  AVISO: Sin cookies (sesion limitada)
) else (
    echo  OK: Sesion guardada
)
echo.
goto :eof

REM =====================================================
REM MENU PRINCIPAL
REM =====================================================
:menu
call :header
echo  MENU PRINCIPAL
echo ============================================================
echo.
echo  [1] Scrapear usuario (directo)
echo  [2] Scrapear con Tor
echo  [3] Iniciar sesion (generar cookies)
echo  [4] Ver ultimo resultado
echo  [5] Salir
echo.
set /p "OP="

if "!OP!"=="1" goto :scrape_direct
if "!OP!"=="2" goto :scrape_tor
if "!OP!"=="3" goto :login
if "!OP!"=="4" goto :view_last
if "!OP!"=="5" goto :exit

echo Opcion invalida
timeout /t 1 >nul
goto :menu

REM =====================================================
REM SCRAPEAR DIRECTO
REM =====================================================
:scrape_direct
call :header
echo [6] Ingresa usuario Instagram (sin @):
set /p "USER="

if "!USER!"=="" (
    echo ERROR: Usuario requerido
    timeout /t 1 >nul
    goto :menu
)

set "USER=!USER:@=!"

echo.
echo Objetivos: @!USER!
echo.

node "%SRC_DIR%\index.js" --no-cookies !USER!
goto :check_result

REM =====================================================
REM SCRAPEAR CON TOR
REM =====================================================
:scrape_tor
call :header
if !TOR!==0 (
    echo Tor no esta activo
    echo Iniciando...
    docker run -d --name tor_proxy -p 9050:9050 dperson/torproxy >nul 2>&1
    timeout /t 10 /nobreak >nul
)

echo [6] Usuario (sin @):
set /p "USER="

if "!USER!"=="" goto :menu
set "USER=!USER:@=!"

echo.
echo Objetivo: @!USER! (via Tor)
echo.

node "%SRC_DIR%\index.js" --tor --no-cookies !USER!

:check_result
set "RESULT_FILE=%DATA_DIR%\!USER!_data.json"

if exist "!RESULT_FILE!" (
    echo.
    echo ============================================================
    call :header
    echo  RESULTADOS - @!USER!
    echo ============================================================
    echo.
    
    REM Extraer datos basicos
    for /f "tokens=*" %%a in ('findstr /i "username followers postsCount isVerified isPrivate" "!RESULT_FILE!"') do (
        echo   %%a
    )
    
    echo.
    echo Archivo: !RESULT_FILE!
) else (
    echo.
    echo ERROR: No se genero archivo
)

echo.
pause >nul
goto :menu

REM =====================================================
REM LOGIN
REM =====================================================
:login
call :header
echo  LOGIN DE INSTAGRAM
echo ============================================================
echo.
echo  Ingresa tus credenciales
echo.
set /p "L_USER= Usuario: "
set /p "L_PASS= Contrasena: "

if "!L_USER!"=="" goto :menu

echo.
echo  Abriendo navegador...
echo  Completa 2FA si es necesario
echo.

REM Guardar temporalmente las credenciales
echo {"username":"!L_USER!","password":"!L_PASS!"} > "%DATA_DIR%\temp_creds.json"

node "%SRC_DIR%\login.js"

del "%DATA_DIR%\temp_creds.json" 2>nul

if exist "%COOKIES%" (
    echo.
    echo  OK: Sesion guardada
) else (
    echo.
    echo  ERROR: Verifica credenciales
)

pause >nul
goto :menu

REM =====================================================
REM VER ULTIMO
REM =====================================================
:view_last
call :header
echo  ULTIMO RESULTADO
echo ============================================================

dir /b /o-d "%DATA_DIR%\*_data.json" 2>nul | findstr "_data" > "%TEMP%\last.txt"

set /p LASTFILE=<"%TEMP%\last.txt"
del "%TEMP%\last.txt" 2>nul

if "!LASTFILE!"=="" (
    echo No hay datos
    timeout /t 1 >nul
    goto :menu
)

echo.
type "%DATA_DIR%\!LASTFILE!"
echo.
pause >nul
goto :menu

REM =====================================================
REM SALIR
REM =====================================================
:exit
echo.
echo Fin del programa
timeout /t 1 >nul
exit /b 0

REM =====================================================
REM INICIO
REM =====================================================
:main
call :check_node
call :check_deps
call :check_vpn
call :check_tor
call :check_cookies
goto :menu

:main
endlocal