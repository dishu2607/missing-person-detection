import cv2
import os
from app.ml.detector import PersonDetector

class VideoDetector:
    def __init__(self, model_path="yolov8n.pt", output_dir="app/data/outputs"):
        """
        Initialize video detector with YOLOv8 model.
        """
        self.detector = PersonDetector(model_path)
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def detect_video(self, video_path, save_video=False):
        """
        Detect persons in each frame of the video.
        Returns list of detections per frame.
        If save_video=True, saves output video with bounding boxes.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Cannot open video {video_path}")

        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))

        if save_video:
            output_video_path = os.path.join(self.output_dir, "output_video.mp4")
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_video_path, fourcc, fps, (frame_width, frame_height))
        else:
            output_video_path = None

        frame_count = 0
        all_detections = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Save current frame temporarily
            temp_frame_path = os.path.join(self.output_dir, f"frame_{frame_count}.jpg")
            cv2.imwrite(temp_frame_path, frame)

            # Detect persons
            detections = self.detector.detect_persons(temp_frame_path)

            # Draw boxes if saving video
            if save_video:
                for det in detections:
                    x1, y1, x2, y2 = det["box"]
                    conf = det["confidence"]
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, f"{conf:.2f}", (x1, y1-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
                out.write(frame)

            all_detections.append({
                "frame": frame_count,
                "detections": detections
            })

            frame_count += 1
            os.remove(temp_frame_path)  # remove temp frame

        cap.release()
        if save_video:
            out.release()

        return all_detections, output_video_path
