import { api } from "./api";
import type { ApiResponse } from "./authService";

export interface UserProfileResponse {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  workspaceId: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  timezone: string;
  notificationPreferences: Record<string, unknown>;
}

export interface AvatarResponse {
  avatarUrl: string;
}

export const userService = {
  getProfile: () =>
    api.get<ApiResponse<UserProfileResponse>>("/api/v1/users/me"),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<UserProfileResponse>>("/api/v1/users/me", data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<AvatarResponse>>(
      "/api/v1/users/me/avatar",
      formData,
    );
  },
};
