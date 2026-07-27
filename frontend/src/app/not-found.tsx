import React from "react";
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md ms-card p-8 rounded-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-sm">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
          <h2 className="text-lg font-bold text-slate-800 mt-1">ไม่พบหน้าที่คุณต้องการ (Page Not Found)</h2>
          <p className="text-xs text-slate-500 mt-2">
            ที่อยู่เว็บที่คุณระบุไม่มีอยู่ในระบบ MueangSmart Back Office
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าหลัก Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
