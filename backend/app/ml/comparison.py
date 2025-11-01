import os
from datetime import datetime
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId
from app.db.mongo import db  # MongoDB connection


class VideoComparison:
    def __init__(self, final_threshold=0.35, emb_weight=0.8, meta_weight=0.2):
        """
        final_threshold: Minimum combined similarity score to count as a match.
        emb_weight/meta_weight: How much to weigh embedding vs metadata similarity.
        """
        self.final_threshold = final_threshold
        self.emb_weight = emb_weight
        self.meta_weight = meta_weight

    def _metadata_similarity(self, ref_meta, vid_meta):
        """
        Compute metadata similarity score between reference and video person.
        Returns a value between 0 and 1.
        """

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

    def compare_reference(self, reference_id: str):
        """
        Compare a single reference embedding (person) against ALL video embeddings in the database.
        Returns a list of matches (frames/videos with similarity >= threshold).
        """
        # Load reference embedding
        ref_collection_name = os.getenv("COLLECTION_NAME", "reference_embeddings")
        ref_doc = db[ref_collection_name].find_one(
            {"_id": ObjectId(reference_id)} if ObjectId.is_valid(reference_id)
            else {"person_id": reference_id}
        )

        if not ref_doc:
            print(f"⚠️ No reference found for id/person_id: {reference_id}")
            return []

        # Extract reference info
        ref_emb = np.array(ref_doc["embedding"]).reshape(1, -1)
        ref_meta = {
            "person_id": ref_doc.get("person_id"),
            "age": ref_doc.get("age"),
            "gender": ref_doc.get("gender"),
            "color": ref_doc.get("color"),
            "crop_path": ref_doc.get("crop_path"),
        }

        # Load all video embeddings
        video_emb_docs = list(db.embeddings.find({}))
        if not video_emb_docs:
            print("⚠️ No video embeddings found in database")
            return []

        matches = []

        for v_doc in video_emb_docs:
            video_emb = np.array(v_doc["embedding"]).reshape(1, -1)
            emb_similarity = cosine_similarity(ref_emb, video_emb)[0][0]

            # Video metadata
            vid_meta = {
                "age": v_doc.get("age"),
                "gender": v_doc.get("gender"),
                "color": v_doc.get("color"),
            }

            meta_similarity = self._metadata_similarity(ref_meta, vid_meta)

            # Combine embedding + metadata scores
            final_score = (self.emb_weight * emb_similarity) + (self.meta_weight * meta_similarity)

            # Debug output
            print(
                f"🧩 Comparing {ref_meta['person_id']} ↔ {v_doc.get('crop_path')} | "
                f"Emb={emb_similarity:.4f}, Meta={meta_similarity:.4f}, Final={final_score:.4f}"
            )

            if final_score >= self.final_threshold:
                matches.append({
                    "reference_id": str(ref_doc["_id"]),
                    "person_id": ref_meta["person_id"],
                    "reference_crop": ref_meta["crop_path"],
                    "ref_age": ref_meta["age"],
                    "ref_gender": ref_meta["gender"],
                    "ref_color": ref_meta["color"],

                    "video_name": str(v_doc.get("video_name", "")),
                    "job_id": str(v_doc.get("job_id", "")),
                    "video_crop": str(v_doc.get("crop_path", "")),
                    "vid_age": vid_meta["age"],
                    "vid_gender": vid_meta["gender"],
                    "vid_color": vid_meta["color"],

                    "face_similarity": float(emb_similarity),
                    "meta_similarity": float(meta_similarity),
                    "final_score": float(final_score),
                    "detected_at": str(datetime.utcnow())
                })

        # Save matches
        if matches:
            db.video_matches.insert_many(matches)

        print(f"✅ Comparison complete: {len(matches)} matches found for reference {ref_meta['person_id']}")
        return matches
