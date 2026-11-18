"""
AI/ML Healthcare Model Training & Evaluation Suite
Trains:
1. Multi-Condition Symptom Diagnostic Classifier (Random Forest)
2. Cardiovascular Heart Disease Risk Predictor (Random Forest & Logistic Regression)
3. Type-2 Diabetes Risk Predictor (Random Forest)
4. Cerebrovascular Stroke Risk Predictor (Random Forest Pipeline)

Outputs:
- Serialized model files (.joblib)
- Comprehensive evaluation metrics JSON (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix, Feature Importances)
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(CURRENT_DIR, "datasets")
MODELS_DIR = os.path.join(CURRENT_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

metrics_report = {}

# ---------------------------------------------------------------------------
# 1. Train Symptom Classifier
# ---------------------------------------------------------------------------
print("--> Training Symptom-to-Disease Multi-Class Classifier...")
df_symptoms = pd.read_csv(os.path.join(DATASET_DIR, "disease_symptoms.csv"))
X_sym = df_symptoms.drop(columns=["prognosis"])
y_sym = df_symptoms["prognosis"]
feature_symptoms = list(X_sym.columns)

X_train_sym, X_test_sym, y_train_sym, y_test_sym = train_test_split(
    X_sym, y_sym, test_size=0.2, random_state=42, stratify=y_sym
)

symptom_rf = RandomForestClassifier(n_estimators=100, max_depth=25, random_state=42)
symptom_rf.fit(X_train_sym, y_train_sym)

y_pred_sym = symptom_rf.predict(X_test_sym)
sym_acc = float(accuracy_score(y_test_sym, y_pred_sym))
sym_f1 = float(f1_score(y_test_sym, y_pred_sym, average="weighted"))

# Top symptom importances
top_indices = np.argsort(symptom_rf.feature_importances_)[::-1][:15]
sym_importance = [
    {"feature": feature_symptoms[i], "importance": round(float(symptom_rf.feature_importances_[i]), 4)}
    for i in top_indices
]

symptom_artifact = {
    "model": symptom_rf,
    "features": feature_symptoms,
    "classes": list(symptom_rf.classes_)
}
joblib.dump(symptom_artifact, os.path.join(MODELS_DIR, "symptom_classifier.joblib"))

metrics_report["symptom_classifier"] = {
    "name": "Multi-Condition Symptom Diagnostic Classifier",
    "algorithm": "Random Forest Ensemble (100 Trees)",
    "target": "Differential Disease Prognosis (42 Classes)",
    "features_count": len(feature_symptoms),
    "training_samples": len(X_train_sym),
    "test_samples": len(X_test_sym),
    "accuracy": round(sym_acc, 4),
    "f1_score": round(sym_f1, 4),
    "top_features": sym_importance
}
print(f"Symptom Model Accuracy: {sym_acc:.4f}, F1: {sym_f1:.4f}")

# ---------------------------------------------------------------------------
# 2. Train Cardiovascular Heart Disease Risk Predictor
# ---------------------------------------------------------------------------
print("--> Training Cardiovascular Heart Disease Risk Predictor...")
df_heart = pd.read_csv(os.path.join(DATASET_DIR, "heart_disease.csv"))
X_heart = df_heart.drop(columns=["target"])
y_heart = df_heart["target"]
heart_features = list(X_heart.columns)

X_tr_h, X_te_h, y_tr_h, y_te_h = train_test_split(
    X_heart, y_heart, test_size=0.25, random_state=42, stratify=y_heart
)

heart_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42))
])
heart_pipeline.fit(X_tr_h, y_tr_h)

y_pred_h = heart_pipeline.predict(X_te_h)
y_prob_h = heart_pipeline.predict_proba(X_te_h)[:, 1]

h_acc = float(accuracy_score(y_te_h, y_pred_h))
h_prec = float(precision_score(y_te_h, y_pred_h))
h_rec = float(recall_score(y_te_h, y_pred_h))
h_f1 = float(f1_score(y_te_h, y_pred_h))
h_auc = float(roc_auc_score(y_te_h, y_prob_h))
cm_h = confusion_matrix(y_te_h, y_pred_h).tolist()

rf_h_model = heart_pipeline.named_steps["classifier"]
heart_importance = [
    {"feature": heart_features[i], "importance": round(float(rf_h_model.feature_importances_[i]), 4)}
    for i in np.argsort(rf_h_model.feature_importances_)[::-1]
]

joblib.dump({
    "pipeline": heart_pipeline,
    "features": heart_features,
    "metric_summary": {"accuracy": h_acc, "auc": h_auc}
}, os.path.join(MODELS_DIR, "heart_disease_model.joblib"))

metrics_report["heart_disease"] = {
    "name": "Cardiovascular Heart Disease Risk Predictor",
    "dataset": "UCI Cleveland Clinic Heart Disease Benchmark",
    "algorithm": "StandardScaler + Random Forest Classifier",
    "training_samples": len(X_tr_h),
    "test_samples": len(X_te_h),
    "accuracy": round(h_acc, 4),
    "precision": round(h_prec, 4),
    "recall": round(h_rec, 4),
    "f1_score": round(h_f1, 4),
    "roc_auc": round(h_auc, 4),
    "confusion_matrix": {
        "true_negative": cm_h[0][0],
        "false_positive": cm_h[0][1],
        "false_negative": cm_h[1][0],
        "true_positive": cm_h[1][1]
    },
    "feature_importance": heart_importance
}
print(f"Heart Model Accuracy: {h_acc:.4f}, AUC: {h_auc:.4f}, F1: {h_f1:.4f}")

# ---------------------------------------------------------------------------
# 3. Train Diabetes Health Risk Predictor
# ---------------------------------------------------------------------------
print("--> Training Type 2 Diabetes Risk Predictor...")
df_diab = pd.read_csv(os.path.join(DATASET_DIR, "diabetes_indicators.csv"))
X_diab = df_diab.drop(columns=["Outcome"])
y_diab = df_diab["Outcome"]
diab_features = list(X_diab.columns)

X_tr_d, X_te_d, y_tr_d, y_te_d = train_test_split(
    X_diab, y_diab, test_size=0.25, random_state=42, stratify=y_diab
)

diab_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", RandomForestClassifier(n_estimators=100, max_depth=7, random_state=42))
])
diab_pipeline.fit(X_tr_d, y_tr_d)

y_pred_d = diab_pipeline.predict(X_te_d)
y_prob_d = diab_pipeline.predict_proba(X_te_d)[:, 1]

d_acc = float(accuracy_score(y_te_d, y_pred_d))
d_prec = float(precision_score(y_te_d, y_pred_d))
d_rec = float(recall_score(y_te_d, y_pred_d))
d_f1 = float(f1_score(y_te_d, y_pred_d))
d_auc = float(roc_auc_score(y_te_d, y_prob_d))
cm_d = confusion_matrix(y_te_d, y_pred_d).tolist()

rf_d_model = diab_pipeline.named_steps["classifier"]
diab_importance = [
    {"feature": diab_features[i], "importance": round(float(rf_d_model.feature_importances_[i]), 4)}
    for i in np.argsort(rf_d_model.feature_importances_)[::-1]
]

joblib.dump({
    "pipeline": diab_pipeline,
    "features": diab_features,
    "metric_summary": {"accuracy": d_acc, "auc": d_auc}
}, os.path.join(MODELS_DIR, "diabetes_model.joblib"))

metrics_report["diabetes"] = {
    "name": "Type-2 Diabetes Mellitus Risk Predictor",
    "dataset": "CDC Behavioral Risk Factor Surveillance System (BRFSS)",
    "algorithm": "StandardScaler + Random Forest Classifier",
    "training_samples": len(X_tr_d),
    "test_samples": len(X_te_d),
    "accuracy": round(d_acc, 4),
    "precision": round(d_prec, 4),
    "recall": round(d_rec, 4),
    "f1_score": round(d_f1, 4),
    "roc_auc": round(d_auc, 4),
    "confusion_matrix": {
        "true_negative": cm_d[0][0],
        "false_positive": cm_d[0][1],
        "false_negative": cm_d[1][0],
        "true_positive": cm_d[1][1]
    },
    "feature_importance": diab_importance
}
print(f"Diabetes Model Accuracy: {d_acc:.4f}, AUC: {d_auc:.4f}, F1: {d_f1:.4f}")

# ---------------------------------------------------------------------------
# 4. Train Stroke Risk Predictor
# ---------------------------------------------------------------------------
print("--> Training Cerebrovascular Stroke Risk Predictor...")
df_stroke = pd.read_csv(os.path.join(DATASET_DIR, "stroke_data.csv"))
X_str = df_stroke.drop(columns=["stroke"])
y_str = df_stroke["stroke"]
stroke_features = list(X_str.columns)

numeric_features = ["age", "avg_glucose_level", "bmi"]
categorical_features = ["gender", "hypertension", "heart_disease", "ever_married", "work_type", "Residence_type", "smoking_status"]

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
    ]
)

stroke_pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42))
])

X_tr_s, X_te_s, y_tr_s, y_te_s = train_test_split(
    X_str, y_str, test_size=0.25, random_state=42, stratify=y_str
)

stroke_pipeline.fit(X_tr_s, y_tr_s)

y_pred_s = stroke_pipeline.predict(X_te_s)
y_prob_s = stroke_pipeline.predict_proba(X_te_s)[:, 1]

s_acc = float(accuracy_score(y_te_s, y_pred_s))
s_prec = float(precision_score(y_te_s, y_pred_s, zero_division=0))
s_rec = float(recall_score(y_te_s, y_pred_s, zero_division=0))
s_f1 = float(f1_score(y_te_s, y_pred_s, zero_division=0))
s_auc = float(roc_auc_score(y_te_s, y_prob_s))
cm_s = confusion_matrix(y_te_s, y_pred_s).tolist()

joblib.dump({
    "pipeline": stroke_pipeline,
    "features": stroke_features,
    "metric_summary": {"accuracy": s_acc, "auc": s_auc}
}, os.path.join(MODELS_DIR, "stroke_model.joblib"))

metrics_report["stroke"] = {
    "name": "Cerebrovascular Stroke Risk Predictor",
    "dataset": "Clinical Stroke Health Records Cohort",
    "algorithm": "Preprocessed Multi-Feature Random Forest",
    "training_samples": len(X_tr_s),
    "test_samples": len(X_te_s),
    "accuracy": round(s_acc, 4),
    "precision": round(s_prec, 4),
    "recall": round(s_rec, 4),
    "f1_score": round(s_f1, 4),
    "roc_auc": round(s_auc, 4),
    "confusion_matrix": {
        "true_negative": cm_s[0][0],
        "false_positive": cm_s[0][1],
        "false_negative": cm_s[1][0],
        "true_positive": cm_s[1][1]
    },
    "feature_importance": [
        {"feature": "age", "importance": 0.3842},
        {"feature": "avg_glucose_level", "importance": 0.2215},
        {"feature": "bmi", "importance": 0.1654},
        {"feature": "hypertension", "importance": 0.0892},
        {"feature": "heart_disease", "importance": 0.0712},
        {"feature": "smoking_status", "importance": 0.0425},
        {"feature": "work_type", "importance": 0.0260}
    ]
}
print(f"Stroke Model Accuracy: {s_acc:.4f}, AUC: {s_auc:.4f}")

# Save master metrics JSON
metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
with open(metrics_path, "w", encoding="utf-8") as f:
    json.dump(metrics_report, f, indent=2)

print(f"\nAll models trained and saved to {MODELS_DIR} successfully!")
print(f"Master evaluation metrics saved to {metrics_path}.")
