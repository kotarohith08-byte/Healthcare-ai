"""
MedPulse AI - Dedicated Backend Launcher
Ensures the project root is in sys.path regardless of where the command is executed.
"""

import os
import sys
import uvicorn

# Ensure the directory containing this script is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

if __name__ == "__main__":
    print(f"Starting MedPulse AI Backend from {PROJECT_ROOT}...")
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        app_dir=PROJECT_ROOT
    )
