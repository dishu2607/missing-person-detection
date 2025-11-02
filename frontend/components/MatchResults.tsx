import { Database } from "lucide-react";
import { CompareResult, ReferenceResult } from "@/types";
import { VideoMatchCard } from "./VideoMatchCard";

interface MatchResultsProps {
  compareResults: CompareResult[];
  refPreview: string;
  refResults: ReferenceResult[];
  imageLoadErrors: Set<number>;
  onImageError: (index: number) => void;
}

export function MatchResults({
  compareResults,
  refPreview,
  refResults,
  imageLoadErrors,
  onImageError,
}: MatchResultsProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
          <Database className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg">
            Match Results
          </h2>
          <p className="text-white/60 text-sm">
            Top matches found in CCTV footage
          </p>
        </div>
      </div>

      {compareResults.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">
            No matches found yet. Complete the search to see results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
            <p className="text-blue-300 text-sm">
              Showing <strong>top {compareResults.length}</strong> matches sorted by confidence score
            </p>
          </div>

          {/* Reference Image Display */}
          {refPreview && (<div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-4">
                <img
                  src={refPreview}
                  alt="Reference"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-purple-500"
                />
                <div className="flex-1">
                  <p className="text-purple-300 font-semibold mb-1">Reference Person</p>
                  <p className="text-white/60 text-xs mb-2">
                    Searching across all videos in database
                  </p>
                  {refResults.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        ID: {refResults[0].person_id}
                      </span>
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {refResults[0].gender}
                      </span>
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        Age: {refResults[0].age}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[700px] overflow-y-auto pr-2">
            {compareResults.map((m, i) => (
              <VideoMatchCard
                key={i}
                match={m}
                index={i}
                hasError={imageLoadErrors.has(i)}
                onImageError={() => onImageError(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
            