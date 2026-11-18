"""
Medical Knowledge Search & Health Education Library Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Query
from ..services.rag_chatbot import rag_service

router = APIRouter(prefix="/api/knowledge", tags=["Medical Knowledge & Education"])

# Curated Health Education Guides & Protocols
HEALTH_GUIDES = [
    {
        "id": "GUIDE-001",
        "title": "AHA Cardiovascular Emergency: Recognizing Heart Attack & Immediate Actions",
        "category": "Emergency & Cardiology",
        "read_time": "4 min",
        "summary": "Step-by-step guidance on recognizing ischemic chest symptoms, atypical presentations in women/elderly, and bystander emergency response.",
        "content": (
            "Myocardial infarction occurs when coronary blood flow is acutely obstructed. "
            "Action Plan:\n"
            "1. Immediately call 911. Never drive yourself or wait for symptoms to subside.\n"
            "2. Rest in a semi-upright position with knees bent to reduce cardiac workload.\n"
            "3. If not allergic or contraindicated by a doctor, chew one full adult non-enteric coated Aspirin (325 mg) or four low-dose chewable aspirins (81 mg each).\n"
            "4. Have an automated external defibrillator (AED) retrieved if in a public facility."
        ),
        "source": "American Heart Association (AHA) Guidelines"
    },
    {
        "id": "GUIDE-002",
        "title": "Stroke Recognition Protocol: The Clinical FAST & BE-FAST Algorithms",
        "category": "Neurology & Emergency",
        "read_time": "3 min",
        "summary": "Critical time-window parameters, tissue plasminogen activator (tPA) eligibility, and immediate identification markers.",
        "content": (
            "BE-FAST Protocol:\n"
            "B - Balance: Sudden loss of balance or coordination.\n"
            "E - Eyes: Sudden blurriness or loss of vision in one or both eyes.\n"
            "F - Face: One side of the face drooping when smiling.\n"
            "A - Arms: One arm drifting downwards when held outstretched.\n"
            "S - Speech: Slurred, incomprehensible, or absent speech.\n"
            "T - Time: Note exact time of onset and call EMS immediately. Thrombolysis is strictly time-dependent (3 to 4.5 hours)."
        ),
        "source": "American Stroke Association"
    },
    {
        "id": "GUIDE-003",
        "title": "Evidence-Based Management of Hypertension: The DASH Nutrition Protocol",
        "category": "Preventive Cardiology",
        "read_time": "5 min",
        "summary": "Dietary Approaches to Stop Hypertension (DASH) macronutrient and micronutrient balance for lowering systolic and diastolic BP.",
        "content": (
            "Clinical trials demonstrate that following the DASH diet can lower systolic BP by 8 to 14 mmHg.\n"
            "Key Principles:\n"
            "- Limit daily sodium to < 1,500 - 2,300 mg.\n"
            "- Incorporate 4-5 servings of vegetables and 4-5 servings of fruits daily to supply potassium.\n"
            "- Opt for whole grains, lean poultry, fish, legumes, and nuts.\n"
            "- Limit saturated fats, trans fats, sugary beverages, and red meats."
        ),
        "source": "National Heart, Lung, and Blood Institute (NHLBI)"
    },
    {
        "id": "GUIDE-004",
        "title": "Type-2 Diabetes: Glucose Monitoring, Hypoglycemia Triage & Prevention",
        "category": "Endocrinology",
        "read_time": "5 min",
        "summary": "Target capillary blood glucose ranges, continuous glucose monitoring (CGM) interpretation, and the Rule of 15 for hypoglycemia.",
        "content": (
            "Standard Glycemic Targets for Non-Pregnant Adults:\n"
            "- Pre-prandial (before meals): 80 to 130 mg/dL.\n"
            "- Post-prandial (1-2 hours after start of meal): < 180 mg/dL.\n"
            "- Glycated Hemoglobin (HbA1c): < 7.0% for most adults.\n"
            "Rule of 15 for Hypoglycemia (<70 mg/dL): Consume 15g fast-acting carbs (juice, glucose tablets), wait 15 minutes, re-check."
        ),
        "source": "American Diabetes Association (ADA)"
    },
    {
        "id": "GUIDE-005",
        "title": "Acute Bronchial Asthma Exacerbation: Peak Flow Zones & Rescue Inhaler Steps",
        "category": "Pulmonology",
        "read_time": "4 min",
        "summary": "Understanding asthma action plan zones (Green, Yellow, Red) and correct metered-dose inhaler spacer administration.",
        "content": (
            "Asthma Zone Management:\n"
            "- Green Zone (80-100% Personal Best): Routine daily maintenance inhaled corticosteroids.\n"
            "- Yellow Zone (50-79%): Caution - take rescue SABA (Albuterol 2-4 puffs) every 20 minutes for up to 1 hour.\n"
            "- Red Zone (<50%): Medical Alert - take 4-6 puffs of SABA immediately and seek emergency medical care."
        ),
        "source": "Global Initiative for Asthma (GINA)"
    }
]

@router.get("/search")
def search_medical_qa(
    q: str = Query(..., min_length=2),
    category: Optional[str] = None
):
    """Semantic vector search across MedQuAD and clinical medical guidelines."""
    results = rag_service.search_knowledge(q, top_k=6)
    if category and category != "All":
        results = [r for r in results if r.get("category", "").lower() == category.lower()]
    return {
        "query": q,
        "total": len(results),
        "results": results
    }

@router.get("/guides")
def list_health_education_guides():
    """Returns curated clinical health education and emergency action guides."""
    return HEALTH_GUIDES
