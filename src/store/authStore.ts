import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole =
  | "ADMIN"
  | "AGENCY_OWNER"
  | "ACCOUNT_MANAGER"
  | "CONTENT_CREATOR"
  | "BRAND_CLIENT";

export interface User {
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
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    { name: "brandhub-auth" },
  ),
);
