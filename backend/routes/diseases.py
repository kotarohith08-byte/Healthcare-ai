"""
Disease Information Explorer API Endpoints
"""

import os
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/diseases", tags=["Disease Information Explorer"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG_PATH = os.path.join(BASE_DIR, "ml", "datasets", "disease_catalog.json")

def load_diseases() -> list[dict]:
    if os.path.exists(CATALOG_PATH):
        with open(CATALOG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/")
def list_diseases(
    search: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None
):
    """Browse and filter comprehensive medical disease library."""
    diseases = load_diseases()
    
    if search:
        s_low = search.lower()
        diseases = [
            d for d in diseases
            if s_low in d["name"].lower()
            or s_low in d["icd10"].lower()
            or any(s_low in sym.lower() for sym in d.get("symptoms", []))
        ]
        
    if category and category != "All":
        diseases = [d for d in diseases if d.get("category", "").lower() == category.lower()]
        
    if severity and severity != "All":
        diseases = [d for d in diseases if severity.lower() in d.get("severity", "").lower()]
        
    return {
        "total": len(diseases),
        "diseases": diseases
    }

@router.get("/{icd10}")
def get_disease_detail(icd10: str):
    """Get full clinical disease profile by ICD-10 or slug."""
    diseases = load_diseases()
    target = next((d for d in diseases if d["icd10"].lower() == icd10.lower() or d["name"].lower() == icd10.lower()), None)
    if not target:
        raise HTTPException(status_code=404, detail="Disease profile not found.")
    return target

@router.get("/categories/list")
def list_disease_categories():
    """List all available medical specialties and categories."""
    diseases = load_diseases()
    categories = sorted(list({d.get("category", "General") for d in diseases}))
    return {"categories": categories}
