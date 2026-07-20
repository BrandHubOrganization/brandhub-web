import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "ADMIN" | "AGENCY_OWNER" | "ACCOUNT_MANAGER" | "CONTENT_CREATOR" | "BRAND_CLIENT";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId?: string;
  clientId?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
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
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken !== null ? refreshToken : state.refreshToken,
        })),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: "brandhub-auth" }
  )
);
