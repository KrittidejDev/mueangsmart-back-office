"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCities, City, ModuleStatus } from "@/hooks/useCities";
import { useAuthStore } from "@/store/useAuthStore";

import { 
  Building2, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Users, 
  UserCheck,
  Layers, 
  ToggleLeft, 
  ToggleRight, 
  ShieldAlert,
  CheckCircle2,
  Landmark,
  HeartHandshake,
  Mail,
  CreditCard,
  Crown
} from "lucide-react";

export default function CityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const cityId = resolvedParams.id;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [city, setCity] = useState<City | null>(null);
  const currentUser = useAuthStore((state) => state.user);

  const {
    loading,
    modules,
    loadingModules,
    selectCity,
    fetchCityByID,
    toggleModule,
  } = useCities();

  const canEditModule = currentUser?.roleName === "SuperAdmin" || currentUser?.roleName === "Admin";

  useEffect(() => {
    async function loadCityData() {
      const cityData = await fetchCityByID(cityId);
      if (cityData) {
        setCity(cityData);
        selectCity(cityData);
      }
    }
    loadCityData();
  }, [cityId, fetchCityByID, selectCity]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">

        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/cities"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-sky-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับไปหน้ารายการเมือง</span>
            </Link>

            {!canEditModule && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>ผู้บริหาร (Read-Only Mode)</span>
              </span>
            )}
          </div>

          {loading || !city ? (
            <LoadingSpinner label="กำลังดึงรายละเอียดสถิติเมือง..." />
          ) : (
            <>
              {/* City Banner & Header Card */}
              <div className="ms-card p-6 sm:p-8 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
                      <Building2 className="w-9 h-9" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{city.name_th}</h1>
                        <Badge variant={city.status === "Active" ? "success" : "neutral"}>{city.status}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">{city.name_en}</p>
                    </div>
                  </div>
                </div>

                {/* 4 Stats Metric Cards: Admin Count & User Count Clearly Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="ผู้ดูแลระบบเทศบาล (Admins)"
                    value={`${city.admins_count || 2} คน`}
                    subtitle="เจ้าหน้าที่ผู้ดูแลระบบเมือง"
                    icon={Crown}
                    iconBgColor="bg-indigo-50 border-indigo-100"
                    iconTextColor="text-indigo-600"
                  />

                  <MetricCard
                    title="ประชาชนผู้ใช้งาน (Users)"
                    value={`${city.total_users_count || 0} คน`}
                    subtitle="ประชาชนที่ลงทะเบียนแอป"
                    icon={Users}
                    iconBgColor="bg-sky-50 border-sky-100"
                    iconTextColor="text-sky-600"
                  />

                  <MetricCard
                    title="กลุ่มเปราะบางรวม"
                    value={`${city.vulnerable_count || 0} คน`}
                    subtitle="ผู้สูงอายุ ผู้พิการ ผู้ป่วย"
                    icon={HeartHandshake}
                    iconBgColor="bg-rose-50 border-rose-100"
                    iconTextColor="text-rose-600"
                  />

                  <MetricCard
                    title="โมดูลที่เปิดใช้งาน"
                    value={`${city.active_modules_count} โมดูล`}
                    subtitle="บริการดิจิทัลเทศบาล"
                    icon={Layers}
                    iconBgColor="bg-emerald-50 border-emerald-100"
                    iconTextColor="text-emerald-600"
                  />
                </div>
              </div>

              {/* Information Grid Section (2 Columns: Left = Municipality & Admin, Right = Bank) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: General & Admin Info */}
                <div className="ms-card p-6 rounded-2xl space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Landmark className="w-5 h-5 text-sky-600" />
                      <span>ข้อมูลทั่วไป & ผู้ดูแลระบบเทศบาล</span>
                    </h2>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">ที่อยู่เทศบาล:</span>
                      <p className="text-slate-700 font-semibold flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{city.address_th || "ไม่ระบุข้อมูลที่อยู่"}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">เบอร์โทรศัพท์:</span>
                        <p className="text-slate-700 font-semibold flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{city.phone || "ไม่ระบุ"}</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">พิกัด GPS:</span>
                        <p className="text-slate-700 font-mono font-semibold">
                          {city.latitude}, {city.longitude}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <span className="text-slate-400 font-medium block">
                        เจ้าหน้าที่ผู้ดูแลระบบเทศบาล (Local Admins): {city.admins_count || 2} คน
                      </span>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          <span>{city.admin_name} {city.admin_last_name} (หัวหน้าผู้ดูแลระบบ)</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600 text-[11px] pt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {city.admin_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {city.admin_phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Bank Account Details */}
                <div className="ms-card p-6 rounded-2xl space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span>รายละเอียดบัญชีธนาคารเทศบาล (รับเงินอุดหนุน)</span>
                    </h2>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">ชื่อบัญชีธนาคาร:</span>
                      <p className="text-slate-800 font-bold text-sm">{city.bank_account_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">ธนาคาร:</span>
                        <p className="text-slate-700 font-semibold">{city.bank_name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">ประเภทบัญชี:</span>
                        <p className="text-slate-700 font-semibold">{city.bank_type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">เลขที่บัญชี:</span>
                        <p className="text-emerald-700 font-mono font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block">
                          {city.bank_account_number}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block mb-1">สาขา:</span>
                        <p className="text-slate-700 font-semibold">{city.bank_branch}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Usage Analytics Grid (All Modules with Toggles) */}
              <div className="ms-card p-6 rounded-2xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">สถิติการใช้งานและสวิตช์ควบคุมโมดูล (Module Management Console)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">รายการโมดูลบริการดิจิทัลทั้งหมดของเทศบาล {city.name_th}</p>
                </div>

                {loadingModules ? (
                  <LoadingSpinner label="กำลังโหลดสถานะโมดูล..." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((m: ModuleStatus) => (
                      <div
                        key={m.module_id}
                        className={`p-5 rounded-2xl border transition-all ${
                          m.is_active
                            ? "bg-white border-slate-200 shadow-xs"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 mb-2">
                              {m.code}
                            </span>
                            <h3 className="text-sm font-bold text-slate-800">{m.name_th}</h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.description || m.name_en}</p>
                          </div>

                          {canEditModule ? (
                            <button
                              onClick={() => toggleModule(city.id, m.module_id, m.is_active)}
                              className="text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                            >
                              {m.is_active ? (
                                <ToggleRight className="w-8 h-8 text-sky-600" />
                              ) : (
                                <ToggleLeft className="w-8 h-8 text-slate-300" />
                              )}
                            </button>
                          ) : (
                            <div className="text-xs font-semibold">
                              {m.is_active ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> เปิด
                                </span>
                              ) : (
                                <span className="text-slate-400">ปิด</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400">สถานะบริการ</span>
                          <Badge variant={m.is_active ? "success" : "neutral"}>
                            {m.is_active ? "พร้อมใช้งาน" : "ปิดบริการ"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}

