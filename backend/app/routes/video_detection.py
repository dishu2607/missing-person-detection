import os
import cv2
import uuid
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from ultralytics import YOLO

router = APIRouter()

# Load YOLO model (make sure it's available)
model = YOLO("yolov8n.pt")

# Base directory for data
BASE_DIR = "app/data/videos"
os.makedirs(BASE_DIR, exist_ok=True)

@router.post("/video-detect/")
async def detect_video(video: UploadFile = File(...)):
    """
    Processes a video:
    - Saves it in app/data/videos/
    - Runs YOLO detection every Nth frame
    - Saves only frames with detections
    - Saves cropped persons with confidence >= 0.5
    """
    # Threshold and frame interval
    CONFIDENCE_THRESHOLD = 0.7
    FRAME_INTERVAL = 10

    # Create new folder for this video
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    video_folder = os.path.join(BASE_DIR, f"video_{timestamp}")
    frames_folder = os.path.join(video_folder, "frames")
    persons_folder = os.path.join(video_folder, "persons")

    os.makedirs(frames_folder, exist_ok=True)
    os.makedirs(persons_folder, exist_ok=True)

    # Save uploaded video
    video_path = os.path.join(video_folder, video.filename)
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    # Process the video
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    saved_frames = 0
    saved_crops = 0

    while True:
        success, frame = cap.read()
        if not success:
            break

        # Process every Nth frame
        if frame_count % FRAME_INTERVAL == 0:
            results = model(frame)
            detections = results[0].boxes.data.cpu().numpy()

            person_detected = False
            for i, det in enumerate(detections):
                x1, y1, x2, y2, conf, cls = det[:6]
                if conf >= CONFIDENCE_THRESHOLD and int(cls) == 0:  # class 0 = person
                    person_detected = True

                    # Crop person
                    crop = frame[int(y1):int(y2), int(x1):int(x2)]
                    crop_filename = f"person_{saved_crops+1}.jpg"
                    cv2.imwrite(os.path.join(persons_folder, crop_filename), crop)
                    saved_crops += 1

            # Save frame only if any person was detected
            if person_detected:
                frame_filename = f"frame_{saved_frames+1}.jpg"
                cv2.imwrite(os.path.join(frames_folder, frame_filename), frame)
                saved_frames += 1

        frame_count += 1

    cap.release()

    return {
        "message": "Video processed successfully",
        "video_folder": video_folder,
        "frames_saved": saved_frames,
        "persons_saved": saved_crops
    }
