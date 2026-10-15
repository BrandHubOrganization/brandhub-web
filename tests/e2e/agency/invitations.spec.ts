import { test, expect, type Page } from "@playwright/test";

const ok = (data: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data }),
});

async function setupAuth(page: Page, invitations: Array<Record<string, unknown>> = []) {
  await page.addInitScript(() => {
    window.localStorage.setItem("brandhub-lang", "vi");
    window.localStorage.setItem("brandhub_current_agency_id", "agency-1");
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "u1",
            name: "Tester",
            email: "tester@brandhub.dev",
            role: "USER",
          },
          accessToken: "mock-token",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });

  // Register general routes first
  await page.route("**/api/v1/agencies", (route) => route.fulfill(ok([])));
  await page.route("**/api/v1/workspaces**", (route) => route.fulfill(ok([])));
  await page.route("**/api/v1/users/me**", (route) =>
    route.fulfill(
      ok({
        id: "u1",
        email: "tester@brandhub.dev",
        fullName: "Tester",
      }),
    ),
  );

  // Register specific invitation routes after general routes
  await page.route("**/api/v1/agencies/invitations/my-pending**", (route) => {
    return route.fulfill(ok(invitations));
  });

  await page.route("**/api/v1/agencies/invitations/decline**", (route) => {
    return route.fulfill(ok({ message: "Declined" }));
  });

  await page.route("**/api/v1/agencies/invitations/accept**", (route) => {
    return route.fulfill(ok({ message: "Accepted" }));
  });
}

test.describe("Agency Invitations - UI Standards & Confirmation Dialog", () => {
  test("displays empty state when user has no pending invitations", async ({ page }) => {
    await setupAuth(page, []);
    await page.goto("/agency/invitations");

    await expect(page.getByText(/Không có lời mời đang chờ/i)).toBeVisible();
  });

  test("renders invitation card with Lucide icons and triggers decline confirmation dialog", async ({
    page,
  }) => {
    const mockInvs = [
      {
        id: "inv-1",
        token: "tok-1",
        agencyId: "agency-99",
        agencyName: "Vanguard Creative",
        email: "tester@brandhub.dev",
        role: "CREATOR",
        status: "PENDING",
        expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    await setupAuth(page, mockInvs);
    await page.goto("/agency/invitations");

    // Verify agency name and role badge
    await expect(page.getByText("Vanguard Creative")).toBeVisible();
    await expect(page.getByText("CREATOR")).toBeVisible();

    // Accept button with variant="orange"
    const acceptBtn = page.getByRole("button", { name: /Chấp nhận/i });
    await expect(acceptBtn).toBeVisible();

    // Click Decline button to open themed confirmation dialog
    const declineBtn = page.getByRole("button", { name: /Từ chối/i });
    await expect(declineBtn).toBeVisible();
    await declineBtn.click();

    // Check Dialog content
    await expect(page.getByText(/Từ chối lời mời tham gia\?/i)).toBeVisible();
    await expect(page.getByText(/Bạn có chắc chắn muốn từ chối lời mời tham gia Vanguard Creative/i)).toBeVisible();

    // Click cancel button in Dialog
    const cancelModalBtn = page.getByRole("button", { name: /Hủy/i });
    await cancelModalBtn.click();
    await expect(page.getByText(/Từ chối lời mời tham gia\?/i)).not.toBeVisible();

    // Open again and confirm decline
    await declineBtn.click();
    const confirmDeclineBtn = page.getByRole("button", { name: /Từ chối/i }).last();
    await confirmDeclineBtn.click();

    // Card should be removed
    await expect(page.getByText("Vanguard Creative")).not.toBeVisible();
  });
});
