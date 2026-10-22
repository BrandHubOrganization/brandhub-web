import { expect, test, type Page } from "@playwright/test";

// FR 3.7.6 style gallery + FR 3.7.7 async video job (credit, polling, refund on failure).
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
const styles = [
  {
    id: "food_closeup",
    name_vi: "Món ăn cận cảnh",
    name_en: "Food close-up",
    description_vi: "",
    description_en: "Steam and pouring close-ups.",
    aspect_ratio: "9:16",
    accent: "#eab308",
    preview_url: null,
  },
  {
    id: "tech_explainer",
    name_vi: "Giải thích công nghệ",
    name_en: "Tech explainer",
    description_vi: "",
    description_en: "Screens and UI.",
    aspect_ratio: "16:9",
    accent: "#0ea5e9",
    preview_url: null,
  },
];

async function openStudio(page: Page, finalStatus: "COMPLETED" | "FAILED") {
  const posts: unknown[] = [];
  let polls = 0;
  const job = (status: string) => ({
    jobId: "job-1",
    status,
    prompt: "Ly cà phê muối được rót chậm",
    styleKey: "tech_explainer",
    ambassadorId: "ngoc_chau_22",
    aspectRatio: "16:9",
    videoUrl: status === "COMPLETED" ? "https://cdn.test/v.mp4" : null,
    s3Key: null,
    errorCode: status === "FAILED" ? "VIDEO_GENERATION_TIMEOUT" : null,
    refunded: status === "FAILED",
    createdAt: new Date().toISOString(),
    finishedAt: null,
  });
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: { id: "creator", name: "Creator" },
          accessToken: "t",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    let data: unknown = [];
    if (path === "/api/v1/users/me")
      data = { role: "USER", fullName: "Creator" };
    if (
      path === "/api/v1/workspaces" ||
      path === "/api/v1/workspaces/workspace-1"
    )
      data = path.endsWith("workspace-1") ? workspace : [workspace];
    if (path.endsWith("/ai/video-styles")) data = styles;
    if (path === "/api/v1/ai/ambassadors/presets")
      data = [
        {
          id: "ngoc_chau_22",
          name: "Ngoc Chau",
          description: "",
          image_url: "/static/models/a.jpg",
        },
      ];
    if (path.endsWith("/ai/credits")) data = { remaining: 190 };
    if (path.endsWith("/ai/videos") && method === "POST") {
      posts.push(route.request().postDataJSON());
      data = { job: job("PENDING"), creditsUsed: 10, creditsRemaining: 180 };
    }
    if (path.endsWith("/ai/videos/job-1"))
      data = job(++polls >= 2 ? finalStatus : "PROCESSING");
    await route.fulfill({ json: { success: true, data } });
  });
  await page.goto("/workspaces/workspace-1/library");
  await page.getByRole("link", { name: "Video AI", exact: true }).click();
  await expect(page).toHaveURL(/\/ai-studio\/video$/);
  return posts;
}

test("styles, ambassador and frame go into the job, which completes with a playable video", async ({
  page,
}) => {
  const posts = await openStudio(page, "COMPLETED");
  await expect(
    page.getByText("You have 190 AI credits left this month."),
  ).toBeVisible();
  await page.getByRole("radio", { name: /Tech explainer/ }).click();
  await expect(
    page.getByRole("button", { name: "Horizontal 16:9" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Ngoc Chau" }).click();
  await page
    .locator("textarea")
    .fill("Ly cà phê muối được rót chậm, khói bốc lên");
  await page.getByRole("button", { name: "Generate video" }).click();
  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(page.getByText("Done").first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator("video[controls]")).toHaveAttribute(
    "src",
    "https://cdn.test/v.mp4",
  );
  expect(posts[0]).toMatchObject({
    styleKey: "tech_explainer",
    ambassadorId: "ngoc_chau_22",
    aspectRatio: "16:9",
  });
});

test("a timed-out job shows the refund and offers a retry", async ({
  page,
}) => {
  await openStudio(page, "FAILED");
  await page
    .locator("textarea")
    .fill("Ly cà phê muối được rót chậm, khói bốc lên");
  await page.getByRole("button", { name: "Generate video" }).click();
  await expect(
    page.getByText("Video generation timed out. Credits refunded."),
  ).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});
