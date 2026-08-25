import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface MonthlyTrendStat {
  year: number;
  month: number;
  month_name: string;
  active_count: number;
  inactive_count: number;
}

export interface Overview {
  total_cities: number;
  active_cities: number;
  inactive_cities?: number;
  total_users: number;
  registered_users?: number;
  total_admins?: number;
  total_elderly_and_disabled?: number;
  total_bedridden?: number;
  approved_users?: number;
  pending_users?: number;
  rejected_users?: number;
  monthly_trends?: MonthlyTrendStat[];
}

export function useAnalytics() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await api.get("/analytics/overview");
        setOverview(res.data);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Failed to fetch analytics";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  return { overview, loading, error };
}
