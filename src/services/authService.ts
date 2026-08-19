import { api } from "./api";
import type { SystemRole } from "@/store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/** URL redirect trực tiếp sang backend OAuth flow — dùng làm href, không phải axios call. */
export function oauthUrl(
  provider: "google" | "github" | "linkedin" | "microsoft",
): string {
  return `${API_BASE_URL}/api/v1/auth/oauth/${provider}`;
}

// --- Request types ---

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LinkPhoneRequest {
  phone: string;
}

export interface VerifyPhoneOtpRequest {
  otpCode: string;
}

export interface SetPasswordRequest {
  password: string;
}

export interface UnlinkOAuthRequest {
  provider: string;
}

export interface MeResponse {
  userId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role?: SystemRole | string;
  workspaceId?: string;
  phone?: string | null;
  hasPassword?: boolean;
  linkedProviders?: string[];
}

export interface UserProfileResponse {
  userId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: SystemRole;
  workspaceId?: string;
  createdAt?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

// --- Response types ---

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterResponse {
  userId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

// --- Service methods ---

export const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>("/api/v1/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<RegisterResponse>>("/api/v1/auth/register", data),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/verify-otp", data),

  resendOtp: (data: { email: string }) =>
    api.post<ApiResponse<void>>("/api/v1/auth/resend-otp", data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/reset-password", data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/change-password", data),

  linkPhone: (data: LinkPhoneRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/link/phone", data),

  verifyPhoneOtp: (data: VerifyPhoneOtpRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/verify-phone-otp", data),

  setPassword: (data: SetPasswordRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/set-password", data),

  unlinkPhone: () => api.post<ApiResponse<void>>("/api/v1/auth/unlink/phone"),

  unlinkOAuth: (data: UnlinkOAuthRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/unlink/oauth", data),

  me: () => api.get<ApiResponse<MeResponse>>("/api/v1/auth/me"),

  getProfile: () => api.get<ApiResponse<UserProfileResponse>>("/api/v1/users/me"),
};
