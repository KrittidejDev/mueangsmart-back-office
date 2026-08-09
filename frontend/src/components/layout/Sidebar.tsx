"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  LayoutGrid,
  Layers, 
  PieChart, 
  ShieldCheck, 
  ClipboardList,
  LogOut,
  X,
  LucideIcon
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "ภาพรวมสถิติ (Dashboard)", href: "/dashboard", icon: LayoutDashboard },
  { name: "จัดการเมือง (Multi-City)", href: "/cities", icon: Building2 },
  { name: "จัดการโมดูล (Module)", href: "/modules", icon: LayoutGrid },
  { name: "การวิเคราะห์กลุ่มเปราะบาง", href: "/analytics/vulnerable", icon: PieChart },
  { name: "ระบบเพิ่มเมือง (Onboarding)", href: "/cities/onboarding", icon: Layers, superAdminOnly: true },
  { name: "ผู้ดูแลระบบ SuperAdmin", href: "/super-admins", icon: ShieldCheck, superAdminOnly: true },
  { name: "ประวัติการใช้งาน (Audit Logs)", href: "/audit-logs", icon: ClipboardList, superAdminOnly: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initAuth();
  }, [initAuth]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Determine SuperAdmin Role reliably on Client side after mounted
  let isSuperAdmin = false;
  if (mounted) {
    isSuperAdmin = user?.roleName === "SuperAdmin";
    if (!isSuperAdmin && typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("superadmin_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.roleName === "SuperAdmin") {
            isSuperAdmin = true;
          }
        }
      } catch {
        // ignore JSON parse error
      }
    }
  }

  // Before client hydration/mounted, render base items or full items if mounted
  const visibleNavItems = navItems.filter((item) => {
    // If not yet mounted on client, render all items to prevent hydration mismatch
    if (!mounted) return true;
    if (item.superAdminOnly && !isSuperAdmin) {
      return false;
    }
    return true;
  });

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm tracking-tight">MueangSmart</h2>
              <p className="text-xs text-sky-600 font-semibold">Back Office Console</p>
            </div>
          </div>
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 h-screen sticky top-0 shadow-sm z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
