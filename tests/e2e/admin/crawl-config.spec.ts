import { expect, test, type Page } from "@playwright/test";

// FR 3.7.9: ADMIN configures the trend crawl schedule, source pages and posts per run.
const saved = {
  intervalMinutes: 60,
  cron: null,
  sourcePages: ["https://www.facebook.com/groups/a"],
  postsPerRun: 200,
  running: true,
  enabled: true,
  nextRunAt: "2026-10-05T01:00:00Z",
  sources: ["facebook-groups"],
};

const lastRun = {
  id: "r1",
  trigger: "MANUAL",
  status: "PARTIAL",
  startedAt: "2026-10-05T07:00:00Z",
  finishedAt: "2026-10-05T07:01:00Z",
  totalPosts: 6,
  deduped: 0,
  creditsRemaining: 88,
  pages: [
    {
      source: "facebook",
      url: "https://www.facebook.com/groups/a",
      posts: 6,
      requests: 2,
      error: null,
    },
    {
      source: "facebook",
      url: "https://www.facebook.com/broken",
      posts: 0,
      requests: 1,
      error: "HTTP 404: page not found",
    },
  ],
  errors: [],
};
const runState = { started: 0 };

async function asAdmin(page: Page, patches: unknown[], reject = false) {
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "22222222-2222-2222-2222-222222222222",
            fullName: "Admin",
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
    const method = route.request().method();
    if (path === "/api/v1/admin/ai/crawl-config" && method === "PATCH") {
      const body = route.request().postDataJSON();
      patches.push(body);
      if (reject) {
        await route.fulfill({
          status: 400,
          json: { success: false, error: { code: "INVALID_SCHEDULE" } },
        });
        return;
      }
      await route.fulfill({
        json: {
          success: true,
          data: { ...saved, ...body, intervalMinutes: null },
        },
      });
      return;
    }
    let data: unknown = [];
    if (path === "/api/v1/users/me")
      data = { role: "ADMIN", fullName: "Admin" };
    if (path === "/api/v1/admin/ai/crawl-config") data = saved;
    if (path === "/api/v1/admin/ai/crawl-runs") {
      if (method === "POST") {
        runState.started += 1;
        await route.fulfill({
          status: 202,
          json: { success: true, data: lastRun },
        });
        return;
      }
      data = { running: null, history: [lastRun] };
    }
    await route.fulfill({ json: { success: true, data } });
  });
}

test("admin switches to a cron schedule, edits pages and saves", async ({
  page,
}) => {
  const patches: unknown[] = [];
  await asAdmin(page, patches);
  await page.goto("/admin?view=crawl");
  await expect(page.getByText("Running on schedule")).toBeVisible();
  await expect(page.getByText("facebook-groups")).toBeVisible();

  await page.getByRole("button", { name: "Cron expression" }).click();
  const cron = page.getByRole("textbox", { name: "Cron expression" });
  await cron.fill("0 */6 * *");
  await expect(page.getByText("A cron needs exactly 5")).toBeVisible();
  await page.getByRole("button", { name: "Save settings" }).click();
  expect(patches).toHaveLength(0);

  await cron.fill("0 */6 * * *");
  await page
    .locator("textarea")
    .fill("https://www.facebook.com/groups/a\nhttps://www.facebook.com/b");
  await page.getByRole("spinbutton").fill("300");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Crawl settings saved.")).toBeVisible();
  expect(patches[0]).toEqual({
    cron: "0 */6 * * *",
    sourcePages: [
      "https://www.facebook.com/groups/a",
      "https://www.facebook.com/b",
    ],
    postsPerRun: 300,
  });
});

test("an invalid page URL blocks saving and a server INVALID_SCHEDULE is shown", async ({
  page,
}) => {
  const patches: unknown[] = [];
  await asAdmin(page, patches, true);
  await page.goto("/admin?view=crawl");
  await page.locator("textarea").fill("http://insecure.example");
  await expect(
    page.getByText("Invalid URL: http://insecure.example"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save settings" }).click();
  expect(patches).toHaveLength(0);

  await page.locator("textarea").fill("");
  await page.getByRole("button", { name: "Cron expression" }).click();
  await page
    .getByRole("textbox", { name: "Cron expression" })
    .fill("99 * * * *");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("The cron expression is invalid.")).toBeVisible();
});

test("the crawl log lists visited pages, posts and errors, and the dev button starts a run", async ({
  page,
}) => {
  await asAdmin(page, []);
  await page.goto("/admin?view=crawl");
  await expect(page.getByText("Partly failed")).toBeVisible();
  await expect(page.getByText("2 sources · 6 posts")).toBeVisible();
  await expect(page.getByText("88 credits left")).toBeVisible();
  await expect(
    page.getByText("https://www.facebook.com/broken: HTTP 404: page not found"),
  ).toBeVisible();
  const before = runState.started;
  await page.getByRole("button", { name: "Crawl now (dev)" }).click();
  await expect(
    page.getByText("Crawl started; the log updates itself."),
  ).toBeVisible();
  expect(runState.started).toBe(before + 1);
});
