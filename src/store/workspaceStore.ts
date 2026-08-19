import { create } from "zustand";
import type { Workspace } from "@/types/workspace";
import { workspaceService } from "@/services/workspaceService";

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
      const { data } = await workspaceService.list();
      set({ workspaceList: data.data });
    } catch {
      set({ workspaceList: [] });
    }
  },

  reset: () => set({ currentWorkspace: null, workspaceList: [] }),
}));
