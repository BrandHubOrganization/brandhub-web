import { expect, test } from "@playwright/test";

const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "studio-test-user",
            name: "Studio Tester",
            email: "studio@brandhub.dev",
            role: "ADMIN",
          },
          accessToken: "dev-token-studio",
          refreshToken: "",
          isAuthenticated: true,
          systemRole: "ADMIN",
        },
        version: 0,
      }),
    );
  });

  await page.route("**/api/v1/ai/ambassadors/presets", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: "ngoc_chau_22",
            name: "Ngoc Chau",
            description: "BrandHub Ambassador",
            image_url: PIXEL,
          },
        ],
      }),
    }),
  );
  await page.route("**/api/v1/workspaces", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: "workspace-1",
            name: "Studio Workspace",
            agencyId: "agency-1",
            slug: "studio-workspace",
            ownerId: "studio-test-user",
            logoUrl: null,
            settings: {},
            isActive: true,
            createdAt: new Date().toISOString(),
            myRole: "CREATOR",
            clientProfileId: null,
          },
        ],
      }),
    }),
  );
  await page.route("**images.unsplash.com/**", (route) =>
    route.fulfill({
      contentType: "image/png",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: Buffer.from(PIXEL.split(",")[1], "base64"),
    }),
  );
  await page.goto("/workspaces/workspace-1/editor");
});

test("renders the three-tool creator studio", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Content Creator Studio" }),
  ).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(3);
  await expect(page.getByText("Live Preview", { exact: true })).toBeVisible();
});

test("redirects the legacy /editor bookmark to the active workspace", async ({
  page,
}) => {
  await page.goto("/editor");
  await expect(page).toHaveURL(/\/workspaces\/workspace-1\/editor$/);
  await expect(
    page.getByRole("heading", { name: "Content Creator Studio" }),
  ).toBeVisible();
});

test("generates and applies real-contract post text", async ({ page }) => {
  await page.route("**/api/v1/ai/content/generate", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          caption: "BrandHub launch caption",
          hashtags: ["BrandHub", "Launch"],
        },
      }),
    }),
  );

  await page.getByTestId("generate-text").click();
  await expect(page.getByTestId("generated-caption")).toHaveValue(
    "BrandHub launch caption",
  );
  await page.getByTestId("apply-text").click();
  await expect(
    page.getByText("#Launch", { exact: true }).first(),
  ).toBeVisible();
});

test("generates one FLUX image and applies it to the post", async ({
  page,
}) => {
  await page.route("**/api/v1/ai/image/commercial/generate", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          generation_id: "generation-1",
          status: "completed",
          image_url: PIXEL,
          aspect_ratio: "1:1",
          width: 1024,
          height: 1024,
          seed_used: 2026,
        },
      }),
    }),
  );

  await page.getByRole("tab").nth(1).click();
  await page
    .locator("#studio-image-prompt")
    .fill("Premium BrandHub product campaign");
  await page.getByTestId("generate-image").click();
  await expect(page.getByTestId("apply-image")).toBeVisible();
  await page.getByTestId("apply-image").click();
});

test("generates an 8-second video job and applies the completed URL", async ({
  page,
}) => {
  await page.route("**/api/v1/ai/video/generate", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          job_id: "video-job-1",
          status: "PENDING",
          estimated_wait_seconds: 1,
        },
      }),
    }),
  );
  await page.route("**/api/v1/ai/video/video-job-1/status", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          job_id: "video-job-1",
          status: "COMPLETED",
          video_url: "https://cdn.example/video.mp4",
        },
      }),
    }),
  );

  await page.getByRole("tab").nth(2).click();
  await page
    .locator("#studio-video-brief")
    .fill("BrandHub product launch video");
  await page.getByTestId("generate-video").click();
  await expect(page.getByTestId("apply-video")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByTestId("apply-video").click();
});

test("stacks the studio without horizontal overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Content Creator Studio" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    )
    .toBe(true);
});
