"use client";

import { useState, useMemo } from "react";
import { SystemModule } from "@/types/module";

const MOCK_MODULES: SystemModule[] = [
  {
    id: "1",
    sort_order: 1,
    name_th: "ร้องทุกข์ร้องเรียน",
    name_en: "Complaint Center",
    dashboard_name_th: "ร้องทุกข์ร้องเรียน",
    dashboard_name_en: "Complaint Center",
    verify_identity: false,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "2",
    sort_order: 2,
    name_th: "ค่าธรรมเนียมขยะ",
    name_en: "Waste Fee",
    dashboard_name_th: "ธรรมเนียมขยะ",
    dashboard_name_en: "Waste Fee",
    verify_identity: true,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "3",
    sort_order: 3,
    name_th: "จ่ายการตลาดออนไลน์",
    name_en: "Online Services",
    dashboard_name_th: "รายการออนไลน์",
    dashboard_name_en: "Online Services",
    verify_identity: true,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "4",
    sort_order: 4,
    name_th: "สุขภาพสุนัขและแมว",
    name_en: "Pet Health",
    dashboard_name_th: "สุขภาพสุนัขและแมว",
    dashboard_name_en: "Pet Health",
    verify_identity: true,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "5",
    sort_order: 5,
    name_th: "ผู้สูงอายุ ผู้พิการ",
    name_en: "Elderly & Disability",
    dashboard_name_th: "ผู้สูงอายุ ผู้พิการ",
    dashboard_name_en: "Elderly & Disability",
    verify_identity: true,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "6",
    sort_order: 6,
    name_th: "ผู้ป่วยติดเตียง",
    name_en: "Bedridden Patients",
    dashboard_name_th: "ผู้ป่วยติดเตียง",
    dashboard_name_en: "Bedridden Patients",
    verify_identity: true,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "7",
    sort_order: 7,
    name_th: "ประชาสัมพันธ์",
    name_en: "News & Announcements",
    dashboard_name_th: "ประชาสัมพันธ์",
    dashboard_name_en: "News & Announcements",
    verify_identity: false,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "8",
    sort_order: 8,
    name_th: "ยืนยันตัวตน",
    name_en: "Verify Identity",
    dashboard_name_th: "ยืนยันตัวตน",
    dashboard_name_en: "Verify Identity",
    verify_identity: false,
    department: true,
    admin_only: true,
    show_dashboard: false,
  },
  {
    id: "9",
    sort_order: 9,
    name_th: "ศูนย์ร้องทุกข์ร้องเรียน",
    name_en: "City Management",
    dashboard_name_th: "จัดการเมือง",
    dashboard_name_en: "City Management",
    verify_identity: false,
    department: false,
    admin_only: true,
    show_dashboard: false,
  },
  {
    id: "10",
    sort_order: 10,
    name_th: "ฟ้าฝน",
    name_en: "Complaint Center",
    dashboard_name_th: "ศูนย์ร้องทุกข์ร้องเรียน",
    dashboard_name_en: "Complaint Center",
    verify_identity: false,
    department: true,
    admin_only: true,
    show_dashboard: false,
  },
  {
    id: "11",
    sort_order: 11,
    name_th: "ข้อมูลระดับน้ำ",
    name_en: "Lightning Alert",
    dashboard_name_th: "ฟ้าฝน",
    dashboard_name_en: "Lightning Alert",
    verify_identity: false,
    department: false,
    admin_only: false,
    show_dashboard: false,
  },
  {
    id: "12",
    sort_order: 12,
    name_th: "กล้องวงจร Info",
    name_en: "Water Level Info",
    dashboard_name_th: "ข้อมูลระดับน้ำ",
    dashboard_name_en: "Water Level Info",
    verify_identity: false,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "13",
    sort_order: 13,
    name_th: "กล้องวงจรปิด",
    name_en: "CCTV",
    dashboard_name_th: "กล้องวงจรปิด",
    dashboard_name_en: "CCTV",
    verify_identity: true,
    department: true,
    admin_only: false,
    show_dashboard: true,
  },
  {
    id: "14",
    sort_order: 99,
    name_th: "พยากรณ์อากาศ by FAHFON",
    name_en: "Weather by FAHFON",
    dashboard_name_th: "พยากรณ์อากาศ by FAHFON",
    dashboard_name_en: "Weather by FAHFON",
    verify_identity: false,
    department: false,
    admin_only: false,
    show_dashboard: true,
  },
];

export function useModules() {
  const [modules, setModules] = useState<SystemModule[]>(MOCK_MODULES);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof SystemModule | null>("sort_order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return modules;
    return modules.filter(
      (m) =>
        m.name_th.toLowerCase().includes(query) ||
        m.name_en.toLowerCase().includes(query) ||
        m.dashboard_name_th.toLowerCase().includes(query) ||
        m.dashboard_name_en.toLowerCase().includes(query)
    );
  }, [modules, searchQuery]);

  const sortedModules = useMemo(() => {
    if (!sortField) return filteredModules;
    return [...filteredModules].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        comparison = (aVal ? 1 : 0) - (bVal ? 1 : 0);
      } else {
        const strA = String(aVal);
        const strB = String(bVal);
        comparison = strA.localeCompare(strB, "th", { numeric: true, sensitivity: "base" });
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredModules, sortField, sortDirection]);

  const handleSort = (field: keyof SystemModule) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const totalItems = sortedModules.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedModules = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedModules.slice(start, start + pageSize);
  }, [sortedModules, currentPage, pageSize]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const createModule = (data: Omit<SystemModule, "id">) => {
    const nextId = String(
      Math.max(0, ...modules.map((m) => parseInt(m.id, 10) || 0)) + 1
    );
    const newModule: SystemModule = {
      id: nextId,
      ...data,
    };
    setModules((prev) => [...prev, newModule]);
    return newModule;
  };

  const updateModule = (id: string, data: Partial<SystemModule>) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );
  };

  return {
    modules: paginatedModules,
    allModules: modules,
    filteredModules: sortedModules,
    searchQuery,
    setSearchQuery: handleSearchChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    sortField,
    sortDirection,
    handleSort,
    createModule,
    updateModule,
  };
}
