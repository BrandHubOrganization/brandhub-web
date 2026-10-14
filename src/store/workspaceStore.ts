import { create } from "zustand";
import type {
  Workspace,
  MemberRole,
  WorkspacePackageNegotiationStatus,
} from "@/types/workspace";
import { workspaceService } from "@/services/workspaceService";
import { mediaPackageService } from "@/pages/media-package/services/mediaPackageService";

export interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaceList: Workspace[];
  /** Role của user trong currentWorkspace — derive từ Workspace.myRole
   * (GET /workspaces đã tính đúng cả case OWNER qua agency ownership).
   * Không set tay: set currentWorkspace là đủ, tránh lệch/stale giữa 2 field. */
  currentMemberRole: MemberRole | null;
  /** workspaceMediaPackageId của currentWorkspace (null: chưa có gói; undefined: chưa check) */
  currentWorkspaceMediaPackageId: string | null | undefined;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaceList: (workspaces: Workspace[]) => void;
  setWorkspaceMediaPackage: (
    packageId: string | null,
    negotiationStatus: WorkspacePackageNegotiationStatus | null,
  ) => void;
  checkWorkspaceMediaPackage: (workspaceId: string) => Promise<string | null>;
  fetchWorkspaces: () => Promise<void>;
  reset: () => void;
}

export const selectWorkspaceMediaPackageId = (
  state: WorkspaceState,
): string | null | undefined =>
  state.currentWorkspace?.workspaceMediaPackageId ??
  state.currentWorkspaceMediaPackageId;

export const selectIsClientHardGated = (state: WorkspaceState): boolean => {
  const role = state.currentMemberRole ?? state.currentWorkspace?.myRole;
  if (role !== "CLIENT" && role !== "MANAGER") return false;
  return state.currentWorkspace?.packageNegotiationStatus !== "APPROVED";
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaceList: [],
  currentMemberRole: null,
  currentWorkspaceMediaPackageId: undefined,

  setCurrentWorkspace: (workspace) =>
    set({
      currentWorkspace: workspace,
      currentMemberRole: workspace?.myRole ?? null,
      currentWorkspaceMediaPackageId: workspace?.workspaceMediaPackageId,
    }),
  setWorkspaceList: (workspaces) => set({ workspaceList: workspaces }),

  setWorkspaceMediaPackage: (packageId, negotiationStatus) =>
    set((state) => ({
      currentWorkspaceMediaPackageId: packageId,
      currentWorkspace: state.currentWorkspace
        ? {
            ...state.currentWorkspace,
            workspaceMediaPackageId: packageId,
            packageNegotiationStatus: negotiationStatus,
          }
        : null,
      workspaceList: state.workspaceList.map((w) =>
        w.id === state.currentWorkspace?.id
          ? {
              ...w,
              workspaceMediaPackageId: packageId,
              packageNegotiationStatus: negotiationStatus,
            }
          : w,
      ),
    })),

  checkWorkspaceMediaPackage: async (workspaceId: string) => {
    try {
      const { data } =
        await mediaPackageService.getWorkspacePackage(workspaceId);
      const pkgId = data.data?.workspaceMediaPackageId ?? null;
      const negotiationStatus = data.data?.negotiationStatus ?? null;
      set((state) => ({
        currentWorkspaceMediaPackageId:
          state.currentWorkspace?.id === workspaceId
            ? pkgId
            : state.currentWorkspaceMediaPackageId,
        currentWorkspace:
          state.currentWorkspace?.id === workspaceId
            ? {
                ...state.currentWorkspace,
                workspaceMediaPackageId: pkgId,
                packageNegotiationStatus: negotiationStatus,
              }
            : state.currentWorkspace,
        workspaceList: state.workspaceList.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                workspaceMediaPackageId: pkgId,
                packageNegotiationStatus: negotiationStatus,
              }
            : w,
        ),
      }));
      return pkgId;
    } catch {
      // Fail closed: if package state cannot be verified, keep the Client in
      // negotiation mode instead of exposing creative-work routes.
      set((state) => ({
        currentWorkspaceMediaPackageId:
          state.currentWorkspace?.id === workspaceId
            ? null
            : state.currentWorkspaceMediaPackageId,
        currentWorkspace:
          state.currentWorkspace?.id === workspaceId
            ? {
                ...state.currentWorkspace,
                workspaceMediaPackageId: null,
                packageNegotiationStatus: null,
              }
            : state.currentWorkspace,
        workspaceList: state.workspaceList.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                workspaceMediaPackageId: null,
                packageNegotiationStatus: null,
              }
            : w,
        ),
      }));
      return null;
    }
  },

  fetchWorkspaces: async () => {
    try {
      const { data } = await workspaceService.list();
      set({ workspaceList: data.data });
    } catch {
      set({ workspaceList: [] });
    }
  },

  reset: () =>
    set({
      currentWorkspace: null,
      workspaceList: [],
      currentMemberRole: null,
      currentWorkspaceMediaPackageId: undefined,
    }),
}));
