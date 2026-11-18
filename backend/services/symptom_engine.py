"""
Symptom Analysis Engine
- Natural Language Symptom Extraction (NLP)
- Symptom synonym mapping and normalization
- Machine Learning Multi-Class Condition Inference (Random Forest)
- Clinical Triage Urgency Assessment (Emergency / Urgent / Routine / Self-care)
"""

import os
import re
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
SYMPTOM_MODEL_PATH = os.path.join(MODELS_DIR, "symptom_classifier.joblib")

# Symptom Synonym dictionary for NLP extraction
SYNONYMS_DICT = {
    "fever": ["fever", "high temperature", "temperature", "pyrexia", "feeling hot", "febrile"],
    "high_fever": ["high fever", "burning up", "very high fever", "102 fever", "103 fever", "104 fever"],
    "chills": ["chills", "shivering", "feeling cold", "rigors"],
    "cough": ["cough", "coughing", "dry cough", "hacking cough"],
    "breathlessness": ["shortness of breath", "breathlessness", "difficulty breathing", "hard to breathe", "dyspnea", "winded"],
    "chest_pain": ["chest pain", "tightness in chest", "chest pressure", "pain in chest", "angina"],
    "headache": ["headache", "head ache", "migraine", "pain in head", "throbbing head"],
    "fatigue": ["fatigue", "tired", "exhausted", "low energy", "worn out", "tiredness", "weakness"],
    "nausea": ["nausea", "nauseous", "feel sick to stomach", "queasy"],
    "vomiting": ["vomiting", "throwing up", "puking", "vomited"],
    "stomach_pain": ["stomach pain", "tummy ache", "belly pain", "abdominal cramps", "gastric pain"],
    "abdominal_pain": ["abdominal pain", "pain in abdomen", "lower belly pain", "upper stomach pain"],
    "diarrhoea": ["diarrhea", "diarrhoea", "loose motions", "watery stool", "runny stomach"],
    "loss_of_smell": ["loss of smell", "cannot smell", "lost smell", "anosmia", "smell gone"],
    "throat_irritation": ["sore throat", "throat pain", "scratchy throat", "irritated throat", "pharyngitis"],
    "dizziness": ["dizzy", "dizziness", "lightheaded", "woozy", "spinning head"],
    "joint_pain": ["joint pain", "pain in joints", "aching joints", "knee pain", "arthralgia"],
    "back_pain": ["back pain", "lower back pain", "spine pain", "lumbago"],
    "neck_pain": ["neck pain", "stiff neck", "cervical pain"],
    "skin_rash": ["rash", "skin rash", "red spots", "hives", "bumps on skin", "eruption"],
    "itching": ["itching", "itchy skin", "pruritus", "scratching"],
    "sweating": ["sweating", "cold sweats", "night sweats", "excessive perspiration"],
    "acidity": ["acidity", "heartburn", "acid reflux", "sour taste in mouth", "pyrosis"],
    "burning_micturition": ["burning urination", "pain when peeing", "dysuria", "burning pee"],
    "yellowish_skin": ["yellow skin", "jaundice", "yellowish eyes", "icterus"],
    "dark_urine": ["dark urine", "brown pee", "tea colored urine"],
    "weight_loss": ["unintended weight loss", "losing weight", "lost weight fast"],
    "weight_gain": ["weight gain", "gained weight", "unexplained weight gain"],
    "blurred_and_distorted_vision": ["blurred vision", "fuzzy vision", "blurry eyes", "vision distortion"],
    "loss_of_balance": ["loss of balance", "unsteady on feet", "off balance", "wobbly"],
    "fast_heart_rate": ["fast heartbeat", "racing heart", "palpitations", "tachycardia"]
}

# Red-flag emergency symptoms
EMERGENCY_SYMPTOMS = {
    "chest_pain", "breathlessness", "altered_sensorium", "weakness_of_one_body_side",
    "blood_in_sputum", "acute_liver_failure"
}

