from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter(prefix="/reference-images")

UPLOADS_DIR = Path("app/data/uploads")

@router.get("/image/{filename}")
async def get_reference_image(filename: str):
    """
    Serve reference images directly from /app/data/uploads.
    """
    print(f"🖼️ Image request: {filename}")
    file_path = UPLOADS_DIR / filename

    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")

    return FileResponse(file_path)
