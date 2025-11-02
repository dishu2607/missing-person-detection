export interface ReferenceResult {
  person_id: string;
  _id: string;
  gender: string;
  age: number;
  color?: number[];
  crop_path?: string;
}

export interface CompareResult {
  reference_id: string;
  person_id: string;
  reference_crop: string;
  ref_age: number;
  ref_gender: string;
  ref_color?: number[];
  video_name: string;
  job_id: string;
  video_crop: string;
  frame_number: number;  // NEW
  timestamp: string;      // NEW
  vid_age: number;
  vid_gender: string;
  vid_color?: number[];
  face_similarity: number;
  meta_similarity: number;
  final_score: number;
  detected_at: string;
}