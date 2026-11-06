import { expect, test, type Page } from "@playwright/test";

// FR 3.7.9: ADMIN configures the trend crawl schedule, sources and pipeline runs.
const saved = {
  intervalMinutes: 60,
  cron: null,
  sourcePages: ["https://www.facebook.com/groups/a"],
  postsPerRun: 200,
  running: true,
  enabled: true,
  nextRunAt: "2026-10-05T01:00:00Z",
  sources: ["facebook-groups"],
  fbCookie: {
    configured: false,
    valid: false,
    status: "missing",
    cookieCount: 0,
    cUser: null,
    expiresAt: null,
    updatedAt: null,
  },
};

const trendSettings = {
  revision: 1,
  enabled: true,
  cron: "0 8 * * *",
  timezone: "UTC",
  platforms: ["facebook", "threads", "tiktok"],
  threads: {
    maxTopics: 10,
    maxPostsPerTopic: 10,
    maxPosts: 100,
    maxSeconds: 300,
    maxCommentsPerPost: 10,
  },
  tiktok: {
    hashtags: ["#dulich"],
    useCreativeCenter: true,
    periodDays: 7,
    pagesPerHashtag: 2,
    topPostsPerHashtag: 10,
    maxCommentsPerPost: 10,
    collectMedia: false,
  },
};

const trendSourceConfig = {
  revision: 1,
  sourceUrls: ["https://www.facebook.com/groups/a"],
  maxPostsPerSource: 200,
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

async function asAdmin(
  page: Page,
  patches: unknown[],
  reject = false,
) {
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
    if (path === "/api/v1/admin/ai/trend-pipeline/source-config") {
      if (method === "PATCH") {
        const body = route.request().postDataJSON();
        patches.push(body);
        if (reject) {
          await route.fulfill({
            status: 400,
            json: {
              success: false,
              error: { code: "TREND_SOURCE_CONFIG_INVALID" },
            },
          });
          return;
        }
        await route.fulfill({
          json: {
            success: true,
            data: { ...trendSourceConfig, ...body, revision: 2 },
          },
        });
        return;
      }
      await route.fulfill({
        json: { success: true, data: trendSourceConfig },
      });
      return;
    }
    if (path === "/api/v1/admin/ai/trend-pipeline/config") {
      if (method === "PATCH") {
        const body = route.request().postDataJSON();
        patches.push(body);
        await route.fulfill({
          json: {
            success: true,
            data: { ...trendSettings, ...body, revision: 2 },
          },
        });
        return;
      }
      await route.fulfill({
        json: { success: true, data: trendSettings },
      });
      return;
    }
    if (path === "/api/v1/admin/ai/trend-pipeline/management/health") {
      await route.fulfill({
        json: {
          success: true,
          data: {
            manualReady: false,
            schedulerHealthy: true,
            checkedAt: "2026-10-05T08:00:00Z",
            checks: [
              {
                component: "session",
                platform: "facebook",
                status: "BLOCKED",
                code: "SESSION_MISSING",
                required: true,
                checkedAt: "2026-10-05T08:00:00Z",
              },
            ],
          },
        },
      });
      return;
    }
    let data: unknown = [];
    if (path === "/api/v1/users/me")
      data = { role: "ADMIN", fullName: "Admin" };
    if (path === "/api/v1/admin/ai/crawl-config") data = saved;
    if (path === "/api/v1/admin/ai/crawl-runs") {
      data = { running: null, history: [lastRun] };
    }
    await route.fulfill({ json: { success: true, data } });
  });
}

test("admin sees Overview, Configuration, and History tabs with Overview first, and pipeline launcher is in Overview tab", async ({
  page,
}) => {
  await asAdmin(page, []);
  await page.goto("/admin?view=crawl");

  const tablist = page.getByRole("tablist", {
    name: "Crawler management sections",
  });
  await expect(tablist.getByRole("tab", { name: "Input" })).toHaveCount(0);
  await expect(
    tablist.getByRole("tab", { name: "Overview" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(tablist.getByRole("tab", { name: "Configuration" })).toBeVisible();
  await expect(tablist.getByRole("tab", { name: /History/ })).toBeVisible();

  await expect(page.getByRole("button", { name: "Preview run" })).toBeVisible();
  await expect(page.getByText("Small test, no live publication")).toHaveCount(0);

  // Unmet check is shown in Overview tab
  const unmetCheck = page.getByRole("button", { name: /Session · Facebook/ });
  await expect(unmetCheck).toBeVisible();
});

test("admin adds Facebook source URL and saves in Configuration tab", async ({
  page,
}) => {
  const patches: unknown[] = [];
  await asAdmin(page, patches);
  await page.goto("/admin?view=crawl&crawlerTab=settings");

  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page
    .locator('input[type="url"]')
    .nth(1)
    .fill("https://www.facebook.com/b");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(
    page.getByText("Saved. The next run will use these settings."),
  ).toBeVisible();
  expect(patches[0]).toEqual({
    revision: 1,
    sourceUrls: [
      "https://www.facebook.com/groups/a",
      "https://www.facebook.com/b",
    ],
    maxPostsPerSource: 200,
  });

  // Add 9 more rows (total 11 rows) to verify 10-per-page pagination
  for (let i = 0; i < 9; i++) {
    await page.getByRole("button", { name: "Add", exact: true }).click();
  }
  const pagination = page.getByRole("navigation", {
    name: "Facebook sources pagination",
  });
  await expect(pagination).toBeVisible();
  await expect(page.locator('input[type="url"]')).toHaveCount(1);
  await pagination.getByRole("button", { name: "1", exact: true }).click();
  await expect(page.locator('input[type="url"]')).toHaveCount(10);
});

test("admin sees Facebook and Threads session cards at the top of the Overview tab with only 3 action buttons", async ({
  page,
}) => {
  await asAdmin(page, []);
  await page.goto("/admin?view=crawl&crawlerTab=monitoring");

  await expect(
    page.getByRole("complementary", { name: "Facebook cookie" }),
  ).toHaveCount(0);

  await expect(
    page.getByRole("heading", { name: "Facebook session" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Threads session" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "TikTok API" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Crawler proxy" }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Upload / replace" }),
  ).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Check connection" }),
  ).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Stop using" }),
  ).toHaveCount(4);
});

test("the live crawl status card in Overview tab lists visited pages, posts and errors", async ({
  page,
}) => {
  await asAdmin(page, []);
  await page.goto("/admin?view=crawl&crawlerTab=monitoring");
  await expect(page.getByText("Partly failed").first()).toBeVisible();
  const live = page
    .getByRole("complementary")
    .filter({ hasText: "Last crawl" });
  await expect(live).toContainText("6posts crawled");
  await expect(live).toContainText("facebook.com/groups/a");
  await expect(page.getByText("88 credits left").first()).toBeVisible();
  await expect(
    page.getByText("https://www.facebook.com/broken: HTTP 404: page not found"),
  ).toBeVisible();
});
