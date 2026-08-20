"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { ClipboardList, Search, ShieldCheck, User, Clock } from "lucide-react";

export default function AuditLogsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logs, loading, searchTerm, setSearchTerm } = useAuditLogs();

  return (
    <ProtectedRoute superAdminOnly>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setMobileOpen(true)} />

          <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  ประวัติการใช้งานระบบ (Professional Audit Trail)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  ระบบบันทึกประวัติการกระทำและคำสั่งสำคัญของผู้ดูแลระบบ (เฉพาะ SuperAdmin เท่านั้น)
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-light text-brand-primary border border-brand-primary/20 self-start sm:self-auto shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>SuperAdmin Privilege Access Only</span>
              </span>
            </div>

            <div className="ms-card p-4 sm:p-6 rounded-2xl space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาชื่อผู้ใช้ คำสั่ง หรือ IP Address..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all"
                />
              </div>

              {/* Audit Logs Table */}
              {loading ? (
                <LoadingSpinner label="กำลังดึงข้อมูลประวัติการใช้งาน..." />
              ) : logs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  ไม่พบประวัติการใช้งานในระบบ UAT
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700 min-w-[650px]">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs font-bold">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">เวลาที่เกิดเหตุการณ์</th>
                        <th className="py-3.5 px-4 font-bold">ผู้ทำรายการ</th>
                        <th className="py-3.5 px-4 font-bold">คำสั่ง / การกระทำ (Action)</th>
                        <th className="py-3.5 px-4 font-bold">IP Address</th>
                        <th className="py-3.5 px-4 font-bold">รายละเอียด (Details Payload)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-all">
                          <td className="py-4 px-4 font-medium text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(log.created_date).toLocaleString("th-TH")}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-800">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-sky-600" />
                              <div>
                                <span>{log.full_name}</span>
                                <div className="text-[11px] text-slate-400 font-normal">@{log.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-600">{log.ip_address}</td>
                          <td className="py-4 px-4">
                            <code className="text-[11px] font-mono bg-slate-100 p-2 rounded border border-slate-200 block max-w-xs truncate text-slate-600">
                              {log.details}
                            </code>
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
      </div>
    </ProtectedRoute>
  );
}
