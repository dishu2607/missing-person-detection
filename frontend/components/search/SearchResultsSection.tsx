"use client";

import { VideoMatchCard } from "./VideoMatchCard";

interface SearchResultsSectionProps {
  compareResults: any[];
  refPreview: string;
  refResults: any[];
  imageLoadErrors: Set<number>;
  setImageLoadErrors: (errors: Set<number>) => void;
}

export function SearchResultsSection({
  compareResults,
  refPreview,
  refResults,
  imageLoadErrors,
  setImageLoadErrors,
}: SearchResultsSectionProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Search Results
          </h2>
          <p className="text-gray-400">
            Found <strong className="text-blue-400">{compareResults.length}</strong> potential matches sorted by confidence score
          </p>
        </div>

        {/* Reference Display */}
        {refPreview && refResults.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-6">
              <img
                src={refPreview}
                alt="Reference"
                className="w-32 h-32 object-cover rounded-xl border-2 border-blue-500"
              />
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">
                  Reference Person
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  All matches below are compared against this reference image
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                    ID: {refResults[0].person_id}
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                    {refResults[0].gender}
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                    Age: {refResults[0].age}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {compareResults.map((match, index) => (
            <VideoMatchCard
              key={index}
              match={match}
              index={index}
              hasError={imageLoadErrors.has(index)}
              onImageError={() => {
                const newErrors = new Set(imageLoadErrors);
                newErrors.add(index);
                setImageLoadErrors(newErrors);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}