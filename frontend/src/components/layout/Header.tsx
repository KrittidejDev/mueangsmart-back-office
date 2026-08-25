"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Bell, Activity, LogOut, ChevronDown, Menu, UserCog } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { ProfileModal } from "@/components/profile/ProfileModal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const initAuth = useAuthStore((state) => state.initAuth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header 
        className="h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md text-white"
        style={{ background: "linear-gradient(90deg, #220e78, #1dd5df)" }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">UAT Environment Connected</span>
            <span className="sm:hidden">UAT</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all relative cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full animate-ping" />
          </button>

          <div className="h-6 w-[1px] bg-white/20" />

          {/* Avatar Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center font-bold text-sm shadow-sm backdrop-blur-sm">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">{user?.fullName || "System SuperAdmin"}</p>
                <p className="text-[10px] text-white/80 font-medium mt-0.5">{user?.roleName || "Platform SuperAdmin"}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.fullName || "System SuperAdmin"}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">@{user?.username || "superadmin"}</p>
                  {(() => {
                    const role = user?.roleName || "SuperAdmin";
                    const badgeStyle =
                      role === "SuperAdmin"
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : role === "Admin"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : role === "Executive" || role === "ผู้บริหาร"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-700 border-slate-200";
                    return (
                      <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                        {role}
                      </span>
                    );
                  })()}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <UserCog className="w-4 h-4 text-brand-primary" />
                    <span>แก้ไขข้อมูลส่วนตัว</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>ออกจากระบบ (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
