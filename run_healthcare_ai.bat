@echo off
cd /d "%~dp0"
echo ===================================================================
echo   Starting MedPulse AI - Healthcare Assistance & ML Platform
echo ===================================================================
echo.

:: 1. Verify ML Models
if not exist "backend\ml\models\symptom_classifier.joblib" (
    echo [INFO] Training ML models and generating datasets...
    python backend\ml\generate_datasets.py
    python backend\ml\train_models.py
)

:: 2. Launch FastAPI Backend on port 8000
echo [INFO] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "MedPulse AI - FastAPI Backend" cmd /k "cd /d "%~dp0" && python run_backend.py"

:: 3. Launch Frontend on port 5173
echo [INFO] Starting Vite Frontend on http://localhost:5173 ...
start "MedPulse AI - React Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================================
echo   System running:
echo   - Web Application: http://localhost:5173
echo   - Backend REST API: http://127.0.0.1:8000
echo   - Interactive Swagger API Docs: http://127.0.0.1:8000/docs
echo ===================================================================
pause