# Disease Specialist & Severity map
DISEASE_METADATA = {
    "Heart attack": {"specialist": "Cardiologist (Emergency Room)", "severity": "Life-Threatening Emergency"},
    "Paralysis (brain hemorrhage)": {"specialist": "Neurologist / Emergency Stroke Center", "severity": "Life-Threatening Emergency"},
    "Pneumonia": {"specialist": "Pulmonologist / Internal Medicine", "severity": "Urgent Medical Care"},
    "Tuberculosis": {"specialist": "Pulmonologist / Infectious Disease", "severity": "Urgent Medical Care"},
    "COVID-19": {"specialist": "Infectious Disease / Primary Care", "severity": "Urgent Medical Care"},
    "Dengue": {"specialist": "Infectious Disease / Internal Medicine", "severity": "Urgent Medical Care"},
    "Malaria": {"specialist": "Infectious Disease / Tropical Medicine", "severity": "Urgent Medical Care"},
    "Typhoid": {"specialist": "Gastroenterologist / Infectious Disease", "severity": "Urgent Medical Care"},
    "Bronchial Asthma": {"specialist": "Pulmonologist / Allergist", "severity": "Chronic / Episodic"},
    "Diabetes": {"specialist": "Endocrinologist", "severity": "Chronic Management"},
    "Hypertension": {"specialist": "Cardiologist / Primary Physician", "severity": "Chronic Management"},
    "Migraine": {"specialist": "Neurologist / Headache Specialist", "severity": "Moderate Episodic"},
    "GERD": {"specialist": "Gastroenterologist", "severity": "Manageable Chronic"},
    "Osteoarthristis": {"specialist": "Orthopedist / Rheumatologist", "severity": "Chronic Degenerative"},
    "Common Cold": {"specialist": "General Physician / Self-Care", "severity": "Mild Self-Limiting"},
    "Allergy": {"specialist": "Allergist / General Practitioner", "severity": "Mild to Moderate"}
}

DEFAULT_METADATA = {"specialist": "General Practitioner / Internist", "severity": "Clinical Evaluation"}

# Load trained symptom model
symptom_artifact = None
if os.path.exists(SYMPTOM_MODEL_PATH):
    try:
        symptom_artifact = joblib.load(SYMPTOM_MODEL_PATH)
        print("Symptom model loaded successfully.")
    except Exception as e:
        print(f"Error loading symptom model: {e}")

def extract_symptoms_from_text(text: str) -> list[str]:
    """Extract known medical symptoms from unstructured natural language text."""
    if not text:
        return []
    
    clean_text = text.lower()
    clean_text = re.sub(r"[^\w\s]", " ", clean_text)
    
    found_symptoms = set()
    for standard_symptom, synonyms in SYNONYMS_DICT.items():
        for syn in synonyms:
            pattern = r"\b" + re.escape(syn.lower()) + r"\b"
            if re.search(pattern, clean_text):
                found_symptoms.add(standard_symptom)
                break
                
    # Direct match on standard symptom names (underscores replaced by spaces)
    if symptom_artifact and "features" in symptom_artifact:
        for feature in symptom_artifact["features"]:
            feat_phrase = feature.replace("_", " ")
            pattern = r"\b" + re.escape(feat_phrase) + r"\b"
            if re.search(pattern, clean_text):
                found_symptoms.add(feature)
                
    return sorted(list(found_symptoms))

