@echo off
:: pAIr MSME Compliance Navigator - Local Demo
:: Starts server and runs test client

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     pAIr MSME Compliance ^& Grant Navigator - Demo Mode       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Set demo mode
set DEMO_MODE=TRUE

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.9+
    pause
    exit /b 1
)

:: Install dependencies if needed
echo 📦 Checking dependencies...
pip install -q -r backend\requirements.txt

:: Start the server in background
echo.
echo 🚀 Starting pAIr Backend Server...
echo    URL: http://localhost:8000
echo    Mode: DEMO_MODE=TRUE
echo.
echo ════════════════════════════════════════════════════════════════
echo.

cd backend
start /b python main.py

:: Wait for server to start
echo ⏳ Waiting for server to start...
timeout /t 5 /nobreak >nul

:: Run test client
echo.
echo 📋 Running Test Client...
echo ════════════════════════════════════════════════════════════════
echo.
cd ..
python src\test_client.py

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ Demo Complete! Server is still running at http://localhost:8000
echo    Press Ctrl+C to stop the server.
echo ════════════════════════════════════════════════════════════════
echo.

:: Keep the window open
pause
