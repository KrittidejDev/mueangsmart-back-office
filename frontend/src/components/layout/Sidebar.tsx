"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  LayoutGrid,
  ShieldCheck, 
  ClipboardList,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Map,
  LucideIcon
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
  hideForRoles?: string[];
}

const navItems: NavItem[] = [
  { name: "ภาพรวมสถิติ (Dashboard)", href: "/dashboard", icon: LayoutDashboard },
  { name: "จัดการเมือง (Multi-City)", href: "/cities", icon: Building2 },
  { name: "จัดการโมดูล (Module)", href: "/modules", icon: LayoutGrid, hideForRoles: ["Executive", "ผู้บริหาร"] },
  { name: "ผู้ดูแลระบบ SuperAdmin", href: "/super-admins", icon: ShieldCheck, superAdminOnly: true },
  { name: "ประวัติการใช้งาน (Audit Logs)", href: "/audit-logs", icon: ClipboardList, superAdminOnly: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const subscribe = () => () => {};

const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getSidebarCollapsed = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sidebar_collapsed") === "true";
};

export function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initAuth } = useAuthStore();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const storedCollapsed = useSyncExternalStore(
    subscribeStorage,
    getSidebarCollapsed,
    () => false
  );
  const [localCollapsed, setLocalCollapsed] = useState<boolean | null>(null);
  const isCollapsed = localCollapsed !== null ? localCollapsed : storedCollapsed;

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setLocalCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar_collapsed", String(nextState));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  let currentRole = "";
  let isSuperAdmin = false;
  if (mounted) {
    currentRole = user?.roleName || "";
    if (!currentRole && typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("superadmin_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          currentRole = parsed.roleName || "";
        }
      } catch {
      }
    }
    isSuperAdmin = currentRole === "SuperAdmin";
  }

  const visibleNavItems = navItems.filter((item) => {
    if (!mounted) return true;
    if (item.superAdminOnly && !isSuperAdmin) {
      return false;
    }
    if (item.hideForRoles && item.hideForRoles.includes(currentRole)) {
      return false;
    }
    return true;
  });

  const renderSidebarContent = (collapsed: boolean, isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className={`p-4 border-b border-slate-100 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? (
            <div className="w-10 h-10 flex items-center justify-center shrink-0" title="MueangSmart Back Office Console">
              <Image 
                src="/images/logo-icon.webp" 
                alt="MueangSmart Logo" 
                width={40}
                height={40}
                priority
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <Image 
                  src="/images/logo-icon.webp" 
                  alt="MueangSmart Logo" 
                  width={48}
                  height={48}
                  priority
                  className="w-12 h-12 object-contain drop-shadow-sm"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-tight truncate">
                  MueangSmart
                </h2>
                <p className="text-xs text-sky-600 font-bold mt-0.5 truncate">Back Office Console</p>
              </div>
            </div>
          )}

          {isMobile && setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={`p-3 space-y-1.5 ${collapsed ? "px-2" : "px-3"}`}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center rounded-xl text-sm font-medium transition-all ${
                  collapsed
                    ? "justify-center w-11 h-11 mx-auto"
                    : "gap-3 px-3.5 py-2.5"
                } ${
                  isActive
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Bar with Toggle Collapse Icon Button */}
      <div className={`p-3 border-t border-slate-100 ${collapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between gap-2"}`}>
        {collapsed ? (
          <>
            <button
              onClick={handleLogout}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-red-600 hover:bg-red-50 transition-all cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5 shrink-0" />
            </button>
            <button
              onClick={toggleCollapse}
              className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:bg-brand-light/60 rounded-xl transition-all cursor-pointer"
              title="ขยายแถบเมนู (Expand Sidebar)"
            >
              <PanelLeftOpen className="w-5 h-5 text-brand-primary shrink-0" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer min-w-0"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap truncate">ออกจากระบบ</span>
            </button>

            <button
              onClick={toggleCollapse}
              className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-light/60 rounded-xl transition-all cursor-pointer shrink-0"
              title="ซ่อนแถบเมนู (Collapse Sidebar)"
            >
              <PanelLeftClose className="w-5 h-5 text-slate-500 hover:text-brand-primary" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside 
        className={`hidden lg:block bg-white border-r border-slate-200 h-screen sticky top-0 shadow-sm z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {renderSidebarContent(isCollapsed, false)}
      </aside>

      {/* Mobile Slide-over Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10">
            {renderSidebarContent(false, true)}
          </div>
        </div>
      )}
    </>
  );
}
