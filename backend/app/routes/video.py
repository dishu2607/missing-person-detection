# app/routes/video.py
import os
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from app.ml.pipeline import VideoProcessingPipeline
from pymongo import MongoClient
from dotenv import load_dotenv
import uuid

load_dotenv()

router = APIRouter()

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Base folder to save uploaded videos
BASE_VIDEO_DIR = "app/data/uploads/videos"
os.makedirs(BASE_VIDEO_DIR, exist_ok=True)

# Initialize pipeline
pipeline = VideoProcessingPipeline()

@router.post("/upload")
async def upload_video(video: UploadFile = File(...), metadata: dict = {}):
    """
    Uploads a video and runs the detection + embedding pipeline.
    metadata: optional dictionary with info like camera location, time, etc.
    """
    # Generate unique job ID
    job_id = str(uuid.uuid4())

    # Save uploaded video
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_folder = os.path.join(BASE_VIDEO_DIR, f"{job_id}_{timestamp}")
    os.makedirs(video_folder, exist_ok=True)

    video_path = os.path.join(video_folder, video.filename)
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    # Run pipeline safely
    try:
        result = pipeline.process_video(video_path, metadata=metadata, job_id=job_id)
    except Exception as e:
        return {"error": f"Pipeline failed: {str(e)}"}

    # Ensure detections key exists
    if "detections" not in result:
        result["detections"] = []

    # Save job info in MongoDB
    job_doc = {
        "job_id": job_id,
        "video_name": video.filename,
        "video_path": video_path,
        "frames_saved": result["frames_saved"],
        "persons_saved": result["persons_saved"],
        "detections": result["detections"],
        "metadata": metadata,
        "created_at": datetime.utcnow()
    }
    db.video_jobs.insert_one(job_doc)

    return {
        "message": "Video uploaded and processed successfully",
        "job_id": job_id,
        "frames_saved": job_doc["frames_saved"],
        "persons_saved": job_doc["persons_saved"],
        "detections_count": len(result["detections"])
    }
