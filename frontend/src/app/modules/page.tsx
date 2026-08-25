"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useModules } from "@/hooks/useModules";
import { SystemModule } from "@/types/module";
import { ModuleFormModal } from "@/components/modules/ModuleFormModal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { 
  Search, 
  Plus, 
  SquarePen, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react";
import { CreateModulePayload, UpdateModulePayload } from "@/types/module";

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80 inline-block text-center shadow-2xs">
        เปิด
      </span>
    );
  }
  return (
    <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-500 border border-rose-200/80 inline-block text-center shadow-2xs">
      ปิด
    </span>
  );
}

function SortIcon({
  field,
  currentField,
  direction,
}: {
  field: string;
  currentField: string | null;
  direction: "asc" | "desc" | null;
}) {
  if (currentField !== field) {
    return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 shrink-0" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="w-3 h-3 text-sky-600 font-bold shrink-0" />
  ) : (
    <ArrowDown className="w-3 h-3 text-sky-600 font-bold shrink-0" />
  );
}

export default function ModulesPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    modules,
    allModules,
    loading,
    searchQuery,
    setSearchQuery,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    sortField,
    sortDirection,
    handleSort,
    createModule,
    updateModule,
  } = useModules();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"create" | "edit">("create");
  const [selectedModule, setSelectedModule] = useState<SystemModule | null>(null);

  const [successModalConfig, setSuccessModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const nextSortOrder = Math.max(0, ...allModules.map((m) => m.sort_order || 0)) + 1;

  const handleOpenCreateModal = () => {
    setFormModalMode("create");
    setSelectedModule(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (module: SystemModule) => {
    setFormModalMode("edit");
    setSelectedModule(module);
    setFormModalOpen(true);
  };

  const handleSaveModule = async (
    data: CreateModulePayload | UpdateModulePayload
  ): Promise<boolean> => {
    if (formModalMode === "create") {
      const success = await createModule(data as CreateModulePayload);
      if (success) {
        setSuccessModalConfig({
          isOpen: true,
          title: "เพิ่มโมดูลสำเร็จ!",
          description: "ระบบได้ทำการบันทึกข้อมูลโมดูลใหม่เรียบร้อยแล้ว",
        });
        return true;
      }
      return false;
    } else if (selectedModule) {
      const success = await updateModule(selectedModule.id, data as UpdateModulePayload);
      if (success) {
        setSuccessModalConfig({
          isOpen: true,
          title: "บันทึกข้อมูลโมดูลสำเร็จ!",
          description: `ระบบได้ทำการปรับปรุงข้อมูลโมดูล ${data.name_th || selectedModule.name_th} เรียบร้อยแล้ว`,
        });
        return true;
      }
      return false;
    }
    return false;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const targetMinRows = 10;
  const emptyRowsCount = modules.length > 0 && modules.length < targetMinRows 
    ? targetMinRows - modules.length 
    : 0;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setMobileOpen(true)} />

          <main className="p-4 sm:p-8 space-y-6 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  จัดการโมดูล (Module)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  จัดการการแสดงผลโมดูลในระบบทั้งหมด
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-48 sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาโมดูล"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-2 px-3 pr-9 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มโมดูล</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse min-w-[1150px]">
                  <colgroup>
                    <col className="w-[90px]" />
                    <col className="w-[185px]" />
                    <col className="w-[165px]" />
                    <col className="w-[145px]" />
                    <col className="w-[145px]" />
                    <col className="w-[75px]" />
                    <col className="w-[85px]" />
                    <col className="w-[75px]" />
                    <col className="w-[80px]" />
                    <col className="w-[105px]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs font-bold select-none">
                      <th
                        onClick={() => handleSort("sort_order")}
                        className="py-2.5 px-2 text-center leading-tight cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="whitespace-nowrap">เรียงลำดับ<br />(Sidebar)</span>
                          <SortIcon field="sort_order" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("name_th")}
                        className="py-2.5 px-3 text-left cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>ชื่อโมดูล (ภาษาไทย)</span>
                          <SortIcon field="name_th" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("name_en")}
                        className="py-2.5 px-3 text-left cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>ชื่อโมดูล (ภาษาอังกฤษ)</span>
                          <SortIcon field="name_en" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("dashboard_name_th")}
                        className="py-2.5 px-3 text-left cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>Dashboard (ไทย)</span>
                          <SortIcon field="dashboard_name_th" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("dashboard_name_en")}
                        className="py-2.5 px-3 text-left cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>Dashboard (อังกฤษ)</span>
                          <SortIcon field="dashboard_name_en" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("verify_identity")}
                        className="py-2.5 px-1 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-1 leading-tight text-center">
                          <span>ยืนยัน<br />ตัวตน</span>
                          <SortIcon field="verify_identity" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("department")}
                        className="py-2.5 px-1 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-1 leading-tight text-center">
                          <span>กอง/<br />หน่วยงาน</span>
                          <SortIcon field="department" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("admin_only")}
                        className="py-2.5 px-1 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-1 leading-tight text-center">
                          <span>เฉพาะ<br />แอดมิน</span>
                          <SortIcon field="admin_only" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("show_dashboard")}
                        className="py-2.5 px-1 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Dashboard</span>
                          <SortIcon field="show_dashboard" currentField={sortField} direction={sortDirection} />
                        </div>
                      </th>
                      <th className="py-2.5 px-2 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-slate-400 text-sm">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                            <span className="text-xs font-semibold text-slate-500">กำลังโหลดข้อมูลโมดูล...</span>
                          </div>
                        </td>
                      </tr>
                    ) : modules.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                          ไม่พบข้อมูลโมดูลที่ค้นหา
                        </td>
                      </tr>
                    ) : (
                      <>
                        {modules.map((m: SystemModule) => (
                          <tr
                            key={m.id}
                            className="hover:bg-slate-50/60 transition-colors text-xs text-slate-700 h-[48px]"
                          >
                            <td className="py-2 px-3 text-center font-medium text-slate-600">
                              {m.sort_order}
                            </td>
                            <td className="py-2 px-4 text-sm font-bold text-slate-900 truncate">
                              {m.name_th}
                            </td>
                            <td className="py-2 px-4 font-medium text-slate-600 truncate">
                              {m.name_en}
                            </td>
                            <td className="py-2 px-4 text-slate-700 truncate">
                              {m.dashboard_name_th}
                            </td>
                            <td className="py-2 px-4 text-slate-600 truncate">
                              {m.dashboard_name_en}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <StatusBadge active={m.verify_identity} />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <StatusBadge active={m.department} />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <StatusBadge active={m.admin_only} />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <StatusBadge active={m.show_dashboard} />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(m)}
                                  className="px-3 py-1 bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  <SquarePen className="w-3.5 h-3.5 text-slate-500" />
                                  <span>แก้ไขโมดูล</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {Array.from({ length: emptyRowsCount }).map((_, index) => (
                          <tr key={`empty-${index}`} className="text-xs text-transparent select-none h-[48px]">
                            <td className="py-2 px-3 text-center">&nbsp;</td>
                            <td className="py-2 px-4">&nbsp;</td>
                            <td className="py-2 px-4">&nbsp;</td>
                            <td className="py-2 px-4">&nbsp;</td>
                            <td className="py-2 px-4">&nbsp;</td>
                            <td className="py-2 px-3 text-center">&nbsp;</td>
                            <td className="py-2 px-3 text-center">&nbsp;</td>
                            <td className="py-2 px-3 text-center">&nbsp;</td>
                            <td className="py-2 px-3 text-center">&nbsp;</td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center">
                                <div className="h-6" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium">
                  แสดง {startItem} - {endItem} จาก {totalItems} รายการ
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span>แสดง</span>
                    <div className="relative">
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-brand-primary cursor-pointer shadow-2xs"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                          currentPage === page
                            ? "bg-brand-primary text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <ModuleFormModal
        key={`modal-${formModalOpen}-${formModalMode}-${selectedModule?.id || 'new'}`}
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formModalMode}
        moduleData={selectedModule}
        nextSortOrder={nextSortOrder}
        onSave={handleSaveModule}
      />

      <SuccessModal
        isOpen={successModalConfig.isOpen}
        onClose={() => setSuccessModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={successModalConfig.title}
        description={successModalConfig.description}
      />
    </ProtectedRoute>
  );
}
