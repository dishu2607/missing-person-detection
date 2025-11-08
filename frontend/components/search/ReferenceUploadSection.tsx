"use client";

import { Upload, Search, AlertCircle, CheckCircle } from "lucide-react";

interface ReferenceUploadSectionProps {
  refFile: File | null;
  refPreview: string;
  uploadingRef: boolean;
  refResults: any[];
  statusMsg: string;
  isSearching: boolean;
  searchAllVideos: boolean;
  handleRefFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadReference: (e: React.FormEvent) => void;
  searchInDatabase: () => void;
  setSearchAllVideos: (value: boolean) => void;
}

export function ReferenceUploadSection({
  refFile,
  refPreview,
  uploadingRef,
  refResults,
  statusMsg,
  isSearching,
  searchAllVideos,
  handleRefFileChange,
  uploadReference,
  searchInDatabase,
  setSearchAllVideos,
}: ReferenceUploadSectionProps) {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
        {/* Status Message */}
        {statusMsg && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <p className="text-blue-300 text-sm">{statusMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Step 1: Upload Reference Image
            </h3>

            {refPreview ? (
              <div className="relative group">
                <img
                  src={refPreview}
                  alt="Reference preview"
                  className="w-full h-80 object-cover rounded-xl border-2 border-blue-500/30"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Loaded
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 hover:border-blue-500/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleRefFileChange}
                  className="hidden"
                  id="ref-upload"
                />
                <label
                  htmlFor="ref-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium mb-1">
                      Click to upload reference image
                    </p>
                    <p className="text-gray-400 text-sm">
                      JPG, PNG up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            )}

            {refFile && !refResults.length && (
              <button
                onClick={uploadReference}
                disabled={uploadingRef}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingRef ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Process Image
                  </>
                )}
              </button>
            )}

            {refResults.length > 0 && (
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 font-semibold">
                    Reference Processed
                  </p>
                </div>
                {refResults.map((r) => (
                  <div key={r.person_id} className="text-gray-300 text-sm">
                    ID: {r.person_id} • {r.gender} • Age: {r.age}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions & Search */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Step 2: Configure Search
            </h3>

            <div className="space-y-4">
              {/* Search Mode Toggle */}
             

              {/* Tips */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-blue-400 font-semibold mb-2 text-sm">
                  Tips for Best Results
                </h4>
                <ul className="space-y-1 text-gray-400 text-xs">
                  <li>• Use a clear, front-facing photo</li>
                  <li>• Good lighting improves accuracy</li>
                  <li>• Avoid sunglasses or face coverings</li>
                  <li>• Recent photos work best</li>
                </ul>
              </div>

              {/* Search Button */}
              <button
                onClick={searchInDatabase}
                disabled={!refResults.length || isSearching}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isSearching ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching Database...
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    Search for Matches
                  </>
                )}
              </button>

              {refResults.length > 0 && (
                <p className="text-center text-gray-400 text-sm">
                  Reference ID: <span className="text-blue-400 font-mono">{refResults[0]?.person_id}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}