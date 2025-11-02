from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

# Routers
from app.routes import detection, video_detection, reference, video, comparison, files, video_serve

app = FastAPI(title="Missing Person Detection API", version="1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running successfully 🚀"}

# Include routers
app.include_router(reference.router, prefix="/reference", tags=["Reference"])
app.include_router(video.router, prefix="/video", tags=["Video"])
app.include_router(video_detection.router, prefix="/video-detect", tags=["Video Detect"])
app.include_router(detection.router, prefix="/detect", tags=["Detection"])
app.include_router(comparison.router, prefix="/compare", tags=["Comparison"])
app.include_router(files.router, tags=["Files"])
app.include_router(video_serve.router, prefix="/videos", tags=["Video Serving"])

# Mount static files LAST
output_dir = "app/data/outputs"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

app.mount("/app/data/outputs", StaticFiles(directory=output_dir), name="outputs")