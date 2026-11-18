"""
AI/ML Predictive Analytics API Endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PredictionLog, User
from ..schemas import (
    HeartPredictionRequest, DiabetesPredictionRequest,
    StrokePredictionRequest, PredictionResponse
)
from ..services.ml_predictor import (
    predict_heart_disease, predict_diabetes, predict_stroke,
    get_all_model_metrics
)

router = APIRouter(prefix="/api/predict", tags=["AI/ML Predictive Analytics"])

@router.get("/metrics")
def get_model_evaluation_metrics():
    """Returns real trained model metrics, confusion matrices, and feature importance."""
    metrics = get_all_model_metrics()
    if not metrics:
        raise HTTPException(status_code=404, detail="Model evaluation metrics not yet generated.")
    return metrics

@router.post("/heart", response_model=PredictionResponse)
def predict_cardiac_risk(payload: HeartPredictionRequest, db: Session = Depends(get_db)):
    """Runs Cleveland Clinic Heart Disease ML inference and returns risk stratification."""
    input_dict = payload.dict()
    result = predict_heart_disease(input_dict)

    # Log prediction audit record
    user = db.query(User).first()
    log = PredictionLog(
        user_id=user.id if user else None,
        model_name="heart_disease",
        inputs=input_dict,
        result=result,
        risk_level=result["risk_level"],
        confidence=result["probability"]
    )
    db.add(log)
    db.commit()

    return result

@router.post("/diabetes", response_model=PredictionResponse)
def predict_diabetes_risk(payload: DiabetesPredictionRequest, db: Session = Depends(get_db)):
    """Runs CDC BRFSS Diabetes ML inference and returns metabolic risk stratification."""
    input_dict = payload.dict()
    result = predict_diabetes(input_dict)

    user = db.query(User).first()
    log = PredictionLog(
        user_id=user.id if user else None,
        model_name="diabetes",
        inputs=input_dict,
        result=result,
        risk_level=result["risk_level"],
        confidence=result["probability"]
    )
    db.add(log)
    db.commit()

    return result

@router.post("/stroke", response_model=PredictionResponse)
def predict_stroke_risk(payload: StrokePredictionRequest, db: Session = Depends(get_db)):
    """Runs Cerebrovascular Stroke ML inference and returns neurological risk stratification."""
    input_dict = payload.dict()
    result = predict_stroke(input_dict)

    user = db.query(User).first()
    log = PredictionLog(
        user_id=user.id if user else None,
        model_name="stroke",
        inputs=input_dict,
        result=result,
        risk_level=result["risk_level"],
        confidence=result["probability"]
    )
    db.add(log)
    db.commit()

    return result
