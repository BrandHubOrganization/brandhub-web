import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send httpOnly cookies if configured
});

// These POST endpoints validate their own credentials, refresh cookie or challenge.
// A previous access token must not prevent starting or recovering a session.
const independentAuthPaths = new Set([
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/v1/auth/verify-otp",
  "/api/v1/auth/resend-otp",
  "/api/v1/auth/2fa/verify",
  "/api/v1/auth/activation/verify",
  "/api/v1/auth/activation/complete",
]);

function isIndependentAuthRequest(config: { method?: string; url?: string }) {
  const path = new URL(config.url || "", window.location.origin).pathname;
  return (
    config.method?.toLowerCase() === "post" && independentAuthPaths.has(path)
  );
}

// Request Interceptor: Attach access token from store
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (isIndependentAuthRequest(config)) {
      config.headers.delete("Authorization");
    } else if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Instance default Content-Type là application/json (dòng ~13) — nếu để
    // nguyên, axios sẽ JSON.stringify luôn FormData (ra "{}", mất file) thay
    // vì tự set multipart/form-data + boundary. Xoá header cố định để axios
    // tự phát hiện FormData và set đúng Content-Type. Sửa 1 chỗ ở interceptor
    // thay vì từng service tự thêm header (userService/clientProfileService
    // đã thiếu, gây lỗi 500 "unexpected error" khi upload avatar/banner/logo).
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Token refresh management
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// Response Interceptor: Catch 401, refresh token and retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (originalRequest && isIndependentAuthRequest(originalRequest)) {
        return Promise.reject(error);
      }

      const currentAccessToken = useAuthStore.getState().accessToken;
      if (currentAccessToken?.startsWith("dev-token-")) {
        return Promise.reject(error);
      }

      // If we are already refreshing the token, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      // Mark request as retried to avoid infinite loops
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        // Perform the token refresh request using a separate axios instance
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update tokens in auth store
        useAuthStore
          .getState()
          .setTokens(newAccessToken, newRefreshToken || refreshToken || null);

        // Resolve queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, reject queued requests
        processQueue(refreshError, null);

        // Log out the user
        useAuthStore.getState().logout();

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
export { apiClient as api };
