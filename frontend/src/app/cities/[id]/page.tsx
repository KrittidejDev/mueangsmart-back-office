"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CityFormModal } from "@/components/cities/CityFormModal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { useCities, City } from "@/hooks/useCities";
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
  CheckCircle2,
  XCircle,
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
  const [imgError, setImgError] = useState(false);

  const isValidUrl =
    logoUrl &&
    (logoUrl.startsWith("http://") ||
      logoUrl.startsWith("https://") ||
      logoUrl.startsWith("/") ||
      logoUrl.startsWith("data:image/"));

  if (!logoUrl || imgError || !isValidUrl) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold text-2xl shadow-2xs flex-shrink-0">
        <Building2 className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs flex-shrink-0 relative overflow-hidden flex items-center justify-center">
      <img
        src={logoUrl}
        alt={name}
        onError={() => setImgError(true)}
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState("1 ม.ค. 2569 - 31 ธ.ค. 2569");

  const { loading, fetchCityByID, updateCity } = useCities();

  useEffect(() => {
    async function loadCityData() {
      const data = await fetchCityByID(cityId);
      if (data) {
        setCity(data);
      }
    }
    loadCityData();
  }, [cityId, fetchCityByID]);

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
    const dummyContent = `City,${city?.name_th}\nDate,${dateRange}\nUsers,4540\nActive,865\nAdmins,28\n`;
    const blob = new Blob([dummyContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nameTh = city?.name_th || "เทศบาลตำบลพลับพลานารายณ์";
  const nameEn = city?.name_en?.trim() ? city.name_en : null;
  const rawAddressTh = city?.address_th || "9 Subdistrict ตำบล คลองนารายณ์ อำเภอเมืองจันทบุรี จันทบุรี 22000";
  const addressTh = rawAddressTh.startsWith("ที่อยู่:") ? rawAddressTh : `ที่อยู่: ${rawAddressTh}`;
  const rawAddressEn = city?.address_en?.trim() ? city.address_en : null;
  const addressEn = rawAddressEn ? (rawAddressEn.startsWith("Address:") ? rawAddressEn : `Address: ${rawAddressEn}`) : null;
  const phone = city?.phone || "024567890";
  const lat = city?.latitude ?? 12.12356;
  const lng = city?.longitude ?? 15.32154;

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
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-sky-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:border-sky-300"
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
                  className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ส่งออกรายงาน</span>
                </button>
              </div>
            </div>

            {loading && !city ? (
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
                              className="font-semibold text-sky-600 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{lat} , {lng}</span>
                              <MapPin className="w-3.5 h-3.5 text-sky-500" />
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start lg:self-center">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        เปิดใช้งาน
                      </span>

                      <button
                        onClick={() => setEditModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                        <span>แก้ไขเมือง</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">ผู้ลงทะเบียน (User)</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">4,540</span>
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
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">865</span>
                        <span className="text-xs text-slate-500 font-medium">คน (82.05%)</span>
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
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">28</span>
                        <span className="text-xs text-slate-500 font-medium">คน</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">โมดูลหลัก</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ผู้สูงอายุและผู้พิการ</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รายชื่อทั้งหมด" value={125} unit="คน" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ผู้ป่วยติดเตียง</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รายชื่อทั้งหมด" value={55} unit="คน" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ศูนย์ร้องทุกข์ร้องเรียน</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="เรื่องร้องเรียนทั่วไปทั้งหมด" value={8} unit="เรื่อง" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ร้องทุกข์ร้องเรียน</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="เรื่องร้องเรียนทุกกองทั้งหมด" value={205} unit="เรื่อง" />
                        <MetricRow label="ดำเนินการเสร็จสิ้น" value={200} unit="เรื่อง" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ภาษี</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="ภาษีที่ดินและสิ่งปลูกสร้าง" value={15} unit="รายการ" />
                        <MetricRow label="ภาษีป้าย" value={9} unit="รายการ" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">สัตว์เลี้ยง</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="สุนัข" value={46} unit="ตัว" />
                        <MetricRow label="แมว" value={61} unit="ตัว" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ยืนยันตัวตน</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รายชื่อทั้งหมด" value="4,532" unit="คน" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ประชาสัมพันธ์</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="ข่าวประชาสัมพันธ์ทั้งหมด" value={22} unit="รายการ" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">การแจ้งเตือน</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รวมทุกโมดูลทั้งหมด" value={765} unit="ครั้ง" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ค่าธรรมเนียมขยะ</h3>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                            ระบบใหม่
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ใช้งาน
                          </span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="รายชื่อทั้งหมด" value="2,765" unit="รายชื่อ" />
                        <MetricRow label="จำนวนบิลทั้งหมด" value="4,321" unit="รายการ" />
                        <MetricRow label="รอชำระทั้งหมด" value={300} unit="รายการ" />
                        <MetricRow label="ชำระแล้วทั้งหมด" value="4,021" unit="รายการ" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">กล้องวงจรปิด CCTV</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          ปิดใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="จำนวนกล้อง CCTV" value={0} unit="เครื่อง" />
                        <MetricRow label="การเข้ารับชม" value={0} unit="ครั้ง" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">โมดูลเพิ่มเติม</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ระบบตรวจวัดระดับน้ำ (River)</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="สถานีตรวจวัดทั้งหมด" value={28} unit="สถานี" />
                        <MetricRow label="ออนไลน์" value={25} unit="สถานี" variant="success" />
                        <MetricRow label="ออฟไลน์" value={3} unit="สถานี" variant="danger" />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-start space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">ระบบตรวจวัดสภาพอากาศ (Sence)</h3>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ใช้งาน
                        </span>
                      </div>
                      <div className="pt-1">
                        <MetricRow label="สถานีตรวจวัดทั้งหมด" value={50} unit="สถานี" />
                        <MetricRow label="ออนไลน์" value={49} unit="สถานี" variant="success" />
                        <MetricRow label="ออฟไลน์" value={1} unit="สถานี" variant="danger" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
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
          title="บันทึกข้อมูลเมืองสำเร็จ"
          description={`ระบบได้ทำการปรับปรุงข้อมูล ${city?.name_th || "เทศบาล"} เรียบร้อยแล้ว`}
        />
      </div>
    </ProtectedRoute>
  );
}
