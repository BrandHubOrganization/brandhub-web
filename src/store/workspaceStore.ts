import { create } from "zustand";
import type { Workspace, MemberRole } from "@/types/workspace";
import { workspaceService } from "@/services/workspaceService";

export interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaceList: Workspace[];
  /** Role của user trong currentWorkspace — derive từ Workspace.myRole
   * (GET /workspaces đã tính đúng cả case OWNER qua agency ownership).
   * Không set tay: set currentWorkspace là đủ, tránh lệch/stale giữa 2 field. */
  currentMemberRole: MemberRole | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaceList: (workspaces: Workspace[]) => void;
  fetchWorkspaces: () => Promise<void>;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaceList: [],
  currentMemberRole: null,

  setCurrentWorkspace: (workspace) =>
    set({
      currentWorkspace: workspace,
      currentMemberRole: workspace?.myRole ?? null,
    }),
  setWorkspaceList: (workspaces) => set({ workspaceList: workspaces }),

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
