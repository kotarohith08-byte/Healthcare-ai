"""
AI-Powered Healthcare Assistance System - FastAPI Application
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import Base, engine
from .routes import (
    auth, chat, symptoms, diseases, prediction, datasets, knowledge, user, admin
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Healthcare Assistance & Medical Intelligence Platform",
    description="Enterprise-grade AI healthcare platform integrating symptom analysis, RAG conversational assistant, multi-condition ML risk predictors, and large-scale dataset management.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(symptoms.router)
app.include_router(diseases.router)
app.include_router(prediction.router)
app.include_router(datasets.router)
app.include_router(knowledge.router)
app.include_router(user.router)
app.include_router(admin.router)

# Locate Frontend Dist Directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/api/status")
def api_status():
    return {
        "status": "online",
        "system": "AI-Powered Healthcare Assistance System",
        "version": "2.4.0",
        "documentation": "/docs",
        "disclaimer": "This system is intended strictly for educational, informational, and research purposes. It does not provide medical diagnoses, treatment decisions, or emergency care."
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Healthcare AI Backend API"}

@app.get("/")
def serve_root():
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "status": "online",
        "system": "AI-Powered Healthcare Assistance System",
        "version": "2.4.0",
        "documentation": "/docs",
        "disclaimer": "This system is intended strictly for educational, informational, and research purposes. It does not provide medical diagnoses, treatment decisions, or emergency care."
    }

# SPA Fallback for client-side navigation
@app.get("/{full_path:path}")
def catch_all(full_path: str):
    # If request is for an existing file in dist (like favicon.svg)
    potential_file = os.path.join(FRONTEND_DIST, full_path)
    if os.path.exists(potential_file) and not os.path.isdir(potential_file):
        return FileResponse(potential_file)
    
    # Otherwise fallback to index.html for React SPA
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Not Found"}
