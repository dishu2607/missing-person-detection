from ultralytics import YOLO
import cv2

class PersonDetector:
    def __init__(self, model_path="yolov8n.pt"):
        print("🔍 Loading YOLOv8 model...")
        self.model = YOLO(model_path)
        print("✅ YOLOv8 model loaded successfully.")

    def detect_persons(self, image_path):
        """
        Detects persons in an image from file path.
        Returns list of detections with bounding boxes and confidence.
        (For backward compatibility)
        """
        img = cv2.imread(image_path)
        if img is None:
            print(f"⚠️ Image not found at {image_path}")
            return []

        results = self.model(image_path)
        return self._parse_results(results, img)

    def detect_persons_from_frame(self, frame):
        """
        Detects persons in a cv2 frame (numpy array).
        Returns list of detections with bounding boxes and confidence.
        """
        results = self.model(frame)
        return self._parse_results(results, frame)

    def _parse_results(self, results, img):
        """
        Parses YOLO results to extract person bounding boxes and confidence.
        """
        detections = []
        h, w = img.shape[:2]

        for result in results:
            boxes = result.boxes.xyxy
            classes = result.boxes.cls
            confs = result.boxes.conf

            for i in range(len(boxes)):
                if int(classes[i]) == 0:  # class 0 = person
                    x1, y1, x2, y2 = map(int, boxes[i])

                    # Ensure bounding box is within frame
                    x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)
                    if y2 <= y1 or x2 <= x1:
                        continue

                    conf = float(confs[i])
                    detections.append({
                        "box": [x1, y1, x2, y2],
                        "confidence": conf
                    })

        return detections
