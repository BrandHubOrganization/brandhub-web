import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, SystemRole } from "@/types/user";

export type { User, SystemRole };

// Dynamic import để tránh circular dependency ở load-time (workspaceStore/
// agencyStore không import ngược lại authStore, nhưng import tĩnh ở đây vẫn
// có thể gây vòng lặp module resolution nếu 1 trong 2 store sau này cần
// authStore). Dùng chung cho cả setAuth (đổi user) và logout.
function resetWorkspaceAndAgencyStores() {
  import("./workspaceStore")
    .then((module) => module.useWorkspaceStore.getState().reset())
    .catch((error) => {
      console.warn("Failed to reset workspace store:", error);
    });
  import("./agencyStore")
    .then((module) => module.useAgencyStore.getState().reset())
    .catch((error) => {
      console.warn("Failed to reset agency store:", error);
    });
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  systemRole: SystemRole | null;
  setUser: (user: User | null) => void;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  clearAuth: () => void;
  setTokens: (accessToken: string, refreshToken: string | null) => void;
  setSystemRole: (systemRole: SystemRole | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      systemRole: null,

      setUser: (user) => set({ user, isAuthenticated: user !== null }),

      setAuth: (user, accessToken, refreshToken = "") => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        // Đăng nhập user MỚI (kể cả quick-login đổi tài khoản mà không gọi
        // logout() trước) phải xoá agency/workspace đang chọn của session
        // trước — currentAgencyId persist ở localStorage, không tự hết khi
        // đổi user, làm sidebar lẫn agency của người khác (đã thấy live khi
        // quick-login liên tục nhiều account).
        resetWorkspaceAndAgencyStores();
      },

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          systemRole: null,
        }),

      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken:
            refreshToken !== null ? refreshToken : state.refreshToken,
        })),

      setSystemRole: (systemRole) => set({ systemRole }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          systemRole: null,
        });
        resetWorkspaceAndAgencyStores();
      },
    }),
    { name: "brandhub-auth" },
  ),
);
