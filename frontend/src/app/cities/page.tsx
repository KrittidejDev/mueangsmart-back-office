"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCities, City } from "@/hooks/useCities";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  ExternalLink, 
  Users, 
  User, 
  Plus, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function CitiesPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const {
    cities,
    totalCities,
    activeCities,
    inactiveCities,
    loading,
    updating,
    createCity,
    updateCity,
  } = useCities();

  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [addressTh, setAddressTh] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState<number>(13.7563);
  const [longitude, setLongitude] = useState<number>(100.5018);
  const [status, setStatus] = useState("ใช้งาน");
  const [modulesCount, setModulesCount] = useState<number>(8);
  const [riverStatus, setRiverStatus] = useState("10");
  const [senseStatus, setSenseStatus] = useState("12");
  const [activeUsersCount, setActiveUsersCount] = useState<number>(200);
  const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(300);
  const [formError, setFormError] = useState("");

  const canEdit = currentUser?.roleName === "SuperAdmin" || currentUser?.roleName === "Admin";

  const totalUsers = cities.reduce((acc, c) => acc + (c.active_users_count || 0), 0);
  const totalRegistered = cities.reduce((acc, c) => acc + (c.registered_users_count || Math.round((c.active_users_count || 0) * 1.5)), 0);

  const activePercent = totalCities > 0 ? ((activeCities / totalCities) * 100).toFixed(2) : "0.00";
  const inactivePercent = totalCities > 0 ? ((inactiveCities / totalCities) * 100).toFixed(2) : "0.00";

  const filteredCities = cities.filter((city) =>
    city.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (city.address_th && city.address_th.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (city.name_en && city.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCities.length / pageSize) || 1;
  const paginatedCities = filteredCities.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetForm = () => {
    setNameTh("");
    setNameEn("");
    setAddressTh("");
    setPhone("");
    setLatitude(13.7563);
    setLongitude(100.5018);
    setStatus("ใช้งาน");
    setModulesCount(8);
    setRiverStatus("10");
    setSenseStatus("12");
    setActiveUsersCount(200);
    setRegisteredUsersCount(300);
    setFormError("");
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameTh.trim() || !addressTh.trim()) {
      setFormError("กรุณากรอกชื่อเมืองและที่อยู่ให้ครบถ้วน");
      return;
    }
    setFormError("");

    const success = await createCity({
      name_th: nameTh,
      name_en: nameEn,
      address_th: addressTh,
      phone: phone,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: status,
      modules_count: Number(modulesCount),
      active_modules_count: Number(modulesCount),
      river_status: riverStatus,
      sense_status: senseStatus,
      active_users_count: Number(activeUsersCount),
      registered_users_count: Number(registeredUsersCount),
      total_users_count: Number(registeredUsersCount),
    });

    if (success) {
      setCreateModalOpen(false);
      resetForm();
    } else {
      setFormError("ไม่สามารถสร้างเมืองใหม่ได้ กรุณาตรวจสอบข้อมูลอีกครั้ง");
    }
  };

  const handleOpenEditModal = (city: City) => {
    setEditingCity(city);
    setNameTh(city.name_th);
    setNameEn(city.name_en || "");
    setAddressTh(city.address_th || "");
    setPhone(city.phone || "");
    setLatitude(city.latitude || 13.7563);
    setLongitude(city.longitude || 100.5018);
    setStatus(city.status || "ใช้งาน");
    setModulesCount(city.modules_count || city.active_modules_count || 8);
    setRiverStatus(String(city.river_status ?? "10"));
    setSenseStatus(String(city.sense_status ?? "12"));
    setActiveUsersCount(city.active_users_count || 0);
    setRegisteredUsersCount(city.registered_users_count || 0);
    setFormError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;
    if (!nameTh.trim() || !addressTh.trim()) {
      setFormError("กรุณากรอกชื่อเมืองและที่อยู่ให้ครบถ้วน");
      return;
    }
    setFormError("");

    const success = await updateCity(editingCity.id, {
      name_th: nameTh,
      name_en: nameEn,
      address_th: addressTh,
      phone: phone,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: status,
      modules_count: Number(modulesCount),
      active_modules_count: Number(modulesCount),
      river_status: riverStatus,
      sense_status: senseStatus,
      active_users_count: Number(activeUsersCount),
      registered_users_count: Number(registeredUsersCount),
      total_users_count: Number(registeredUsersCount),
    });

    if (success) {
      setEditModalOpen(false);
      setEditingCity(null);
    } else {
      setFormError("ไม่สามารถอัปเดตข้อมูลเมืองได้ กรุณาตรวจสอบข้อมูลอีกครั้ง");
    }
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
              <div className="text-xs text-slate-400 font-medium self-start sm:self-auto">
                Dashboard / <span className="text-slate-600">จัดการเมือง (Multi-City)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">จำนวนเมืองทั้งหมด</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalCities}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">เมือง</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">เมืองที่เปิดใช้งาน</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{activeCities}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">เมือง ({activePercent}%)</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">เมืองที่ไม่ได้ใช้งาน</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{inactiveCities}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">เมือง ({inactivePercent}%)</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">จำนวนผู้ใช้งานทั้งหมด</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalUsers.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">คน</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">จำนวนผู้ลงทะเบียนทั้งหมด</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalRegistered.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">คน</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  รายการเมืองทั้งหมด ({filteredCities.length})
                </h2>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="ค้นหาเมือง"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 sm:w-64 bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                  />
                  {canEdit && (
                    <button
                      onClick={handleOpenCreateModal}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ เพิ่มเมือง</span>
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <LoadingSpinner label="กำลังโหลดข้อมูลรายการเมือง..." />
              ) : filteredCities.length === 0 ? (
                <div className="py-12 text-center text-slate-400">ไม่พบข้อมูลเมืองในระบบ</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700 min-w-[850px]">
                    <thead className="text-xs bg-slate-50 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 font-bold">ชื่อเมือง / ที่อยู่</th>
                        <th className="py-3 px-4 font-bold text-center">สถานะ</th>
                        <th className="py-3 px-4 font-bold text-center">Module</th>
                        <th className="py-3 px-4 font-bold text-center">River</th>
                        <th className="py-3 px-4 font-bold text-center">Sense</th>
                        <th className="py-3 px-4 font-bold text-right">ผู้ใช้งาน</th>
                        <th className="py-3 px-4 font-bold text-right">ผู้ลงทะเบียน</th>
                        <th className="py-3 px-4 font-bold text-center">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedCities.map((city) => (
                        <tr key={city.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{city.name_th}</div>
                            <div className="text-xs text-slate-400 font-normal mt-0.5">{city.address_th}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                          <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                            {city.modules_count || city.active_modules_count || 8}
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                            {city.river_status ?? "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                            {city.sense_status ?? "-"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                            {(city.active_users_count || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                            {(city.registered_users_count || Math.round((city.active_users_count || 0) * 1.5)).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap space-x-2">
                            <Link
                              href={`/cities/${city.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sky-200 bg-sky-50/60 hover:bg-sky-100 text-sky-600 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
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

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>แสดง</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 outline-none text-xs font-medium text-slate-700"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>รายการต่อหน้า</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? "bg-sky-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    &gt;
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    &raquo;
                  </button>
                </div>

                <div>
                  ทั้งหมด {filteredCities.length} รายการ
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="เพิ่มเมืองใหม่ (+ New City)">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเมืองภาษาไทย (Name TH)*</label>
            <input
              type="text"
              required
              placeholder="เช่น เทศบาลนครเชียงใหม่"
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเมืองภาษาอังกฤษ (Name EN)</label>
            <input
              type="text"
              placeholder="e.g. Chiang Mai Municipality"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ที่อยู่เทศบาล (Address TH)*</label>
            <textarea
              rows={2}
              required
              placeholder="เช่น ต.ช้างคลาน อ.เมือง จ.เชียงใหม่ 50000"
              value={addressTh}
              onChange={(e) => setAddressTh(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">สถานะเมือง (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              >
                <option value="ใช้งาน">ใช้งาน</option>
                <option value="ไม่ใช้งาน">ไม่ใช้งาน</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวน Module</label>
              <input
                type="number"
                value={modulesCount}
                onChange={(e) => setModulesCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนอุปกรณ์ River</label>
              <input
                type="text"
                placeholder="เช่น 10 หรือ -"
                value={riverStatus}
                onChange={(e) => setRiverStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนอุปกรณ์ Sense</label>
              <input
                type="text"
                placeholder="เช่น 15 หรือ -"
                value={senseStatus}
                onChange={(e) => setSenseStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนผู้ใช้งาน (คน)</label>
              <input
                type="number"
                value={activeUsersCount}
                onChange={(e) => setActiveUsersCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนผู้ลงทะเบียน (คน)</label>
              <input
                type="number"
                value={registeredUsersCount}
                onChange={(e) => setRegisteredUsersCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้าง...</span>
                </>
              ) : (
                <span>สร้างเมือง</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="แก้ไขรายละเอียดเมือง / เทศบาล">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเมืองภาษาไทย (Name TH)</label>
            <input
              type="text"
              required
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเมืองภาษาอังกฤษ (Name EN)</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ที่อยู่เทศบาล (Address)</label>
            <textarea
              rows={2}
              value={addressTh}
              onChange={(e) => setAddressTh(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">สถานะเมือง (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              >
                <option value="ใช้งาน">ใช้งาน</option>
                <option value="ไม่ใช้งาน">ไม่ใช้งาน</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวน Module</label>
              <input
                type="number"
                value={modulesCount}
                onChange={(e) => setModulesCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนอุปกรณ์ River</label>
              <input
                type="text"
                placeholder="เช่น 10 หรือ -"
                value={riverStatus}
                onChange={(e) => setRiverStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนอุปกรณ์ Sense</label>
              <input
                type="text"
                placeholder="เช่น 15 หรือ -"
                value={senseStatus}
                onChange={(e) => setSenseStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนผู้ใช้งาน (คน)</label>
              <input
                type="number"
                value={activeUsersCount}
                onChange={(e) => setActiveUsersCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนผู้ลงทะเบียน (คน)</label>
              <input
                type="number"
                value={registeredUsersCount}
                onChange={(e) => setRegisteredUsersCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกการเปลี่ยนแปลง</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}
