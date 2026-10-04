import { expect, test } from "@playwright/test";

const owner = {
  id: "11111111-1111-1111-1111-111111111111",
  fullName: "Owner API Test",
  email: "owner@example.test",
  role: "USER",
  status: "FLAGGED",
  yellow: 1,
  orange: 2,
  red: 0,
  cleanPeriodEndsAt: "2026-11-01T00:00:00Z",
  reactivateAt: null,
  pendingReviewId: null,
  createdAt: "2026-10-01T00:00:00Z",
  emailVerifiedAt: "2026-10-01T00:00:00Z",
};

const liveStrike = {
  id: "44444444-4444-4444-4444-444444444444",
  level: "ORANGE",
  category: "SPAM",
  reason: "Repeated spam posts",
  createdAt: "2026-10-01T00:00:00Z",
  expiresAt: "2026-10-31T00:00:00Z",
  convertedToId: null,
  removedAt: null,
  removalReason: null,
  state: "ACTIVE",
};
let removals: Record<string, unknown>[] = [];

test.beforeEach(async ({ page }) => {
  removals = [];
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "22222222-2222-2222-2222-222222222222",
            fullName: "Admin",
            email: "admin@example.test",
          },
          isAuthenticated: true,
          systemRole: "ADMIN",
          accessToken: "test-access",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path === "/api/v1/users/me")
      data = { role: "ADMIN", fullName: "Admin" };
    if (path === "/api/v1/admin/users")
      data = { items: [owner], page: 1, size: 20, total: 1 };
    if (path.endsWith("/violations") && route.request().method() === "POST") {
      removals.push(route.request().postDataJSON());
    } else if (path.endsWith("/violations"))
      data = { user: owner, items: [liveStrike], page: 1, size: 20, total: 1 };
    await route.fulfill({ json: { success: true, data } });
  });
});

test("account tab uses API and hides retired verify/delete actions", async ({
  page,
}) => {
  await page.goto("/admin?view=users");
  await expect(page.getByText("Owner API Test", { exact: true })).toBeVisible();
  await expect(page.getByText("2/3", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Manage strikes" }).click();
  await expect(page.getByRole("dialog")).toContainText("owner@example.test");
  // Live strikes block unflagging; the dialog now says why instead of a dead button.
  await expect(
    page.getByText("can be unflagged only when it has no live strikes"),
  ).toBeVisible();
});

test("returning to unfiltered Users clears the search field", async ({
  page,
}) => {
  await page.goto("/admin?view=users");
  await page.getByRole("textbox").fill("Alpha");
  await page.getByRole("textbox").press("Enter");
  await expect(page).toHaveURL(/search=Alpha/);
  await page.getByRole("link", { name: "Users", exact: true }).click();
  await expect(page).not.toHaveURL(/search=/);
  await expect(page.getByRole("textbox")).toHaveValue("");
});

test("failed strike submission preserves evidence and retries the same operation ID", async ({
  page,
}) => {
  const operations: string[] = [];
  await page.route("**/api/v1/admin/users/*/violations", async (route) => {
    if (route.request().method() === "POST") {
      operations.push(route.request().postDataJSON().operationId);
      await route.fulfill({
        status: 500,
        json: { success: false, error: { code: "INTERNAL_ERROR" } },
      });
    } else
      await route.fulfill({
        json: {
          success: true,
          data: { user: owner, items: [], page: 1, size: 20, total: 0 },
        },
      });
  });
  await page.goto("/admin?view=users");
  await page.getByRole("button", { name: "Manage strikes" }).click();
  await page.getByLabel("Category", { exact: true }).fill("SPAM");
  await page
    .getByLabel("Reason / evidence", { exact: true })
    .fill("Evidence of repeated spam");
  await page
    .getByRole("button", { name: "Record strike", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  await expect(
    page.getByLabel("Reason / evidence", { exact: true }),
  ).toHaveValue("Evidence of repeated spam");
  await page
    .getByRole("button", { name: "Record strike", exact: true })
    .click();
  await expect.poll(() => operations.length).toBe(2);
  expect(operations[0]).toBe(operations[1]);
});

for (const language of ["vi", "en"]) {
  for (const theme of ["light", "dark"]) {
    test(`accounts ${language} ${theme} responsive`, async ({ page }, info) => {
      await page.addInitScript(
        ({ language, theme }) => {
          localStorage.setItem("brandhub-lang", language);
          localStorage.setItem("vite-ui-theme", theme);
        },
        { language, theme },
      );
      await page.setViewportSize({
        width: language === "vi" ? 390 : 1440,
        height: 900,
      });
      await page.goto("/admin?view=users");
      await page
        .getByRole("button", {
          name: language === "vi" ? "Quản lý thẻ phạt" : "Manage strikes",
        })
        .click();
      await expect(page.getByRole("dialog")).toContainText(
        language === "vi" ? "Lịch sử thẻ phạt" : "Strike history",
      );
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expect(page.getByRole("dialog")).not.toContainText(
        "admin.strikes.",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath(`accounts-${language}-${theme}.png`),
        fullPage: true,
      });
    });
  }
}

test("search filters while typing, without pressing Enter", async ({
  page,
}) => {
  await page.goto("/admin?view=users");
  const request = page.waitForRequest(
    (r) =>
      r.url().includes("/admin/users?") &&
      new URL(r.url()).searchParams.get("search") === "Owner",
  );
  await page.getByRole("textbox").fill("Owner");
  await request;
  await expect(page).toHaveURL(/search=Owner/);
});

test("removing a strike asks for its own reason and sends it", async ({
  page,
}) => {
  await page.goto("/admin?view=users");
  await page.getByRole("button", { name: "Manage strikes" }).click();
  await page.getByRole("button", { name: "Pardon this strike" }).click();
  const confirm = page.getByRole("button", {
    name: "Remove strike",
    exact: true,
  });
  await expect(confirm).toBeDisabled();
  await page
    .getByPlaceholder("Reason for removing this strike")
    .fill("Appeal accepted");
  await confirm.click();
  await expect.poll(() => removals.length).toBe(1);
  expect(removals[0]).toMatchObject({
    action: "REMOVE",
    strikeId: liveStrike.id,
    reason: "Appeal accepted",
  });
});
