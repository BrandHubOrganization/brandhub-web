import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type {
  CreateCustomMediaPackageRequest,
  MediaPackage,
  NegotiateTermsRequest,
  SelectMediaPackageResponse,
  WorkspaceMediaPackage,
  PackageNegotiationHistoryPage,
} from "@/pages/media-package/types/mediaPackage";

export const mediaPackageService = {
  listTemplates: () =>
    api.get<ApiResponse<MediaPackage[]>>("/api/v1/media-package-templates"),

  listAgencyCustom: (agencyId: string) =>
    api.get<ApiResponse<MediaPackage[]>>(
      `/api/v1/agencies/${agencyId}/media-package-custom`,
    ),

  listAvailableForWorkspace: (workspaceId: string) =>
    api.get<ApiResponse<MediaPackage[]>>(
      `/api/v1/workspaces/${workspaceId}/media-packages`,
    ),

  createCustom: (agencyId: string, request: CreateCustomMediaPackageRequest) =>
    api.post<ApiResponse<MediaPackage>>(
      `/api/v1/agencies/${agencyId}/media-package-custom`,
      request,
    ),

  updateAvailability: (
    agencyId: string,
    packageId: string,
    available: boolean,
  ) =>
    api.patch<ApiResponse<MediaPackage>>(
      `/api/v1/agencies/${agencyId}/media-packages/${packageId}/availability`,
      { available },
    ),

  selectForWorkspace: (workspaceId: string, packageId: string) =>
    api.post<ApiResponse<SelectMediaPackageResponse>>(
      `/api/v1/workspaces/${workspaceId}/media-package`,
      { packageId },
    ),

  getWorkspacePackage: (workspaceId: string) =>
    api.get<ApiResponse<WorkspaceMediaPackage>>(
      `/api/v1/workspaces/${workspaceId}/media-package`,
    ),

  negotiateTerms: (workspaceId: string, terms: NegotiateTermsRequest) =>
    api.patch<ApiResponse<WorkspaceMediaPackage>>(
      `/api/v1/workspaces/${workspaceId}/media-package/negotiate`,
      terms,
    ),

  history: (workspaceId: string, page: number) =>
    api.get<ApiResponse<PackageNegotiationHistoryPage>>(
      `/api/v1/workspaces/${workspaceId}/media-package/history`, { params: { page, size: 10 } }),

  approvePackage: (workspaceId: string, expectedTermsVersion: number) =>
    api.post<ApiResponse<WorkspaceMediaPackage>>(
      `/api/v1/workspaces/${workspaceId}/media-package/approve`,
      { expectedTermsVersion },
    ),
};

