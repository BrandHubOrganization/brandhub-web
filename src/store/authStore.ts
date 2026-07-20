import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "@/types/user";

export type { User, UserRole };

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setTokens: (accessToken: string, refreshToken: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: user !== null }),

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken !== null ? refreshToken : state.refreshToken,
        })),

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        // Clear workspace store atomically without circular dependency issues at load-time
        import("./workspaceStore")
          .then((module) => {
            module.useWorkspaceStore.getState().reset();
          })
          .catch((error) => {
            console.warn("Failed to reset workspace store on logout:", error);
          });
      },
    }),
    { name: "brandhub-auth" }
  )
);
