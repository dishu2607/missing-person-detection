import { useState } from "react";
import { Play, AlertCircle, Clock, Video as VideoIcon } from "lucide-react";
import { CompareResult } from "@/types";
import { api } from "@/lib/api";

interface VideoMatchCardProps {
  match: CompareResult;
  index: number;
  onImageError: () => void;
  hasError: boolean;
}

export function VideoMatchCard({ match, index, onImageError, hasError }: VideoMatchCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  const filename = match.video_crop?.split('\\').pop()?.split('/').pop() || 'unknown.jpg';

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-blue-500/30 transition-all">
      {/* Thumbnail or Video */}
      <div className="relative mb-3 group">
        {!showVideo ? (
          <>
            {!hasError ? (
              <>
                <img
                  src={api.getImageUrl(filename)}
                  alt={`Match ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg bg-gray-800"
                  onError={onImageError}
                />
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div className="bg-blue-600 rounded-full p-4">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </button>
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  #{index + 1}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {match.timestamp}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {(match.final_score * 100).toFixed(1)}%
                </div>
              </>
            ) : (
              <div className="w-full h-48 bg-red-900/20 border border-red-500/30 rounded-lg flex flex-col items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-red-400 text-xs font-semibold">Frame Not Available</p>
                <p className="text-white/60 text-xs">{filename}</p>
              </div>
            )}
          </>
        ) : (
          <div className="relative">
            <video
              controls
              autoPlay
              className="w-full h-48 rounded-lg bg-black"
              src={`${api.getVideoStreamUrl(match.job_id)}#t=${Math.floor(match.frame_number / 30)}`}
            >
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
            >
              Close Video
            </button>
          </div>
        )}
      </div>

      {/* Match Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <VideoIcon className="w-4 h-4 text-blue-400" />
          <span className="text-white font-medium text-xs truncate">
            {match.video_name || match.job_id}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Timestamp:</span>
          <span className="text-blue-400 font-mono font-medium">
            {match.timestamp}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/60">Face Match:</span>
          <span className={`font-bold ${
            match.face_similarity > 0.8 ? "text-green-400" : 
            match.face_similarity > 0.6 ? "text-yellow-400" : "text-orange-400"
          }`}>
            {(match.face_similarity * 100).toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/60">Combined:</span>
          <span className={`font-bold ${
            match.final_score > 0.7 ? "text-green-400" : 
            match.final_score > 0.5 ? "text-yellow-400" : "text-orange-400"
          }`}>
            {(match.final_score * 100).toFixed(1)}%
          </span>
        </div>

        <div className="border-t border-white/10 pt-2">
          <p className="text-white/60 text-xs mb-1">
            <strong>Frame:</strong> {match.frame_number}
          </p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="bg-white/10 px-2 py-1 rounded">
              {match.vid_gender || 'N/A'}
            </span>
            <span className="bg-white/10 px-2 py-1 rounded">
              Age: {match.vid_age || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}