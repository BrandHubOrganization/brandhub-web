import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn(), token: "initial-token" as string | null }));
vi.mock("@/services/api", () => ({ api: { get: mocks.get } }));
vi.mock("@/store/authStore", () => ({ useAuthStore: { getState: () => ({ accessToken: mocks.token }) } }));
import { prepareTaskSocket } from "./taskSocketSession";

beforeEach(() => {
  mocks.token = "initial-token";
  mocks.get.mockReset().mockResolvedValue({ data: { success: true, data: { id: "test-user" } } });
  vi.stubGlobal("window", { location: { origin: "http://localhost:3000" } });
});
afterEach(() => vi.unstubAllGlobals());
describe("editor handshake session", () => {
  it("uses the token rotated during the protected HTTP request, on every attempt", async () => {
    mocks.get.mockImplementationOnce(async () => {
      mocks.token = "rotated-token";
      return { data: { success: true, data: {} } };
    });
    expect(new URL(await prepareTaskSocket("https://example.test")).searchParams.get("token")).toBe("rotated-token");
    mocks.token = "next-token";
    const url = new URL(await prepareTaskSocket("https://example.test"));
    expect(url.protocol).toBe("wss:");
    expect(url.pathname).toBe("/ws/tasks");
    expect(url.searchParams.get("token")).toBe("next-token");
  });
  it("never connects without a session or after logout during validation", async () => {
    mocks.token = null;
    await expect(prepareTaskSocket("http://localhost:8080")).rejects.toThrow();
    expect(mocks.get).not.toHaveBeenCalled();
    mocks.token = "initial-token";
    mocks.get.mockImplementationOnce(async () => {
      mocks.token = null;
      return { data: { success: true, data: {} } };
    });
    await expect(prepareTaskSocket("http://localhost:8080")).rejects.toThrow();
  });
  it("does not open a socket on rejected or malformed identity response", async () => {
    mocks.get.mockRejectedValueOnce(new Error("401"));
    await expect(prepareTaskSocket("http://localhost:8080")).rejects.toThrow("401");
    mocks.get.mockResolvedValueOnce({ data: {} });
    await expect(prepareTaskSocket("http://localhost:8080")).rejects.toThrow("INVALID_API_RESPONSE");
  });
});
