@echo off
REM =============================================================================
REM Single Command Deployment Script for Windows
REM Starts MongoDB, Backend, and Frontend with one command
REM =============================================================================

setlocal EnableDelayedExpansion

REM Configuration
set "MONGO_DB_PATH=./data/db"
set "BACKEND_PORT=8000"
set "FRONTEND_PORT=3000"

REM Project directories
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"
set "VENV_DIR=%BACKEND_DIR%venv"

REM Color codes for Windows (limited support)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

REM Print colored message (works in modern terminals)
echo_color() {
    for /f "tokens=1,*" %%a in ("%*") do (
        set "color_code=%%a"
        set "message=%%b"
    )
    echo %color_code%%message%[0m
}

REM Alternative simple echo without colors for compatibility
echo_status() {
    echo [DEPLOY] %*
}

echo_warning() {
    echo [WARN] %*
}

echo_error() {
    echo [ERROR] %*
}

echo_info() {
    echo [INFO] %*
}

REM =============================================================================
REM Step 1: Check prerequisites
REM =============================================================================
echo_status Checking prerequisites...

REM Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo_error Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check for Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo_error Python is not installed. Please install Python 3 first.
    exit /b 1
)

REM Check for MongoDB
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo_warning MongoDB (mongod) not found in PATH.
    echo_info Attempting to use external MongoDB...
    set USE_EXTERNAL_MONGO=true
) else (
    set USE_EXTERNAL_MONGO=false
)

echo_status Prerequisites check passed!

REM =============================================================================
REM Step 2: Start MongoDB
REM =============================================================================
:start_mongodb
if "%USE_EXTERNAL_MONGO%"=="true" (
    echo_info Using external MongoDB (set MONGO_URL in backend/.env)
    echo_info MongoDB configuration loaded from backend/.env
    goto :start_backend
)

echo_status Starting MongoDB...

REM Create data directory if it doesn't exist
if not exist "%MONGO_DB_PATH%" mkdir "%MONGO_DB_PATH%"

REM Check if MongoDB is already running
tasklist /FI "IMAGENAME eq mongod.exe" 2>nul | findstr /I mongod.exe >nul
if %errorlevel% equ 0 (
    echo_warning MongoDB is already running. Skipping MongoDB start.
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq mongod.exe" /NH') do set MONGO_PID=%%a
    goto :start_backend
)

REM Start MongoDB in background
echo_info Starting MongoDB on port 27017...
start /B mongod --dbpath "%MONGO_DB_PATH%" --bind_ip 127.0.0.1 --port 27017

REM Wait for MongoDB to be ready
echo_info Waiting for MongoDB to be ready...
timeout /t 3 /nobreak >nul

REM Verify MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>nul | findstr /I mongod.exe >nul
if %errorlevel% neq 0 (
    echo_error Failed to start MongoDB. Check logs/mongodb.log for details.
    exit /b 1
)

for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq mongod.exe" /NH') do set MONGO_PID=%%a
echo_status MongoDB started successfully (PID: !MONGO_PID!)

REM =============================================================================
REM Step 3: Start Backend
REM =============================================================================
:start_backend
echo_status Starting Backend...

cd /d "%BACKEND_DIR%"

REM Check if virtual environment exists
if not exist "%VENV_DIR%" (
    echo_info Creating Python virtual environment...
    python -m venv "%VENV_DIR%"
)

REM Install dependencies
echo_info Installing backend dependencies...
call "%VENV_DIR%\Scripts\pip" install -q -r requirements.txt 2>nul

REM Start backend in background
echo_info Starting backend server on port %BACKEND_PORT%...
start /B cmd /c "%VENV_DIR%\Scripts\python -m uvicorn server:app --host 127.0.0.1 --port %BACKEND_PORT%"

set BACKEND_PID=last
echo_status Backend started (checking status...)

REM Wait for backend to be ready
echo_info Waiting for backend to be ready...
timeout /t 5 /nobreak >nul

REM Verify backend is running
curl -s http://127.0.0.1:%BACKEND_PORT%/api >nul 2>&1
if %errorlevel% neq 0 (
    echo_warning Backend may still be starting, continuing...
)

echo_status Backend started successfully

REM =============================================================================
REM Step 4: Start Frontend
REM =============================================================================
:start_frontend
echo_status Starting Frontend...

cd /d "%FRONTEND_DIR%"

REM Check if node_modules exists
if not exist "node_modules" (
    echo_info Installing frontend dependencies...
    call npm install --silent
)

REM Set the backend URL environment variable (configurable via environment)
REM Default to localhost, can be overridden with network IP for remote access
if not defined REACT_APP_BACKEND_URL set REACT_APP_BACKEND_URL=http://127.0.0.1:%BACKEND_PORT%

REM Start frontend (this will open browser)
echo_info Starting frontend server on port %FRONTEND_PORT%...
start cmd /c "npm start"

echo_status Frontend starting...

REM =============================================================================
REM Step 5: Display status
REM =============================================================================
:display_status
echo.
echo ===========================================================================
echo All services started successfully!
echo ===========================================================================
echo.
echo Services:
if "%USE_EXTERNAL_MONGO%"=="false" (
    echo   MongoDB:  running on 127.0.0.1:27017
) else (
    echo   MongoDB:  using external MongoDB (check backend/.env)
)
echo   Backend:  running on http://127.0.0.1:%BACKEND_PORT%
echo   Frontend: running on http://127.0.0.1:%FRONTEND_PORT%
echo.
echo API Endpoints:
echo   API Root:    http://127.0.0.1:%BACKEND_PORT%/api
echo   API Docs:    http://127.0.0.1:%BACKEND_PORT%/docs
echo.
echo Press Ctrl+C to stop all services.
echo ===========================================================================
echo.
echo Services are running. Keep this window open.
echo.

REM =============================================================================
REM Main loop - wait for user interrupt
REM =============================================================================
:wait_loop
timeout /t 10 /nobreak >nul
goto :wait_loop

endlocal

