from fastapi import APIRouter, UploadFile, File
import os
import shutil
from app.ml.detector import PersonDetector

router = APIRouter(prefix="/detect", tags=["Detection"])

# Initialize YOLO detector once
detector = PersonDetector()

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def detect_person(file: UploadFile = File(...)):
    """
    Endpoint: /detect/
    Upload an image → Detect persons → Return list of cropped detections.
    """
    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run person detection (creates its own session folder)
    detections = detector.detect_persons(file_path)

    return {
        "message": "Detection completed successfully",
        "detections_count": len(detections),
        "detections": detections
    }
