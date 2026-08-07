"use client";

import React, { useEffect } from "react";
import { Check, X } from "lucide-react";

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: React.ReactNode | string;
  confirmText?: string;
  onConfirm?: () => void;
  autoCloseMs?: number;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "ดำเนินการสำเร็จ!",
  description = "ระบบได้ทำการบันทึกข้อมูลของคุณเรียบร้อยแล้ว",
  confirmText = "ตกลง",
  onConfirm,
  autoCloseMs,
}: SuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") {
        if (onConfirm) onConfirm();
        else onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    let timer: NodeJS.Timeout;
    if (autoCloseMs && autoCloseMs > 0) {
      timer = setTimeout(() => {
        if (onConfirm) onConfirm();
        else onClose();
      }, autoCloseMs);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, onClose, onConfirm, autoCloseMs]);

  if (!isOpen) return null;

  const handleButtonClick = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 z-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glowing Success Icon */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100/90 text-emerald-600 flex items-center justify-center border-4 border-emerald-50 shadow-md">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div
            className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none"
            style={{ animationDuration: "2s" }}
          />
        </div>

        {/* Title & Description */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Confirm Button */}
        <button
          onClick={handleButtonClick}
          className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
