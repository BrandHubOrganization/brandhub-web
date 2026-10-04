import { expect, test, type Page } from "@playwright/test";

// FR 3.10.4 SCR-ADM-04 against mocked API responses.
const item = {
  id: "11111111-1111-1111-1111-111111111111",
  postId: "6ac23c91c7a7694d7cac5e1b",
  contentVersion: 1,
  currentVersion: 1,
  workspaceId: null,
  authorId: "33333333-3333-3333-3333-333333333333",
  authorName: "Đỗ Gia Quân",
  authorEmail: "quan@example.test",
  authorStatus: "FLAGGED",
  yellow: 0,
  orange: 1,
  red: 0,
  source: "COPYRIGHT",
  reason: "Image matches a copyrighted photo at 92%",
  status: "PENDING",
  decisionNote: null,
  strikeLevel: null,
  reviewedByName: null,
  reviewedAt: null,
  createdAt: "2026-10-04T11:47:00Z",
  rowVersion: 0,
  captionPreview: "Autumn collection launch",
  snapshot: {
    contentText: "Autumn collection launch",
    hashtags: ["#brandhub"],
    media: [
      {
        s3_key: null,
        external_url: "https://example.test/a.png",
        media_type: "IMAGE",
      },
    ],
    targetPlatforms: ["FACEBOOK"],
    contentHash: "a".repeat(64),
    capturedAt: "2026-10-04T11:47:00Z",
  },
};

async function mockApi(
  page: Page,
  onDecision: (body: Record<string, unknown>) => Response | undefined,
) {
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
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/decision")) {
      const reply = onDecision(route.request().postDataJSON());
      if (reply) {
        await route.fulfill({ status: reply.status, json: await reply.json() });
        return;
      }
      await route.fulfill({
        json: { success: true, data: { ...item, status: "BLOCKED" } },
      });
      return;
    }
    let data: unknown =
      url.pathname === "/api/v1/users/me"
        ? { role: "ADMIN", fullName: "Admin" }
        : [];
    if (url.pathname === "/api/v1/admin/moderation")
      data = {
        items: [item],
        page: 1,
        size: 10,
        total: 1,
        pendingTotal: 1,
        processedToday: 4,
      };
    if (url.pathname === `/api/v1/admin/moderation/${item.id}`) data = item;
    await route.fulfill({ json: { success: true, data } });
  });
}

test("approve needs a 10-character note and a stale decision shows the conflict message", async ({
  page,
}) => {
  await mockApi(
    page,
    () =>
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "ADMIN_STATE_CONFLICT" },
        }),
        { status: 409 },
      ),
  );
  await page.goto("/admin?view=moderation");
  await expect(page.getByRole("button", { name: "Pending (1)" })).toBeVisible();
  await expect(page.getByText("Handled today: 4 posts")).toBeVisible();
  await page.getByRole("button", { name: "Review and decide" }).click();
  await expect(page.getByText("https://example.test/a.png")).toBeVisible();
  const approve = page.getByRole("button", {
    name: "Dismiss warning and allow publishing",
  });
  await page.locator("textarea").fill("too short");
  await expect(approve).toBeDisabled();
  await page.locator("textarea").fill("License verified with the author");
  await approve.click();
  await expect(page.getByRole("alert")).toContainText(
    "already handled or the post changed version",
  );
});

test("quick block sends the chosen strike level with the reason and row version", async ({
  page,
}) => {
  const bodies: Record<string, unknown>[] = [];
  await mockApi(page, (body) => {
    bodies.push(body);
    return undefined;
  });
  await page.goto("/admin?view=moderation");
  await page.getByRole("button", { name: "Quick block" }).click();
  await page.getByText("Orange", { exact: true }).click();
  await page.locator("textarea").fill("Uses an unlicensed photo");
  await page
    .getByRole("button", { name: "Block this version and record the strike" })
    .click();
  await expect(page.getByText("This post version was blocked")).toBeVisible();
  expect(bodies[0]).toMatchObject({
    decision: "BLOCK",
    strikeLevel: "ORANGE",
    note: "Uses an unlicensed photo",
    rowVersion: 0,
  });
});

for (const theme of ["light", "dark"]) {
  test(`moderation ${theme} fits a phone screen`, async ({ page }, info) => {
    await mockApi(page, () => undefined);
    await page.addInitScript(
      (value) => localStorage.setItem("vite-ui-theme", value),
      theme,
    );
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/admin?view=moderation");
    await expect(page.getByText("Autumn collection launch")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`moderation-${theme}.png`),
      fullPage: true,
    });
  });
}
