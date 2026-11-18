"""
Machine Learning Predictive Analytics Service
- Cardiovascular Heart Disease Risk Predictor
- Type 2 Diabetes Risk Predictor
- Cerebrovascular Stroke Risk Predictor
- Full Model Evaluation Metrics, Confusion Matrices, and Feature Importance Rankings
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
METRICS_PATH = os.path.join(MODELS_DIR, "model_metrics.json")

# Model Paths
HEART_MODEL_PATH = os.path.join(MODELS_DIR, "heart_disease_model.joblib")
DIABETES_MODEL_PATH = os.path.join(MODELS_DIR, "diabetes_model.joblib")
STROKE_MODEL_PATH = os.path.join(MODELS_DIR, "stroke_model.joblib")

# Load Metrics JSON
def get_all_model_metrics() -> dict:
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading model metrics: {e}")
    return {}

# ---------------------------------------------------------------------------
# Heart Disease Prediction
# ---------------------------------------------------------------------------
def predict_heart_disease(inputs: dict) -> dict:
    """Predicts heart disease risk using trained Cleveland Clinic Random Forest model."""
    if not os.path.exists(HEART_MODEL_PATH):
        raise FileNotFoundError("Heart disease model artifact not found.")

    artifact = joblib.load(HEART_MODEL_PATH)
    pipeline = artifact["pipeline"]
    feature_names = artifact["features"]

    df_in = pd.DataFrame([inputs])[feature_names]
    prob = float(pipeline.predict_proba(df_in)[0, 1])
    prob_percent = round(prob * 100, 1)

    # Determine risk category
    if prob_percent >= 70:
        risk_level = "High Risk"
    elif prob_percent >= 40:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    # Identify primary risk contributors
    risk_factors = []
    if inputs.get("trestbps", 0) >= 140:
        risk_factors.append(f"Elevated Resting Blood Pressure ({inputs['trestbps']} mmHg - Stage 2 Hypertension)")
    if inputs.get("chol", 0) >= 240:
        risk_factors.append(f"Hypercholesterolemia ({inputs['chol']} mg/dL - High Total Cholesterol)")
    if inputs.get("thalach", 150) < 120 and inputs.get("age", 50) > 45:
        risk_factors.append(f"Blunted Max Heart Rate Reserve ({inputs['thalach']} bpm)")
    if inputs.get("exang", 0) == 1:
        risk_factors.append("Exercise-Induced Angina (Myocardial Ischemia Indicator)")
    if inputs.get("oldpeak", 0) >= 2.0:
        risk_factors.append(f"Significant ST Depression on ECG ({inputs['oldpeak']} mm)")
    if inputs.get("ca", 0) > 0:
        risk_factors.append(f"Coronary Calcification ({inputs['ca']} major vessels colored on fluoroscopy)")

    if not risk_factors:
        risk_factors.append("Biomarkers within expected standard baseline ranges.")

    recommendations = [
        "Schedule an in-person resting ECG and clinical cardiology review.",
        "Maintain dietary sodium < 2,000 mg/day (DASH diet protocol).",
        "Target LDL cholesterol < 100 mg/dL (or < 70 mg/dL for high cardiovascular risk).",
        "Engage in 150 minutes of moderate-intensity aerobic cardiovascular exercise weekly."
    ]

    disclaimer = (
        "Educational & Research Demonstration Only: This prediction is based on statistical machine learning "
        "trained on the UCI Cleveland Clinic cohort. It is NOT a medical diagnosis and cannot confirm heart disease."
    )

    return {
        "model_name": "Cardiovascular Heart Disease Risk Predictor (Random Forest)",
        "probability": prob_percent,
        "risk_level": risk_level,
        "primary_risk_factors": risk_factors,
        "recommendations": recommendations,
        "disclaimer": disclaimer
    }

# ---------------------------------------------------------------------------
# Diabetes Prediction
# ---------------------------------------------------------------------------
def predict_diabetes(inputs: dict) -> dict:
    """Predicts Type 2 Diabetes risk using trained CDC BRFSS Random Forest model."""
    if not os.path.exists(DIABETES_MODEL_PATH):
        raise FileNotFoundError("Diabetes model artifact not found.")

    artifact = joblib.load(DIABETES_MODEL_PATH)
    pipeline = artifact["pipeline"]
    feature_names = artifact["features"]

    df_in = pd.DataFrame([inputs])[feature_names]
    prob = float(pipeline.predict_proba(df_in)[0, 1])
    prob_percent = round(prob * 100, 1)

    if prob_percent >= 65:
        risk_level = "High Risk"
    elif prob_percent >= 35:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    risk_factors = []
    if inputs.get("BMI", 0) >= 30:
        risk_factors.append(f"Class I+ Obesity (BMI {inputs['BMI']} kg/m2 - high insulin resistance link)")
    elif inputs.get("BMI", 0) >= 25:
        risk_factors.append(f"Overweight BMI ({inputs['BMI']} kg/m2)")
    if inputs.get("HighBP", 0) == 1:
        risk_factors.append("Diagnosed Hypertension (Associated metabolic syndrome component)")
    if inputs.get("HighChol", 0) == 1:
        risk_factors.append("High Blood Cholesterol / Dyslipidemia")
    if inputs.get("PhysActivity", 0) == 0:
        risk_factors.append("Physical Inactivity / Sedentary Lifestyle")
    if inputs.get("GenHlth", 1) >= 4:
        risk_factors.append("Fair/Poor Self-Assessed Overall Health Status")

    if not risk_factors:
        risk_factors.append("Standard metabolic biomarker baseline.")

    recommendations = [
        "Request a laboratory Fasting Plasma Glucose (FPG) and Glycated Hemoglobin (HbA1c) screening test.",
        "Emphasize a low-glycemic Mediterranean or high-fiber whole food nutrition plan.",
        "Incorporate 30 minutes of daily physical activity (e.g. brisk walking) to improve insulin sensitivity.",
        "Maintain regular routine wellness checkups with your primary care provider."
    ]

    disclaimer = (
        "Educational & Research Demonstration Only: Model predictions reflect statistical associations "
        "from the CDC BRFSS dataset. Only licensed laboratory blood assays can confirm diabetes."
    )

    return {
        "model_name": "Type-2 Diabetes Risk Predictor (CDC BRFSS Random Forest)",
        "probability": prob_percent,
        "risk_level": risk_level,
        "primary_risk_factors": risk_factors,
        "recommendations": recommendations,
        "disclaimer": disclaimer
    }

# ---------------------------------------------------------------------------
# Stroke Prediction
# ---------------------------------------------------------------------------
def predict_stroke(inputs: dict) -> dict:
    """Predicts Cerebrovascular Stroke risk using trained multi-feature pipeline."""
    if not os.path.exists(STROKE_MODEL_PATH):
        raise FileNotFoundError("Stroke model artifact not found.")

    artifact = joblib.load(STROKE_MODEL_PATH)
    pipeline = artifact["pipeline"]
    feature_names = artifact["features"]

    df_in = pd.DataFrame([inputs])[feature_names]
    prob = float(pipeline.predict_proba(df_in)[0, 1])
    prob_percent = round(prob * 100, 1)

    if prob_percent >= 50:
        risk_level = "High Risk"
    elif prob_percent >= 25:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    risk_factors = []
    if inputs.get("age", 0) >= 60:
        risk_factors.append(f"Age Indicator ({inputs['age']} years - primary non-modifiable risk factor)")
    if inputs.get("hypertension", 0) == 1:
        risk_factors.append("Diagnosed Chronic Hypertension (Leading modifiable stroke risk factor)")
    if inputs.get("heart_disease", 0) == 1:
        risk_factors.append("Pre-existing Heart Disease (Cardioembolic stroke risk)")
    if inputs.get("avg_glucose_level", 0) >= 140:
        risk_factors.append(f"Elevated Serum Glucose ({inputs['avg_glucose_level']} mg/dL)")
    if inputs.get("smoking_status") == "smokes":
        risk_factors.append("Active Tobacco Smoking (Accelerates carotid atherosclerosis)")

    if not risk_factors:
        risk_factors.append("Standard cerebrovascular baseline profile.")

    recommendations = [
        "Maintain strict blood pressure control (target < 120/80 mmHg).",
        "Familiarize yourself and family members with the FAST stroke warning protocol.",
        "Undergo carotid artery ultrasound screening if recommended by your physician.",
        "Avoid tobacco smoking and maintain moderate physical activity."
    ]

    disclaimer = (
        "Educational & Research Demonstration Only: Model predictions reflect population risk patterns "
        "and do not constitute an individual neurological evaluation."
    )

    return {
        "model_name": "Cerebrovascular Stroke Risk Predictor (Random Forest)",
        "probability": prob_percent,
        "risk_level": risk_level,
        "primary_risk_factors": risk_factors,
        "recommendations": recommendations,
        "disclaimer": disclaimer
    }
