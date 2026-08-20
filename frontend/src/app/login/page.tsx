"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const initAuth = useAuthStore((state) => state.initAuth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    initAuth();
  }, [initAuth]);

  React.useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      const data = res.data;

      setAuth(data.token, {
        id: data.super_admin_id,
        username: data.username,
        fullName: data.full_name,
        roleName: data.role_name,
        permissions: data.permissions || [],
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #1dd5df 50%, #220e78 100%)" }}
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-slate-200 p-8 rounded-2xl shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 drop-shadow-sm">
            <Image 
              src="/images/logo-icon.webp" 
              alt="MueangSmart Logo" 
              width={64}
              height={64}
              priority
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MueangSmart Back Office</h1>
          <p className="text-sm text-slate-500 mt-1">ระบบบริหารจัดการเมืองอัจฉริยะ (SuperAdmin)</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="superadmin"
                className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 focus:border-brand-primary focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ SuperAdmin</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            ระบบความปลอดภัยขั้นสูง MueangSmart Enterprise &bull; UAT
          </p>
        </div>
      </div>
    </div>
  );
}
