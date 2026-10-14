import { expect, test } from "@playwright/test";

// FR 3.10.1 in-app channel: admin broadcasts appear in every user's bell and can be marked read.
test("a user's bell shows admin system notifications and marks them read", async ({
  page,
}) => {
  const reads: string[] = [];
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "55555555-5555-5555-5555-555555555555",
            name: "Dev Client",
            role: "USER",
          },
          accessToken: "test-access",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (
      path.startsWith("/api/v1/notifications/me/") &&
      route.request().method() === "POST"
    ) {
      reads.push(path);
      await route.fulfill({ json: { success: true, data: null } });
      return;
    }
    let data: unknown = [];
    if (path === "/api/v1/users/me")
      data = { role: "USER", fullName: "Dev Client" };
    if (path === "/api/v1/notifications/me")
      data = {
        items: [
          {
            id: "66666666-6666-6666-6666-666666666666",
            type: "MAINTENANCE",
            title: "Scheduled maintenance at 23:00",
            content: "BrandHub will be down from 23:00 to 23:30.",
            actionUrl: null,
            createdAt: "2099-01-01T00:00:00Z",
            readAt: null,
          },
        ],
        unread: 1,
        total: 1,
        page: 1,
        size: 20,
      };
    await route.fulfill({ json: { success: true, data } });
  });
  await page.goto("/client-profiles");
  await page.getByTitle("Notifications").first().click();
  const item = page.getByText("Scheduled maintenance at 23:00");
  await expect(item).toBeVisible();
  await item.click();
  await expect
    .poll(() => reads)
    .toContain(
      "/api/v1/notifications/me/66666666-6666-6666-6666-666666666666/read",
    );
});
