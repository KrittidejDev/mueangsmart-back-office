"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { 
  Building2, 
  Users, 
  HeartHandshake, 
  UserCheck, 
  Clock, 
} from "lucide-react";

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { overview, loading } = useAnalytics();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />
        
        <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">ภาพรวมสถิติระบบบริหารจัดการเมือง (System Overview)</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">มอนิเตอร์สถานะเมือง ประชากร กลุ่มเปราะบาง และท่อส่งการอนุมัติผู้ใช้งานภาพรวมประเทศ</p>
          </div>

          {loading ? (
            <LoadingSpinner label="กำลังดึงสถิติภาพรวมจาก UAT Database..." />
          ) : (
            <>
              {/* Responsive Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                  title="เมืองในระบบทั้งหมด"
                  value={overview?.total_cities || 0}
                  subtitle={`เปิดใช้งานแล้ว ${overview?.active_cities || 0} เมือง`}
                  icon={Building2}
                  iconBgColor="bg-sky-50 border-sky-100"
                  iconTextColor="text-sky-600"
                />

                <MetricCard
                  title="ผู้สูงอายุ / ผู้พิการ"
                  value={overview?.total_elderly_and_disabled || 0}
                  subtitle="กลุ่มผู้รับสวัสดิการเมือง"
                  icon={Users}
                  iconBgColor="bg-indigo-50 border-indigo-100"
                  iconTextColor="text-indigo-600"
                />

                <MetricCard
                  title="ผู้ป่วยติดเตียง"
                  value={overview?.total_bedridden || 0}
                  subtitle="ต้องการการดูแลใกล้ชิด"
                  icon={HeartHandshake}
                  iconBgColor="bg-amber-50 border-amber-100"
                  iconTextColor="text-amber-600"
                />

                <MetricCard
                  title="ผู้ลงทะเบียนทั้งหมด"
                  value={overview?.total_users || 0}
                  subtitle={`อนุมัติแล้ว ${overview?.approved_users || 0} คน`}
                  icon={UserCheck}
                  iconBgColor="bg-emerald-50 border-emerald-100"
                  iconTextColor="text-emerald-600"
                />
              </div>

              {/* Pending Approvals Notice Banner */}
              <div className="ms-card p-4 sm:p-6 rounded-2xl border-l-4 border-l-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-800">ผู้ใช้งานรอการอนุมัติยืนยันตัวตน (Pending Approvals)</h4>
                    <p className="text-xs text-slate-500 mt-0.5">มีผู้ใช้งานจำนวน {overview?.pending_users || 0} คน ในเทศบาลต่างๆ ที่รอการอนุมัติสิทธิจากผู้ดูแลระบบ</p>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all whitespace-nowrap">
                  ดูรายละเอียด
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
