import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import { useAuthStore } from "@/store/authStore";

/** Revalidate via the shared HTTP refresh queue before every WS handshake. */
export async function prepareTaskSocket(baseUrl: string): Promise<string> {
  if (!useAuthStore.getState().accessToken) throw new Error("AUTHENTICATION_REQUIRED");
  const response = await api.get("/api/v1/users/me");
  requireApiData(response.data);
  const token = useAuthStore.getState().accessToken;
  if (!token) throw new Error("AUTHENTICATION_REQUIRED");
  // Keep the existing Business handshake contract; never log this URL.
  const url = new URL(baseUrl, window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/ws/tasks`;
  url.search = "";
  url.searchParams.set("token", token);
  return url.toString();
}
