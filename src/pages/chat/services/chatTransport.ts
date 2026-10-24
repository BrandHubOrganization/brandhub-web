import { isAxiosError, CanceledError, type AxiosRequestConfig } from "axios";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

let cooldown: { userId: string; until: number; error: unknown } | undefined;
const actor = () => useAuthStore.getState().user?.id ?? "";

export function chatRetryDelay() {
  return cooldown?.userId === actor()
    ? Math.max(0, cooldown.until - Date.now())
    : 0;
}

async function request<T>(
  method: string,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) {
  const userId = actor();
  if (chatRetryDelay() > 0) throw cooldown?.error;
  try {
    return await api.request<T>({ ...config, method, url, data });
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === 429 &&
      userId === actor()
    ) {
      const header = error.response.headers["retry-after"];
      const seconds = Number(header);
      const wait =
        header != null &&
        String(header).trim() !== "" &&
        Number.isFinite(seconds)
          ? seconds * 1000
          : Date.parse(String(header)) - Date.now();
      cooldown = {
        userId,
        until:
          Date.now() + Math.max(1000, Number.isFinite(wait) ? wait : 60_000),
        error,
      };
    }
    throw error;
  }
}

export const chatReadRetry = (count: number, error: unknown) =>
  count < 1 && isAxiosError(error) && error.response?.status === 429;

export const chatTransport = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    if (config?.signal?.aborted) return Promise.reject(new CanceledError());
    return request<T>("GET", url, undefined, config);
  },
  post: <T>(url: string, data?: unknown) => request<T>("POST", url, data),
  put: <T>(url: string, data?: unknown) => request<T>("PUT", url, data),
  patch: <T>(url: string, data?: unknown) => request<T>("PATCH", url, data),
  delete: <T>(url: string) => request<T>("DELETE", url),
};
