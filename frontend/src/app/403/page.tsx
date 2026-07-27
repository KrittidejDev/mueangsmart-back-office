"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg ms-card p-8 rounded-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>403 Forbidden Access</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ไม่มีสิทธิเข้าถึงหน้านี้ (Access Denied)</h1>
          <p className="text-sm text-slate-500 mt-2">
            ขออภัย สิทธิของบทบาทบัญชีของคุณไม่เพียงพอสำหรับการเข้าถึงเส้นทางหรือหน้าจอนี้ <br />
            (หน้าที่คุณพยายามเข้าถึงถูกจำกัดให้ใช้งานได้เฉพาะสิทธิระดับสูงกว่าเท่านั้น)
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-sky-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าหลัก Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
