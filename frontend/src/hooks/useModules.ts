"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { SystemModule, CreateModulePayload, UpdateModulePayload } from "@/types/module";

let cachedModules: SystemModule[] | null = null;

export function useModules() {
  const [allModules, setAllModules] = useState<SystemModule[]>(() => cachedModules || []);
  const [loading, setLoading] = useState(() => !cachedModules);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof SystemModule | null>("sort_order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchModules = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<SystemModule[]>("/modules/management");
      if (res.data && Array.isArray(res.data)) {
        cachedModules = res.data;
        setAllModules(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load modules";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleSort = useCallback((field: keyof SystemModule) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const filteredModules = useMemo(() => {
    let result = [...allModules];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name_th?.toLowerCase().includes(q) ||
          m.name_en?.toLowerCase().includes(q) ||
          m.dashboard_name_th?.toLowerCase().includes(q) ||
          m.dashboard_name_en?.toLowerCase().includes(q) ||
          m.key?.toLowerCase().includes(q)
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === bVal) return 0;
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        let comp = 0;
        if (typeof aVal === "number" && typeof bVal === "number") {
          comp = aVal - bVal;
        } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
          comp = (aVal ? 1 : 0) - (bVal ? 1 : 0);
        } else {
          comp = String(aVal).localeCompare(String(bVal), "th", { numeric: true });
        }

        return sortDirection === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [allModules, searchQuery, sortField, sortDirection]);

  const totalItems = filteredModules.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedModules = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredModules.slice(start, start + pageSize);
  }, [filteredModules, currentPage, pageSize]);

  const createModule = useCallback(
    async (data: CreateModulePayload): Promise<boolean> => {
      try {
        const res = await api.post("/modules/management", data);
        if (res.data) {
          await fetchModules();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchModules]
  );

  const updateModule = useCallback(
    async (id: string, data: UpdateModulePayload): Promise<boolean> => {
      try {
        const res = await api.put(`/modules/management/${id}`, data);
        if (res.data) {
          await fetchModules();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchModules]
  );

  return {
    modules: paginatedModules,
    allModules,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    sortField,
    sortDirection,
    handleSort,
    fetchModules,
    createModule,
    updateModule,
  };
}
