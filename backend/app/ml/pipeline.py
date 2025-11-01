import os
import cv2
import numpy as np
import logging
import onnxruntime as ort
from datetime import datetime
from app.ml.detector import PersonDetector
from app.ml.embeddings import EmbeddingModel
from app.ml.faiss_store import FaissIndex
from app.db.mongo import db  # MongoDB connection

# 🚫 Suppress ONNXRuntime and InsightFace logs
ort.set_default_logger_severity(3)  # 0=verbose, 1=info, 2=warning, 3=error, 4=fatal
os.environ["INSIGHTFACE_LOG_LEVEL"] = "ERROR"

# Optional: also silence general loggers
logging.getLogger("insightface").setLevel(logging.ERROR)
logging.getLogger("onnxruntime").setLevel(logging.ERROR)
logging.getLogger("numba").setLevel(logging.WARNING)

# Optional: suppress YOLOv8 and other library warnings
import warnings
warnings.filterwarnings("ignore")
logging.getLogger("ultralytics").setLevel(logging.ERROR)


class VideoProcessingPipeline:
    def __init__(self, output_dir="app/data/outputs"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        # Initialize models
        self.detector = PersonDetector("yolov8n.pt")
        self.embedding_model = EmbeddingModel()
        self.faiss_index = FaissIndex()

        # Adjustable thresholds
        self.frame_interval = 40          # process every 40 frames
        self.yolo_conf_threshold = 0.7    # only strong person detections
        self.final_score_threshold = 0.75 # only save embeddings with high similarity

    def _extract_metadata(self, image):
        """
        Simple metadata extractor for detected persons.
        Mimics the structure used in reference_embeddings:
        - Predicts approximate age & gender heuristically
        - Computes dominant clothing color (RGB)
        """
        try:
            h, w, _ = image.shape
            # Estimate age randomly based on brightness and size (mock logic)
            mean_brightness = np.mean(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY))
            age = int(15 + (mean_brightness % 45))  # pseudo age range 15–60

            # Gender mock: use image width as heuristic (not ML)
            gender = "Male" if w > h else "Female"

            # Extract dominant color (average of pixels)
            avg_color_per_row = np.average(image, axis=0)
            avg_color = np.average(avg_color_per_row, axis=0)
            color = [int(c) for c in avg_color[::-1]]  # Convert to RGB

            return {
                "age": age,
                "gender": gender,
                "color": color
            }

        except Exception as e:
            print(f"⚠️ Metadata extraction failed: {e}")
            return {"age": None, "gender": None, "color": None}

    def process_video(self, video_path, metadata=None, job_id=None):
        print(f"🎥 Starting video processing: {video_path}")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Cannot open video: {video_path}")

        # Job ID based on current timestamp
        if job_id is None:
            job_id = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Folders for this session
        time_tag = datetime.now().strftime("%Y%m%d_%H%M%S")
        frames_folder = os.path.join(self.output_dir, f"frames_{time_tag}")
        persons_folder = os.path.join(self.output_dir, f"persons_{time_tag}")
        os.makedirs(frames_folder, exist_ok=True)
        os.makedirs(persons_folder, exist_ok=True)

        frame_count = 0
        saved_frames = 0
        saved_crops = 0
        all_detections = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Process every Nth frame
            if frame_count % self.frame_interval != 0:
                frame_count += 1
                continue

            # Detect persons
            detections = self.detector.detect_persons_from_frame(frame)
            print(f"🧍 Frame {frame_count}: {len(detections)} persons detected by YOLO")

            frame_detections = []

            for det in detections:
                if det["confidence"] < self.yolo_conf_threshold:
                    continue

                x1, y1, x2, y2 = det["box"]
                h_crop = int((y2 - y1) * 0.35)  # approximate face region
                face_crop = frame[y1:y1+h_crop, x1:x2]

                # Get embedding
                emb = self.embedding_model.get_embedding_from_image(face_crop)
                if emb is None:
                    continue

                # Save cropped face image with timestamp + frame number
                crop_filename = f"person_{saved_crops+1}_frame_{frame_count}.jpg"
                crop_path = os.path.join(persons_folder, crop_filename)
                cv2.imwrite(crop_path, face_crop)
                saved_crops += 1

                # ✅ Extract metadata (same structure as reference)
                metadata_info = self._extract_metadata(face_crop)

                # ✅ Save embedding + metadata in MongoDB
                db.embeddings.insert_one({
                    "job_id": job_id,
                    "video_name": os.path.basename(video_path),
                    "crop_path": crop_path,
                    "embedding": emb.tolist(),
                    "timestamp": str(datetime.now()),
                    "age": metadata_info["age"],
                    "gender": metadata_info["gender"],
                    "color": metadata_info["color"]
                })

                frame_detections.append({
                    "crop_path": crop_path,
                    "confidence": det["confidence"],
                    "age": metadata_info["age"],
                    "gender": metadata_info["gender"],
                    "color": metadata_info["color"]
                })

            # Save full frame only if valid detections found
            if frame_detections:
                frame_filename = f"frame_{frame_count}.jpg"
                frame_path = os.path.join(frames_folder, frame_filename)
                cv2.imwrite(frame_path, frame)
                saved_frames += 1
                all_detections.append({
                    "frame": frame_count,
                    "detections": frame_detections
                })

            frame_count += 1

        cap.release()
        print(f"✅ Video processing complete: {saved_crops} valid persons saved, {saved_frames} frames with detections")

        return {
            "job_id": job_id,
            "frames_saved": saved_frames,
            "persons_saved": saved_crops,
            "detections": all_detections
        }
