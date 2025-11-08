from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
import os
from pathlib import Path
import cv2

router = APIRouter()

# Videos are stored in subdirectories: app/data/uploads/videos/{job_id}/video.mp4
VIDEO_BASE_DIR = Path("app/data/uploads/videos")

@router.get("/stream/{job_id}")
async def stream_video(
    job_id: str,
    start_time: int = Query(0, description="Start time in seconds")
):
    """
    Stream video file by job_id with optional start time
    Videos are stored in: app/data/uploads/videos/{job_id}/
    """
    print(f"🎬 Video stream request for job_id: {job_id}")
    
    # The video is inside a folder named by job_id
    job_dir = VIDEO_BASE_DIR / job_id
    print(f"   Looking in directory: {job_dir.absolute()}")
    
    if not job_dir.exists():
        print(f"❌ Job directory does not exist: {job_dir.absolute()}")
        raise HTTPException(
            status_code=404, 
            detail=f"Video folder not found for job_id: {job_id}"
        )
    
    # List files in job directory
    files_in_dir = list(job_dir.glob("*"))
    print(f"   Files in job directory: {[f.name for f in files_in_dir]}")
    
    # Try to find video file (usually named after original or just "video")
    video_path = None
    
    # Try common video filenames
    possible_names = [
        "video",           # Generic name
        job_id,            # Named after job_id
        "output",          # Sometimes named output
        "processed",       # Sometimes named processed
    ]
    
    for base_name in possible_names:
        for ext in ['.mp4', '.avi', '.mov', '.mkv', '.MP4', '.AVI', '.MOV']:
            potential_path = job_dir / f"{base_name}{ext}"
            if potential_path.exists():
                video_path = potential_path
                print(f"   ✅ Found video: {video_path}")
                break
        if video_path:
            break
    
    # If still not found, just get the first video file in the directory
    if not video_path:
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.MP4', '.AVI', '.MOV']
        for file in job_dir.iterdir():
            if file.is_file() and file.suffix in video_extensions:
                video_path = file
                print(f"   ✅ Found video by extension: {video_path}")
                break
    
    if not video_path or not video_path.exists():
        print(f"❌ Video file not found in directory: {job_dir}")
        raise HTTPException(
            status_code=404, 
            detail=f"Video file not found in {job_id} directory. Files present: {[f.name for f in files_in_dir]}"
        )
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        headers={
            "Accept-Ranges": "bytes",
            "Content-Disposition": f"inline; filename={video_path.name}"
        }
    )

@router.get("/thumbnail/{job_id}")
async def get_video_thumbnail(
    job_id: str,
    frame_number: int = Query(0, description="Frame number to capture")
):
    """
    Generate thumbnail from video at specific frame
    """
    print(f"🖼️ Thumbnail request for job_id: {job_id}, frame: {frame_number}")
    
    job_dir = VIDEO_BASE_DIR / job_id
    
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail=f"Video folder not found: {job_id}")
    
    # Find video file
    video_path = None
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.MP4', '.AVI', '.MOV']
    for file in job_dir.iterdir():
        if file.is_file() and file.suffix in video_extensions:
            video_path = file
            break
    
    if not video_path:
        raise HTTPException(status_code=404, detail=f"Video file not found in {job_id}")
    
    # Extract frame
    cap = cv2.VideoCapture(str(video_path))
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        raise HTTPException(status_code=404, detail="Could not extract frame")
    
    # Encode as JPEG
    _, buffer = cv2.imencode('.jpg', frame)
    
    return StreamingResponse(
        iter([buffer.tobytes()]),
        media_type="image/jpeg"
    )

