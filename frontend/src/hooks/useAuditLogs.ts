import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface AuditLog {
  id: string;
  super_admin_id: string;
  username: string;
  full_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_date: string;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        const res = await api.get("/audit-logs");
        setLogs(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ip_address.includes(searchTerm)
  );

  return {
    logs: filteredLogs,
    rawLogsCount: logs.length,
    loading,
    searchTerm,
    setSearchTerm,
  };
}
