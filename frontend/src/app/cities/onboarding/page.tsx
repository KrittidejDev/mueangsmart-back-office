"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layers, Building2 } from "lucide-react";

export default function CityOnboardingPage() {
  return (
    <ProtectedRoute superAdminOnly>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="p-8 space-y-8 flex-1">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Layers className="w-7 h-7 text-sky-600" />
                <span>ระบบเพิ่มเมืองอัจฉริยะใหม่ (Automated City Onboarding Wizard)</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                สร้างเมืองใหม่พร้อมผูกข้อมูลธนาคาร แผนก SuperAdmin และโมดูลเริ่มต้นเข้าสู่ระบบ UAT อัตโนมัติ (เฉพาะ SuperAdmin เท่านั้น)
              </p>
            </div>

            <div className="ms-card p-8 rounded-2xl text-center space-y-4 py-16">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Automated City Onboarding Console</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                หน้านี้ถูกป้องกันด้วย Zero-Trust Client Route Guard ผู้ใช้ที่ไม่ใช่ SuperAdmin แม้จะแอบพิมพ์ URL เข้าหาตรงๆ จะถูก Redirect ไปหน้า 403 Forbidden ทันที
              </p>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
