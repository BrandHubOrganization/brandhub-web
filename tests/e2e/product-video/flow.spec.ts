import {
  expect,
  test,
  type BrowserContext,
  type Route,
} from "@playwright/test";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  VideoSpaceApiFixture,
  WORKSPACE,
  FIXTURE_VIDEO,
} from "../video-space/fixture";
import type {
  ProductVideoBrief,
  ProductVideoProduction,
  ProductVideoQuote,
} from "../../../src/pages/product-video/types/productVideo";

const ID = "66666666-6666-4666-8666-666666666666";
const PROJECT = "77777777-7777-4777-8777-777777777777";
const IMAGE = "88888888-8888-4888-8888-888888888888";
const ROOT = path.resolve("../.tmp/product-video-pipeline-20261030/web");
function sourceVideo() {
  const file = path.join(ROOT, "source-8s.mp4");
  if (!existsSync(file)) {
    mkdirSync(ROOT, { recursive: true });
    execFileSync(
      process.env.FFMPEG_PATH ?? "ffmpeg",
      [
        "-v",
        "error",
        "-nostdin",
        "-y",
        "-f",
        "lavfi",
        "-i",
        "color=c=red:s=320x180:r=24:d=8",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=220:sample_rate=48000:duration=8",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "1",
        "-c:a",
        "aac",
        file,
      ],
      { timeout: 30000 },
    );
  }
  return readFileSync(file);
}
class ProductFixture {
  readonly space = new VideoSpaceApiFixture();
  readonly calls: {
    path: string;
    method: string;
    body: Record<string, unknown> | null;
    key?: string;
  }[] = [];
  production: ProductVideoProduction = this.initial();
  private quote(): ProductVideoQuote {
    return {
      quoteId: crypto.randomUUID(),
      units: 2,
      unitCredits: 10,
      totalCredits: 20,
      expiresAt: new Date(Date.now() + 300000).toISOString(),
    };
  }
  private initial(): ProductVideoProduction {
    const brief: ProductVideoBrief = {
      recipeId: "review",
      productName: "Test perfume",
      productFacts: "Amber glass, black cap",
      requirements: "Close-up details",
      durationSeconds: 15,
      aspectRatio: "9:16",
      productImageAssetId: IMAGE,
      packagingImageAssetId: null,
      logoAssetId: null,
      allowGenericPackaging: false,
      cta: "Discover",
      musicId: null,
      preserveSourceAudio: true,
      language: "en",
    };
    return {
      productionId: ID,
      projectId: PROJECT,
      state: "PLAN_READY",
      revision: 1,
      brief,
      recipeId: "review",
      selectionReason: "Matches the product brief and available assets.",
      providerReady: true,
      missingInputs: [],
      quote: this.quote(),
      sourceConfigDisplay: {
        model: "veo-3.1-generate-001",
        resolution: "720p",
        sourceDurationSeconds: 8,
      },
      scenes: [1, 2].map((n) => ({
        sceneId: `99999999-9999-4999-8999-99999999999${n}`,
        ordinal: n,
        role: "detail",
        prompt: `Scene ${n}: preserve the supplied product identity.`,
        sourceDurationSeconds: 8,
        status: "PENDING",
      })),
    };
  }
  async install(context: BrowserContext, locale = "en", theme = "dark") {
    await this.space.install(context, undefined, locale, theme);
    await context.route(
      "**/api/v1/workspaces/*/ai/video-productions**",
      (route) => this.api(route),
    );
  }
  private async api(route: Route) {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    const method = request.method();
    const headers = {
      "access-control-allow-origin": "http://127.0.0.1:3215",
      "access-control-allow-credentials": "true",
      "access-control-allow-headers":
        "authorization,content-type,idempotency-key",
      "access-control-allow-methods": "GET,POST,OPTIONS",
    };
    if (method === "OPTIONS") return route.fulfill({ headers, status: 200 });
    const body =
      method === "POST"
        ? (request.postDataJSON() as Record<string, unknown>)
        : null;
    this.calls.push({
      path: pathname,
      method,
      body,
      key: request.headers()["idempotency-key"],
    });
    const response = (data: unknown, status = 200) =>
      route.fulfill({ status, headers, json: { success: true, data } });
    if (pathname.endsWith("/content"))
      return route.fulfill({
        headers,
        contentType: "video/mp4",
        body: pathname.includes("/scenes/") ? sourceVideo() : FIXTURE_VIDEO,
      });
    if (pathname.endsWith("/editing-bundle"))
      return response({
        productionId: ID,
        projectId: this.production.projectId,
        name: this.production.brief.productName,
        fps: 24,
        width: 720,
        height: 1280,
        totalFrames: 360,
        preserveSourceAudio: true,
        segments: this.production.scenes.map((scene, i) => ({
          sceneId: scene.sceneId,
          assetId: `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa${i}`,
          startFrame: i ? 168 : 0,
          sourceStartFrame: 0,
          durationFrames: i ? 192 : 180,
          fadeInFrames: i ? 12 : 0,
        })),
        texts: [],
        logo: null,
        music: null,
      });
    if (pathname.endsWith("/plan")) {
      this.production.brief = body!.brief as ProductVideoBrief;
      this.production.projectId = body!.projectId as string;
      this.production.revision++;
      this.production.recipeId =
        this.production.brief.recipeId === "auto"
          ? "product_showcase"
          : this.production.brief.recipeId;
      const needsBox =
        this.production.recipeId === "unboxing" &&
        !this.production.brief.packagingImageAssetId &&
        !this.production.brief.allowGenericPackaging;
      this.production.missingInputs = needsBox
        ? ["PACKAGING_IMAGE_REQUIRED"]
        : [];
      this.production.state = needsBox ? "NEEDS_INPUT" : "PLAN_READY";
      this.production.quote = needsBox ? null : this.quote();
      for (const edit of body!.sceneEdits as {
        sceneId: string;
        prompt: string;
      }[])
        this.production.scenes.find(
          (scene) => scene.sceneId === edit.sceneId,
        )!.prompt = edit.prompt;
      const lines = (this.production.brief.reviewScript ?? "")
        .split(/\r?\n/)
        .filter((line) => line.trim());
      this.production.scenes.forEach((scene, index) => {
        scene.title = index === 0 ? "Product reveal" : "Product experience";
        scene.action =
          index === 0
            ? "Open the box and lift the referenced product."
            : "Review the supplied product facts with a natural demonstration.";
        scene.narration = lines[index] ?? "";
      });
    }
    if (pathname.endsWith("/generate")) {
      expect(body).toEqual({
        revision: this.production.revision,
        quoteId: this.production.quote!.quoteId,
      });
      expect(request.headers()["idempotency-key"]).toBeTruthy();
      this.production.state =
        this.production.recipeId === "review" ? "SCENE_FAILED" : "COMPLETED";
      this.production.scenes[0].status = "COMPLETED";
      this.production.scenes[1].status =
        this.production.state === "SCENE_FAILED" ? "FAILED" : "COMPLETED";
      this.production.scenes[1].canRetry =
        this.production.state === "SCENE_FAILED";
      this.production.hasResult = this.production.state === "COMPLETED";
      this.production.creditsCharged =
        this.production.state === "SCENE_FAILED" ? 10 : 20;
    }
    if (pathname.includes("/scenes/") && pathname.endsWith("/retry")) {
      if (!body!.quoteId)
        return response({ ...this.quote(), units: 1, totalCredits: 10 });
      this.production.state = "COMPLETED";
      this.production.hasResult = true;
      this.production.scenes[1].status = "COMPLETED";
      this.production.scenes[1].canRetry = false;
    }
    if (pathname.endsWith("/render-retry")) {
      this.production.state = "COMPLETED";
      this.production.hasResult = true;
      this.production.canRetryRender = false;
    }
    return response(
      this.production,
      method === "POST" && !pathname.endsWith("/plan") ? 202 : 200,
    );
  }
}
for (const recipe of ["review", "unboxing", "product_showcase"] as const)
  test(`${recipe}: upload, plan, explicit consent and final result`, async ({
    page,
    context,
  }) => {
    const api = new ProductFixture();
    await api.install(context);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/workspaces/${WORKSPACE}/product-video`);
    await page
      .getByRole("textbox", { name: "Product name", exact: true })
      .fill("Amber perfume");
    await page.getByLabel("Video recipe", { exact: true }).selectOption(recipe);
    await page
      .getByLabel("Verified product facts")
      .fill("Glass bottle with a closed black cap.");
    if (recipe === "review")
      await page
        .getByLabel("Review script (optional)", { exact: true })
        .fill(
          "Discover the amber bottle and its clean glass design.\nA fictional scent pairing of bergamot, jasmine, and sandalwood.",
        );
    const photo = {
      name: "product.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        await page.evaluate(() => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 32;
          const paint = canvas.getContext("2d")!;
          paint.fillStyle = "#a66a22";
          paint.fillRect(0, 0, 32, 32);
          return canvas.toDataURL("image/png").split(",")[1];
        }),
        "base64",
      ),
    };
    await page.getByLabel(/^Product photo/).setInputFiles(photo);
    if (recipe === "review") {
      await page.getByRole("button", { name: "Remove", exact: true }).click();
      await expect(page.getByLabel(/^Product photo/)).toHaveValue("");
      await page.getByLabel(/^Product photo/).setInputFiles(photo);
    }
    await page
      .getByRole("button", { name: "Build storyboard", exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`productionId=${ID}`));
    if (recipe === "review")
      await expect(
        page.getByText(
          "A fictional scent pairing of bergamot, jasmine, and sandalwood.",
          { exact: true },
        ),
      ).toBeVisible();
    if (recipe === "unboxing") {
      await expect(
        page.getByRole("button", { name: "Approve & generate video" }),
      ).toBeDisabled();
      await page.getByLabel(/Allow simple generic packaging/).check();
      await page
        .getByRole("button", { name: "Update storyboard & quote" })
        .click();
    }
    await expect(page.getByText("20 credits", { exact: true })).toBeVisible();
    expect(
      api.calls.filter((call) => call.path.endsWith("/generate")),
    ).toHaveLength(0);
    await page
      .getByLabel("Scene 1", { exact: true })
      .fill("Approved close-up. Keep the original glass and cap.");
    await expect(
      page.getByRole("button", { name: "Approve & generate video" }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "Update storyboard & quote" })
      .click();
    await page
      .getByRole("button", { name: "Approve & generate video" })
      .click();
    if (recipe === "review") {
      await page.getByRole("button", { name: "Get retry quote" }).click();
      expect(
        api.calls.filter(
          (call) => call.path.includes("/retry") && call.body?.quoteId,
        ),
      ).toHaveLength(0);
      await expect(
        page.getByText("Retry one scene: 10 additional credits"),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Approve credits & retry scene" })
        .click();
    }
    await expect(
      page.getByRole("button", { name: "Download MP4" }),
    ).toBeEnabled();
    await expect(
      page.getByRole("link", { name: "Open in Video Space" }),
    ).toHaveAttribute(
      "href",
      `/workspaces/${WORKSPACE}/video-space?productionId=${ID}`,
    );
    expect(
      api.calls.filter((call) => call.path.endsWith("/generate")),
    ).toHaveLength(1);
    await page.reload();
    await expect(
      page.getByText("Video completed", { exact: true }),
    ).toBeVisible();
    expect(
      api.calls.filter((call) => call.path.endsWith("/generate")),
    ).toHaveLength(1);
    expect(errors).toEqual([]);
    mkdirSync(ROOT, { recursive: true });
    await page.screenshot({
      path: path.join(ROOT, `${recipe}-result-dark.png`),
      fullPage: true,
    });
    if (recipe === "product_showcase") {
      // The form already staged a private product photo on this revision0 project.
      expect(api.space.projects.get(api.production.projectId)?.revision).toBe(
        0,
      );
      await page.getByRole("link", { name: "Open in Video Space" }).click();
      const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
      await expect(
        editor.getByRole("button", { name: "Save project", exact: true }),
      ).toBeVisible({ timeout: 60000 });
      await expect
        .poll(() => api.space.projects.get(api.production.projectId)?.revision)
        .toBe(1);
      const accepted = api.space.projects.get(api.production.projectId)!;
      expect(accepted.snapshot.mediaAssetIds).toHaveLength(2);
      await page
        .getByRole("button", { name: "Back to product video", exact: true })
        .click();
      await expect(page).toHaveURL(
        new RegExp(`product-video\\?productionId=${ID}`),
      );
      expect(
        api.calls.filter((call) => call.path.endsWith("/generate")),
      ).toHaveLength(1);
      expect(errors).toEqual([]);
    }
  });
test("render-only retry never sends a generation or scene retry request", async ({
  page,
  context,
}) => {
  const api = new ProductFixture();
  api.production.state = "RENDER_FAILED";
  api.production.canRetryRender = true;
  for (const scene of api.production.scenes) scene.status = "COMPLETED";
  await api.install(context);
  await page.goto(`/workspaces/${WORKSPACE}/product-video?productionId=${ID}`);
  await page
    .getByRole("button", { name: "Render again from saved sources" })
    .click();
  await expect(
    page.getByRole("button", { name: "Download MP4" }),
  ).toBeEnabled();
  expect(
    api.calls
      .filter((call) => call.method === "POST")
      .map((call) => call.path.split("/").at(-1)),
  ).toEqual(["render-retry"]);
});
for (const [width, locale, theme] of [
  [375, "vi", "light"],
  [768, "en", "dark"],
  [1440, "vi", "light"],
] as const)
  test(`responsive ${width} ${locale} ${theme}`, async ({ page, context }) => {
    const api = new ProductFixture();
    await api.install(context, locale, theme);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/workspaces/${WORKSPACE}/product-video`);
    await expect(
      page.getByRole("heading", {
        name: locale === "vi" ? "Video sản phẩm" : "Product video",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: locale === "vi" ? "Lập kịch bản" : "Build storyboard",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(await page.locator("body").innerText()).not.toContain(
      "productVideo.",
    );
    mkdirSync(ROOT, { recursive: true });
    await page.screenshot({
      path: path.join(ROOT, `form-${width}-${locale}-${theme}.png`),
      fullPage: true,
    });
  });
