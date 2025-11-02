import { Upload, User } from "lucide-react";
import { ReferenceResult } from "@/types";

interface ReferenceUploadProps {
  refFile: File | null;
  refPreview: string;
  uploadingRef: boolean;
  refResults: ReferenceResult[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (e: React.FormEvent) => void;
}

export function ReferenceUpload({
  refFile,
  refPreview,
  uploadingRef,
  refResults,
  onFileChange,
  onUpload,
}: ReferenceUploadProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg">
            Step 1: Reference Image
          </h2>
          <p className="text-white/60 text-sm">
            Upload the missing person's photo
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {refPreview && (
          <div className="relative">
            <img
              src={refPreview}
              alt="Reference preview"
              className="w-full h-64 object-cover rounded-xl border-2 border-purple-500/30"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Preview
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            id="ref-upload"
          />
          <label
            htmlFor="ref-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-white/40" />
            <span className="text-white/60 text-sm">
              Click to upload reference image
            </span>
            <span className="text-white/40 text-xs">JPG, PNG up to 10MB</span>
          </label>
        </div>

        <button
          onClick={onUpload}
          disabled={uploadingRef || !refFile}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {uploadingRef ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Embeddings...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Process Reference Image
            </>
          )}
        </button>

        {refResults.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm font-medium mb-2">
              ✓ Reference Processed
            </p>
            {refResults.map((r) => (
              <div key={r.person_id} className="text-white/80 text-xs">
                ID: {r.person_id} • {r.gender} • Age: {r.age}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
        <p className="text-blue-300 text-xs leading-relaxed">
          <strong>How it works:</strong> We extract facial features and generate a unique embedding vector from the reference image. This embedding is stored and used to search through CCTV footage frames.
        </p>
      </div>
    </div>
  );
}