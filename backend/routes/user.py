"""
User Profile & Health Metrics Tracking Endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, HealthProfile, HealthMetricLog
from ..schemas import HealthProfileUpdate, HealthMetricCreate, HealthMetricResponse

router = APIRouter(prefix="/api/user", tags=["User Profile & Health Metrics"])

def get_or_create_demo_user(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User(
            username="clinical_demo",
            email="demo@antigravity-health.ai",
            hashed_password="demo_hashed_password",
            full_name="Dr. Alex Morgan",
            role="clinician"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = HealthProfile(
            user_id=user.id,
            age=38,
            gender="Female",
            height_cm=168.0,
            weight_kg=64.0,
            blood_group="O+",
            primary_physician="Dr. Sarah Jenkins, MD",
            chronic_conditions=["Mild Seasonal Asthma"],
            allergies=["Penicillin"],
            disclaimer_accepted=True
        )
        db.add(profile)
        db.commit()
    return user

@router.get("/profile")
def get_user_profile(db: Session = Depends(get_db)):
    """Fetch current user profile and health information."""
    user = get_or_create_demo_user(db)
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
    
    # Calculate BMI
    bmi = None
    bmi_category = "Normal"
    if profile and profile.height_cm and profile.weight_kg:
        h_m = profile.height_cm / 100.0
        bmi = round(profile.weight_kg / (h_m * h_m), 1)
        if bmi < 18.5:
            bmi_category = "Underweight"
        elif bmi < 25.0:
            bmi_category = "Normal Weight"
        elif bmi < 30.0:
            bmi_category = "Overweight"
        else:
            bmi_category = "Obesity"

    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "profile": {
            "age": profile.age if profile else 38,
            "gender": profile.gender if profile else "Female",
            "height_cm": profile.height_cm if profile else 168.0,
            "weight_kg": profile.weight_kg if profile else 64.0,
            "blood_group": profile.blood_group if profile else "O+",
            "primary_physician": profile.primary_physician if profile else "Dr. Sarah Jenkins",
            "chronic_conditions": profile.chronic_conditions if profile else [],
            "allergies": profile.allergies if profile else [],
            "bmi": bmi or 22.7,
            "bmi_category": bmi_category,
            "preferred_units": profile.preferred_units if profile else "metric",
            "theme_preference": profile.theme_preference if profile else "dark",
            "disclaimer_accepted": profile.disclaimer_accepted if profile else True
        }
    }

@router.put("/profile")
def update_user_profile(payload: HealthProfileUpdate, db: Session = Depends(get_db)):
    """Update profile parameters and health preferences."""
    user = get_or_create_demo_user(db)
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
    if not profile:
        profile = HealthProfile(user_id=user.id)
        db.add(profile)

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return {"message": "Profile updated successfully.", "profile": profile}

@router.get("/metrics", response_model=List[HealthMetricResponse])
def get_health_metrics_history(db: Session = Depends(get_db)):
    """Get recorded longitudinal health metrics (Blood pressure, Heart rate, Glucose, etc.)."""
    user = get_or_create_demo_user(db)
    metrics = db.query(HealthMetricLog).filter(HealthMetricLog.user_id == user.id).order_by(HealthMetricLog.recorded_at.desc()).limit(50).all()
    
    # If empty, populate with realistic clinical demonstration vitals
    if not metrics:
        seed_vitals = [
            {"metric_type": "systolic_bp", "value": 118.0, "unit": "mmHg", "status": "Optimal", "notes": "Morning resting reading"},
            {"metric_type": "diastolic_bp", "value": 78.0, "unit": "mmHg", "status": "Optimal", "notes": "Morning resting reading"},
            {"metric_type": "heart_rate", "value": 72.0, "unit": "bpm", "status": "Normal", "notes": "Resting pulse"},
            {"metric_type": "blood_glucose", "value": 92.0, "unit": "mg/dL", "status": "Normal", "notes": "Fasting blood sugar"},
            {"metric_type": "bmi", "value": 22.7, "unit": "kg/m2", "status": "Normal Weight", "notes": "Body mass index calculation"}
        ]
        for sv in seed_vitals:
            item = HealthMetricLog(user_id=user.id, **sv)
            db.add(item)
        db.commit()
        metrics = db.query(HealthMetricLog).filter(HealthMetricLog.user_id == user.id).order_by(HealthMetricLog.recorded_at.desc()).all()

    return metrics

@router.post("/metrics", response_model=HealthMetricResponse)
def log_new_health_metric(payload: HealthMetricCreate, db: Session = Depends(get_db)):
    """Log a new biomarker or vital measurement with clinical range status evaluation."""
    user = get_or_create_demo_user(db)
    
    # Evaluate Status
    status = "Normal"
    if payload.metric_type == "systolic_bp":
        if payload.value >= 140:
            status = "Stage 2 Hypertension"
        elif payload.value >= 130:
            status = "Stage 1 Hypertension"
        elif payload.value >= 120:
            status = "Elevated"
        else:
            status = "Optimal"
    elif payload.metric_type == "blood_glucose":
        if payload.value >= 126:
            status = "Hyperglycemia (Diabetic Range)"
        elif payload.value >= 100:
            status = "Impaired Fasting Glucose"
        elif payload.value < 70:
            status = "Hypoglycemia Alert"
        else:
            status = "Normal Fasting"
    elif payload.metric_type == "heart_rate":
        if payload.value > 100:
            status = "Tachycardia"
        elif payload.value < 60:
            status = "Bradycardia"
        else:
            status = "Normal Resting"

    new_log = HealthMetricLog(
        user_id=user.id,
        metric_type=payload.metric_type,
        value=payload.value,
        unit=payload.unit,
        status=status,
        notes=payload.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
