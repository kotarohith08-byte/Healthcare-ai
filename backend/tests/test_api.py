"""
Comprehensive Automated Tests for Healthcare AI Assistant Backend
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "disclaimer" in data

def test_symptom_catalog():
    response = client.get("/api/symptoms/catalog")
    assert response.status_code == 200
    catalog = response.json()
    assert isinstance(catalog, list)
    assert len(catalog) > 0
    assert "category" in catalog[0]
    assert "symptoms" in catalog[0]

def test_symptom_nlp_extraction():
    payload = {"text": "I have had a throbbing headache, high fever, and extreme fatigue for 3 days"}
    response = client.post("/api/symptoms/extract", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 2
    assert any("headache" in s.lower() for s in data["extracted_symptoms"])

def test_symptom_analysis_ml_inference():
    payload = {
        "natural_text": "I have chest pain, shortness of breath, sweating, and vomiting",
        "selected_symptoms": ["chest_pain", "breathlessness", "sweating", "vomiting"]
    }
    response = client.post("/api/symptoms/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["conditions"]) > 0
    assert data["triage_level"] in ["Emergency (Red)", "Urgent Care (Yellow)"]
    assert data["emergency_warning"] is not None
    assert "medical_disclaimer" in data

def test_disease_explorer():
    response = client.get("/api/diseases/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["diseases"]) > 0

def test_disease_detail():
    response = client.get("/api/diseases/E11")
    assert response.status_code == 200
    disease = response.json()
    assert disease["name"] == "Diabetes Mellitus Type 2"
    assert len(disease["symptoms"]) > 0

def test_heart_prediction_model():
    payload = {
        "age": 62,
        "sex": 1,
        "cp": 2,
        "trestbps": 150,
        "chol": 260,
        "fbs": 1,
        "restecg": 1,
        "thalach": 125,
        "exang": 1,
        "oldpeak": 2.5,
        "slope": 2,
        "ca": 2,
        "thal": 3
    }
    response = client.post("/api/predict/heart", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["probability"] <= 100
    assert data["risk_level"] in ["Low Risk", "Moderate Risk", "High Risk"]
    assert len(data["primary_risk_factors"]) > 0

def test_diabetes_prediction_model():
    payload = {
        "HighBP": 1,
        "HighChol": 1,
        "BMI": 34.0,
        "Smoker": 0,
        "Stroke": 0,
        "HeartDiseaseorAttack": 1,
        "PhysActivity": 0,
        "Fruits": 0,
        "Veggies": 1,
        "GenHlth": 4,
        "MentHlth": 5,
        "PhysHlth": 10,
        "DiffWalk": 1,
        "Sex": 1,
        "Age": 9
    }
    response = client.post("/api/predict/diabetes", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["probability"] <= 100
    assert "risk_level" in data

def test_stroke_prediction_model():
    payload = {
        "gender": "Male",
        "age": 68.0,
        "hypertension": 1,
        "heart_disease": 1,
        "ever_married": 1,
        "work_type": "Private",
        "Residence_type": "Urban",
        "avg_glucose_level": 160.0,
        "bmi": 31.0,
        "smoking_status": "smokes"
    }
    response = client.post("/api/predict/stroke", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["probability"] <= 100
    assert "risk_level" in data

def test_model_metrics():
    response = client.get("/api/predict/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert "heart_disease" in metrics
    assert "accuracy" in metrics["heart_disease"]
    assert "confusion_matrix" in metrics["heart_disease"]

def test_dataset_list_and_details():
    response = client.get("/api/datasets/")
    assert response.status_code == 200
    datasets = response.json()
    assert len(datasets) >= 5

    # Check detail of MIMIC-IV
    res_detail = client.get("/api/datasets/mimic-iv-icu?page=1&page_size=10")
    assert res_detail.status_code == 200
    d_data = res_detail.json()
    assert "profile" in d_data
    assert "columns" in d_data
    assert len(d_data["sample_records"]) > 0

def test_rag_knowledge_search():
    response = client.get("/api/knowledge/search?q=myocardial infarction symptoms")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["results"]) > 0

def test_chat_interaction():
    payload = {"message": "What is the FAST protocol for stroke?"}
    response = client.post("/api/chat/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["content"]) > 20
    assert "Stroke" in data["content"] or "FAST" in data["content"]
    assert "sources" in data

def test_user_profile_and_vitals():
    res_prof = client.get("/api/user/profile")
    assert res_prof.status_code == 200
    prof = res_prof.json()
    assert "profile" in prof

    # Log vital
    vital_payload = {
        "metric_type": "systolic_bp",
        "value": 128.0,
        "unit": "mmHg",
        "notes": "Evening check"
    }
    res_v = client.post("/api/user/metrics", json=vital_payload)
    assert res_v.status_code == 200
    v_data = res_v.json()
    assert v_data["status"] == "Elevated"

def test_admin_system_health():
    response = client.get("/api/admin/system-health")
    assert response.status_code == 200
    data = response.json()
    assert data["system_status"] == "Healthy & Operational"
    assert len(data["active_models"]) > 0
