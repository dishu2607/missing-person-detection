"use client";

import { ReferenceUploadSection } from "@/components/search/ReferenceUploadSection";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { useMissingPersonSearch } from "@/hooks/useMissingPersonSearch";

export default function SearchPage() {
  const searchState = useMissingPersonSearch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Find Missing Person
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload a reference photo and let our AI search through CCTV footage database
          </p>
        </div>

        {/* Reference Upload Section */}
        <ReferenceUploadSection {...searchState} />

        {/* Search Results Section */}
        {searchState.compareResults.length > 0 && (
          <SearchResultsSection {...searchState} />
        )}
      </div>
    </div>
  );
}