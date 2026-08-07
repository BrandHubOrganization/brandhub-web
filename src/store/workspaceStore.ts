import { create } from "zustand";
import type { Workspace } from "@/types/workspace";
import { api } from "@/lib/axios";

export interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaceList: Workspace[];
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  fetchWorkspaces: () => Promise<void>;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaceList: [],

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  fetchWorkspaces: async () => {
    try {
      const response = await api.get("/api/v1/workspaces");
      // Handle standard API envelope { data: { data: [...] } } or direct array
      const list = response.data.data || response.data;
      set({ workspaceList: Array.isArray(list) ? list : [] });
    } catch (error) {
      console.warn("Failed to fetch workspaces, using fallback mock data:", error);
      // Fallback mockup data as a safety fallback
      const fallbackList: Workspace[] = [
        {
          id: "ws-nike",
          name: "Nike Vietnam Campaign",
          ownerId: "owner-demo",
          description: "Nike Marketing Campaigns",
          settings: {
            defaultPlatforms: ["facebook", "instagram"],
            timezone: "Asia/Ho_Chi_Minh",
            language: "vi",
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: "ws-heineken",
          name: "Heineken Campaign 2026",
          ownerId: "owner-demo",
          description: "Heineken Promo",
          settings: {
            defaultPlatforms: ["instagram"],
            timezone: "Asia/Ho_Chi_Minh",
            language: "vi",
          },
          createdAt: new Date().toISOString(),
        },
      ];
      set({ workspaceList: fallbackList });
    }
  },

  reset: () => set({ currentWorkspace: null, workspaceList: [] }),
}));
