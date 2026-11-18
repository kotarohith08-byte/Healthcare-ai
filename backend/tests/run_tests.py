"""
Direct Verification Test Suite for Healthcare AI Platform
"""

import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.services.symptom_engine import (
    analyze_symptoms, get_all_symptoms_catalog, extract_symptoms_from_text
)
from backend.services.ml_predictor import (
    predict_heart_disease, predict_diabetes, predict_stroke, get_all_model_metrics
)
from backend.services.rag_chatbot import rag_service
from backend.services.dataset_service import (
    get_registered_datasets_list, get_dataset_details
)

def run_all_tests():
    print("==================================================")
    print(" RUNNING HEALTHCARE AI SYSTEM VERIFICATION TESTS")
    print("==================================================")

    # 1. Symptom NLP Extraction Test
    sample_text = "I have a high fever, severe headache, and vomiting since yesterday."
    extracted = extract_symptoms_from_text(sample_text)
    print(f"\n[PASS] Symptom NLP Extraction: {len(extracted)} symptoms found: {extracted}")
    assert len(extracted) >= 2, "NLP symptom extraction failed"

    # 2. Symptom ML Multi-Class Inference Test
    analysis = analyze_symptoms(
        natural_text=sample_text,
        selected_symptoms=["high_fever", "headache", "vomiting"]
    )
    print(f"[PASS] Symptom Inference Differential: {len(analysis['conditions'])} conditions evaluated.")
    print(f"       Top Condition: {analysis['conditions'][0]['condition']} ({analysis['conditions'][0]['confidence']}%)")
    print(f"       Triage Level: {analysis['triage_level']}")
    assert len(analysis["conditions"]) > 0
    assert "medical_disclaimer" in analysis

    # 3. Heart Disease ML Model Test
    heart_input = {
        "age": 60, "sex": 1, "cp": 2, "trestbps": 145, "chol": 260,
        "fbs": 0, "restecg": 0, "thalach": 130, "exang": 1,
        "oldpeak": 2.2, "slope": 2, "ca": 2, "thal": 3
    }
    heart_res = predict_heart_disease(heart_input)
    print(f"\n[PASS] Heart Disease Risk Model: Probability = {heart_res['probability']}%, Level = {heart_res['risk_level']}")
    assert 0 <= heart_res["probability"] <= 100
    assert len(heart_res["primary_risk_factors"]) > 0

    # 4. Diabetes ML Model Test
    diab_input = {
        "HighBP": 1, "HighChol": 1, "BMI": 32.5, "Smoker": 0, "Stroke": 0,
        "HeartDiseaseorAttack": 1, "PhysActivity": 0, "Fruits": 0, "Veggies": 1,
        "GenHlth": 4, "MentHlth": 2, "PhysHlth": 5, "DiffWalk": 1, "Sex": 1, "Age": 9
    }
    diab_res = predict_diabetes(diab_input)
    print(f"[PASS] Diabetes Risk Model: Probability = {diab_res['probability']}%, Level = {diab_res['risk_level']}")
    assert 0 <= diab_res["probability"] <= 100

    # 5. Stroke ML Model Test
    stroke_input = {
        "gender": "Male", "age": 67.0, "hypertension": 1, "heart_disease": 1,
        "ever_married": 1, "work_type": "Private", "Residence_type": "Urban",
        "avg_glucose_level": 155.0, "bmi": 30.5, "smoking_status": "smokes"
    }
    stroke_res = predict_stroke(stroke_input)
    print(f"[PASS] Stroke Risk Model: Probability = {stroke_res['probability']}%, Level = {stroke_res['risk_level']}")
    assert 0 <= stroke_res["probability"] <= 100

    # 6. Evaluation Metrics & Confusion Matrices
    metrics = get_all_model_metrics()
    print(f"\n[PASS] Model Evaluation Metrics Loaded: {list(metrics.keys())}")
    for k, m in metrics.items():
        print(f"       - {m.get('name', k)}: Acc={m.get('accuracy', 'N/A')}, F1={m.get('f1_score', 'N/A')}")
    assert "heart_disease" in metrics
    assert "confusion_matrix" in metrics["heart_disease"]

    # 7. RAG Semantic Knowledge Search & Chatbot Test
    rag_query = "What are the warning signs of myocardial infarction and acute chest pain?"
    rag_answer = rag_service.generate_response(rag_query)
    print(f"\n[PASS] RAG Medical Response Generated: {len(rag_answer['content'])} characters.")
    print(f"       Sources Cited: {len(rag_answer['sources'])} items.")
    print(f"       Emergency Detected: {rag_answer['is_emergency']}")
    print(f"       Simplified Terms Found: {list(rag_answer['simplified_terms'].keys())}")
    assert len(rag_answer["sources"]) > 0
    assert len(rag_answer["simplified_terms"]) > 0

    # 8. Large-Scale Dataset Registry & Profiling Test
    datasets = get_registered_datasets_list()
    print(f"\n[PASS] Registered Medical Datasets: {len(datasets)} benchmark sources loaded.")
    for ds in datasets:
        print(f"       - {ds['name']}: {ds['record_count']} records, {ds['feature_count']} features, Quality={ds['quality_score']}%")
    assert len(datasets) >= 5

    # 9. Dataset Pagination & Profiling Deep Test (MIMIC-IV)
    mimic_detail = get_dataset_details("mimic-iv-icu", page=1, page_size=5)
    print(f"[PASS] MIMIC-IV ICU Cohort: {mimic_detail['summary']['record_count']} records profiled.")
    print(f"       Columns Profiled: {len(mimic_detail['columns'])}")
    print(f"       Sample Page Length: {len(mimic_detail['sample_records'])}")
    assert len(mimic_detail["sample_records"]) == 5

    # 10. Symptoms Catalog Test
    catalog = get_all_symptoms_catalog()
    total_syms = sum(len(cat["symptoms"]) for cat in catalog)
    print(f"\n[PASS] System Symptom Catalog: {len(catalog)} anatomical categories, {total_syms} total symptoms.")
    assert total_syms > 40

    print("\n==================================================")
    print(" ALL 10 CORE HEALTHCARE AI VERIFICATION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
