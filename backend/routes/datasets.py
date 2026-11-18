"""
Healthcare Dataset Management & Explorer API Endpoints
"""

import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
import pandas as pd
from ..services.dataset_service import (
    get_registered_datasets_list, get_dataset_details,
    UPLOADS_DIR, compute_data_quality_profile, STATIC_REGISTRY
)

router = APIRouter(prefix="/api/datasets", tags=["Healthcare Dataset Explorer"])

@router.get("/")
def list_datasets():
    """Lists all active and indexed large-scale medical datasets with live quality metrics."""
    return get_registered_datasets_list()

@router.get("/{slug}")
def get_dataset(
    slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    """Fetches dataset metadata, data quality report, and paginated records."""
    try:
        details = get_dataset_details(slug, page=page, page_size=page_size, search=search)
        return details
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")

@router.post("/upload")
async def upload_custom_dataset(
    file: UploadFile = File(...)
):
    """Uploads a healthcare CSV dataset, computes quality statistics, and indexes it."""
    if not file.filename.endswith((".csv", ".json")):
        raise HTTPException(status_code=400, detail="Only CSV or JSON datasets are supported.")

    file_path = os.path.join(UPLOADS_DIR, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_json(file_path)

        profile = compute_data_quality_profile(df)
        
        # Add to runtime registry
        new_id = len(STATIC_REGISTRY) + 1
        slug = file.filename.split(".")[0].lower().replace(" ", "-")
        custom_entry = {
            "id": new_id,
            "name": file.filename.replace("_", " ").title(),
            "slug": slug,
            "category": "User Uploaded Cohort",
            "description": f"Custom uploaded dataset containing {len(df)} records and {len(df.columns)} features.",
            "source": "Clinical User Upload",
            "file_name": file.filename,
            "file_type": "csv" if file.filename.endswith(".csv") else "json"
        }
        STATIC_REGISTRY.append(custom_entry)

        return {
            "message": "Dataset uploaded and profiled successfully.",
            "dataset": custom_entry,
            "profile": profile
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to process dataset: {str(e)}")
