import os
from datetime import datetime
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId
from app.db.mongo import db
from app.routes.video_serve import get_video_info_sync  # ✅ use only the sync helper


class VideoComparison:
    def __init__(self, final_threshold=0.35, emb_weight=0.8, meta_weight=0.2, top_k=20):
        """
        final_threshold: Minimum combined similarity score to count as a match.
        emb_weight/meta_weight: How much to weigh embedding vs metadata similarity.
        top_k: Return only top K matches (default 10)
        """
        self.final_threshold = final_threshold
        self.emb_weight = emb_weight
        self.meta_weight = meta_weight
        self.top_k = top_k

    # -------------------------------------------------------------------------
    # Utility Methods
    # -------------------------------------------------------------------------
    def _safe_convert(self, value):
        """Safely convert values to JSON-serializable format"""
        if value is None:
            return None
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, (list, tuple)):
            return [self._safe_convert(v) for v in value]
        if isinstance(value, dict):
            return {k: self._safe_convert(v) for k, v in value.items()}
        if isinstance(value, np.integer):
            return int(value)
        if isinstance(value, np.floating):
            return float(value)
        if isinstance(value, np.ndarray):
            return value.tolist()
        return value

    def _metadata_similarity(self, ref_meta, vid_meta):
        """Compute metadata similarity score between reference and video person"""
        if not ref_meta or not vid_meta:
            return 0.0

        # Gender match (1 if same, 0 otherwise)
        gender_score = 1.0 if ref_meta.get("gender") == vid_meta.get("gender") else 0.0

        # Age similarity (closeness within 10 years)
        ref_age, vid_age = ref_meta.get("age"), vid_meta.get("age")
        if ref_age is not None and vid_age is not None:
            age_diff = abs(ref_age - vid_age)
            age_score = max(0, 1 - (age_diff / 10)) if age_diff <= 10 else 0.0
        else:
            age_score = 0.0

        # Color similarity (using cosine similarity on RGB)
        ref_color, vid_color = ref_meta.get("color"), vid_meta.get("color")
        if ref_color and vid_color and len(ref_color) == 3 and len(vid_color) == 3:
            ref_vec = np.array(ref_color).reshape(1, -1)
            vid_vec = np.array(vid_color).reshape(1, -1)
            color_score = cosine_similarity(ref_vec, vid_vec)[0][0] / 255
            color_score = np.clip(color_score, 0, 1)
        else:
            color_score = 0.0

        # Weighted combination of metadata attributes
        meta_score = (0.4 * gender_score) + (0.3 * age_score) + (0.3 * color_score)
        return meta_score

    def _extract_frame_number(self, crop_path):
        """Extract frame number from crop path like 'person_1_frame_120.jpg' -> 120"""
        try:
            filename = os.path.basename(crop_path)
            frame_part = filename.split('_frame_')[-1]
            frame_num = int(frame_part.split('.')[0])
            return frame_num
        except Exception:
            return 0

    def _calculate_timestamp(self, frame_number, fps=30.0):
        """Convert frame number to timestamp"""
        total_seconds = frame_number / fps
        minutes = int(total_seconds // 60)
        seconds = int(total_seconds % 60)
        return f"{minutes:02d}:{seconds:02d}"

    def _get_fps_for_video(self, job_id: str):
        """Fetch real FPS dynamically for each video using the sync helper."""
        try:
            video_info = get_video_info_sync(job_id)
            fps = float(video_info.get("fps", 30.0))
            if fps > 0:
                print(f"🎬 Using FPS={fps} for job_id={job_id}")
                return fps
        except Exception as e:
            print(f"⚠️ Could not fetch FPS for job_id {job_id}: {e}")
        return 30.0

    # -------------------------------------------------------------------------
    # Core Comparison Logic
    # -------------------------------------------------------------------------
    def compare_reference(self, reference_id: str, job_id: str = None):
        """Compare a single reference embedding against ALL video embeddings"""
        print(f"\n🔍 Starting comparison for reference: {reference_id}")
        
        ref_collection_name = os.getenv("COLLECTION_NAME", "reference_embeddings")
        
        # Try to find by ObjectId first, then by person_id
        ref_doc = None
        if ObjectId.is_valid(reference_id):
            try:
                ref_doc = db[ref_collection_name].find_one({"_id": ObjectId(reference_id)})
                print(f"   Found by ObjectId: {reference_id}")
            except Exception:
                pass
        
        if not ref_doc:
            ref_doc = db[ref_collection_name].find_one({"person_id": reference_id})
            if ref_doc:
                print(f"   Found by person_id: {reference_id}")

        if not ref_doc:
            print(f"⚠️ No reference found for id/person_id: {reference_id}")
            return []

        ref_emb = np.array(ref_doc["embedding"]).reshape(1, -1)
        ref_meta = {
            "person_id": str(ref_doc.get("person_id", "")),
            "age": int(ref_doc.get("age", 0)) if ref_doc.get("age") else None,
            "gender": str(ref_doc.get("gender", "")),
            "color": self._safe_convert(ref_doc.get("color")),
            "crop_path": str(ref_doc.get("crop_path", "")),
        }

        print(f"   Reference metadata: person_id={ref_meta['person_id']}, gender={ref_meta['gender']}, age={ref_meta['age']}")

        # Load video embeddings
        query = {"job_id": job_id} if job_id else {}
        print(f"   Searching {'job_id ' + job_id if job_id else 'ALL videos in database'}")
            
        video_emb_docs = list(db.embeddings.find(query))
        if not video_emb_docs:
            print(f"⚠️ No video embeddings found in database{' for job_id: ' + job_id if job_id else ''}")
            return []
        
        print(f"   Found {len(video_emb_docs)} video embeddings to compare")

        matches = []
        fps_cache = {}  # avoid redundant lookups

        for idx, v_doc in enumerate(video_emb_docs):
            try:
                video_emb = np.array(v_doc["embedding"]).reshape(1, -1)
                emb_similarity = cosine_similarity(ref_emb, video_emb)[0][0]

                vid_meta = {
                    "age": int(v_doc.get("age", 0)) if v_doc.get("age") else None,
                    "gender": str(v_doc.get("gender", "")),
                    "color": self._safe_convert(v_doc.get("color")),
                }

                meta_similarity = self._metadata_similarity(ref_meta, vid_meta)
                final_score = (self.emb_weight * emb_similarity) + (self.meta_weight * meta_similarity)

                frame_number = self._extract_frame_number(v_doc.get("crop_path", ""))
                job_id_for_fps = str(v_doc.get("job_id", job_id or ""))

                # ✅ Dynamically get fps per video
                if job_id_for_fps not in fps_cache:
                    fps_cache[job_id_for_fps] = self._get_fps_for_video(job_id_for_fps)
                fps = fps_cache[job_id_for_fps]

                timestamp = self._calculate_timestamp(frame_number, fps=fps)

                if final_score >= self.final_threshold:
                    match = {
                        "reference_id": str(ref_doc["_id"]),
                        "person_id": ref_meta["person_id"],
                        "reference_crop": ref_meta["crop_path"],
                        "ref_age": ref_meta["age"],
                        "ref_gender": ref_meta["gender"],
                        "ref_color": ref_meta["color"],
                        "video_name": str(v_doc.get("video_name", "")),
                        "job_id": job_id_for_fps,
                        "video_crop": str(v_doc.get("crop_path", "")),
                        "frame_number": int(frame_number),
                        "timestamp": str(timestamp),
                        "vid_age": vid_meta["age"],
                        "vid_gender": vid_meta["gender"],
                        "vid_color": vid_meta["color"],
                        "face_similarity": float(emb_similarity),
                        "meta_similarity": float(meta_similarity),
                        "final_score": float(final_score),
                        "detected_at": str(datetime.utcnow())
                    }
                    matches.append(self._safe_convert(match))

                    if idx % 100 == 0 and idx > 0:
                        print(f"   Processed {idx} embeddings, {len(matches)} matches so far...")

            except Exception as e:
                print(f"⚠️ Error processing video embedding {idx}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue

        matches.sort(key=lambda x: x["final_score"], reverse=True)
        top_matches = matches[:self.top_k]

        print(f"✅ Comparison complete: {len(top_matches)} top matches (from {len(matches)} total) for reference {ref_meta['person_id']}\n")
        return top_matches
