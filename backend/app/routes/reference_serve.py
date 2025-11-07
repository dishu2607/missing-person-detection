from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter()

REFERENCE_CROPS_DIR = Path("app/data/reference_crops")
OUTPUTS_DIR = Path("app/data/outputs")

@router.get("/image/{filename}")
async def serve_reference_or_frame_image(filename: str):
    """
    Serve images from either reference_crops or outputs/frames_* directories.
    Example:
    - /reference-images/image/20251103_224009_srk3.jpg_person0.jpg
    - /reference-images/image/frame_0.jpg
    """
    print(f"🖼️ Image request: {filename}")

    # 1️⃣ Search in reference_crops first
    if REFERENCE_CROPS_DIR.exists():
        for file in REFERENCE_CROPS_DIR.iterdir():
            if file.name == filename:
                print(f"✅ Found in reference_crops: {file}")
                return FileResponse(
                    file,
                    media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=3600"}
                )

    # 2️⃣ Search in outputs/frames_* directories
    if OUTPUTS_DIR.exists():
        for folder in OUTPUTS_DIR.glob("frames_*"):
            potential_file = folder / filename
            if potential_file.exists():
                print(f"✅ Found in outputs: {potential_file}")
                return FileResponse(
                    potential_file,
                    media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=3600"}
                )

    print(f"❌ File not found in either location: {filename}")
    raise HTTPException(
        status_code=404,
        detail=f"Image not found: {filename}"
    )


@router.get("/list")
async def list_reference_images():
    """List all images from reference_crops and outputs."""
    result = {"reference_crops": [], "frames": []}

    if REFERENCE_CROPS_DIR.exists():
        result["reference_crops"] = [
            f.name for f in REFERENCE_CROPS_DIR.iterdir() if f.is_file()
        ]

    if OUTPUTS_DIR.exists():
        all_frames = []
        for folder in OUTPUTS_DIR.glob("frames_*"):
            for f in folder.iterdir():
                if f.is_file() and f.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                    all_frames.append(f.name)
        result["frames"] = all_frames[:30]  # Limit for readability

    return {
        "reference_crops_dir": str(REFERENCE_CROPS_DIR.absolute()),
        "outputs_dir": str(OUTPUTS_DIR.absolute()),
        "summary": {
            "reference_images": len(result["reference_crops"]),
            "frame_images": len(result["frames"]),
        },
        "files": result
    }
