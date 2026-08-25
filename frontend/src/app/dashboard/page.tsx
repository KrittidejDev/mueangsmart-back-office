"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAnalytics } from "@/hooks/useAnalytics";

import { 
  Building2, 
  CheckSquare,
  Target,
  Users, 
  UserCheck, 
  ShieldCheck,
  Clock, 
} from "lucide-react";

import { CityUsageAnalytics } from "@/components/dashboard/CityUsageAnalytics";
import { CityMapAndTable } from "@/components/dashboard/CityMapAndTable";

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { overview, loading } = useAnalytics();

  return (
    <ProtectedRoute>
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
                {(() => {
                  const totalCities = overview?.total_cities || 0;
                  const activeCities = overview?.active_cities || 0;
                  const inactiveCities = overview?.inactive_cities !== undefined 
                    ? overview.inactive_cities 
                    : Math.max(0, totalCities - activeCities);
                  const activePercent = totalCities > 0 ? ((activeCities / totalCities) * 100).toFixed(2) : "0.00";
                  const inactivePercent = totalCities > 0 ? ((inactiveCities / totalCities) * 100).toFixed(2) : "0.00";
                  const totalUsers = overview?.total_users || 0;
                  const registeredUsers = overview?.registered_users !== undefined && overview.registered_users > 0 
                    ? overview.registered_users 
                    : totalUsers;
                  const totalAdmins = overview?.total_admins || 0;

                  return (
                    <>
                      {/* Responsive Metric Cards Grid (6 items) */}
                      <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                        <MetricCard
                          title="เมืองทั้งหมด"
                          value={totalCities.toLocaleString()}
                          subtitle="เมือง"
                          icon={Building2}
                          iconBgColor="bg-sky-50 border-sky-100"
                          iconTextColor="text-sky-600"
                        />

                        <MetricCard
                          title="เมืองที่เปิดใช้งาน"
                          value={activeCities.toLocaleString()}
                          subtitle={`เมือง (${activePercent}%)`}
                          icon={CheckSquare}
                          iconBgColor="bg-emerald-50 border-emerald-100"
                          iconTextColor="text-emerald-600"
                        />

                        <MetricCard
                          title="เมืองที่ไม่ได้เปิดใช้งาน"
                          value={inactiveCities.toLocaleString()}
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
                          value={registeredUsers.toLocaleString()}
                          subtitle="คน"
                          icon={UserCheck}
                          iconBgColor="bg-amber-50 border-amber-100"
                          iconTextColor="text-amber-600"
                        />

                        <MetricCard
                          title="แอดมินทั้งหมด"
                          value={totalAdmins.toLocaleString()}
                          subtitle="คน"
                          icon={ShieldCheck}
                          iconBgColor="bg-purple-50 border-purple-100"
                          iconTextColor="text-purple-600"
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

                      {/* Yearly City Usage Analytics Section (Line & Donut Charts) */}
                      <CityUsageAnalytics overview={overview} />

                      {/* City Pins Map & Municipalities Data Table Section */}
                      <CityMapAndTable />
                    </>
                  );
                })()}
              </>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
