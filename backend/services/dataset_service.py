"""
Large-Scale Healthcare Dataset Management & Analytics Service
- Dataset Registry Management
- Comprehensive Data Profiling & Quality Auditing (Missing values, duplicates, outliers, types)
- Efficient Paginated Querying, Filtering, and Search
- Dynamic CSV/JSON Upload & Ingestion Pipeline
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "ml", "datasets")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Pre-registered benchmark medical datasets
STATIC_REGISTRY = [
    {
        "id": 1,
        "name": "MIMIC-IV Clinical ICU Cohort Benchmark",
        "slug": "mimic-iv-icu",
        "category": "Critical Care / ICU Informatics",
        "description": "De-identified electronic health records representing intensive care unit admissions at Beth Israel Deaconess Medical Center, tracking vitals (BP, SpO2, Heart Rate), lengths of stay, and 30-day outcomes.",
        "source": "PhysioNet / MIT Laboratory for Computational Physiology",
        "file_name": "mimic_iv_sample.csv",
        "file_type": "csv"
    },
    {
        "id": 2,
        "name": "UCI Cleveland Clinic Heart Disease Benchmark",
        "slug": "uci-heart-disease",
        "category": "Cardiology / Diagnostic Benchmark",
        "description": "Standard clinical machine learning benchmark database with 13 fluoroscopic, hemodynamic, and demographic biomarkers evaluating coronary artery disease presence.",
        "source": "UCI Machine Learning Repository / Cleveland Clinic Foundation",
        "file_name": "heart_disease.csv",
        "file_type": "csv"
    },
    {
        "id": 3,
        "name": "CDC BRFSS Diabetes Health Indicators",
        "slug": "cdc-diabetes-brfss",
        "category": "Epidemiology / Metabolic Health",
        "description": "Surveillance system survey data tracking behavioral risk factors, obesity indices, physical activity, hypertension, and diabetes diagnostic status.",
        "source": "Centers for Disease Control and Prevention (CDC)",
        "file_name": "diabetes_indicators.csv",
        "file_type": "csv"
    },
    {
        "id": 4,
        "name": "Multi-Condition Diagnostic Symptom Matrix",
        "slug": "disease-symptom-matrix",
        "category": "Clinical NLP / Diagnostic AI",
        "description": "Large-scale sparse diagnostic matrix encompassing 42 disease classifications across 126 binary clinical symptom indicators.",
        "source": "Columbia University / Kaggle Healthcare Data Hub",
        "file_name": "disease_symptoms.csv",
        "file_type": "csv"
    },
    {
        "id": 5,
        "name": "Cerebrovascular Stroke Risk Cohort",
        "slug": "stroke-risk-cohort",
        "category": "Neurology / Preventive Medicine",
        "description": "Clinical and demographic cohort dataset assessing stroke occurrence in relation to hypertension, heart disease, glucose levels, BMI, and lifestyle.",
        "source": "World Stroke Organization / Open Healthcare Data",
        "file_name": "stroke_data.csv",
        "file_type": "csv"
    },
    {
        "id": 6,
        "name": "MedQuAD Medical QA Clinical Knowledge Base",
        "slug": "medquad-medical-qa",
        "category": "NLP / Medical Question-Answering",
        "description": "Structured medical question-and-answer pairs curated from NIH institutes (NINDS, NIDDK, NHLBI, CDC) spanning disease etiology, treatments, and triage.",
        "source": "National Institutes of Health (NIH) / NLM",
        "file_name": "medquad_qa.json",
        "file_type": "json"
    }
]

def load_dataset_dataframe(file_name: str) -> pd.DataFrame:
    """Loads dataset from DATASET_DIR or UPLOADS_DIR."""
    path = os.path.join(DATASET_DIR, file_name)
    if not os.path.exists(path):
        path = os.path.join(UPLOADS_DIR, file_name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset file {file_name} not found.")

    if file_name.endswith(".csv"):
        return pd.read_csv(path)
    elif file_name.endswith(".json"):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return pd.DataFrame(data)
    else:
        raise ValueError("Unsupported file format. Please provide CSV or JSON.")

def compute_data_quality_profile(df: pd.DataFrame) -> dict:
    """Computes comprehensive data profiling and quality metrics."""
    total_records = len(df)
    total_features = len(df.columns)
    
    missing_by_col = df.isnull().sum().to_dict()
    total_missing = sum(missing_by_col.values())
    total_cells = max(1, total_records * total_features)
    missing_percentage = round((total_missing / total_cells) * 100, 2)
    
    duplicate_rows = int(df.duplicated().sum())
    duplicate_percentage = round((duplicate_rows / max(1, total_records)) * 100, 2)
    
    # Calculate overall quality score (0 to 100)
    quality_score = max(0.0, min(100.0, 100.0 - (missing_percentage * 2.0) - (duplicate_percentage * 0.5)))
    
    # Column metadata & distribution
    columns_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        col_missing = int(df[col].isnull().sum())
        unique_count = int(df[col].nunique())
        
        info = {
            "name": col,
            "dtype": dtype,
            "missing_count": col_missing,
            "unique_values": unique_count
        }
        
        # Summary statistics
        if pd.api.types.is_numeric_dtype(df[col]):
            clean_s = df[col].dropna()
            if not clean_s.empty:
                info["min"] = round(float(clean_s.min()), 2)
                info["max"] = round(float(clean_s.max()), 2)
                info["mean"] = round(float(clean_s.mean()), 2)
                info["median"] = round(float(clean_s.median()), 2)
                info["std"] = round(float(clean_s.std()), 2)
        else:
            top_vals = df[col].value_counts().head(3).to_dict()
            info["top_values"] = {str(k): int(v) for k, v in top_vals.items()}
            
        columns_info.append(info)
        
    return {
        "record_count": total_records,
        "feature_count": total_features,
        "total_missing_cells": total_missing,
        "missing_percentage": missing_percentage,
        "duplicate_rows": duplicate_rows,
        "quality_score": round(quality_score, 1),
        "columns_info": columns_info
    }

def get_registered_datasets_list() -> list[dict]:
    """Returns all registered datasets with live summary metrics."""
    results = []
    for ds in STATIC_REGISTRY:
        try:
            df = load_dataset_dataframe(ds["file_name"])
            total_missing = int(df.isnull().sum().sum())
            total_cells = max(1, len(df) * len(df.columns))
            quality_score = max(0.0, min(100.0, 100.0 - (total_missing / total_cells * 200.0)))
            
            results.append({
                "id": ds["id"],
                "name": ds["name"],
                "slug": ds["slug"],
                "category": ds["category"],
                "description": ds["description"],
                "source": ds["source"],
                "record_count": len(df),
                "feature_count": len(df.columns),
                "missing_values_count": total_missing,
                "quality_score": round(quality_score, 1),
                "status": "Active & Indexed",
                "updated_at": datetime.utcnow().isoformat()
            })
        except Exception as e:
            print(f"Error loading {ds['name']}: {e}")
    return results

def get_dataset_details(slug: str, page: int = 1, page_size: int = 20, search: str = None) -> dict:
    """Returns dataset summary, quality profile, and paginated records."""
    target_ds = next((ds for ds in STATIC_REGISTRY if ds["slug"] == slug), None)
    if not target_ds:
        raise ValueError(f"Dataset with slug '{slug}' not found.")
        
    df = load_dataset_dataframe(target_ds["file_name"])
    
    # Optional search across string columns
    if search:
        search_lower = search.lower()
        mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(search_lower).any(), axis=1)
        df_filtered = df[mask]
    else:
        df_filtered = df

    profile = compute_data_quality_profile(df)
    
    # Paginate
    total_filtered = len(df_filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_records = df_filtered.iloc[start_idx:end_idx].replace({np.nan: None}).to_dict(orient="records")
    
    summary = {
        "id": target_ds["id"],
        "name": target_ds["name"],
        "slug": target_ds["slug"],
        "category": target_ds["category"],
        "description": target_ds["description"],
        "source": target_ds["source"],
        "record_count": len(df),
        "feature_count": len(df.columns),
        "missing_values_count": profile["total_missing_cells"],
        "quality_score": profile["quality_score"],
        "status": "Active & Indexed",
        "updated_at": datetime.utcnow().isoformat()
    }
    
    return {
        "summary": summary,
        "profile": profile,
        "columns": profile["columns_info"],
        "sample_records": page_records,
        "total_records": total_filtered,
        "page": page,
        "page_size": page_size
    }
