import { create } from "zustand";

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  roleName: string;
  permissions: Array<{ resource: string; action: string }>;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  hasHydrated: false,

  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("superadmin_token", token);
      localStorage.setItem("superadmin_user", JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true, hasHydrated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("superadmin_token");
      localStorage.removeItem("superadmin_user");
    }
    set({ token: null, user: null, isAuthenticated: false, hasHydrated: true });
  },

  initAuth: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("superadmin_token");
      const userStr = localStorage.getItem("superadmin_user");
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ token, user, isAuthenticated: true, hasHydrated: true });
          return;
        } catch (e) {
          console.error("Failed to parse stored user profile", e);
        }
      }
    }
    set({ hasHydrated: true });
  },
}));
