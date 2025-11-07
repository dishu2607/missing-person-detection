"use client";

import React, { useEffect, useState } from "react";
import { X, User, Calendar, Clock, Film } from "lucide-react";
import { VideoMatchCard } from "../search/VideoMatchCard";// ⬅️ same as your working video card
import { api } from "@/lib/api";

interface Match {
  frame_number: number;
  timestamp: number;
  job_id: string;
  video_name: string;
  final_score?: number;
  face_similarity?: number;
  meta_similarity?: number;
  vid_gender?: string;
  vid_age?: string;
}

interface VideoMetadata {
  fps: number;
  frame_count: number;
  duration_seconds: number;
  resolution: string;
}

interface ReferenceDetails {
  reference_time: string;
  reference_image: string;
  gender: string;
  age: number;
  match_count: number;
  matches: Match[];
  video_metadata: VideoMetadata | null;
  job_id: string | null;
}

interface ReferenceModalProps {
  referenceId: string | null;
  onClose: () => void;
}

const ReferenceDetailsModal: React.FC<ReferenceModalProps> = ({
  referenceId,
  onClose,
}) => {
  const [details, setDetails] = useState<ReferenceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (referenceId) fetchReferenceDetails();
  }, [referenceId]);

  const fetchReferenceDetails = async () => {
    if (!referenceId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${api.baseUrl}/dashboard/reference/${referenceId}`
      );
      if (!response.ok) throw new Error("Failed to fetch reference details");
      const data = await response.json();
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp: string) => {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(9, 11);
    const min = timestamp.substring(11, 13);
    const sec = timestamp.substring(13, 15);
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  };

  if (!referenceId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reference Details</h2>
            {details && (
              <p className="text-sm text-gray-600 mt-1">
                ID: {details.reference_time} • {details.match_count} match
                {details.match_count !== 1 ? "es" : ""} found
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading details...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}

          {/* Reference Info */}
          {details && !loading && (
            <>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Reference Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={`${api.baseUrl}/uploads/${details.reference_image}`}
                      alt="Reference"
                      className="w-full max-w-xs rounded-lg shadow-lg border-4 border-white"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase">
                          Upload Date
                        </div>
                        <div className="font-semibold">
                          {formatDate(details.reference_time)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <User className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase">
                          Gender
                        </div>
                        <div className="font-semibold">{details.gender}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500 uppercase">
                          Age
                        </div>
                        <div className="font-semibold">
                          {details.age || "Unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Player (Overview) */}
              {details.job_id && details.video_metadata && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Film className="w-5 h-5 mr-2 text-purple-600" />
                    Video Overview
                  </h3>
                  <video
                    controls
                    className="w-full rounded-lg shadow-lg border-4 border-white"
                    src={`${api.baseUrl}/videos/stream/${details.job_id}`}
                  ></video>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-700">
                    <div>
                      <span className="font-semibold">Duration:</span>{" "}
                      {formatTime(details.video_metadata.duration_seconds)}
                    </div>
                    <div>
                      <span className="font-semibold">FPS:</span>{" "}
                      {details.video_metadata.fps}
                    </div>
                    <div>
                      <span className="font-semibold">Resolution:</span>{" "}
                      {details.video_metadata.resolution}
                    </div>
                    <div>
                      <span className="font-semibold">Total Frames:</span>{" "}
                      {details.video_metadata.frame_count}
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Matches */}
              {details.matches && details.matches.length > 0 ? (
                <div className="bg-gray-900/5 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Detected Matches ({details.matches.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {details.matches.map((match, index) => (
                      <VideoMatchCard
                        key={index}
                        match={match}
                        index={index}
                        hasError={false}
                        onImageError={() => {}}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-600">
                  No matches detected for this reference.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferenceDetailsModal;
