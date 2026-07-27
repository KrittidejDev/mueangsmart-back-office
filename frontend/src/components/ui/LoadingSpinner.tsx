import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label = "กำลังโหลดข้อมูล...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`py-12 text-center text-slate-500 font-medium ${className}`}>
      <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-sky-600" />
      <span>{label}</span>
    </div>
  );
}
