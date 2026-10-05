import { expect, test, type Page } from "@playwright/test";

// FR 3.7.1: trend dashboard reads the AI pipeline through /api/v1/ai/trending-topics.
const trend = {
  id: "t1",
  rank: 1,
  keyword: "áo dài tết",
  score: 3.2,
  virality: 42.4,
  dailyCounts: [1, 4, 9],
  topic: "Fashion",
  status: "rising",
  mood: "positive",
  emotion: "vui",
  brandRisk: "low",
  crossTopic: true,
  keywords: ["áo dài", "tết"],
  sources: {},
  samplePosts: ["Mặc áo dài đi chơi tết"],
  posts: [
    {
      url: "https://www.facebook.com/page/posts/1",
      author: "Thời trang Việt",
      source: "facebook",
      likes: 1250,
      shares: 40,
      comments: 88,
      postedAt: "2026-09-21T08:00:00",
      text: "Mặc áo dài đi chơi tết năm nay ai cũng khen",
    },
  ],
};

async function signIn(page: Page, onTrends: (url: URL) => unknown) {
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: { id: "55555555-5555-5555-5555-555555555555", name: "Creator" },
          accessToken: "test-access",
          isAuthenticated: true,
          // Page behaviour only; route access is covered by access.ts (ADMIN skips role checks).
          systemRole: "ADMIN",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    let data: unknown = [];
    if (url.pathname === "/api/v1/users/me")
      data = { role: "ADMIN", fullName: "Creator" };
    if (url.pathname === "/api/v1/workspaces")
      data = [
        {
          id: "workspace-1",
          name: "Studio",
          agencyId: "agency-1",
          slug: "studio",
          ownerId: "owner",
          logoUrl: null,
          settings: {},
          isActive: true,
          createdAt: "2026-10-01T00:00:00Z",
          myRole: "CREATOR",
          clientProfileId: null,
        },
      ];
    if (url.pathname === "/api/v1/ai/trending-topics") data = onTrends(url);
    await route.fulfill({ json: { success: true, data } });
  });
}

test("shows ranked trends and filters by period and topic", async ({
  page,
}) => {
  const calls: string[] = [];
  await signIn(page, (url) => {
    calls.push(url.search);
    return {
      items: url.searchParams.get("topic") === "Food" ? [] : [trend],
      topics: ["Fashion", "Food"],
      topicStats: [
        { topic: "thể_thao", score: 22.3, trends: 3, rising: 3 },
        { topic: "Food", score: 4.1, trends: 1, rising: 0 },
      ],
      crawl: {
        intervalMinutes: 360,
        cron: null,
        pageCount: 3,
        sources: ["facebook-groups"],
        nextRunAt: null,
      },
    };
  });
  await page.goto("/ai-studio/trends");
  await expect(page.getByRole("heading", { name: "áo dài tết" })).toBeVisible();
  await expect(page.getByText("Rising", { exact: true })).toBeVisible();
  await expect(page.getByText("Super trend")).toBeVisible();
  await expect(page.getByText("42/100")).toBeVisible();
  expect(calls[0]).toContain("period=24h");
  await expect(
    page.getByText("Crawled from: facebook-groups (3 pages)"),
  ).toBeVisible();
  await expect(page.getByText("· refreshed every 6 hours")).toBeVisible();

  await page.getByRole("button", { name: "7 days" }).click();
  await expect
    .poll(() => calls.some((c) => c.includes("period=7d")))
    .toBe(true);

  await expect(
    page.getByRole("heading", { name: "Rising topics" }),
  ).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Sports" })).toBeAttached();
  await page.getByRole("combobox", { name: "Filter by topic" }).click();

  await page.getByRole("option", { name: "Food" }).click();
  await expect(page.getByText("No trend data yet")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Rising topics" }),
  ).toHaveCount(0);
});

test("empty cache shows an empty state, not an error", async ({ page }) => {
  await signIn(page, () => ({ items: [], topics: [] }));
  await page.goto("/ai-studio/trends");
  await expect(page.getByText("No trend data yet")).toBeVisible();
  await expect(page.getByText("Could not load trend data.")).toHaveCount(0);
});

test("a creator inside a workspace reaches Trends from the sidebar", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: { id: "33333333-3333-3333-3333-333333333333", name: "Creator" },
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
    let data: unknown = [];
    if (path === "/api/v1/users/me")
      data = { role: "USER", fullName: "Creator" };
    if (
      path === "/api/v1/workspaces" ||
      path === "/api/v1/workspaces/workspace-1"
    )
      data = path.endsWith("workspace-1") ? workspace : [workspace];
    if (path === "/api/v1/ai/trending-topics")
      data = { items: [trend], topics: [], crawl: null };
    await route.fulfill({ json: { success: true, data } });
  });
  await page.goto("/workspaces/workspace-1/library");
  await page.getByRole("link", { name: "Trends", exact: true }).click();
  await expect(page).toHaveURL(/\/ai-studio\/trends$/);
  await expect(page.getByRole("heading", { name: "áo dài tết" })).toBeVisible();
});

const workspace = {
  id: "workspace-1",
  name: "Studio",
  agencyId: "agency-1",
  slug: "studio",
  ownerId: "owner",
  logoUrl: null,
  settings: {},
  isActive: true,
  createdAt: "2026-10-01T00:00:00Z",
  myRole: "CREATOR",
  clientProfileId: null,
};

test("hovering a trend card pops up its posts with a link", async ({
  page,
}) => {
  await signIn(page, () => ({
    items: [trend],
    topics: [],
    topicStats: [],
    crawl: null,
  }));
  await page.goto("/ai-studio/trends");
  await expect(page.getByText("1 post · hover to view")).toBeVisible();
  await page.getByRole("heading", { name: "áo dài tết" }).hover();
  const popup = page.getByText('1 post on "áo dài tết"');
  await expect(popup).toBeVisible();
  await expect(page.getByText("Thời trang Việt")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open post" })).toHaveAttribute(
    "href",
    "https://www.facebook.com/page/posts/1",
  );
});
