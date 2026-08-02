import { api } from "./api";

// --- Request types ---

export interface LoginRequest {
  email: string;
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
  meta?: unknown;
  requestId?: string;
  version?: string;
  timestamp?: string;
}

// --- Service ---

export const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>("/api/v1/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<RegisterResponse>>("/api/v1/auth/register", data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/reset-password", data),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/verify-otp", data),

  resendOtp: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<void>>("/api/v1/auth/resend-otp", data),

  logout: () => api.post<ApiResponse<void>>("/api/v1/auth/logout"),

  refresh: () => api.post<ApiResponse<LoginResponse>>("/api/v1/auth/refresh"),
};
