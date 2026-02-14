@echo off
echo ============================================
echo   pAIr - Starting Development Servers
echo ============================================
echo.

echo [1/2] Starting Backend (FastAPI on port 8000)...
cd /d "%~dp0backend"
start "pAIr-Backend" cmd /c "pip install -r requirements.txt >nul 2>&1 && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting Frontend (Vite on port 5173)...
cd /d "%~dp0frontend"
start "pAIr-Frontend" cmd /c "npm install >nul 2>&1 && npm run dev"

echo.
echo ============================================
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo ============================================
echo.
echo Both servers are starting in separate windows.
echo Press any key to exit this launcher...
pause >nul
