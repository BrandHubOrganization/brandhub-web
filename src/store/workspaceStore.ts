import { create } from "zustand";
import type { Workspace, MemberRole } from "@/types/workspace";
import { workspaceService } from "@/services/workspaceService";

export interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaceList: Workspace[];
  currentMemberRole: MemberRole | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaceList: (workspaces: Workspace[]) => void;
  setCurrentMemberRole: (role: MemberRole | null) => void;
  fetchWorkspaces: () => Promise<void>;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaceList: [],
  currentMemberRole: null,

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setWorkspaceList: (workspaces) => set({ workspaceList: workspaces }),
  setCurrentMemberRole: (role) => set({ currentMemberRole: role }),

  fetchWorkspaces: async () => {
    try {
      const { data } = await workspaceService.list();
      set({ workspaceList: data.data });
    } catch {
      set({ workspaceList: [] });
    }
  },

  reset: () =>
    set({ currentWorkspace: null, workspaceList: [], currentMemberRole: null }),
}));
