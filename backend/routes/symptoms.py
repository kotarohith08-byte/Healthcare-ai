"""
Symptom Analysis API Endpoints
"""

from typing import List, Dict, Any
from fastapi import APIRouter
from ..schemas import SymptomAnalysisRequest, SymptomAnalysisResponse
from ..services.symptom_engine import (
    analyze_symptoms, get_all_symptoms_catalog, extract_symptoms_from_text
)

router = APIRouter(prefix="/api/symptoms", tags=["Symptom Analysis Engine"])

@router.get("/catalog")
def get_symptoms_catalog():
    """Returns all available system symptoms categorized by anatomical / body system."""
    return get_all_symptoms_catalog()

@router.post("/extract")
def extract_symptoms_nlp(payload: Dict[str, str]):
    """Extracts identified clinical symptoms from natural language text."""
    text = payload.get("text", "")
    extracted = extract_symptoms_from_text(text)
    return {
        "text": text,
        "extracted_symptoms": [s.replace("_", " ").title() for s in extracted],
        "raw_keys": extracted,
        "count": len(extracted)
    }

@router.post("/analyze", response_model=SymptomAnalysisResponse)
def run_symptom_analysis(payload: SymptomAnalysisRequest):
    """
    Analyzes symptoms (from natural language narrative or selected tokens)
    and predicts probable condition differential, triage urgency, and specialists.
    """
    result = analyze_symptoms(
        natural_text=payload.natural_text,
        selected_symptoms=payload.selected_symptoms,
        age=payload.age,
        gender=payload.gender
    )
    return result
