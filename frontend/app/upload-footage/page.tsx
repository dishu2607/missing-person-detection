"use client";

import { useState } from "react";
import { Upload, Video, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function UploadFootagePage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setError("");
      setStatus("");
      setJobId("");
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError("Please select a video file first");
      return;
    }

    setUploading(true);
    setStatus("Uploading and processing video...");
    setError("");

    try {
      const data = await api.uploadVideo(videoFile);
      setJobId(data.job_id || "");
      setStatus(`✅ Video processed successfully! Job ID: ${data.job_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to upload video");
      setStatus("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Upload CCTV Footage
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Add new surveillance footage to the database for analysis
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          {/* Status Messages */}
          {status && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-300 text-sm">{status}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div className="mb-6">
            {videoFile ? (
              <div className="bg-gray-700/30 border border-gray-600 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{videoFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setVideoFile(null);
                      setStatus("");
                      setError("");
                      setJobId("");
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 hover:border-green-500/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg mb-2">
                      Click to upload CCTV footage
                    </p>
                    <p className="text-gray-400 text-sm">
                      MP4, AVI, MOV supported • Maximum file size: 500MB
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!videoFile || uploading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Video...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Upload & Process Video
              </>
            )}
          </button>

          {/* Job ID Display */}
          {jobId && (
            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-400 text-sm font-semibold mb-2">
                Job ID (save this for reference):
              </p>
              <code className="block bg-gray-900 text-blue-300 px-4 py-2 rounded font-mono text-sm break-all">
                {jobId}
              </code>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">Processing Steps:</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>Video is uploaded to secure storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>Frames are extracted at regular intervals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>Persons are detected using YOLOv8</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>Face embeddings are generated</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span>All data is indexed for fast searching</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}