"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ReferenceDetailsModal from "./ReferenceDetailsModal";
import { Eye, Loader2, Image as ImageIcon } from "lucide-react";

interface Search {
  reference_id: string;
  reference_image: string;
  reference_path: string;
  gender: string;
  age: string;
  match_count: number;
  frames_processed: number;
  top_match_score: number;
  job_id: string | null;
}

export default function RecentSearchesTable() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefTime, setSelectedRefTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearches = async () => {
      try {
        const data = await api.getRecentSearches();
        setSearches(data);
      } catch (err) {
        console.error("❌ Failed to fetch recent searches:", err);
        setError("Failed to load recent searches.");
      } finally {
        setLoading(false);
      }
    };
    fetchSearches();
  }, []);

  // ──────────────────────────────────────────────────────────────
  //  LOADING STATE (skeleton shimmer)
  // ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-400" />
        <p>Loading recent searches...</p>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  //  ERROR STATE
  // ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center">
        {error}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  //  EMPTY STATE
  // ──────────────────────────────────────────────────────────────
  if (!searches.length) {
    return (
      <div className="text-center text-gray-400 py-10 bg-gray-800/30 rounded-xl border border-gray-700">
        No reference images found yet.
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  //  MAIN TABLE
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-800/40 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="bg-gray-900/70 text-xs uppercase font-semibold text-gray-400">
          <tr>
            <th className="px-6 py-3">Reference</th>
            <th className="px-6 py-3">Gender</th>
            <th className="px-6 py-3">Age</th>
            <th className="px-6 py-3">Frames</th>
            <th className="px-6 py-3">Matches</th>
            <th className="px-6 py-3">Top Match</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {searches.map((search, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-700/30 transition-colors duration-150"
            >
              {/* Reference image */}
              <td className="px-6 py-3 flex items-center space-x-3">
                {search.reference_image ? (
                  <img
                    src={`${api.baseUrl}/uploads/${search.reference_image}`}
                    alt={search.reference_id}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/48x48?text=?";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">
                    {search.reference_id}
                  </p>
                  <p className="text-xs text-gray-500 truncate w-40">
                    {search.reference_image}
                  </p>
                </div>
              </td>

              <td className="px-6 py-3">{search.gender || "Unknown"}</td>
              <td className="px-6 py-3">{search.age || "Unknown"}</td>
              <td className="px-6 py-3">{search.frames_processed || 0}</td>
              <td className="px-6 py-3">{search.match_count || 0}</td>

              {/* Top match bar */}
              <td className="px-6 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-2"
                      style={{
                        width: `${(search.top_match_score || 0) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {((search.top_match_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </td>

              {/* Action button */}
              <td className="px-6 py-3 text-center">
                <button
                  onClick={() => setSelectedRefTime(search.reference_id)}
                  className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedRefTime && (
        <ReferenceDetailsModal
          referenceId={selectedRefTime}
          onClose={() => setSelectedRefTime(null)}
        />
      )}
    </div>
  );
}