def analyze_symptoms(
    natural_text: str = None,
    selected_symptoms: list[str] = None,
    age: int = None,
    gender: str = None
) -> dict:
    """Analyze symptoms using trained Random Forest model and clinical rule-based triage."""
    extracted = set()
    if natural_text:
        extracted.update(extract_symptoms_from_text(natural_text))
    if selected_symptoms:
        extracted.update(selected_symptoms)
        
    symptoms_list = sorted(list(extracted))
    
    if not symptoms_list:
        return {
            "extracted_symptoms": [],
            "conditions": [],
            "triage_level": "Self-Care",
            "emergency_warning": None,
            "medical_disclaimer": "No identifiable symptoms were detected. Please describe your symptoms in greater detail or consult a licensed physician."
        }
    
    # Check for Emergency Red Flags
    has_emergency = any(sym in EMERGENCY_SYMPTOMS for sym in symptoms_list)
    emergency_warning = None
    if has_emergency:
        emergency_warning = (
            "EMERGENCY ALERT: One or more reported symptoms (such as acute chest pain, severe dyspnea, "
            "or focal neurological signs) may indicate a time-sensitive medical emergency. "
            "Please call 911 (or your local emergency services) or proceed immediately to the nearest Emergency Department."
        )

    conditions = []
    if symptom_artifact:
        features = symptom_artifact["features"]
        model = symptom_artifact["model"]
        
        # Build 1xN feature vector as a DataFrame with explicit column names
        row_dict = {f: 0 for f in features}
        matched_in_features = []
        for feat in symptoms_list:
            if feat in row_dict:
                row_dict[feat] = 1
                matched_in_features.append(feat)
                
        df_vector = pd.DataFrame([row_dict])[features]
        # Predict class probabilities
        probs = model.predict_proba(df_vector)[0]
        top_indices = np.argsort(probs)[::-1][:4]
        
        for idx in top_indices:
            prob = float(probs[idx])
            if prob > 0.03: # Include non-trivial possibilities
                cond_name = model.classes_[idx]
                meta = DISEASE_METADATA.get(cond_name, DEFAULT_METADATA)
                
                # Format friendly condition description
                conditions.append({
                    "condition": cond_name,
                    "confidence": round(prob * 100, 1),
                    "matched_symptoms": [s.replace("_", " ").title() for s in matched_in_features],
                    "severity": meta["severity"],
                    "recommended_specialist": meta["specialist"],
                    "description": f"Statistical pattern match for {cond_name} based on presence of {len(matched_in_features)} input symptom indicators."
                })

    # Determine Triage Level
    if has_emergency:
        triage_level = "Emergency (Red)"
    elif any(c["confidence"] > 40 and "Urgent" in c["severity"] for c in conditions):
        triage_level = "Urgent Care (Yellow)"
    elif len(symptoms_list) >= 3:
        triage_level = "Clinical Consultation (Green)"
    else:
        triage_level = "Routine / Self-Care (Blue)"

    disclaimer = (
        "IMPORTANT MEDICAL NOTICE: This analysis is generated by an artificial intelligence model "
        "for educational and informational purposes only. It is NOT a clinical diagnosis and cannot replace "
        "a physical examination or clinical diagnostic evaluation by a licensed healthcare provider."
    )

    return {
        "extracted_symptoms": [s.replace("_", " ").title() for s in symptoms_list],
        "conditions": conditions,
        "triage_level": triage_level,
        "emergency_warning": emergency_warning,
        "medical_disclaimer": disclaimer
    }

def get_all_symptoms_catalog() -> list[dict]:
    """Returns all available system symptoms categorized by body system."""
    if not symptom_artifact or "features" not in symptom_artifact:
        return []
    
    body_systems = {
        "Head & Neurological": ["headache", "dizziness", "loss_of_balance", "altered_sensorium", "spinning_movements", "visual_disturbances", "depression", "irritability", "lack_of_concentration", "stiff_neck"],
        "Respiratory & Chest": ["cough", "breathlessness", "chest_pain", "phlegm", "blood_in_sputum", "mucoid_sputum", "runny_nose", "congestion", "sinus_pressure", "throat_irritation", "continuous_sneezing"],
        "Gastrointestinal": ["stomach_pain", "acidity", "vomiting", "nausea", "loss_of_appetite", "abdominal_pain", "diarrhoea", "constipation", "indigestion", "passage_of_gases", "pain_during_bowel_movements", "bloody_stool"],
        "Cardiovascular & Vitals": ["fast_heart_rate", "palpitations", "sweating", "cold_hands_and_feets", "swollen_legs", "swollen_blood_vessels"],
        "Skin & Mucosal": ["skin_rash", "itching", "yellowish_skin", "dark_urine", "red_spots_over_body", "blister", "yellow_crust_ooze", "pus_filled_pimples", "blackheads", "skin_peeling", "silver_like_dusting"],
        "Musculoskeletal": ["joint_pain", "back_pain", "neck_pain", "muscle_pain", "knee_pain", "hip_joint_pain", "swelling_joints", "muscle_weakness", "painful_walking", "cramps"],
        "General & Systemic": ["high_fever", "mild_fever", "chills", "fatigue", "weight_loss", "weight_gain", "lethargy", "restlessness", "malaise", "dehydration", "excessive_hunger", "burning_micturition"]
    }
    
    catalog = []
    features = symptom_artifact["features"]
    
    for category, sym_list in body_systems.items():
        items = []
        for s in sym_list:
            if s in features:
                items.append({
                    "id": s,
                    "name": s.replace("_", " ").title()
                })
        if items:
            catalog.append({
                "category": category,
                "symptoms": items
            })
            
    return catalog
