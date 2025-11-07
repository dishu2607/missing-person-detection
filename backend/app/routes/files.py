from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from pathlib import Path

router = APIRouter()

@router.get("/outputs/search/{filename}")
async def get_output_file(filename: str):
    """
    Serve cropped person images from outputs OR uploads directory
    """
    # Try outputs directory first (for video frames)
    output_dir = Path("app/data/outputs")
    
    # Search in all persons_ folders
    for persons_folder in output_dir.glob("persons_*"):
        potential_file = persons_folder / filename
        if potential_file.exists():
            return FileResponse(
                potential_file, 
                media_type="image/jpeg",
                headers={"Cache-Control": "public, max-age=3600"}
            )
    
    # Try uploads directory (for reference images)
    uploads_dir = Path("app/data/uploads")
    upload_file = uploads_dir / filename
    if upload_file.exists():
        return FileResponse(
            upload_file,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=3600"}
        )
    
    # Try with different extensions in uploads
    for ext in ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']:
        name_without_ext = filename.rsplit('.', 1)[0]
        potential_file = uploads_dir / f"{name_without_ext}{ext}"
        if potential_file.exists():
            return FileResponse(
                potential_file,
                media_type="image/jpeg",
                headers={"Cache-Control": "public, max-age=3600"}
            )
    
    raise HTTPException(
        status_code=404, 
        detail=f"File not found: {filename}"
    )

@router.get("/outputs/debug")
async def debug_outputs():
    """
    Debug endpoint to check what files exist
    """
    output_dir = Path("app/data/outputs")
    uploads_dir = Path("app/data/uploads")
    
    result = {
        "output_directory": str(output_dir.absolute()),
        "uploads_directory": str(uploads_dir.absolute()),
    }
    
    # Check outputs
    if output_dir.exists():
        folders = []
        for f in output_dir.iterdir():
            if f.is_dir():
                files = [file.name for file in f.iterdir() if file.is_file()][:5]
                folders.append({
                    "name": f.name,
                    "file_count": len(list(f.iterdir())),
                    "sample_files": files
                })
        result["output_folders"] = folders
    
    # Check uploads
    if uploads_dir.exists():
        upload_files = [f.name for f in uploads_dir.iterdir() if f.is_file()][:20]
        result["upload_files"] = upload_files
        result["upload_file_count"] = len(list(uploads_dir.iterdir()))
    
    return result