"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MetricCard } from "@/components/ui/MetricCard";
import { CityFormModal } from "@/components/cities/CityFormModal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { resolveImageUrl } from "@/lib/image";
import { useCities, City } from "@/hooks/useCities";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Building2, 
  CheckSquare, 
  Target, 
  Edit, 
  ExternalLink, 
  Users, 
  UserCheck, 
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";

function SortIcon({
  field,
  currentField,
  direction,
}: {
  field: string;
  currentField: string | null;
  direction: "asc" | "desc" | null;
}) {
  if (currentField !== field) {
    return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 shrink-0" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="w-3 h-3 text-sky-600 font-bold shrink-0" />
  ) : (
    <ArrowDown className="w-3 h-3 text-sky-600 font-bold shrink-0" />
  );
}

function CityLogo({ logoUrl, name }: { logoUrl?: string; name: string }) {
  const cleanUrl =
    logoUrl?.startsWith("blob:") || logoUrl?.startsWith("data:")
      ? undefined
      : logoUrl;
  const targetLogo = resolveImageUrl(cleanUrl);
  const [imgError, setImgError] = useState(false);

  const isValidUrl = Boolean(targetLogo);

  if (!targetLogo || imgError || !isValidUrl) {
    return (
      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 text-slate-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
        <Building2 className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  return (
    <Image
      src={targetLogo}
      alt={name}
      width={36}
      height={36}
      unoptimized
      onError={() => {
        setImgError(true);
      }}
      className="w-9 h-9 rounded-full object-cover border border-slate-200/80 shadow-2xs flex-shrink-0"
    />
  );
}

export default function CitiesPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const [successModalConfig, setSuccessModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
  }>({
    isOpen: false,
    title: "",
    description: null,
  });

  const currentUser = useAuthStore((state) => state.user);
  const {
    cities,
    totalCities,
    activeCities,
    inactiveCities,
    loading,
    createCity,
    updateCity,
    fetchCityByID,
  } = useCities();

  const { overview } = useAnalytics();
  const canEdit = currentUser?.roleName === "SuperAdmin" || currentUser?.roleName === "Admin";

  const totalUsers = cities.reduce((acc, c) => acc + (c.active_users_count || 0), 0);
  const totalRegistered = overview?.registered_users ?? cities.reduce((acc, c) => acc + (c.registered_users_count || c.active_users_count || 0), 0);

  const activePercent = totalCities > 0 ? ((activeCities / totalCities) * 100).toFixed(2) : "0.00";
  const inactivePercent = totalCities > 0 ? ((inactiveCities / totalCities) * 100).toFixed(2) : "0.00";

  const filteredCities = cities.filter((city) =>
    (city.name_th && city.name_th.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (city.address_th && city.address_th.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (city.name_en && city.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const [sortField, setSortField] = useState<keyof City | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof City) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedCities = React.useMemo(() => {
    if (!sortField) return filteredCities;
    return [...filteredCities].sort((a, b) => {
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
  }, [filteredCities, sortField, sortDirection]);

  const totalItems = sortedCities.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCities = sortedCities.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (data: Partial<City>) => {
    const success = await createCity(data);

    if (success) {
      setSuccessModalConfig({
        isOpen: true,
        title: "สร้างเมืองสำเร็จ!",
        description: (
          <span>
            สร้างข้อมูลเมือง<br />
            <strong className="text-slate-800 font-bold">&ldquo;{data.name_th || "ใหม่"}&rdquo;</strong><br />
            เข้าสู่ระบบเรียบร้อยแล้ว
          </span>
        ),
      });
    }

    return success;
  };

  const handleOpenEditModal = async (city?: City) => {
    const targetCity = city || (cities.length > 0 ? cities[0] : null);
    if (targetCity) {
      const fullCity = await fetchCityByID(targetCity.id);
      setEditingCity(fullCity || targetCity);
    } else {
      setEditingCity(null);
    }
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (data: Partial<City>) => {
    if (!editingCity) return false;
    const success = await updateCity(editingCity.id, data);

    if (success) {
      setSuccessModalConfig({
        isOpen: true,
        title: "บันทึกการเปลี่ยนแปลงสำเร็จ!",
        description: (
          <span>
            อัปเดตข้อมูลรายละเอียดเมือง<br />
            <strong className="text-slate-800 font-bold">&ldquo;{data.name_th || editingCity.name_th}&rdquo;</strong><br />
            เรียบร้อยแล้ว
          </span>
        ),
      });
    }

    return success;
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setMobileOpen(true)} />

          <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  จัดการเมือง (Multi-City)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  บริหารจัดการเมืองทั้งหมดในระบบ ข้อมูลสถิติ และตั้งค่าพื้นฐานของแต่ละเมือง
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              <MetricCard
                title="เมืองทั้งหมด"
                value={totalCities}
                subtitle="เมือง"
                icon={Building2}
                iconBgColor="bg-sky-50 border-sky-100"
                iconTextColor="text-sky-600"
              />

              <MetricCard
                title="เมืองที่เปิดใช้งาน"
                value={activeCities}
                subtitle={`เมือง (${activePercent}%)`}
                icon={CheckSquare}
                iconBgColor="bg-emerald-50 border-emerald-100"
                iconTextColor="text-emerald-600"
              />

              <MetricCard
                title="เมืองที่ไม่ได้เปิดใช้งาน"
                value={inactiveCities}
                subtitle={`เมือง (${inactivePercent}%)`}
                icon={Target}
                iconBgColor="bg-rose-50 border-rose-100"
                iconTextColor="text-rose-600"
              />

              <MetricCard
                title="ผู้ใช้งานทั้งหมด"
                value={totalUsers.toLocaleString()}
                subtitle="คน"
                icon={Users}
                iconBgColor="bg-indigo-50 border-indigo-100"
                iconTextColor="text-indigo-600"
              />

              <MetricCard
                title="ผู้ลงทะเบียนทั้งหมด"
                value={totalRegistered.toLocaleString()}
                subtitle="คน"
                icon={UserCheck}
                iconBgColor="bg-amber-50 border-amber-100"
                iconTextColor="text-amber-600"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  รายการเมืองทั้งหมด ({filteredCities.length})
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative w-48 sm:w-64">
                    <input
                      type="text"
                      placeholder="ค้นหาเมือง"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-2 px-3 pr-9 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {canEdit && (
                    <button
                      onClick={handleOpenCreateModal}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-brand-primary/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มเมือง</span>
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-4 sm:p-6">
                  <LoadingSpinner label="กำลังโหลดข้อมูลรายการเมือง..." />
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="py-12 text-center text-slate-400">ไม่พบข้อมูลเมืองในระบบ</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700 table-fixed min-w-[780px]">
                    <colgroup>
                      <col className="w-[32%]" />
                      <col className="w-[9%]" />
                      <col className="w-[7%]" />
                      <col className="w-[6%]" />
                      <col className="w-[6%]" />
                      <col className="w-[9%]" />
                      <col className="w-[10%]" />
                      <col className="w-[21%]" />
                    </colgroup>
                    <thead className="text-xs bg-slate-50/80 text-slate-700 border-b border-slate-200 font-bold select-none">
                      <tr>
                        <th
                          onClick={() => handleSort("name_th")}
                          className="py-2.5 pl-4 sm:pl-6 pr-2 text-left cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>ชื่อเมือง / ที่อยู่</span>
                            <SortIcon field="name_th" currentField={sortField} direction={sortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("status")}
                          className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>สถานะ</span>
                            <SortIcon field="status" currentField={sortField} direction={sortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("modules_count")}
                          className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Module</span>
                            <SortIcon field="modules_count" currentField={sortField} direction={sortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("river_status")}
                          className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>River</span>
                            <SortIcon field="river_status" currentField={sortField} direction={sortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("sense_status")}
                          className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Sense</span>
                            <SortIcon field="sense_status" currentField={sortField} direction={sortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("active_users_count")}
                          className="py-2.5 px-2 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>ผู้ใช้งาน</span>
                            <SortIcon field="active_users_count" currentField={sortField} direction={sortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("registered_users_count")}
                          className="py-2.5 px-2 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>ผู้ลงทะเบียน</span>
                            <SortIcon field="registered_users_count" currentField={sortField} direction={sortDirection} />
                          </div>
                        </th>
                        <th className="py-2.5 pl-2 pr-4 sm:pr-6 text-center">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedCities.map((city) => (
                        <tr key={city.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="py-3.5 pl-4 sm:pl-6 pr-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <CityLogo logoUrl={city.logo_url} name={city.name_th} />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900 truncate" title={city.name_th}>
                                  {city.name_th}
                                </div>
                                <div className="text-xs text-slate-400 font-normal mt-0.5 truncate" title={city.address_th}>
                                  {city.address_th}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${
                                city.status === "ใช้งาน" || city.status === "Active"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-rose-50 text-rose-500 border border-rose-100"
                              }`}
                            >
                              {city.status === "Active" ? "ใช้งาน" : city.status === "Inactive" ? "ไม่ใช้งาน" : city.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-center font-medium text-slate-800 whitespace-nowrap">
                            {city.modules_count ?? city.active_modules_count ?? 0}
                          </td>
                          <td className="py-3.5 px-2 text-center font-medium text-slate-800 whitespace-nowrap">
                            {city.river_status ?? "-"}
                          </td>
                          <td className="py-3.5 px-2 text-center font-medium text-slate-800 whitespace-nowrap">
                            {city.sense_status ?? "-"}
                          </td>
                          <td className="py-3.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">
                            {(city.active_users_count || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">
                            {(city.registered_users_count || city.active_users_count || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 pl-2 pr-4 sm:pr-6 text-center whitespace-nowrap space-x-1.5">
                            <Link
                              href={`/cities/${city.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-primary/20 bg-brand-light/70 hover:bg-brand-light text-brand-primary rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>รายละเอียด & สถิติ</span>
                            </Link>

                            {canEdit && (
                              <button
                                onClick={() => handleOpenEditModal(city)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-500" />
                                <span>แก้ไขเมือง</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium">
                  แสดง {startItem} - {endItem} จาก {totalItems} รายการ
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span>แสดง</span>
                    <div className="relative">
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-brand-primary cursor-pointer shadow-2xs"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                          currentPage === page
                            ? "bg-brand-primary text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <CityFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        onSave={handleCreateSubmit}
      />

      <CityFormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingCity(null);
        }}
        mode="edit"
        cityData={editingCity}
        onSave={handleSaveEdit}
      />

      <SuccessModal
        isOpen={successModalConfig.isOpen}
        onClose={() => setSuccessModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={successModalConfig.title}
        description={successModalConfig.description}
      />
    </ProtectedRoute>
  );
}
