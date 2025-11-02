import { Search } from "lucide-react";

interface SearchButtonProps {
  isSearching: boolean;
  disabled: boolean;
  onClick: () => void;
  refId: string;
  searchAllVideos: boolean;
}

export function SearchButton({ isSearching, disabled, onClick, refId, searchAllVideos }: SearchButtonProps) {
  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm mb-1">Ready to Search</p>
            <p className="text-white/60 text-xs">
              Reference ID: <span className="text-purple-400 font-mono">{refId || 'Not set'}</span>
            </p>
            <p className="text-white/60 text-xs">
              Search Scope: <span className="text-blue-400">{searchAllVideos ? 'All Videos' : 'Specific Video'}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs">Top Matches</p>
            <p className="text-white font-bold text-2xl">10</p>
          </div>
        </div>
      </div>

      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg"
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
    </div>
  );
}