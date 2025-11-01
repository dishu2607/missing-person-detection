from insightface.app import FaceAnalysis
import numpy as np
import cv2

class EmbeddingModel:
    def __init__(self):
        print("🧠 Loading InsightFace model...")
        self.model = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        self.model.prepare(ctx_id=-1)  # CPU mode (set ctx_id=0 for GPU)
        print("✅ InsightFace model loaded successfully.")

    def get_embedding(self, image_path):
        """
        Reads an image path and returns its 512-D face embedding vector.
        Used by reference.py for registering known faces.
        """
        img = cv2.imread(image_path)
        return self._get_embedding_from_img(img, image_path)

    def get_embedding_from_image(self, img):
        """
        Returns the 512-D face embedding vector from an OpenCV image array.
        Used by pipeline.py to process cropped faces directly.
        """
        return self._get_embedding_from_img(img)

    def _get_embedding_from_img(self, img, path=None):
        if img is None:
            raise ValueError(f"❌ Image not found or invalid: {path}")

        faces = self.model.get(img)
        if len(faces) == 0:
            if path:
                print(f"⚠️ No face detected in {path}")
            return None

        return faces[0].embedding.astype("float32")
