from ultralytics import YOLO
import cv2

model = YOLO("yolov8n.pt")
results = model("shraddha1.jpg")  # take one frame from your video

for result in results:
    boxes = result.boxes
    for i, cls in enumerate(boxes.cls):
        if int(cls) == 0:
            print("✅ Person detected:", boxes.xyxy[i].tolist())
