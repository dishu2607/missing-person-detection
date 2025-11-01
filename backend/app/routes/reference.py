# app/routes/reference.py
from fastapi import APIRouter, UploadFile, File
import os
import shutil
from datetime import datetime
from app.ml.embeddings import EmbeddingModel
from app.ml.faiss_store import FaissIndex
from app.ml.detector import PersonDetector
from collections import Counter
import cv2
import numpy as np
from dotenv import load_dotenv
from pymongo import MongoClient

# -------------------- Load environment variables --------------------
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

router = APIRouter(tags=["Reference"])

# -------------------- Setup upload directories --------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "data", "uploads")
CROPS_DIR = os.path.join(BASE_DIR, "data", "reference_crops")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CROPS_DIR, exist_ok=True)

# -------------------- Load models --------------------
embedding_model = EmbeddingModel()
faiss_index = FaissIndex()
detector = PersonDetector()

def get_dominant_color(image, k=4):
    """Estimate dominant clothing color (simple heuristic)."""
    img = cv2.resize(image, (100, 100))
    img = img.reshape((-1, 3))
    pixels = [tuple(x) for x in img]
    most_common = Counter(pixels).most_common(1)[0][0]
    return tuple(map(int, most_common))

@router.post("/add")
async def add_reference(file: UploadFile = File(...)):
    """Add a new reference image to FAISS index + MongoDB + save top-35% crops"""
    try:
        filename = datetime.now().strftime("%Y%m%d_%H%M%S_") + file.filename
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Read image
        img = cv2.imread(file_path)
        if img is None:
            return {"error": "Invalid image file."}

        # Detect persons using YOLO
        detections = detector.detect_persons(file_path)
        if len(detections) == 0:
            return {"error": "No person detected in the uploaded image."}

        all_results = []

        for i, det in enumerate(detections):
            x1, y1, x2, y2 = det["box"]
            h_crop = int((y2 - y1) * 0.35)  # crop top 35% of the person box
            face_crop = img[y1:y1 + h_crop, x1:x2]

            if face_crop.size == 0:
                continue

            # Save crop to disk
            crop_filename = f"{filename}_person{i}.jpg"
            crop_path = os.path.join(CROPS_DIR, crop_filename)
            cv2.imwrite(crop_path, face_crop)

            # Detect face and embedding from crop
            faces = embedding_model.model.get(face_crop)
            if len(faces) == 0:
                print(f"🚫 No face found in person {i + 1}")
                continue

            face = faces[0]
            age = int(face.age)
            gender = "Male" if face.gender > 0.5 else "Female"
            emb = face.embedding.astype("float32")
            color = get_dominant_color(face_crop)

            # Print info on terminal
            print("\n🧍 Person Detected:")
            print(f" - Age: {age}")
            print(f" - Gender: {gender}")
            print(f" - Clothing Color (RGB): {color}")
            print(f" - Embedding (first 5 dims): {emb[:5]} ...")

            # Add to FAISS index
            person_id = f"{filename}_person{i}"
            faiss_index.add_embedding(emb, person_id)

            # Prepare MongoDB document
            mongo_data = {
                "person_id": person_id,
                "age": age,
                "gender": gender,
                "color": color,
                "embedding": emb.tolist(),
                "file_path": file_path,
                "crop_path": crop_path,  # store crop path too
                "timestamp": datetime.utcnow(),
            }

            # Insert into MongoDB
            collection.insert_one(mongo_data)

            all_results.append({
                "person_id": person_id,
                "age": age,
                "gender": gender,
                "color": color,
                "crop_path": crop_path
            })

        return {"message": "Reference(s) added successfully.", "results": all_results}

    except Exception as e:
        print("❌ ERROR:", e)
        return {"error": str(e)}
