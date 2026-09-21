import { api } from "./api";
import type { ApiResponse } from "./authService";
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from "@/types/clientProfile";

export const clientProfileService = {
  getMyProfile: (agencyId: string) =>
    api.get<ApiResponse<ClientProfile>>("/api/v1/client-profile/me", {
      params: { agencyId },
    }),

  updateMyProfile: (agencyId: string, data: UpdateClientProfileRequest) =>
    api.put<ApiResponse<ClientProfile>>("/api/v1/client-profile/me", data, {
      params: { agencyId },
    }),
};
