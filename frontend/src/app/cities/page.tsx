"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { useCities, City } from "@/hooks/useCities";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  ExternalLink, 
  Users, 
  Layers, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function CitiesPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
    updateCity,
  } = useCities();

  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [addressTh, setAddressTh] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [status, setStatus] = useState("Active");
  const [formError, setFormError] = useState("");

  const canEdit = currentUser?.roleName === "SuperAdmin" || currentUser?.roleName === "Admin";

  const handleOpenEditModal = (city: City) => {
    setEditingCity(city);
    setNameTh(city.name_th);
    setNameEn(city.name_en || "");
    setAddressTh(city.address_th || "");
    setPhone(city.phone || "");
    setLatitude(city.latitude || 0);
    setLongitude(city.longitude || 0);
    setStatus(city.status || "Active");
    setFormError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;
    setFormError("");

    const success = await updateCity(editingCity.id, {
      name_th: nameTh,
      name_en: nameEn,
      address_th: addressTh,
      phone: phone,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: status,
    });

    if (success) {
      setEditModalOpen(false);
      setEditingCity(null);
    } else {
      setFormError("ไม่สามารถอัปเดตข้อมูลเมืองได้ กรุณาตรวจสอบข้อมูลอีกครั้ง");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">ระบบบริหารจัดการเมือง (Multi-City Operations)</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">มอนิเตอร์สถานะเมือง ดูสถิติการใช้งานแต่ละโมดูล และแก้ไขรายละเอียดเทศบาล</p>
            </div>
          </div>

          {/* 3 Metric Cards Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <MetricCard
              title="จำนวนเมืองทั้งหมด"
              value={totalCities}
              subtitle="เทศบาลในระบบ UAT"
              icon={Building2}
              iconBgColor="bg-sky-50 border-sky-100"
              iconTextColor="text-sky-600"
              loading={loading}
            />

            <MetricCard
              title="เมืองที่เปิดใช้งาน (Active)"
              value={activeCities}
              subtitle="พร้อมให้บริการประชาชน"
              icon={CheckCircle2}
              iconBgColor="bg-emerald-50 border-emerald-100"
              iconTextColor="text-emerald-600"
              loading={loading}
            />

            <MetricCard
              title="เมืองที่ปิดใช้งาน (Inactive)"
              value={inactiveCities}
              subtitle="ปิดปรับปรุงหรือยังไม่เปิดระบบ"
              icon={XCircle}
              iconBgColor="bg-slate-100 border-slate-200"
              iconTextColor="text-slate-500"
              loading={loading}
            />
          </div>

          {/* Cities Data Table */}
          <div className="ms-card p-4 sm:p-6 rounded-2xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">รายการเมืองทั้งหมด ({cities.length})</h2>

            {loading ? (
              <LoadingSpinner label="กำลังโหลดข้อมูลรายการเมือง..." />
            ) : cities.length === 0 ? (
              <div className="py-12 text-center text-slate-400">ยังไม่มีข้อมูลเมืองในระบบ UAT</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 min-w-[750px]">
                  <thead className="text-xs uppercase bg-slate-100 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">ชื่อเทศบาล / เมือง</th>
                      <th className="py-3.5 px-4 font-bold">สถานะ</th>
                      <th className="py-3.5 px-4 font-bold">จำนวนโมดูล</th>
                      <th className="py-3.5 px-4 font-bold">จำนวนผู้ใช้งาน (Users)</th>
                      <th className="py-3.5 px-4 text-right font-bold">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cities.map((city) => (
                      <tr key={city.id} className="hover:bg-slate-50 transition-all">
                        <td className="py-4 px-4 font-semibold text-slate-800">
                          <div>{city.name_th}</div>
                          <div className="text-xs text-slate-400 font-normal">{city.name_en}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={city.status === "Active" ? "success" : "neutral"}>
                            {city.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 font-bold text-sky-600">
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-sky-500" />
                            <span>{city.active_modules_count} โมดูล</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <span>{city.total_users_count || 0} คน</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                          <Link
                            href={`/cities/${city.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>ดูรายละเอียด & สถิติ</span>
                          </Link>

                          {canEdit && (
                            <button
                              onClick={() => handleOpenEditModal(city)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
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
          </div>
        </main>
      </div>

      {/* Edit City Modal Form */}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ (Phone)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">สถานะเมือง (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              >
                <option value="Active">Active (เปิดบริการ)</option>
                <option value="Inactive">Inactive (ปิดบริการ)</option>
                <option value="Maintenance">Maintenance (ปรับปรุง)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">พิกัด Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">พิกัด Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
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
    </div>
  );
}
