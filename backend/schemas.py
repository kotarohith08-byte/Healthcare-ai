"""
Pydantic Validation Schemas for Healthcare Assistant API
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

# ----------------- Auth Schemas -----------------
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = "Healthcare User"
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Health Profile Schemas -----------------
class HealthProfileUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_group: Optional[str] = None
    primary_physician: Optional[str] = None
    chronic_conditions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    preferred_units: Optional[str] = "metric"
    theme_preference: Optional[str] = "dark"
    disclaimer_accepted: Optional[bool] = True

class HealthMetricCreate(BaseModel):
    metric_type: str # systolic_bp, diastolic_bp, heart_rate, blood_glucose, bmi, weight_kg
    value: float
    unit: str
    notes: Optional[str] = None

class HealthMetricResponse(BaseModel):
    id: int
    metric_type: str
    value: float
    unit: str
    status: str
    notes: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True

# ----------------- Chatbot & RAG Schemas -----------------
class ChatMessageCreate(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1)

class ChatMessageResponse(BaseModel):
    id: int
    session_id: str
    role: str
    content: str
    sources: List[Dict[str, Any]] = []
    extracted_symptoms: List[str] = []
    simplified_terms: Dict[str, str] = {}
    is_emergency: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

# ----------------- Symptom Engine Schemas -----------------
class SymptomAnalysisRequest(BaseModel):
    natural_text: Optional[str] = None
    selected_symptoms: Optional[List[str]] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    duration_days: Optional[int] = None

class DifferentialCondition(BaseModel):
    condition: str
    confidence: float
    matched_symptoms: List[str]
    severity: str
    recommended_specialist: str
    description: str

class SymptomAnalysisResponse(BaseModel):
    extracted_symptoms: List[str]
    conditions: List[DifferentialCondition]
    triage_level: str # Emergency (Red), Urgent (Yellow), Clinical Routine (Green), Self-Care (Blue)
    emergency_warning: Optional[str] = None
    medical_disclaimer: str

# ----------------- ML Prediction Schemas -----------------
class HeartPredictionRequest(BaseModel):
    age: int = Field(55, ge=20, le=100)
    sex: int = Field(1, ge=0, le=1) # 1=Male, 0=Female
    cp: int = Field(1, ge=0, le=3) # Chest pain type: 0=Typical, 1=Atypical, 2=Non-anginal, 3=Asymptomatic
    trestbps: int = Field(130, ge=80, le=220) # Resting BP mmHg
    chol: int = Field(240, ge=100, le=600) # Serum Cholesterol mg/dL
    fbs: int = Field(0, ge=0, le=1) # Fasting blood sugar > 120 mg/dL (1=True, 0=False)
    restecg: int = Field(0, ge=0, le=2) # Resting ECG
    thalach: int = Field(150, ge=60, le=220) # Max heart rate achieved
    exang: int = Field(0, ge=0, le=1) # Exercise induced angina
    oldpeak: float = Field(1.0, ge=0.0, le=8.0) # ST depression
    slope: int = Field(1, ge=0, le=2) # Slope of peak exercise ST segment
    ca: int = Field(0, ge=0, le=4) # Number of major vessels colored by fluoroscopy
    thal: int = Field(2, ge=0, le=3) # Thalassemia: 1=Normal, 2=Fixed defect, 3=Reversible defect

class DiabetesPredictionRequest(BaseModel):
    HighBP: int = Field(0, ge=0, le=1)
    HighChol: int = Field(0, ge=0, le=1)
    BMI: float = Field(26.5, ge=10.0, le=70.0)
    Smoker: int = Field(0, ge=0, le=1)
    Stroke: int = Field(0, ge=0, le=1)
    HeartDiseaseorAttack: int = Field(0, ge=0, le=1)
    PhysActivity: int = Field(1, ge=0, le=1)
    Fruits: int = Field(1, ge=0, le=1)
    Veggies: int = Field(1, ge=0, le=1)
    GenHlth: int = Field(2, ge=1, le=5) # 1=Excellent to 5=Poor
    MentHlth: int = Field(0, ge=0, le=30)
    PhysHlth: int = Field(0, ge=0, le=30)
    DiffWalk: int = Field(0, ge=0, le=1)
    Sex: int = Field(1, ge=0, le=1)
    Age: int = Field(6, ge=1, le=13) # Age 1-13 categories

class StrokePredictionRequest(BaseModel):
    gender: str = Field("Male")
    age: float = Field(52.0, ge=1.0, le=100.0)
    hypertension: int = Field(0, ge=0, le=1)
    heart_disease: int = Field(0, ge=0, le=1)
    ever_married: int = Field(1, ge=0, le=1)
    work_type: str = Field("Private")
    Residence_type: str = Field("Urban")
    avg_glucose_level: float = Field(105.0, ge=40.0, le=350.0)
    bmi: float = Field(27.5, ge=10.0, le=70.0)
    smoking_status: str = Field("never smoked")

class PredictionResponse(BaseModel):
    model_name: str
    probability: float
    risk_level: str # Low Risk, Moderate Risk, Elevated Risk, High Risk
    primary_risk_factors: List[str]
    recommendations: List[str]
    disclaimer: str

# ----------------- Dataset Explorer Schemas -----------------
class DatasetSummary(BaseModel):
    id: int
    name: str
    slug: str
    category: str
    description: str
    source: str
    record_count: int
    feature_count: int
    missing_values_count: int
    quality_score: float
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True

class DatasetDetailsResponse(BaseModel):
    summary: DatasetSummary
    columns: List[Dict[str, Any]]
    sample_records: List[Dict[str, Any]]
    total_records: int
    page: int
    page_size: int
