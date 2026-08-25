"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Loader2 
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"general" | "password">("general");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize or fetch current full profile info when opening modal
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setSuccessMsg(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setActiveTab("general");

    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }

    api.get("/auth/me")
      .then((res) => {
        if (res.data) {
          setFullName(res.data.full_name || "");
          setEmail(res.data.email || "");
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError("กรุณากรอกชื่อ - นามสกุล");
      return;
    }

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    // Password validation if attempting to change password
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setError("กรุณากรอกรหัสผ่านเดิมเพื่อยืนยันตัวตน");
        return;
      }
      if (newPassword.length < 6) {
        setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: {
        full_name: string;
        email: string;
        current_password?: string;
        new_password?: string;
      } = {
        full_name: fullName.trim(),
        email: email.trim(),
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.put("/auth/profile", payload);
      
      if (res.data) {
        updateUser({
          fullName: res.data.full_name,
          email: res.data.email,
          roleName: res.data.role_name,
        });
      }

      setSuccessMsg("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      const apiErr = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(apiErr || "เกิดข้อผิดพลาดในการบันทึกข้อมูลส่วนตัว");
    } finally {
      setLoading(false);
    }
  };

  const roleName = user?.roleName || "SuperAdmin";
  const badgeStyle =
    roleName === "SuperAdmin"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : roleName === "Admin"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : roleName === "Executive" || roleName === "ผู้บริหาร"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="แก้ไขข้อมูลส่วนตัว (Profile Management)">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "general"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <User className="w-4 h-4" />
            <span>ข้อมูลทั่วไป</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "password"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>เปลี่ยนรหัสผ่าน</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: General Info */}
        {activeTab === "general" && (
          <div className="space-y-4">
            {/* Username (Read Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>ชื่อผู้ใช้ (Username)</span>
                <span className="text-[10px] text-slate-400 font-normal">ใช้สำหรับเข้าสู่ระบบ (ไม่สามารถแก้ไขได้)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={user?.username || "superadmin"}
                  className="w-full bg-slate-100/80 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-500 font-medium cursor-not-allowed outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Role (Read Only Badge) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>บทบาทสิทธิ์ในระบบ (Role)</span>
                <span className="text-[10px] text-slate-400 font-normal">กำหนดโดยผู้ดูแลระบบสูงสุด</span>
              </label>
              <div className="flex items-center gap-2 py-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{roleName}</span>
                </span>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ - นามสกุล <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                อีเมล (Email) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mueangsmart.go.th"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Password Update */}
        {activeTab === "password" && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>คำแนะนำความปลอดภัย</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                หากต้องการเปลี่ยนรหัสผ่าน จำเป็นต้องระบุรหัสผ่านเดิมเพื่อยืนยันตัวตน และรหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร
              </p>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่านเดิม (Current Password)
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-2 pl-9 pr-10 text-sm text-slate-900 outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่านใหม่ (New Password)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-2 pl-9 pr-10 text-sm text-slate-900 outline-none transition-all"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ยืนยันรหัสผ่านใหม่ (Confirm New Password)
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-2 pl-9 pr-10 text-sm text-slate-900 outline-none transition-all"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-md shadow-brand-primary/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
