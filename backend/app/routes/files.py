# app/routes/files.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from pathlib import Path

router = APIRouter()

@router.get("/outputs/{folder}/{filename}")
async def get_output_file(folder: str, filename: str):
    """
    Serve cropped person images from outputs directory
    Example: /outputs/persons_20251025_195455/person_1_frame_0.jpg
    """
    # Build the file path
    file_path = Path("app/data/outputs") / folder / filename
    
    # Check if file exists
    if not file_path.exists():
        # Try to find the file in any persons_ folder
        output_dir = Path("app/data/outputs")
        for persons_folder in output_dir.glob("persons_*"):
            potential_file = persons_folder / filename
            if potential_file.exists():
                return FileResponse(
                    potential_file, 
                    media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=3600"}
                )
        
        raise HTTPException(
            status_code=404, 
            detail=f"File not found: {folder}/{filename}"
        )
    
    # Return the image
    return FileResponse(
        file_path, 
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=3600"}
    )

@router.get("/outputs/search/{filename}")
async def search_output_file(filename: str):
    """
    Search for a file across all output folders
    Example: /outputs/search/person_1_frame_0.jpg
    """
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
    
    raise HTTPException(
        status_code=404, 
        detail=f"File not found in any folder: {filename}"
    )

@router.get("/outputs/debug")
async def debug_outputs():
    """
    Debug endpoint to list all output folders and sample files
    """
    output_dir = Path("app/data/outputs")
    if not output_dir.exists():
        return {"error": "Output directory does not exist"}
    
    folders = []
    for f in output_dir.iterdir():
        if f.is_dir():
            files = [file.name for file in f.iterdir() if file.is_file()][:5]  # First 5 files
            folders.append({
                "name": f.name,
                "file_count": len(list(f.iterdir())),
                "sample_files": files
            })
    
    return {
        "output_directory": str(output_dir.absolute()),
        "folders": folders,
        "total_folders": len(folders)
    }