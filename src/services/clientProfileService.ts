import { api } from "./api";
import type { ApiResponse } from "./authService";
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from "@/types/clientProfile";

export const clientProfileService = {
  getMyProfile: () =>
    api.get<ApiResponse<ClientProfile>>("/api/v1/client-profile/me"),

  updateMyProfile: (data: UpdateClientProfileRequest) =>
    api.put<ApiResponse<ClientProfile>>("/api/v1/client-profile/me", data),
};
