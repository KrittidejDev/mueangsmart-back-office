"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SystemModule } from "@/types/module";

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  moduleData?: SystemModule | null;
  nextSortOrder?: number;
  onSave: (data: Omit<SystemModule, "id"> | Partial<SystemModule>) => void;
}

export function ModuleFormModal({
  isOpen,
  onClose,
  mode,
  moduleData,
  nextSortOrder = 15,
  onSave,
}: ModuleFormModalProps) {
  const isEdit = mode === "edit" && !!moduleData;

  const [sortOrder, setSortOrder] = useState<number>(() =>
    isEdit ? moduleData.sort_order : nextSortOrder
  );
  const [nameTh, setNameTh] = useState<string>(() =>
    isEdit ? moduleData.name_th || "" : ""
  );
  const [nameEn, setNameEn] = useState<string>(() =>
    isEdit ? moduleData.name_en || "" : ""
  );
  const [dashboardNameTh, setDashboardNameTh] = useState<string>(() =>
    isEdit ? moduleData.dashboard_name_th || "" : ""
  );
  const [dashboardNameEn, setDashboardNameEn] = useState<string>(() =>
    isEdit ? moduleData.dashboard_name_en || "" : ""
  );
  const [verifyIdentity, setVerifyIdentity] = useState<boolean>(() =>
    isEdit ? moduleData.verify_identity ?? false : true
  );
  const [department, setDepartment] = useState<boolean>(() =>
    isEdit ? moduleData.department ?? false : true
  );
  const [adminOnly, setAdminOnly] = useState<boolean>(() =>
    isEdit ? moduleData.admin_only ?? false : true
  );
  const [showDashboard, setShowDashboard] = useState<boolean>(() =>
    isEdit ? moduleData.show_dashboard ?? false : true
  );

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && moduleData) {
        setSortOrder(moduleData.sort_order);
        setNameTh(moduleData.name_th || "");
        setNameEn(moduleData.name_en || "");
        setDashboardNameTh(moduleData.dashboard_name_th || "");
        setDashboardNameEn(moduleData.dashboard_name_en || "");
        setVerifyIdentity(moduleData.verify_identity ?? false);
        setDepartment(moduleData.department ?? false);
        setAdminOnly(moduleData.admin_only ?? false);
        setShowDashboard(moduleData.show_dashboard ?? false);
      } else if (mode === "create") {
        setSortOrder(nextSortOrder);
        setNameTh("");
        setNameEn("");
        setDashboardNameTh("");
        setDashboardNameEn("");
        setVerifyIdentity(true);
        setDepartment(true);
        setAdminOnly(true);
        setShowDashboard(true);
      }
    }
  }, [isOpen, mode, moduleData, nextSortOrder]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      sort_order: sortOrder,
      name_th: nameTh,
      name_en: nameEn,
      dashboard_name_th: dashboardNameTh,
      dashboard_name_en: dashboardNameEn,
      verify_identity: verifyIdentity,
      department: department,
      admin_only: adminOnly,
      show_dashboard: showDashboard,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200/80 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {mode === "create" ? "เพิ่มโมดูล (Module)" : "แก้ไขโมดูล (Module)"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700">
                เรียงลำดับ (Sidebar) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                ชื่อโมดูล (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value)}
                placeholder="กรอกชื่อโมดูล (ภาษาไทย)"
                required
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                ชื่อโมดูล (ภาษาอังกฤษ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="กรอกชื่อโมดูล (ภาษาอังกฤษ)"
                required
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Dashboard (ไทย) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dashboardNameTh}
                onChange={(e) => setDashboardNameTh(e.target.value)}
                placeholder="กรอกชื่อ Dashboard (ไทย)"
                required
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Dashboard (อังกฤษ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dashboardNameEn}
                onChange={(e) => setDashboardNameEn(e.target.value)}
                placeholder="กรอกชื่อ Dashboard (อังกฤษ)"
                required
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-slate-800">ยืนยันตัวตน</span>
              <button
                type="button"
                onClick={() => setVerifyIdentity(!verifyIdentity)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  verifyIdentity ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs absolute top-0.5 left-0.5 ${
                    verifyIdentity ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-slate-800">กอง/หน่วยงาน</span>
              <button
                type="button"
                onClick={() => setDepartment(!department)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  department ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs absolute top-0.5 left-0.5 ${
                    department ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-slate-800">เฉพาะแอดมิน</span>
              <button
                type="button"
                onClick={() => setAdminOnly(!adminOnly)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  adminOnly ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs absolute top-0.5 left-0.5 ${
                    adminOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-slate-800">Dashboard</span>
              <button
                type="button"
                onClick={() => setShowDashboard(!showDashboard)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  showDashboard ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs absolute top-0.5 left-0.5 ${
                    showDashboard ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              {mode === "create" ? "บันทึก" : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
