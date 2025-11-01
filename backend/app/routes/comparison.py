from fastapi import APIRouter
from pydantic import BaseModel
from bson import ObjectId
from app.ml.comparison import VideoComparison

router = APIRouter()

class ComparisonRequest(BaseModel):
    reference_id: str  # _id or person_id of the reference person


@router.post("/")
async def search_person(request: ComparisonRequest):
    """
    Compare a reference person's embedding with ALL stored video embeddings.
    Returns frames/videos where the person is detected (above similarity threshold).
    """
    comparer = VideoComparison(final_threshold=0.35)
    matches = comparer.compare_reference(request.reference_id)

    # Convert ObjectIds safely for JSON response
    safe_matches = []
    for m in matches:
        safe_m = {k: str(v) if isinstance(v, ObjectId) else v for k, v in m.items()}
        safe_matches.append(safe_m)

    return {
        "message": "Search complete",
        "reference_id": request.reference_id,
        "matches_count": len(safe_matches),
        "matches": safe_matches
    }
