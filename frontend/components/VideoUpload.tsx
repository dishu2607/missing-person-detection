import { Upload, Video } from "lucide-react";

interface VideoUploadProps {
  videoFile: File | null;
  uploadingVideo: boolean;
  videoJobId: string;
  searchAllVideos: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (e: React.FormEvent) => void;
  onJobIdChange: (value: string) => void;
  onSearchModeChange: (searchAll: boolean) => void;
}

export function VideoUpload({
  videoFile,
  uploadingVideo,
  videoJobId,
  searchAllVideos,
  onFileChange,
  onUpload,
  onJobIdChange,
  onSearchModeChange,
}: VideoUploadProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <Video className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg">
            Step 2: CCTV Footage (Optional)
          </h2>
          <p className="text-white/60 text-sm">
            Upload new video or search existing database
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search Mode Toggle */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={searchAllVideos}
              onChange={(e) => onSearchModeChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-white font-medium text-sm block">
                Search All Videos in Database
              </span>
              <span className="text-white/60 text-xs">
                {searchAllVideos 
                  ? "Searching across all processed videos" 
                  : "Search only in specific video below"}
              </span>
            </div>
          </label>
        </div>

        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 hover:border-green-500/50 transition-colors">
          <input
            type="file"
            accept="video/*"
            onChange={onFileChange}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Video className="w-8 h-8 text-white/40" />
            <span className="text-white/60 text-sm">
              Click to upload CCTV footage
            </span>
            <span className="text-white/40 text-xs">MP4, AVI, MOV supported</span>
          </label>
        </div>

        {videoFile && (
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white text-sm">
              Selected: <span className="text-blue-400">{videoFile.name}</span>
            </p>
          </div>
        )}

        <button
          onClick={onUpload}
          disabled={uploadingVideo || !videoFile}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {uploadingVideo ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Video...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload & Process Video
            </>
          )}
        </button>

        {!searchAllVideos && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-2 text-white/40">OR</span>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                Enter specific Job ID to search:
              </label>
              <input
                type="text"
                value={videoJobId}
                onChange={(e) => onJobIdChange(e.target.value)}
                placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50"
              />
              <p className="text-white/40 text-xs mt-2">
                Leave empty to search all videos in database
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
        <p className="text-blue-300 text-xs leading-relaxed">
          <strong>How it works:</strong> Video is processed frame-by-frame. We detect persons, extract faces, and generate embeddings for each frame. These are stored in the database for comparison.
        </p>
      </div>
    </div>
  );
}