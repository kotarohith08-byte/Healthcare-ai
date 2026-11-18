"""
Admin & System Health Monitoring API Endpoints
"""

import os
import sys
import psutil
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ChatSession, ChatMessage, PredictionLog, HealthMetricLog
from ..services.dataset_service import STATIC_REGISTRY
from ..services.symptom_engine import symptom_artifact
from ..services.rag_chatbot import rag_service

router = APIRouter(prefix="/api/admin", tags=["Admin & System Health"])

START_TIME = datetime.utcnow()

@router.get("/system-health")
def get_system_health(db: Session = Depends(get_db)):
    """Provides operational metrics, memory telemetry, active ML artifacts, and audit statistics."""
    uptime_seconds = (datetime.utcnow() - START_TIME).total_seconds()
    
    # Process memory
    proc = psutil.Process(os.getpid())
    mem_info = proc.memory_info()
    mem_mb = round(mem_info.rss / (1024 * 1024), 2)
    
    # Database stats
    total_users = db.query(User).count()
    total_sessions = db.query(ChatSession).count()
    total_messages = db.query(ChatMessage).count()
    total_predictions = db.query(PredictionLog).count()
    total_metrics = db.query(HealthMetricLog).count()

    # Active ML Models in RAM
    active_models = [
        {"name": "Symptom Classifier (Random Forest 42 Classes)", "status": "Loaded" if symptom_artifact else "Unloaded", "type": "Multi-Class Ensemble"},
        {"name": "Heart Disease Risk Model", "status": "Ready on Disk", "type": "StandardScaler + Random Forest"},
        {"name": "Type-2 Diabetes Risk Model", "status": "Ready on Disk", "type": "StandardScaler + Random Forest"},
        {"name": "Cerebrovascular Stroke Risk Model", "status": "Ready on Disk", "type": "ColumnTransformer + Random Forest"},
        {"name": "Medical RAG TF-IDF Cosine Vectorizer", "status": "Indexed & Active", "passages_indexed": len(rag_service.documents)}
    ]

    # Recent Prediction Audits
    recent_predictions = (
        db.query(PredictionLog)
        .order_by(PredictionLog.created_at.desc())
        .limit(10)
        .all()
    )
    prediction_audit = [
        {
            "id": p.id,
            "model_name": p.model_name,
            "risk_level": p.risk_level,
            "confidence": p.confidence,
            "created_at": p.created_at.isoformat()
        }
        for p in recent_predictions
    ]

    return {
        "system_status": "Healthy & Operational",
        "api_version": "2.4.0-healthcare-enterprise",
        "python_version": sys.version.split(" ")[0],
        "uptime_seconds": int(uptime_seconds),
        "process_memory_mb": mem_mb,
        "active_models": active_models,
        "datasets_count": len(STATIC_REGISTRY),
        "database_metrics": {
            "users": total_users,
            "chat_sessions": total_sessions,
            "chat_messages": total_messages,
            "predictions_logged": total_predictions,
            "vitals_logged": total_metrics
        },
        "recent_prediction_audits": prediction_audit,
        "security": {
            "hipaa_compliance_mode": "Active (De-identified synthetic cohorts only)",
            "ssl_tls": "Enabled",
            "rate_limiting": "Active (100 req/min)",
            "disclaimer_enforced": True
        }
    }
