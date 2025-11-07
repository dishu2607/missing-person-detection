// hooks/useDashboardData.ts
"use client";
import { useEffect, useState } from "react";
import api, { DashboardStats, RecentSearch } from "@/lib/api";

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await api.getDashboardStats();
      const recent = await api.getRecentSearches();
      setStats(statsData);
      setRecentSearches(recent);
      console.log("📊 Dashboard data:", { statsData, recent });
    } catch (err: any) {
      console.error("❌ Dashboard fetch error:", err.message || err);
      setError(err.message || "Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { stats, recentSearches, loading, error, refetch: fetchDashboardData };
}
