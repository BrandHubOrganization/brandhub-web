import { api } from "./api";
import type { ApiResponse } from "./authService";
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from "@/types/clientProfile";

export const clientProfileService = {
  // Agency-side: chọn client profile có sẵn để gắn vào workspace (AddClientDialog).
  listByAgency: (agencyId: string) =>
    api.get<ApiResponse<ClientProfile[]>>("/api/v1/client-profile", {
      params: { agencyId },
    }),

  // Legacy 1-per-agency API — không dùng ở accept-invite/trang quản lý profile
  // mới nữa (BA đã đổi sang N profile/user), giữ lại phòng chỗ khác còn gọi.
  getMyProfile: (agencyId: string) =>
    api.get<ApiResponse<ClientProfile>>("/api/v1/client-profile/me", {
      params: { agencyId },
    }),

  updateMyProfile: (agencyId: string, data: UpdateClientProfileRequest) =>
    api.put<ApiResponse<ClientProfile>>("/api/v1/client-profile/me", data, {
      params: { agencyId },
    }),

  // BA mới — N profile/user, không giới hạn theo agency.
  listMine: () =>
    api.get<ApiResponse<ClientProfile[]>>("/api/v1/client-profile/mine"),

  create: (data: UpdateClientProfileRequest) =>
    api.post<ApiResponse<ClientProfile>>("/api/v1/client-profile", data),

  getById: (profileId: string) =>
    api.get<ApiResponse<ClientProfile>>(`/api/v1/client-profile/${profileId}`),

  updateById: (profileId: string, data: UpdateClientProfileRequest) =>
    api.put<ApiResponse<ClientProfile>>(
      `/api/v1/client-profile/${profileId}`,
      data,
    ),

  deleteById: (profileId: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/client-profile/${profileId}`),
};
