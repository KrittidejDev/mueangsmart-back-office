"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught application exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg ms-card p-8 rounded-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">เกิดข้อผิดพลาดในการประมวลผลระบบ</h1>
          <p className="text-xs text-slate-500 mt-2 font-mono bg-slate-100 p-3 rounded-lg border border-slate-200 text-left overflow-x-auto">
            {error.message || "An unexpected application error occurred."}
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ลองใหม่อีกครั้ง</span>
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
