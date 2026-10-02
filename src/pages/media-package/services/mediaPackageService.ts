import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import type {
  CreateCustomMediaPackageRequest,
  MediaPackage,
  SelectMediaPackageResponse,
  WorkspaceMediaPackage,
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
};
