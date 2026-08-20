"use client";

import React, { useState } from "react";
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

function ModuleFormModalContent({
  onClose,
  mode,
  moduleData,
  nextSortOrder = 15,
  onSave,
}: Omit<ModuleFormModalProps, "isOpen">) {
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
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === "create" ? "เพิ่มโมดูลใหม่" : "แก้ไขโมดูล"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              กำหนดข้อมูลทั่วไปและคุณลักษณะการทำงานของโมดูลในระบบ
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ลำดับ (Sort Order)
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-primary font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อโมดูล (ภาษาไทย)
              </label>
              <input
                type="text"
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value)}
                placeholder="เช่น ผู้สูงอายุและผู้พิการ"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อโมดูล (ภาษาอังกฤษ)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="เช่น Elderly and Disabled"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อแสดงบน Dashboard (ภาษาไทย)
              </label>
              <input
                type="text"
                value={dashboardNameTh}
                onChange={(e) => setDashboardNameTh(e.target.value)}
                placeholder="เช่น ข้อมูลสถิติผู้สูงอายุ"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อแสดงบน Dashboard (ภาษาอังกฤษ)
              </label>
              <input
                type="text"
                value={dashboardNameEn}
                onChange={(e) => setDashboardNameEn(e.target.value)}
                placeholder="เช่น Elderly Statistics"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-slate-800">ยืนยันตัวตน</span>
              <button
                type="button"
                onClick={() => setVerifyIdentity(!verifyIdentity)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  verifyIdentity ? "bg-brand-primary" : "bg-slate-300"
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
                  department ? "bg-brand-primary" : "bg-slate-300"
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
                  adminOnly ? "bg-brand-primary" : "bg-slate-300"
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
                  showDashboard ? "bg-brand-primary" : "bg-slate-300"
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
              className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover active:bg-brand-hover text-white text-sm font-semibold shadow-md shadow-brand-primary/20 transition-all cursor-pointer"
            >
              {mode === "create" ? "บันทึก" : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModuleFormModal(props: ModuleFormModalProps) {
  if (!props.isOpen) return null;
  return (
    <ModuleFormModalContent
      key={`${props.mode}-${props.moduleData?.id || props.nextSortOrder || "new"}`}
      onClose={props.onClose}
      mode={props.mode}
      moduleData={props.moduleData}
      nextSortOrder={props.nextSortOrder}
      onSave={props.onSave}
    />
  );
}
