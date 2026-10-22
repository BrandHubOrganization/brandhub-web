import { expect, test, type Page } from "@playwright/test";

async function openCaptionDialog(page: Page, blockedAdapt = false) {
  let generation = 0;
  let refinePlatform = "";
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "caption-user",
            name: "Creator",
            email: "creator@example.test",
          },
          accessToken: "caption-test-token",
          isAuthenticated: true,
          systemRole: "ADMIN",
        },
        version: 0,
      }),
    );
  });
  const signals = {
    emotion: { vui: 0.7 },
    trendUsed: false,
    unverifiedClaims: [],
  };
  const draft = (caption: string, blocked = false) => ({
    platform: "tiktok",
    caption,
    hashtags: ["#coffee"],
    characterCount: caption.length,
    recommendedMaxChars: 4000,
    signals,
    compliance: { status: blocked ? "BLOCKED" : "PASSED", issues: [] },
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path === "/api/v1/users/me")
      data = { role: "ADMIN", fullName: "Creator" };
    if (path === "/api/v1/workspaces")
      data = [
        {
          id: "caption-workspace",
          name: "Caption Studio",
          agencyId: "caption-agency",
          slug: "caption-studio",
          ownerId: "caption-user",
          logoUrl: null,
          settings: {},
          isActive: true,
          createdAt: "2026-10-08T00:00:00Z",
          myRole: "CREATOR",
          clientProfileId: null,
        },
      ];
    if (path.endsWith("/ai/credits")) data = { remaining: 200 };
    if (path === "/api/v1/ai/trending-topics") data = { items: [] };
    if (path.endsWith("/ai/trend-fit"))
      data = { date: "2026-10-23", judged: false, trends: [], upcoming: [] };
    if (path.endsWith("/ai/captions")) {
      generation++;
      data = {
        generationId: `generation-${generation}`,
        captions: ["HOOK_DRIVEN", "STORYTELLING", "DIRECT_CTA"].map((type) => ({
          ...draft(`Caption ${generation} ${type}`),
          recommendedMaxChars: 2000,
          platform: undefined,
          type,
          title: type,
        })),
        context: {
          brand: true,
          trend: false,
          examples: 0,
          knowledgeChunks: 0,
          task: false,
        },
        creditsUsed: 1,
        creditsRemaining: 200 - generation,
      };
    }
    if (path.endsWith("/captions/adapt"))
      data = {
        drafts: [draft("Adapted caption", blockedAdapt)],
        creditsUsed: 1,
        creditsRemaining: 198,
      };
    if (path.endsWith("/captions/refine")) {
      refinePlatform = route.request().postDataJSON().platform;
      data = {
        drafts: [draft("Refined caption")],
        creditsUsed: 1,
        creditsRemaining: 197,
      };
    }
    await route.fulfill({ json: { success: true, data } });
  });
  await page.goto("/workspaces/caption-workspace/editor");
  await page.getByRole("button", { name: "AI Content", exact: true }).click();
  await page.getByRole("button", { name: "AI: 3 caption options" }).click();
  const dialog = page.getByRole("dialog", { name: "AI caption", exact: true });
  await dialog
    .getByRole("textbox", { name: "Topic / key message" })
    .fill("Launch our autumn coffee menu");
  await dialog
    .getByRole("button", { name: "Generate captions", exact: true })
    .click();
  await expect(
    dialog.getByText("Caption 1 HOOK_DRIVEN", { exact: true }),
  ).toBeVisible();
  return { dialog, getRefinePlatform: () => refinePlatform };
}

async function adaptFirstOption(page: Page) {
  const option = page
    .getByRole("dialog", { name: "AI caption", exact: true })
    .locator("article")
    .first();
  await option.getByRole("button", { name: "Edit / other platforms" }).click();
  await option.getByRole("button", { name: "Tiktok", exact: true }).click();
  await option.getByRole("button", { name: "Create", exact: true }).click();
  await expect(
    option.getByText("Adapted caption", { exact: true }),
  ).toBeVisible();
  return option.getByText("Adapted caption", { exact: true }).locator("..");
}

test("a blocked adapted caption cannot be inserted", async ({ page }) => {
  await openCaptionDialog(page, true);
  const adapted = await adaptFirstOption(page);
  await expect(
    adapted.getByRole("button", { name: "Insert", exact: true }),
  ).toBeDisabled();
});

test("the editor initializes and accepts a generated caption", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const { dialog } = await openCaptionDialog(page);
  await dialog
    .locator("article")
    .first()
    .getByRole("button", { name: "Insert", exact: true })
    .click();
  await expect(page.locator(".tiptap")).toHaveText("Caption 1 HOOK_DRIVEN");
  expect(errors).toEqual([]);
});

test("generating again discards versions adapted from the previous generation", async ({
  page,
}) => {
  const { dialog } = await openCaptionDialog(page);
  await adaptFirstOption(page);
  await dialog
    .getByRole("button", { name: "Generate again", exact: true })
    .click();
  await expect(
    dialog.getByText("Caption 2 HOOK_DRIVEN", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Adapted caption", { exact: true }),
  ).toHaveCount(0);
});

test("refining keeps the generated platform after the form selection changes", async ({
  page,
}) => {
  const { dialog, getRefinePlatform } = await openCaptionDialog(page);
  await dialog.getByRole("combobox", { name: "Platform", exact: true }).click();
  await page.getByRole("option", { name: "Threads", exact: true }).click();
  const option = dialog.locator("article").first();
  await option.getByRole("button", { name: "Edit / other platforms" }).click();
  await option.getByRole("button", { name: "Shorter", exact: true }).click();
  await expect(
    option.getByText("Refined caption", { exact: true }),
  ).toBeVisible();
  expect(getRefinePlatform()).toBe("facebook");
});
