"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action: string;
  };
  superAdminOnly?: boolean;
}

export function ProtectedRoute({ children, requiredPermission, superAdminOnly }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, hasHydrated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    let roleName = user?.roleName;
    if (!roleName && typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("superadmin_user");
        if (storedUser) {
          roleName = JSON.parse(storedUser).roleName;
        }
      } catch {
      }
    }

    if (superAdminOnly && roleName !== "SuperAdmin") {
      router.push("/403");
      return;
    }

    if (requiredPermission) {
      const hasPerm = user?.permissions?.some(
        (p) => p.resource === requiredPermission.resource && p.action === requiredPermission.action
      );
      if (!hasPerm && roleName !== "SuperAdmin") {
        router.push("/403");
      }
    }
  }, [isAuthenticated, user, hasHydrated, router, pathname, requiredPermission, superAdminOnly]);

  const isAuthorized = Boolean(
    hasHydrated &&
    isAuthenticated &&
    (!superAdminOnly || user?.roleName === "SuperAdmin") &&
    (!requiredPermission || user?.roleName === "SuperAdmin" || user?.permissions?.some(
      (p) => p.resource === requiredPermission.resource && p.action === requiredPermission.action
    ))
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500 font-medium flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
          <span>กำลังตรวจสอบสิทธิการเข้าใช้งาน...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
