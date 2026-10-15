import axios, { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const session = vi.hoisted(() => ({
  accessToken: "expired-token" as string | null, refreshToken: null as string | null,
  logout: vi.fn(), setTokens: vi.fn(),
}));
vi.mock("@/store/authStore", () => ({ useAuthStore: { getState: () => session } }));
import api from "./axios";

function response(config: InternalAxiosRequestConfig, status = 200): AxiosResponse {
  return { status, statusText: String(status), config, headers: new AxiosHeaders(),
    data: { success: true, data: { items: [] } } };
}
function unauthorized(config: InternalAxiosRequestConfig): never {
  throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, response(config, 401));
}
beforeEach(() => {
  session.accessToken = "expired-token";
  session.refreshToken = null;
  session.setTokens.mockReset().mockImplementation((access: string, refresh: string | null) => {
    session.accessToken = access; session.refreshToken = refresh;
  });
  session.logout.mockReset().mockImplementation(() => { session.accessToken = null; });
  vi.stubGlobal("window", { location: { origin: "http://localhost:3000", pathname: "/login", href: "/login" } });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("bounded HTTP authentication recovery", () => {
  it("shares one refresh and retries concurrent requests with its new token", async () => {
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({ data: { success: true, data: { accessToken: "fresh-token" } } });
    const headers: string[] = [];
    api.defaults.adapter = async config => {
      headers.push(String(config.headers.Authorization));
      if (config.headers.Authorization !== "Bearer fresh-token") unauthorized(config);
      return response(config);
    };
    const result = await Promise.all([api.get("/one"), api.get("/two")]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh.mock.calls[0][2]).toEqual({ withCredentials: true });
    expect(result).toHaveLength(2);
    expect(headers.filter(header => header === "Bearer fresh-token")).toHaveLength(2);
    expect(session.logout).not.toHaveBeenCalled();
  });
  it("rejects repeated 401 for queued requests without a refresh loop", async () => {
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({ data: { success: true, data: { accessToken: "fresh-token" } } });
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => unauthorized(config));
    api.defaults.adapter = adapter;
    const results = await Promise.allSettled([api.get("/one"), api.get("/two")]);
    expect(results.every(result => result.status === "rejected")).toBe(true);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(4);
  });
  it.each([{}, { success: true }, { success: false, data: {} },
    { success: true, data: {} }, { success: true, data: { accessToken: "" } }])(
    "rejects malformed refresh %j instead of installing an undefined token", async body => {
      vi.spyOn(axios, "post").mockResolvedValue({ data: body });
      api.defaults.adapter = async config => unauthorized(config);
      await expect(api.get("/protected")).rejects.toThrow();
      expect(session.setTokens).not.toHaveBeenCalled();
      expect(session.logout).toHaveBeenCalledOnce();
    });
  it("rejects missing/expired refresh cookies and logs out", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(new Error("REFRESH_TOKEN_INVALID"));
    api.defaults.adapter = async config => unauthorized(config);
    await expect(api.get("/protected")).rejects.toThrow("REFRESH_TOKEN_INVALID");
    expect(session.logout).toHaveBeenCalledOnce();
  });
  it("does not undo logout when a refresh completes late", async () => {
    vi.spyOn(axios, "post").mockImplementation(async () => {
      session.accessToken = null;
      return { data: { success: true, data: { accessToken: "fresh-token" } } };
    });
    api.defaults.adapter = async config => unauthorized(config);
    await expect(api.get("/protected")).rejects.toThrow("AUTH_SESSION_CHANGED");
    expect(session.setTokens).not.toHaveBeenCalled();
  });
  it("keeps login credential failures out of the refresh flow", async () => {
    const refresh = vi.spyOn(axios, "post");
    api.defaults.adapter = async config => unauthorized(config);
    await expect(api.post("/api/v1/auth/login", {})).rejects.toThrow();
    expect(refresh).not.toHaveBeenCalled();
  });
  it("reuses a newer token when a late 401 arrives after another refresh", async () => {
    const refresh = vi.spyOn(axios, "post");
    let attempts = 0;
    api.defaults.adapter = async config => {
      attempts++;
      if (attempts === 1) { session.accessToken = "already-rotated"; unauthorized(config); }
      expect(config.headers.Authorization).toBe("Bearer already-rotated");
      return response(config);
    };
    await api.get("/protected");
    expect(attempts).toBe(2);
    expect(refresh).not.toHaveBeenCalled();
  });
});
