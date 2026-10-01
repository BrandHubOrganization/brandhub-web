import { api } from "./api";
import type { ApiResponse } from "./authService";
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from "@/types/clientProfile";

export const clientProfileService = {
  // N profile/user, không giới hạn theo agency.
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

  // Upload logo dạng file — song song với việc dán URL vào field logoUrl.
  // Bản có profileId dùng khi đã có hồ sơ (trang chỉnh sửa).
  uploadLogo: (profileId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<ClientProfile>>(
      `/api/v1/client-profile/${profileId}/logo`,
      formData,
    );
  },

  // Form tạo mới chưa có profileId — server chỉ upload rồi trả URL, không lưu DB.
  uploadLogoDraft: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<string>>(
      "/api/v1/client-profile/logo",
      formData,
    );
  },
};
