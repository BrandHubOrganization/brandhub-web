import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type {
  CreateCustomMediaPackageRequest,
  WorkspaceMediaPackage,
} from "@/pages/media-package/types/mediaPackage";

export interface PackagePreparation {
  campaignId: string | null;
  termsVersion: number;
  status:
    | "LEGACY"
    | "PENDING"
    | "PROCESSING"
    | "READY"
    | "FAILED"
    | "DEPLOYING"
    | "DEPLOYED";
  errorCode: string | null;
  canEditPackage: boolean;
  canDeploy: boolean;
}
export interface PackageAffectedTask {
  taskId: string;
  name: string;
  reason: string;
}
export interface PackageRemovalGroup {
  deliverableId: string;
  name: string;
  removeCount: number;
  candidates: PackageAffectedTask[];
}
export interface PackageChangeImpact {
  termsVersion: number;
  blocked: boolean;
  affectedTasks: PackageAffectedTask[];
  removalGroups?: PackageRemovalGroup[];
}
export const packagePlanningService = {
  impact: async (
    id: string,
    packageDetails: CreateCustomMediaPackageRequest,
    expectedTermsVersion: number,
    requestId: string,
  ) =>
    (
      await api.post<ApiResponse<PackageChangeImpact>>(
        `/api/v1/workspaces/${id}/media-package/impact`,
        {
          packageDetails,
          expectedTermsVersion,
          requestId,
        },
      )
    ).data.data,
  selection: async (id: string) =>
    (
      await api.get<ApiResponse<WorkspaceMediaPackage | null>>(
        `/api/v1/workspaces/${id}/media-package`,
      )
    ).data.data,
  status: async (id: string) =>
    (
      await api.get<ApiResponse<PackagePreparation | null>>(
        `/api/v1/workspaces/${id}/media-package/preparation`,
      )
    ).data.data,
  save: async (
    id: string,
    packageDetails: CreateCustomMediaPackageRequest,
    expectedTermsVersion: number,
    requestId: string,
    confirmedRemovedTaskIds?: string[],
  ) =>
    (
      await api.put<ApiResponse<PackagePreparation>>(
        `/api/v1/workspaces/${id}/media-package`,
        {
          packageDetails,
          expectedTermsVersion,
          requestId,
          confirmedRemovedTaskIds,
        },
      )
    ).data.data,
  retry: async (id: string, expectedTermsVersion: number) =>
    (
      await api.post<ApiResponse<PackagePreparation>>(
        `/api/v1/workspaces/${id}/media-package/preparation/retry`,
        { expectedTermsVersion },
      )
    ).data.data,
};
