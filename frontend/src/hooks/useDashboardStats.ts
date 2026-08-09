import { useState, useEffect, useCallback } from "react";
import { getStations } from "../../api/station";
import { getTrains } from "../../api/train";
import { getLines } from "../../api/line";
import { getWilayas } from "../../api/wilaya";
import { getNotices } from "../../api/notice";
import { getAdminUsers } from "../../api/adminUsers";

export type DashboardStats = {
  stations: number;
  trains: number;
  lines: number;
  wilayas: number;
  notices: number;
  admins: number;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    stations: 0, trains: 0, lines: 0, wilayas: 0, notices: 0, admins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [st, tr, ln, wl, nt, ad] = await Promise.all([
        getStations(), getTrains(), getLines(), getWilayas(), getNotices(), getAdminUsers(),
      ]);
      setStats({
        stations: st.length, trains: tr.length, lines: ln.length,
        wilayas: wl.length, notices: nt.length, admins: ad.length,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تحميل الإحصائيات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats, clearError: () => setError(null)  };
}