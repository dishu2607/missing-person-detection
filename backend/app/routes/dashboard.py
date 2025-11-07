from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import re
import cv2
from datetime import datetime
from app.routes import video_serve  # ✅ reuse your working routes

# ----------------------------------------------------------------
# Router setup
# ----------------------------------------------------------------
router = APIRouter()
router.include_router(video_serve.router, prefix="/videos", tags=["Video Serving"])

# ----------------------------------------------------------------
# Paths & DB
# ----------------------------------------------------------------
DATA_DIR = Path("app/data")
UPLOADS_DIR = DATA_DIR / "uploads"
OUTPUTS_DIR = DATA_DIR / "outputs"
VIDEOS_DIR = UPLOADS_DIR / "videos"

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client[os.getenv("DB_NAME", "missing_person_db")]

# ----------------------------------------------------------------
# Helper Functions
# ----------------------------------------------------------------
def parse_ts(ts):
    try:
        return datetime.strptime(ts, "%Y%m%d_%H%M%S").timestamp()
    except Exception:
        return 0

def find_video_file(job_dir: Path):
    if not job_dir.exists():
        return None
    video_exts = [".mp4", ".avi", ".mov", ".mkv", ".MP4", ".AVI", ".MOV"]
    for file in job_dir.iterdir():
        if file.suffix in video_exts:
            return file
    return None

