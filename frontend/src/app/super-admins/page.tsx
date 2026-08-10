"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { useSuperAdmins, SuperAdminUser } from "@/hooks/useSuperAdmins";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldCheck, UserPlus, Users, Loader2, AlertCircle, Trash2, UserX } from "lucide-react";

export default function SuperAdminsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SuperAdminUser | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const { users, roles, loading, creating, deleting, error, createUser, deleteUser } = useSuperAdmins();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [formError, setFormError] = useState("");

  const handleOpenModal = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setFullName("");
    setRoleId(roles[0]?.Id || "");
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const success = await createUser({
      username,
      email,
      password,
      full_name: fullName,
      role_id: roleId || roles[0]?.Id,
    });

    if (success) {
      setModalOpen(false);
    } else if (error) {
      setFormError(error);
    }
  };

  const handleOpenDeleteModal = (user: SuperAdminUser) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const success = await deleteUser(userToDelete.id);
    if (success) {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <ProtectedRoute superAdminOnly>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setMobileOpen(true)} />

          <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-sky-600" />
                  <span>ระบบจัดการผู้ใช้งาน SuperAdmin Back Office</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  สร้าง กำหนดบทบาทสิทธิ 3 ระดับ (SuperAdmin / Admin / ผู้บริหาร) สำหรับผู้ใช้งานระบบบริหารจัดการเมือง
                </p>
              </div>

              <button
                onClick={handleOpenModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>เพิ่มผู้ใช้งานใหม่</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="ms-card p-4 sm:p-6 rounded-2xl space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <span>รายชื่อผู้ใช้งานผู้ดูแลระบบทั้งหมด ({users.length})</span>
              </h2>

              {loading ? (
                <LoadingSpinner label="กำลังโหลดรายชื่อผู้ใช้งาน..." />
              ) : users.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">ยังไม่มีผู้ใช้งานในระบบ</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700 min-w-[700px]">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs font-bold">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">ชื่อ - นามสกุล / ชื่อผู้ใช้</th>
                        <th className="py-3.5 px-4 font-bold">อีเมล</th>
                        <th className="py-3.5 px-4 font-bold">บทบาทสิทธิ (Role)</th>
                        <th className="py-3.5 px-4 font-bold">สถานะ</th>
                        <th className="py-3.5 px-4 font-bold">วันที่สร้าง</th>
                        <th className="py-3.5 px-4 text-right font-bold">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => {
                        const isSelf = currentUser?.id === u.id || currentUser?.username === u.username;
                        return (
                          <tr key={u.id} className="hover:bg-slate-50 transition-all">
                            <td className="py-4 px-4 font-semibold text-slate-800">
                              <div>{u.full_name}</div>
                              <div className="text-xs text-slate-400 font-normal">@{u.username}</div>
                            </td>
                            <td className="py-4 px-4 text-slate-600">{u.email}</td>
                            <td className="py-4 px-4">
                              <Badge
                                variant={
                                  u.role_name === "SuperAdmin"
                                    ? "info"
                                    : u.role_name === "Admin"
                                    ? "success"
                                    : "warning"
                                }
                              >
                                {u.role_name}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={u.is_active ? "success" : "danger"}>
                                {u.is_active ? "ใช้งานปกติ" : "ระงับใช้งาน"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {new Date(u.created_date).toLocaleString("th-TH")}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {isSelf ? (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium italic">
                                  <span>บัญชีของคุณ</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleOpenDeleteModal(u)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold border border-red-200 transition-all cursor-pointer whitespace-nowrap"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>ลบผู้ใช้</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="เพิ่มผู้ใช้งาน Back Office ใหม่">
        <form onSubmit={handleSubmit} className="space-y-4">
          {(formError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ใช้ (Username)</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น admin_city01"
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อ - นามสกุล (Full Name)</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="เช่น สมชาย ใจดี"
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">อีเมล (Email)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mueangsmart.go.th"
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">รหัสผ่าน (Password)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">บทบาทสิทธิการใช้งาน (Role)</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-900 outline-none transition-all"
            >
              {roles.map((r) => (
                <option key={r.Id} value={r.Id}>
                  {r.Name} ({r.Description})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างผู้ใช้งาน...</span>
                </>
              ) : (
                <span>สร้างผู้ใช้งาน</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete User Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="ยืนยันการลบผู้ใช้งาน">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
            <UserX className="w-6 h-6 flex-shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?</p>
              <p className="text-xs text-red-600 mt-1">
                การลบบัญชีผู้ใช้ <strong>{userToDelete?.full_name} (@{userToDelete?.username})</strong> จะทำให้ผู้ใช้งานนี้ไม่สามารถเข้าสู่ระบบ Back Office ได้อีกต่อไป
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังลบผู้ใช้...</span>
                </>
              ) : (
                <span>ยืนยันลบผู้ใช้งาน</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </ProtectedRoute>
  );
}