@router.get("/info/{job_id}")
async def get_video_info(job_id: str):
    """
    Get video metadata (duration, fps, resolution)
    ✅ Returns real FPS, frame count, and duration.
    """
    job_dir = VIDEO_BASE_DIR / job_id
    
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail=f"Video folder not found: {job_id}")
    
    # Find first valid video file
    video_path = None
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.MP4', '.AVI', '.MOV']
    for file in job_dir.iterdir():
        if file.is_file() and file.suffix in video_extensions:
            video_path = file
            break
    
    if not video_path:
        raise HTTPException(status_code=404, detail=f"Video file not found in {job_id}")

    # ✅ Extract info using OpenCV
    cap = cv2.VideoCapture(str(video_path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()

    # Handle bad FPS readings (some videos return 0 or NaN)
    if not fps or fps <= 1:
        print(f"⚠️ Invalid FPS ({fps}) for {video_path.name}, defaulting to 30.0")
        fps = 30.0

    duration = frame_count / fps if fps > 0 else 0
    print(f"🎞️ Video Info → {video_path.name}: {frame_count} frames, {fps:.2f} fps, {duration:.2f}s total")

    return {
        "job_id": job_id,
        "filename": video_path.name,
        "fps": round(float(fps), 2),
        "frame_count": frame_count,
        "duration_seconds": round(float(duration), 2),
        "duration_formatted": f"{int(duration // 60):02d}:{int(duration % 60):02d}",
        "resolution": f"{width}x{height}"
    }


@router.get("/debug")
async def debug_videos():
    """
    Debug endpoint to check video directory structure
    """
    if not VIDEO_BASE_DIR.exists():
        return {
            "error": f"Video base directory does not exist: {VIDEO_BASE_DIR.absolute()}",
            "checked_path": str(VIDEO_BASE_DIR.absolute())
        }
    
    job_folders = []
    for job_dir in VIDEO_BASE_DIR.iterdir():
        if job_dir.is_dir():
            files = []
            for f in job_dir.iterdir():
                if f.is_file():
                    files.append({
                        "name": f.name,
                        "size_mb": round(f.stat().st_size / (1024 * 1024), 2),
                        "extension": f.suffix
                    })
            
            job_folders.append({
                "job_id": job_dir.name,
                "files": files,
                "file_count": len(files)
            })
    
    return {
        "video_base_directory": str(VIDEO_BASE_DIR.absolute()),
        "exists": VIDEO_BASE_DIR.exists(),
        "total_job_folders": len(job_folders),
        "job_folders": job_folders[:20]  # Show first 10
    }

@router.get("/debug/{job_id}")
async def debug_specific_job(job_id: str):
    """
    Debug specific job folder
    """
    job_dir = VIDEO_BASE_DIR / job_id
    
    if not job_dir.exists():
        return {
            "error": f"Job folder does not exist: {job_id}",
            "checked_path": str(job_dir.absolute())
        }
    
    files = []
    for f in job_dir.iterdir():
        files.append({
            "name": f.name,
            "size_mb": round(f.stat().st_size / (1024 * 1024), 2),
            "extension": f.suffix,
            "full_path": str(f.absolute())
        })
    
    return {
        "job_id": job_id,
        "job_directory": str(job_dir.absolute()),
        "exists": True,
        "files": files
    }


def get_video_info_sync(job_id: str):
    """
    Synchronous helper for ML/comparison pipelines.
    Reads FPS, frame count, and duration directly from disk (not through FastAPI).
    """
    job_dir = VIDEO_BASE_DIR / job_id
    if not job_dir.exists():
        print(f"⚠️ Video directory not found: {job_dir}")
        return {"fps": 30.0, "duration": 0, "frames": 0}

    video_path = None
    for file in job_dir.iterdir():
        if file.suffix.lower() in [".mp4", ".avi", ".mov", ".mkv"]:
            video_path = file
            break

    if not video_path or not video_path.exists():
        print(f"⚠️ No video file found in {job_dir}")
        return {"fps": 30.0, "duration": 0, "frames": 0}

    cap = cv2.VideoCapture(str(video_path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()

    # Handle invalid FPS
    if not fps or fps <= 1:
        print(f"⚠️ Invalid FPS ({fps}) for {video_path.name}, defaulting to 30.0")
        fps = 30.0

    duration = frame_count / fps if fps > 0 else 0
    print(f"🎞️ [SYNC INFO] {video_path.name}: {frame_count} frames, {fps:.2f} fps, {duration:.2f}s total")

    return {"fps": round(float(fps), 2), "duration": round(float(duration), 2), "frames": frame_count}
