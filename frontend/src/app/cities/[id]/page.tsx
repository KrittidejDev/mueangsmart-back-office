"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CityFormModal } from "@/components/cities/CityFormModal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { GisMapHub } from "@/components/map/GisMapHub";
import { resolveImageUrl } from "@/lib/image";
import { useCities, City, ModuleStatus, CityStatistics } from "@/hooks/useCities";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchSenseDeviceCount } from "@/services/gatewayService";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Download,
  Building2,
  Phone,
  Edit,
  User,
  Users,
  ShieldCheck,
  MapPin,
} from "lucide-react";

interface MetricRowProps {
  label: string;
  value: string | number;
  unit: string;
  variant?: "default" | "success" | "danger";
}

function MetricRow({ label, value, unit, variant = "default" }: MetricRowProps) {
  const valueColor =
    variant === "success"
      ? "text-emerald-600"
      : variant === "danger"
      ? "text-rose-600"
      : "text-slate-900";

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs sm:text-sm">
      <span className="text-slate-600 font-medium truncate pr-2">{label}</span>
      <div className="flex items-center justify-end gap-1.5 flex-shrink-0">
        <span className={`font-bold font-mono text-sm sm:text-base text-right ${valueColor}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        <span className="text-slate-500 font-normal text-xs text-right min-w-[45px]">
          {unit}
        </span>
      </div>
    </div>
  );
}

function CityHeaderLogo({ logoUrl, name }: { logoUrl?: string; name: string }) {
  const cleanUrl =
    logoUrl?.startsWith("blob:") || logoUrl?.startsWith("data:")
      ? undefined
      : logoUrl;
  const targetLogo = resolveImageUrl(cleanUrl);

  const [imgError, setImgError] = useState(false);

  const isValidUrl = Boolean(targetLogo);

  if (!targetLogo || imgError || !isValidUrl) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-brand-light border border-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-2xl shadow-2xs flex-shrink-0">
        <Building2 className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs flex-shrink-0 relative overflow-hidden flex items-center justify-center">
      <Image
        src={targetLogo}
        alt={name}
        width={64}
        height={64}
        unoptimized
        onError={() => {
          setImgError(true);
        }}
        className="w-full h-full object-contain rounded-xl"
      />
    </div>
  );
}

export default function CityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const cityId = resolvedParams.id;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [city, setCity] = useState<City | null>(null);
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [stats, setStats] = useState<CityStatistics | null>(null);
  const [senseCount, setSenseCount] = useState<number | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [dateRange] = useState("1 ม.ค. 2569 - 31 ธ.ค. 2569");

  const { user: currentUser } = useAuthStore();
  const canEdit = currentUser?.roleName === "SuperAdmin" || currentUser?.roleName === "Admin";

  const { fetchCityByID, fetchCityStatistics, updateCity } = useCities();

  useEffect(() => {
    let isMounted = true;

    async function loadAllCityData() {
      try {
        setPageLoading(true);
        const [cityData, statsData, modulesRes, realSenseCount] = await Promise.all([
          fetchCityByID(cityId),
          fetchCityStatistics(cityId),
          api.get(`/cities/${cityId}/modules`).catch(() => ({ data: [] })),
          fetchSenseDeviceCount(cityId),
        ]);

        if (isMounted) {
          if (cityData) setCity(cityData);
          if (statsData) setStats(statsData);
          if (realSenseCount !== undefined && realSenseCount !== null) {
            setSenseCount(realSenseCount);
          }
          if (modulesRes?.data && Array.isArray(modulesRes.data)) {
            setModules(modulesRes.data);
          }
        }
      } finally {
        if (isMounted) setPageLoading(false);
      }
    }

    loadAllCityData();
    return () => {
      isMounted = false;
    };
  }, [cityId, fetchCityByID, fetchCityStatistics]);

  const handleSaveEdit = async (updatedData: Partial<City>): Promise<boolean> => {
    if (!city) return false;
    const ok = await updateCity(city.id, updatedData);
    if (ok) {
      setCity((prev) => (prev ? { ...prev, ...updatedData } : null));
      setEditModalOpen(false);
      setSuccessModalOpen(true);
      return true;
    }
    return false;
  };

  const handleExport = () => {
    const filename = `${city?.name_th || "city"}_report_${dateRange.replace(/\s+/g, "_")}.csv`;
    const dummyContent = `City,${city?.name_th}\nDate,${dateRange}\nUsers,${stats?.registered_users || 0}\nActive,${stats?.active_users || 0}\nAdmins,${stats?.admin_users || 0}\n`;
    const blob = new Blob([dummyContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nameTh = city?.name_th || "";
  const nameEn = city?.name_en?.trim() ? city.name_en : null;
  const rawAddressTh = city?.address_th || "";
  const addressTh = rawAddressTh ? (rawAddressTh.startsWith("ที่อยู่:") ? rawAddressTh : `ที่อยู่: ${rawAddressTh}`) : "";
  const rawAddressEn = city?.address_en?.trim() ? city.address_en : null;
  const addressEn = rawAddressEn ? (rawAddressEn.startsWith("Address:") ? rawAddressEn : `Address: ${rawAddressEn}`) : null;
  const phone = city?.phone || "-";
  const lat = city?.latitude ?? 0;
  const lng = city?.longitude ?? 0;
  const isActive = city?.status === "Active" || city?.status === "ใช้งาน";

  const isModuleActive = (keywords: string[]): boolean => {
    if (!modules || modules.length === 0) return true;
    const found = modules.find((m) =>
      keywords.some(
        (k) =>
          m.name_th?.toLowerCase().includes(k.toLowerCase()) ||
          m.code?.toLowerCase().includes(k.toLowerCase())
      )
    );
    return found ? found.is_active : true;
  };

  const renderStatusBadge = (active: boolean) => (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
        active
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-rose-50 text-rose-600 border border-rose-200"
      }`}
    >
      {active ? "ใช้งาน" : "ปิดใช้งาน"}
    </span>
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setMobileOpen(true)} />

          <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/cities"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-brand-primary bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:border-brand-primary/30"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>ย้อนกลับไปหน้าการแสดงเมือง</span>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative inline-flex items-center">
                  <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{dateRange}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover active:bg-brand-hover text-white rounded-xl px-4 py-2 text-xs font-bold shadow-md shadow-brand-primary/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ส่งออกรายงาน</span>
                </button>
              </div>
            </div>

            {pageLoading && !city ? (
              <LoadingSpinner label="กำลังดึงรายละเอียดสถิติเมือง..." />
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <CityHeaderLogo logoUrl={city?.logo_url} name={nameTh} />

                      <div className="space-y-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          {nameTh}
                        </h1>
                        {nameEn && (
                          <p className="text-xs sm:text-sm text-slate-500 font-medium">{nameEn}</p>
                        )}
                        {addressTh && (
                          <p className="text-xs font-semibold text-slate-900 pt-0.5">{addressTh}</p>
                        )}
                        {addressEn && (
                          <p className="text-slate-400 font-normal text-[11px] sm:text-xs">{addressEn}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <span>เบอร์โทรศัพท์:</span>
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-900">{phone}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>พิกัด :</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
                            >
                              <span>{lat} , {lng}</span>
                              <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start lg:self-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {isActive ? "เปิดใช้งาน" : "ไม่ใช้งาน"}
                      </span>

                      {canEdit && (
                        <button
                          onClick={() => setEditModalOpen(true)}
                          className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover active:bg-brand-hover text-white rounded-xl px-4 py-2 text-xs font-bold shadow-md shadow-brand-primary/20 transition-all cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                          <span>แก้ไขเมือง</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">ผู้ลงทะเบียน (User)</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                          {(stats?.registered_users ?? city?.registered_users_count ?? city?.total_users_count ?? 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">คน</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">ผู้ใช้งาน (User Active)</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                          {(stats?.active_users ?? city?.active_users_count ?? 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">คน</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">ผู้ดูแลระบบ (Admin)</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                          {(stats?.admin_users ?? city?.admins_count ?? 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">คน</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Interactive City GIS Multi-Layer Map Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>แผนที่ข้อมูลเชิงพื้นที่ของเมือง</span>
                        <span className="text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          GIS Multi-Layer Map
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        แสดงพิกัดจริงทุกมิติข้อมูล ร้องทุกข์ กลุ่มเปราะบาง กล้องวงจรปิด และสัตว์เลี้ยงของ {nameTh}
                      </p>
                    </div>
                  </div>

                  <GisMapHub
                    cityId={cityId}
                    cityName={nameTh}
                    hideHeader={true}
                    hideCitySelector={true}
                    heightClassName="h-[520px] min-h-[450px]"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">โมดูลหลัก</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ผู้สูงอายุและผู้พิการ</h3>
                        {renderStatusBadge(isModuleActive(["elderly", "ผู้สูงอายุ", "พิการ"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รายชื่อทั้งหมด" value={stats?.elderly_and_disabled_count ?? 0} unit="คน" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ผู้ป่วยติดเตียง</h3>
                        {renderStatusBadge(isModuleActive(["bedridden", "ติดเตียง"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รายชื่อทั้งหมด" value={stats?.bedridden_count ?? 0} unit="คน" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ศูนย์ร้องทุกข์ร้องเรียน</h3>
                        {renderStatusBadge(isModuleActive(["complaint", "ร้องทุกข์", "ร้องเรียน"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="เรื่องร้องเรียนทั่วไปทั้งหมด" value={stats?.general_complaints_count ?? 0} unit="เรื่อง" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ร้องทุกข์ร้องเรียน</h3>
                        {renderStatusBadge(isModuleActive(["complaint", "ร้องทุกข์", "ร้องเรียน"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="เรื่องร้องเรียนทุกกองทั้งหมด" value={stats?.total_complaints_count ?? 0} unit="เรื่อง" />
                        <MetricRow label="ดำเนินการเสร็จสิ้น" value={stats?.resolved_complaints_count ?? 0} unit="เรื่อง" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ภาษี</h3>
                        {renderStatusBadge(isModuleActive(["tax", "ภาษี"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="ภาษีที่ดินและสิ่งปลูกสร้าง" value={stats?.tax_land_building_count ?? 0} unit="รายการ" />
                        <MetricRow label="ภาษีป้าย" value={stats?.tax_signboard_count ?? 0} unit="รายการ" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">สัตว์เลี้ยง</h3>
                        {renderStatusBadge(isModuleActive(["pet", "สัตว์เลี้ยง"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="สุนัข" value={stats?.pet_dogs_count ?? 0} unit="ตัว" />
                        <MetricRow label="แมว" value={stats?.pet_cats_count ?? 0} unit="ตัว" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ยืนยันตัวตน</h3>
                        {renderStatusBadge(isModuleActive(["verify", "ยืนยันตัวตน"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รายชื่อทั้งหมด" value={stats?.verified_users_count ?? 0} unit="คน" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ประชาสัมพันธ์</h3>
                        {renderStatusBadge(isModuleActive(["pr", "publicrelation", "ประชาสัมพันธ์"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="ข่าวประชาสัมพันธ์ทั้งหมด" value={stats?.public_relations_count ?? 0} unit="รายการ" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">การแจ้งเตือน</h3>
                        {renderStatusBadge(isModuleActive(["notification", "แจ้งเตือน"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รวมทุกโมดูลทั้งหมด" value={stats?.notifications_count ?? 0} unit="ครั้ง" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ค่าธรรมเนียมขยะ</h3>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-light text-brand-primary border border-brand-primary/20">
                            {stats?.waste_system_mode || "ระบบใหม่"}
                          </span>
                          {renderStatusBadge(isModuleActive(["waste", "ขยะ"]))}
                        </div>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รายชื่อทั้งหมด" value={stats?.waste_members_count ?? 0} unit="รายชื่อ" />
                        <MetricRow label="จำนวนบิลทั้งหมด" value={stats?.waste_bills_count ?? 0} unit="รายการ" />
                        <MetricRow label="รอชำระทั้งหมด" value={stats?.waste_pending_bills_count ?? 0} unit="รายการ" />
                        <MetricRow label="ชำระแล้วทั้งหมด" value={stats?.waste_paid_bills_count ?? 0} unit="รายการ" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">กล้องวงจรปิด CCTV</h3>
                        {renderStatusBadge(isModuleActive(["cctv", "กล้อง"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="จำนวนกล้อง CCTV" value={stats?.cctv_cameras_count ?? 0} unit="เครื่อง" />
                        <MetricRow label="การเข้ารับชม" value={stats?.cctv_views_count ?? 0} unit="ครั้ง" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">โมดูลเพิ่มเติม</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ระบบตรวจวัดระดับน้ำ (River)</h3>
                        {renderStatusBadge(isModuleActive(["river", "น้ำ"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="สถานีตรวจวัดทั้งหมด" value={stats?.river_stations_count ?? city?.river_status ?? 0} unit="สถานี" />
                        <MetricRow label="ออนไลน์" value={stats?.river_online_count ?? city?.river_status ?? 0} unit="สถานี" variant="success" />
                        <MetricRow label="ออฟไลน์" value={stats?.river_offline_count ?? 0} unit="สถานี" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ระบบตรวจวัดสภาพอากาศ (Sense)</h3>
                        {renderStatusBadge(isModuleActive(["sense", "fahfon", "ฟ้าฝน", "อากาศ"]))}
                      </div>
                      <div className="pt-1">
                        <MetricRow label="สถานีตรวจวัดทั้งหมด" value={senseCount ?? stats?.sense_stations_count ?? city?.sense_status ?? 0} unit="สถานี" />
                        <MetricRow label="ออนไลน์" value={senseCount ?? stats?.sense_online_count ?? city?.sense_status ?? 0} unit="สถานี" variant="success" />
                        <MetricRow label="ออฟไลน์" value={stats?.sense_offline_count ?? 0} unit="สถานี" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <CityFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode="edit"
        cityData={city}
        onSave={handleSaveEdit}
      />

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="บันทึกการเปลี่ยนแปลงสำเร็จ!"
        description={
          <span>
            อัปเดตข้อมูลรายละเอียดเมือง<br />
            <strong className="text-slate-800 font-bold">&ldquo;{city?.name_th}&rdquo;</strong><br />
            เรียบร้อยแล้ว
          </span>
        }
      />
    </ProtectedRoute>
  );
}
