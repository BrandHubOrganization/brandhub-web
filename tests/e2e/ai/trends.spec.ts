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

  await page.getByRole("combobox", { name: "Filter by topic" }).click();
  await page.getByRole("option", { name: "Food" }).click();
  await expect(page.getByText("No trend data yet")).toBeVisible();
});

test("empty cache shows an empty state, not an error", async ({ page }) => {
  await signIn(page, () => ({ items: [], topics: [] }));
  await page.goto("/ai-studio/trends");
  await expect(page.getByText("No trend data yet")).toBeVisible();
  await expect(page.getByText("Could not load trend data.")).toHaveCount(0);
});
