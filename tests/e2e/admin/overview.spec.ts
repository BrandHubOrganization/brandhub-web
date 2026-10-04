import { expect, test } from "@playwright/test";

const statistics = {
  generatedAt: "2026-10-02T04:30:00Z",
  timezone: "Asia/Ho_Chi_Minh",
  days: 30,
  periodStart: "2026-09-02T17:00:00Z",
  periodEnd: "2026-10-02T04:30:00Z",
  totalUsers: 1234,
  activeUsers30d: 458,
  totalAgencies: 24,
  flaggedUsers: 7,
  pendingVerificationUsers: 12,
  deactivatedUsers: 3,
  pendingSanctions: 2,
  newUsersInPeriod: 81,
  strikes: { yellow: 13, orange: 8, red: 2 },
  accountStatuses: [
    { status: "ACTIVE", count: 1212 },
    { status: "FLAGGED", count: 7 },
    { status: "PENDING_VERIFICATION", count: 12 },
    { status: "DEACTIVATED", count: 3 },
  ],
  registrations: Array.from({ length: 30 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 8, 3 + index)).toISOString().slice(0, 10),
    count: [1, 2, 4, 2, 3, 6, 4, 3, 2, 1][index % 10],
  })),
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "22222222-2222-2222-2222-222222222222",
            name: "Admin",
            role: "ADMIN",
          },
          accessToken: "test-access",
          isAuthenticated: true,
          systemRole: "ADMIN",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path === "/api/v1/admin/statistics") data = statistics;
    if (path === "/api/v1/users/me")
      data = { role: "ADMIN", fullName: "Admin" };
    if (path === "/api/v1/admin/users")
      data = { items: [], total: 0, page: 1, size: 20 };
    await route.fulfill({ json: { success: true, data } });
  });
});

test("admin opens real overview metrics and period/timezone controls", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Platform overview", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("1,234", { exact: true }).first()).toBeVisible();
  const request = page.waitForRequest(
    (r) =>
      r.url().includes("/admin/statistics") &&
      new URL(r.url()).searchParams.get("days") === "7",
  );
  await page
    .getByRole("group", { name: "Period" })
    .getByRole("button", { name: "7 days", exact: true })
    .click();
  await request;
  const utc = page.waitForRequest(
    (r) =>
      r.url().includes("/admin/statistics") &&
      new URL(r.url()).searchParams.get("timezone") === "UTC",
  );
  await page.getByLabel("Time zone", { exact: true }).selectOption("UTC");
  await utc;
});

test("mobile admin navigation stays in administration", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");
  await expect(
    page.getByRole("link", { name: "Users", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Users", exact: true }).click();
  await expect(page).toHaveURL(/view=users/);
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Platform overview", exact: true }),
  ).toBeVisible();
});

test("permission loss hides previously loaded statistics", async ({ page }) => {
  let forbidden = false;
  await page.route("**/api/v1/admin/statistics**", (route) =>
    route.fulfill(
      forbidden
        ? { status: 403, json: { success: false } }
        : { json: { success: true, data: statistics } },
    ),
  );
  await page.goto("/admin");
  await expect(page.getByText("1,234", { exact: true }).first()).toBeVisible();
  forbidden = true;
  await page.getByRole("button", { name: "Refresh data", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "does not have permission",
  );
  await expect(page.getByText("1,234", { exact: true })).toHaveCount(0);
});

test("admin shell does not present sample workspace notifications as real alerts", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Platform overview", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('header button[title="Notifications"]'),
  ).toHaveCount(0);
  await page.goto("/admin?view=moderation");
  await expect(page.locator("header nav")).toContainText("Moderation");
  await expect(page.locator("main")).toContainText("not available yet");
});

test("flagged drill-down preserves status on reload", async ({ page }) => {
  await page.goto("/admin");
  await page.locator('a[href*="status=FLAGGED"]').first().click();
  await expect(page).toHaveURL(/view=users/);
  await expect(page).toHaveURL(/status=FLAGGED/);
  await expect(page.getByLabel("Account status", { exact: true })).toHaveValue(
    "FLAGGED",
  );
  await page.reload();
  await expect(page.getByLabel("Account status", { exact: true })).toHaveValue(
    "FLAGGED",
  );
});

test("failed statistics show an error and retry loads actual data", async ({
  page,
}) => {
  let fails = true;
  await page.route("**/api/v1/admin/statistics**", (route) =>
    route.fulfill(
      fails
        ? { status: 500, json: { success: false } }
        : { json: { success: true, data: statistics } },
    ),
  );
  await page.goto("/admin");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByText("1,234", { exact: true })).toHaveCount(0);
  fails = false;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByText("1,234", { exact: true }).first()).toBeVisible();
});

for (const language of ["vi", "en"]) {
  for (const theme of ["light", "dark"]) {
    test(`overview ${language} ${theme} responsive`, async ({ page }, info) => {
      await page.addInitScript(
        ({ language, theme }) => {
          localStorage.setItem("brandhub-lang", language);
          localStorage.setItem("vite-ui-theme", theme);
        },
        { language, theme },
      );
      await page.setViewportSize({
        width: language === "vi" ? 390 : 1440,
        height: 1000,
      });
      await page.goto("/admin");
      await expect(
        page.getByRole("heading", {
          name: language === "vi" ? "Tổng quan nền tảng" : "Platform overview",
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator("main")).not.toContainText("admin.overview.");
      await page.screenshot({
        path: info.outputPath(`overview-${language}-${theme}.png`),
        fullPage: true,
      });
      expect(
        await page
          .locator("main")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await page
        .locator("main")
        .evaluate((el) => el.scrollTo(0, el.scrollHeight));
      await page.screenshot({
        path: info.outputPath(`overview-${language}-${theme}-bottom.png`),
      });
    });
  }
}