def get_video_metadata(job_id: str):
    job_dir = VIDEOS_DIR / job_id
    if not job_dir.exists():
        return None
    video_path = find_video_file(job_dir)
    if not video_path:
        return None
    cap = cv2.VideoCapture(str(video_path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    dur = frames / fps if fps > 0 else 0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    return {
        "job_id": job_id,
        "filename": video_path.name,
        "fps": round(fps, 2),
        "frame_count": frames,
        "duration_seconds": round(dur, 2),
        "resolution": f"{width}x{height}",
    }

@router.get("/stats")
async def get_dashboard_stats():
    """
    Provide live counts for dashboard cards.
    """
    import time

    # Ensure directories exist
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

    total_refs = len([f for f in UPLOADS_DIR.iterdir() if f.is_file() and f.suffix.lower() in [".jpg", ".jpeg", ".png"]])
    total_videos = len([f for f in VIDEOS_DIR.glob("*/**/*.mp4")])
    total_person_folders = len([f for f in OUTPUTS_DIR.iterdir() if f.is_dir() and f.name.startswith("persons_")])

    return {
        "total_references": total_refs,
        "total_videos": total_videos,
        "total_detections": total_person_folders,
        "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")
    }


# ----------------------------------------------------------------
# /dashboard/recent-searches
# ----------------------------------------------------------------
@router.get("/recent-searches")
async def get_recent_searches():
    if not UPLOADS_DIR.exists():
        return []
    refs = sorted(
        [f for f in UPLOADS_DIR.glob("*.jpg")],
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )
    data = []
    for ref in refs:
        ref_name = ref.name
        ref_time = re.search(r"(\d{8}_\d{6})", ref_name)
        ref_time = ref_time.group(1) if ref_time else ref_name

        # try DB metadata
        doc = db.reference_images.find_one({"filename": ref_name})
        gender = doc.get("gender", "Unknown") if doc else "Unknown"
        age = doc.get("age", "Unknown") if doc else "Unknown"

        # persons_ / frames_ folders
        persons_dir = OUTPUTS_DIR / f"persons_{ref_time}"
        frames_dir = OUTPUTS_DIR / f"frames_{ref_time}"
        frames_processed = len(list(frames_dir.glob("*.jpg"))) if frames_dir.exists() else 0
        matches = len(list(persons_dir.glob("*.jpg"))) if persons_dir.exists() else 0

        # job lookup via Mongo
        job_doc = db.video_jobs.find_one(
            {"detections.crop_path": {"$regex": f"persons_{ref_time}"}}
        )
        job_id = job_doc["job_id"] if job_doc else None

        data.append({
            "reference_id": ref_time,
            "reference_image": ref_name,
            "reference_path": f"/uploads/{ref_name}",
            "gender": gender,
            "age": age,
            "frames_processed": frames_processed,
            "match_count": matches,
            "top_match_score": 0.8 if matches else 0.0,
            "job_id": job_id,
        })
    return data



# ----------------------------------------------------------------
# /dashboard/reference/{ref_time}
# ----------------------------------------------------------------
@router.get("/reference/{ref_time}")
async def get_reference_details(ref_time: str):
    """
    Return details for a given reference upload:
    - mapped persons_* folder
    - matched video via job_id
    - all detections with timestamps
    - reference image path
    """
    from datetime import datetime
    import re

    def parse_dt(ts: str):
        try:
            return datetime.strptime(ts, "%Y%m%d_%H%M%S").timestamp()
        except Exception:
            return 0

    # --- 1️⃣ Find closest persons_* folder ---
    persons_folders = [f for f in OUTPUTS_DIR.iterdir() if f.is_dir() and f.name.startswith("persons_")]
    if not persons_folders:
        raise HTTPException(status_code=404, detail="No persons_* folders found")

    ref_ts = parse_dt(ref_time)
    closest_folder = min(persons_folders, key=lambda f: abs(parse_dt(f.name.replace("persons_", "")) - ref_ts))
    persons_dir = closest_folder
    print(f"✅ Mapped reference {ref_time} → {persons_dir.name}")

    # --- 2️⃣ Try to get job_id from DB ---
    job_id = None
    job_doc = None
    try:
        job_doc = db.video_jobs.find_one({"detections.crop_path": {"$regex": persons_dir.name}})
        if job_doc:
            job_id = job_doc.get("job_id")
            print(f"🎬 Found job_id: {job_id}")
    except Exception as e:
        print(f"⚠️ Mongo lookup failed: {e}")

    # --- 3️⃣ Fallback: use latest available job ---
    if not job_id and VIDEOS_DIR.exists():
        job_dirs = sorted(VIDEOS_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True)
        if job_dirs:
            job_id = job_dirs[0].name
            print(f"⚙️ Using fallback job_id: {job_id}")

    if not job_id:
        raise HTTPException(status_code=404, detail="No matching video job found")

    # --- 4️⃣ Fetch video info ---
    try:
        video_info_url = f"http://127.0.0.1:8000/videos/info/{job_id}"
        import requests
        res = requests.get(video_info_url)
        video_metadata = res.json() if res.status_code == 200 else None
    except Exception as e:
        print(f"⚠️ Video info fetch failed: {e}")
        video_metadata = None

    fps = float(video_metadata["fps"]) if video_metadata and video_metadata.get("fps") else 30.0

    # --- 5️⃣ Build detections list ---
    detections = []
    frame_numbers = sorted([
        int(re.search(r"frame[_\-]?(\d+)", f.name).group(1))
        for f in persons_dir.glob("*.jpg")
        if re.search(r"frame[_\-]?(\d+)", f.name)
    ])
    for fnum in frame_numbers:
        detections.append({
            "frame_number": fnum,
            "timestamp": round(fnum / fps, 2),
            "job_id": job_id,
            "thumbnail": f"/videos/thumbnail/{job_id}?frame_number={fnum}",
            "video_stream": f"/videos/stream/{job_id}?start_time={int(fnum / fps)}"
        })

    print(f"🧩 Total detections for {ref_time}: {len(detections)}")

    # --- 6️⃣ Reference image ---
    ref_image_file = next((f for f in UPLOADS_DIR.iterdir() if f.name.startswith(ref_time)), None)
    if not ref_image_file:
        raise HTTPException(status_code=404, detail="Reference image not found")

    return {
        "reference_time": ref_time,
        "job_id": job_id,
        "reference_image": ref_image_file.name,
        "reference_path": f"/uploads/{ref_image_file.name}",
        "video_metadata": video_metadata,
        "match_count": len(detections),
        "matches": detections
    }
