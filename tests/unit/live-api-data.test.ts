import { beforeEach, describe, expect, it, vi } from "vitest";
const { api } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock("@/lib/axios", () => ({ api }));
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/services/notificationFeed";
import { fetchSocialAccounts } from "@/pages/social-accounts/services/socialAccountService";
beforeEach(() => vi.resetAllMocks());
describe("implemented flows never substitute sample data", () => {
  it("keeps an empty inbox empty", async () => {
    api.get.mockResolvedValue({ data: { data: { items: [] } } });
    expect(await getNotifications()).toEqual([]);
  });
  it("contains only real inbox items", async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          items: [
            {
              id: "server-id",
              title: "Real notice",
              content: "Server content",
              createdAt: "2026-10-18T01:00:00Z",
              readAt: null,
              actionUrl: null,
            },
          ],
        },
      },
    });
    expect(await getNotifications()).toEqual([
      expect.objectContaining({
        id: "sys:server-id",
        title: "Real notice",
        isRead: false,
      }),
    ]);
  });
  it("propagates inbox failures instead of pretending it is empty", async () => {
    api.get.mockRejectedValue(new Error("offline"));
    await expect(getNotifications()).rejects.toThrow("offline");
  });
  it("rejects malformed inbox responses", async () => {
    api.get.mockResolvedValue({ data: { data: {} } });
    await expect(getNotifications()).rejects.toThrow();
  });
  it("persists read operations and propagates failures", async () => {
    api.post.mockResolvedValue({});
    await markAsRead("sys:server-id");
    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/notifications/me/server-id/read",
    );
    api.post.mockRejectedValue(new Error("denied"));
    await expect(markAllAsRead()).rejects.toThrow("denied");
    await expect(markAsRead("sys:server-id")).rejects.toThrow("denied");
  });
  it("propagates social API failures", async () => {
    api.get.mockRejectedValue(new Error("offline"));
    await expect(fetchSocialAccounts("workspace-1")).rejects.toThrow("offline");
  });
  it("preserves empty social results and missing optional metadata", async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    expect(await fetchSocialAccounts("workspace-1")).toEqual([]);
    api.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "social-1",
            platform: "FACEBOOK",
            accountName: "Real Page",
            status: "ACTIVE",
          },
        ],
      },
    });
    const [account] = await fetchSocialAccounts("workspace-1");
    expect(account.status).toBe("CONNECTED");
    expect(account.connectedAt).toBeUndefined();
    expect(account.accountHandle).toBe("");
  });
});
