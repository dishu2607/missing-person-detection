// components/dashboard/StatsCards.tsx
"use client";
import React from "react";
import { TrendingUp, Video, Image, Users } from "lucide-react";

interface Props {
  stats: {
    total_videos: number;
    total_references: number;
    total_frames_processed: number;
    total_persons_detected: number;
  };
}

export function StatsCards({ stats }: Props) {
  const cards = [
    { icon: Video, label: "Videos", value: stats.total_videos, color: "from-purple-500 to-pink-500" },
    { icon: Image, label: "References", value: stats.total_references, color: "from-yellow-500 to-orange-500" },
    { icon: TrendingUp, label: "Frames Processed", value: stats.total_frames_processed, color: "from-green-500 to-emerald-500" },
    { icon: Users, label: "Persons Detected", value: stats.total_persons_detected, color: "from-blue-500 to-indigo-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-300">{c.label}</div>
              <div className="text-2xl font-bold text-white">{c.value}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
