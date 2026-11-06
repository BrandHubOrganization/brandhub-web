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
export const packagePlanningService = {
  impact: async (
    id: string,
    packageDetails: CreateCustomMediaPackageRequest,
    expectedTermsVersion: number,
    requestId: string,
  ) =>
    (
      await api.post<
        ApiResponse<{
          blocked: boolean;
          affectedTasks: { taskId: string; name: string; reason: string }[];
        }>
      >(`/api/v1/workspaces/${id}/media-package/impact`, {
        packageDetails,
        expectedTermsVersion,
        requestId,
      })
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
  ) =>
    (
      await api.put<ApiResponse<PackagePreparation>>(
        `/api/v1/workspaces/${id}/media-package`,
        { packageDetails, expectedTermsVersion, requestId },
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
