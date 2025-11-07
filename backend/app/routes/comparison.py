from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.ml.comparison import VideoComparison
import json

router = APIRouter()

class CompareRequest(BaseModel):
    reference_id: str
    job_id: Optional[str] = None
    top_k: int = 20

@router.post("/")
async def compare_reference_to_videos(req: CompareRequest):
    """
    Compare a reference person against video embeddings.
    If job_id is provided, search only that video. Otherwise search all videos.
    Returns top K matches sorted by similarity.
    """
    try:
        print(f"🔍 Comparison Request:")
        print(f"   Reference ID: {req.reference_id}")
        print(f"   Job ID: {req.job_id}")
        print(f"   Top K: {req.top_k}")
        
        comparator = VideoComparison(
            final_threshold=0.35,
            emb_weight=0.8,
            meta_weight=0.2,
            top_k=req.top_k
        )
        
        matches = comparator.compare_reference(
            reference_id=req.reference_id,
            job_id=req.job_id
        )
        
        print(f"✅ Found {len(matches)} matches")
        
        # Ensure all data is JSON serializable
        response = {
            "success": True,
            "matches": matches,
            "matches_count": len(matches),
            "searched_all_videos": req.job_id is None,
            "message": f"Found {len(matches)} top matches"
        }
        
        # Test JSON serialization before returning
        try:
            json.dumps(response)
        except TypeError as e:
            print(f"❌ JSON serialization error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Response serialization error: {str(e)}")
        
        return response
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ Error in comparison: {str(e)}")
        print(error_trace)
        raise HTTPException(status_code=500, detail=str(e))