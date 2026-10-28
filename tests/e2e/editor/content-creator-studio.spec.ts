import { expect, test } from "@playwright/test";
import { ContentCreatorStudioPage } from "../../pages/ContentCreatorStudioPage";

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

test("opens a new Post without seeded content or product imagery", async ({
  page,
}) => {
  await expect(page.locator('[contenteditable="true"]')).toHaveText("");
  await expect(page.getByAltText(/^Media /)).toHaveCount(0);
  await expect(page.getByAltText("Post content", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText("#NikeAirMax", { exact: true })).toHaveCount(0);
});

test("loads task content without adding promotional seed text", async ({
  page,
}) => {
  await page.route("**/api/v1/workspaces/workspace-1/tasks/task-1", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          name: "Campaign task",
          description: "Actual task description",
        },
      },
    }),
  );
  await page.goto("/workspaces/workspace-1/editor?taskId=task-1");
  await expect(page.locator('[contenteditable="true"]')).toHaveText(
    "Actual task description",
  );
  await expect(page.getByText("#Event2026", { exact: true })).toHaveCount(0);
  await expect(page.getByAltText("Post content", { exact: true })).toHaveCount(
    0,
  );
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
          moderation: { status: "PASSED", issues: [] },
          hashtags: ["BrandHub", "Launch"],
        },
      }),
    }),
  );

  const prompt = page.locator("textarea").first();
  await expect(prompt).toHaveValue("");
  await expect(prompt).toHaveAttribute("placeholder", /.+/);
  await prompt.fill("Write a BrandHub launch post");
  await page.getByTestId("generate-text").click();
  await expect(page.getByTestId("generated-caption")).toHaveValue(
    "BrandHub launch caption",
  );
  await page.getByTestId("apply-text").click();
  await expect(
    page.getByText("#Launch", { exact: true }).first(),
  ).toBeVisible();
});

test("applies workspace collection hashtags and saves the Post snapshot", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("brandhub-lang", "en"));
  const studio = new ContentCreatorStudioPage(page);
  const entries = [
    {
      id: "hashtag-1",
      workspaceId: "workspace-1",
      tag: "BrandHub",
      purpose: "BRAND",
      addedBy: "studio-test-user",
      addedByName: "Studio Tester",
      isRequired: false,
      campaignId: null,
      version: 0,
      createdAt: "2026-10-09T08:00:00Z",
    },
    {
      id: "hashtag-required",
      workspaceId: "workspace-1",
      tag: "CampaignTag",
      purpose: "EVENT_SPECIFIC",
      addedBy: "client-user",
      addedByName: "Client",
      isRequired: true,
      campaignId: "campaign-42",
      version: 0,
      createdAt: "2026-10-09T08:00:00Z",
    },
  ];
  let savedHashtags: string[] | undefined;
  await page.route(
    "**/api/v1/workspaces/workspace-1/hashtags**",
    async (route) => {
      if (route.request().method() === "POST") {
        const request = route.request().postDataJSON() as {
          tag: string;
          purpose: string;
        };
        const entry = {
          ...entries[0],
          id: "hashtag-2",
          tag: request.tag.replace(/^#/, ""),
          purpose: request.purpose,
        };
        entries.push(entry);
        return route.fulfill({
          status: 201,
          json: { success: true, data: entry },
        });
      }
      return route.fulfill({
        json: {
          success: true,
          data: {
            items: entries,
            page: 0,
            size: 20,
            totalElements: entries.length,
            totalPages: 1,
          },
        },
      });
    },
  );
  await page.route("**/api/v1/workspaces/workspace-1/posts", async (route) => {
    const body = route.request().postDataJSON() as { hashtags: string[] };
    savedHashtags = body.hashtags;
    return route.fulfill({
      json: {
        success: true,
        data: {
          ...body,
          id: "post-1",
          workspaceId: "workspace-1",
          status: "DRAFT",
          media: [],
          createdAt: "2026-10-09T08:00:00Z",
          updatedAt: "2026-10-09T08:00:00Z",
        },
      },
    });
  });
  await page.route(
    "**/api/v1/workspaces/workspace-1/posts/post-1/submit",
    (route) =>
      route.fulfill({ json: { success: true, data: { id: "post-1" } } }),
  );
  await page.reload();
  await page
    .locator('[contenteditable="true"]')
    .fill("Workspace campaign caption");
  const hashtagInput = page.getByRole("textbox", {
    name: "Search or add a hashtag",
  });
  await expect(
    page.getByRole("button", { name: "Apply #BrandHub to this Post" }),
  ).toHaveCount(0);
  await hashtagInput.focus();
  await expect(
    page.getByRole("button", { name: "Apply #BrandHub to this Post" }),
  ).toBeVisible();
  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.pathname.endsWith("/workspace-1/hashtags") &&
      url.searchParams.get("q") === "Brand"
    );
  });
  await hashtagInput.fill("#Brand");
  await filteredRequest;
  await expect(
    page.getByRole("textbox", { name: "Search saved hashtags" }),
  ).toHaveValue("Brand");
  await studio.openCollection();
  await hashtagInput.click();
  await expect(page.getByText("Campaign campaign-42")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Campaign-required hashtags need a campaign-linked Post.",
    }),
  ).toBeDisabled();
  await studio.applyCollectionTag("BrandHub");
  await studio.addHashtagWithPurpose("Launch", "CAMPAIGN");
  await studio.submitForApproval();
  await expect(page).toHaveURL(/\/workspaces\/workspace-1\/requests$/);
  expect(entries.map((entry) => entry.tag)).toContain("Launch");
  expect(savedHashtags).toEqual(["#BrandHub", "#Launch"]);
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

for (const language of ["vi", "en"] as const) {
  test(`ambassador portrait flow uses worker defaults (${language})`, async ({
    page,
  }, testInfo) => {
    await page.evaluate((lang) => {
      localStorage.setItem("brandhub-lang", lang);
      localStorage.setItem("vite-ui-theme", lang === "vi" ? "light" : "dark");
    }, language);
    await page.reload();
    const requests: unknown[] = [];
    let sheetRequests = 0;
    await page.route("**/api/v1/ai/ambassadors/character-sheet", (route) => {
      sheetRequests += 1;
      return route.abort();
    });
    await page.route("**/api/v1/ai/ambassadors/generate", (route) => {
      requests.push(route.request().postDataJSON());
      return route.fulfill({
        json: {
          success: true,
          data: {
            image_url: PIXEL,
            image_type: "ambassador",
            s3_key: "ambassadors/test.png",
          },
        },
      });
    });
    await page
      .getByRole("tab", {
        name: language === "vi" ? "Hình ảnh" : "Image",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name:
          language === "vi"
            ? "Tạo Ambassador bằng AI"
            : "Generate AI Ambassador",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).not.toContainText(/Character Sheet/i);
    await page.getByTestId("generate-character").click();
    await expect(dialog.getByRole("alert")).toBeVisible();
    expect(requests).toHaveLength(0);
    await page
      .getByTestId("character-description")
      .fill("A Vietnamese model in a cream blazer");
    await page.screenshot({
      path: testInfo.outputPath(`ambassador-${language}.png`),
    });
    await page.getByTestId("generate-character").click();
    await expect(page.getByTestId("approve-character")).toBeVisible();
    expect(requests).toEqual([
      {
        prompt: "A Vietnamese model in a cream blazer",
        steps: 25,
        width: 832,
        height: 1248,
      },
    ]);
    await page
      .getByRole("button", {
        name: language === "vi" ? "Tạo lại" : "Regenerate",
        exact: true,
      })
      .click();
    await expect.poll(() => requests.length).toBe(2);
    await page.getByTestId("approve-character").click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("button", {
        name:
          language === "vi"
            ? "Ambassador do AI tạo"
            : "AI-generated Ambassador",
        exact: true,
      }),
    ).toBeVisible();
    expect(sheetRequests).toBe(0);
  });
}

for (const language of ["vi", "en"] as const) {
  test(`loads API hashtag suggestions without saving to collection (${language})`, async ({
    page,
  }, testInfo) => {
    await page.evaluate((lang) => {
      localStorage.setItem("brandhub-lang", lang);
      localStorage.setItem("vite-ui-theme", lang === "vi" ? "light" : "dark");
    }, language);
    await page.reload();
    let savedToCollection = 0;
    await page.route("**/api/v1/workspaces/workspace-1/hashtags**", (route) => {
      if (route.request().method() === "POST") savedToCollection++;
      return route.fulfill({
        json: { success: true, data: { items: [], totalPages: 0 } },
      });
    });
    const requests: unknown[] = [];
    await page.route("**/api/v1/ai/content/hashtags", (route) => {
      requests.push(route.request().postDataJSON());
      return route.fulfill({
        json: {
          success: true,
          data: {
            hashtags: ["#CoffeeLaunch", "coffeelaunch", "#NewBlend"],
            suggestions: [
              { tag: "#CoffeeLaunch", source: "WORKSPACE" },
              { tag: "coffeelaunch", source: "WORKSPACE" },
              { tag: "#NewBlend", source: "AI_GENERATED" },
            ],
          },
        },
      });
    });
    const generate = page.getByRole("button", {
      name:
        language === "vi"
          ? /Gợi ý hashtag theo nội dung/
          : /Suggest hashtags for this caption/,
    });
    await expect(generate).toBeDisabled();
    await page
      .locator('[contenteditable="true"]')
      .fill("Our new coffee launch");
    await generate.click();
    expect(requests).toEqual([
      { topic: "Our new coffee launch", platform: "facebook", count: 5 },
    ]);
    const apply = page.getByRole("button", {
      name:
        language === "vi"
          ? "Thêm #CoffeeLaunch vào bài viết"
          : "Add #CoffeeLaunch to this Post",
    });
    await expect(apply).toHaveCount(1);
    const ranked = page.getByRole("list", {
      name:
        language === "vi"
          ? "Hashtag theo mức độ phù hợp"
          : "Hashtags ranked by relevance",
    });
    await expect(ranked.getByRole("listitem")).toHaveCount(2);
    await expect(ranked.getByRole("listitem").nth(0)).toContainText(
      language === "vi" ? "Trong kho workspace" : "Workspace collection",
    );
    await expect(ranked.getByRole("listitem").nth(1)).toContainText(
      language === "vi" ? "AI đề xuất mới" : "New AI suggestion",
    );
    await expect(ranked.getByRole("listitem").nth(0)).toContainText(
      "#CoffeeLaunch",
    );
    await expect(ranked.getByRole("listitem").nth(1)).toContainText(
      "#NewBlend",
    );
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await ranked.scrollIntoViewIfNeeded();
      const box = await ranked.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(width);
      await page.screenshot({
        path: testInfo.outputPath(`hashtag-rank-${language}-${width}.png`),
      });
    }
    await apply.focus();
    await page.keyboard.press("Enter");
    await expect(apply).toBeDisabled();
    expect(savedToCollection).toBe(0);
    await page.locator('[contenteditable="true"]').fill("Another topic");
    await expect(apply).toHaveCount(0);
    await page.route("**/api/v1/ai/content/hashtags", (route) =>
      route.fulfill({ status: 503, json: { success: false } }),
    );
    await generate.click();
    await expect(
      page.getByRole("alert").filter({
        hasText:
          language === "vi"
            ? "Không lấy được hashtag"
            : "Could not get hashtags",
      }),
    ).toBeVisible();
    await page.route("**/api/v1/ai/content/hashtags", (route) =>
      route.fulfill({ json: { success: true, data: { hashtags: [] } } }),
    );
    await generate.click();
    await expect(
      page.getByText(
        language === "vi"
          ? "Chưa tìm thấy hashtag phù hợp. Hãy bổ sung nội dung cụ thể hơn."
          : "No relevant hashtags found. Add more specific details to your caption.",
        { exact: true },
      ),
    ).toBeVisible();
  });
}

for (const language of ["vi", "en"] as const) {
  test(`real notification inbox has empty/error/read states (${language})`, async ({
    page,
  }) => {
    await page.addInitScript((lang) => {
      const auth = JSON.parse(localStorage.getItem("brandhub-auth")!);
      auth.state.systemRole = "USER";
      auth.state.user.role = "USER";
      localStorage.setItem("brandhub-auth", JSON.stringify(auth));
      localStorage.setItem("brandhub-lang", lang);
      localStorage.setItem("vite-ui-theme", lang === "vi" ? "light" : "dark");
    }, language);
    let mode = "empty";
    await page.route("**/api/v1/notifications/me?**", (route) =>
      mode === "error"
        ? route.fulfill({ status: 503, json: { success: false } })
        : route.fulfill({
            json: {
              success: true,
              data: {
                items:
                  mode === "empty"
                    ? []
                    : [
                        {
                          id: "notice-1",
                          title: "Real server notification",
                          content: "Actual inbox message",
                          createdAt: "2026-10-18T01:00:00Z",
                          readAt: null,
                          actionUrl: null,
                        },
                      ],
              },
            },
          }),
    );
    await page.route("**/api/v1/notifications/me/*/read", (route) =>
      route.fulfill({ status: 503, json: { success: false } }),
    );
    await page.reload();
    const bell = page.getByRole("button", {
      name: language === "vi" ? "Thông báo" : "Notifications",
      exact: true,
    });
    await bell.click();
    await expect(
      page.getByText(
        language === "vi" ? "Không có thông báo nào." : "No notifications yet.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByRole("menuitem")).toHaveCount(1);
    await page.keyboard.press("Escape");
    mode = "error";
    await bell.click();
    await expect(
      page.getByRole("alert").filter({
        hasText:
          language === "vi"
            ? "Không thể tải thông báo."
            : "Could not load notifications.",
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        language === "vi" ? "Không có thông báo nào." : "No notifications yet.",
        { exact: true },
      ),
    ).toHaveCount(0);
    mode = "real";
    const retry = page.getByRole("button", {
      name: language === "vi" ? "Thử lại" : "Retry",
      exact: true,
    });
    await retry.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByText("Real server notification", { exact: true }),
    ).toBeVisible();
    await page.getByText("Real server notification", { exact: true }).click();
    await expect(
      page.getByText(
        language === "vi"
          ? "Không thể đánh dấu đã đọc. Vui lòng thử lại."
          : "Could not mark notifications as read. Please try again.",
        { exact: true },
      ),
    ).toBeVisible();
    await bell.click();
    await expect(
      page.getByRole("button", {
        name: language === "vi" ? "Đánh dấu tất cả đã đọc" : "Mark all read",
        exact: true,
      }),
    ).toBeVisible();
  });
}

test("social API failure does not claim all platforms are disconnected", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("brandhub-lang", "en"));
  await page.route("**/api/v1/social-accounts?**", (route) =>
    route.fulfill({ status: 503, json: { success: false } }),
  );
  await page.reload();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Could not check social account connections." }),
  ).toBeVisible();
  await expect(
    page.getByText("Chưa kết nối tài khoản cho các nền tảng:", {
      exact: false,
    }),
  ).toHaveCount(0);
  await expect(page.getByTitle("Chưa liên kết", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByTitle("Connection status unknown", { exact: true }),
  ).toHaveCount(4);
  await page.goto("/workspaces/workspace-1/social-accounts");
  await expect(
    page.getByText("Failed to load social accounts.", { exact: true }),
  ).toBeVisible();
  await page.route("**/api/v1/social-accounts?**", (route) =>
    route.fulfill({ json: { success: true, data: [] } }),
  );
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    page.getByText("Failed to load social accounts.", { exact: true }),
  ).toHaveCount(0);
});

for (const status of ["BLOCKED", "NOT_CHECKED", "WARNING"] as const) {
  test(`caption moderation ${status} controls Apply and invalidates on edit`, async ({
    page,
  }) => {
    await page.route("**/api/v1/ai/content/generate", (route) =>
      route.fulfill({
        json: {
          success: true,
          data: {
            caption: "Moderation test caption",
            hashtags: [],
            moderation: { status, issues: [] },
          },
        },
      }),
    );
    await page.route(
      "**/api/v1/workspaces/workspace-1/ai/captions/moderate",
      (route) =>
        route.fulfill({
          json: {
            success: true,
            data: { status: "PASSED", issues: [] },
          },
        }),
    );
    await page
      .locator("textarea")
      .first()
      .fill("Write a moderation test caption");
    await page.getByTestId("generate-text").click();
    const caption = page.getByTestId("generated-caption");
    await expect(caption).toHaveValue("Moderation test caption");
    const apply = page.getByTestId("apply-text");
    if (status === "WARNING") await expect(apply).toBeEnabled();
    else await expect(apply).toBeDisabled();
    await caption.fill("Changed caption");
    await expect(apply).toBeDisabled();
    await page
      .getByRole("button", { name: /Kiểm tra caption|Check caption/ })
      .click();
    await expect(apply).toBeEnabled();
  });
}

for (const theme of ["light", "dark"]) {
  test(`caption moderation ${theme} fits mobile and English`, async ({
    page,
  }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem("brandhub-lang", "en");
      localStorage.setItem("vite-ui-theme", theme);
    }, theme);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.route("**/api/v1/ai/content/generate", (route) =>
      route.fulfill({
        json: {
          success: true,
          data: {
            caption: "Check this caption",
            hashtags: [],
            moderation: {
              status: "BLOCKED",
              issues: [{ code: "hate", message: "Review", excerpt: "" }],
            },
          },
        },
      }),
    );
    await page
      .locator("textarea")
      .first()
      .fill("Write a moderation test caption");
    await page.getByTestId("generate-text").click();
    await expect(
      page.getByText("Text safety check", { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("apply-text")).toBeDisabled();
    const moderation = page.getByTestId("caption-moderation");
    await moderation.scrollIntoViewIfNeeded();
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    const bounds = await moderation.boundingBox();
    expect(bounds?.width).toBeLessThanOrEqual(390);
    await moderation.screenshot({
      path: `test-results/caption-moderation-${theme}.png`,
    });
  });
}

test("main editor moderation waits 3 seconds after the last edit", async ({
  page,
}) => {
  await page.clock.install();
  const checked: string[] = [];
  await page.route(
    "**/api/v1/workspaces/workspace-1/ai/captions/moderate",
    (route) => {
      checked.push(route.request().postDataJSON().text);
      return route.fulfill({
        json: { success: true, data: { status: "PASSED", issues: [] } },
      });
    },
  );
  const editor = page.locator('[contenteditable="true"]');
  await editor.fill("First caption");
  await page.clock.runFor(2000);
  expect(checked).toEqual([]);
  await editor.fill("New caption after typing");
  await page.clock.runFor(2999);
  expect(checked).toEqual([]);
  await page.clock.runFor(1);
  await expect.poll(() => checked).toEqual(["New caption after typing"]);
  await expect(page.getByTestId("editor-moderation")).toContainText(
    /Nội dung an toàn|Content is safe/,
  );
});

for (const trigger of ["early", "inflight", "cached", "partial"] as const) {
  test(`main editor moderation ${trigger} runs before publish API without duplicate checks`, async ({
    page,
  }) => {
    await page.clock.install();
    const calls: string[] = [];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      "**/api/v1/workspaces/workspace-1/ai/captions/moderate",
      async (route) => {
        calls.push("moderate");
        await gate;
        await route.fulfill({
          json: { success: true, data: trigger === "partial"
            ? { status: "WARNING", issues: [{ code: "unsupported_hate", message: "Unsupported category", excerpt: "" }] }
            : { status: "PASSED", issues: [] } },
        });
      },
    );
    await page.route("**/api/v1/workspaces/workspace-1/posts", (route) => {
      calls.push("save");
      return route.fulfill({
        json: {
          success: true,
          data: {
            ...route.request().postDataJSON(),
            id: "moderation-post",
            updatedAt: "2026-10-28T00:00:00Z",
          },
        },
      });
    });
    await page.route(
      "**/api/v1/workspaces/workspace-1/posts/moderation-post/publish",
      (route) => {
        calls.push("publish");
        return route.fulfill({
          json: { success: true, data: { status: "PUBLISHED" } },
        });
      },
    );
    await page.locator('[contenteditable="true"]').fill("Caption to publish");
    if (trigger !== "early") {
      await page.clock.runFor(3000);
      await expect.poll(() => calls).toEqual(["moderate"]);
    }
    if (trigger === "cached" || trigger === "partial") {
      release();
      await expect(page.getByTestId("editor-moderation")).toContainText(
        trigger === "partial" ? /Đã kiểm tra các nhóm|Supported categories were checked/ : /Nội dung an toàn|Content is safe/,
      );
    }
    await page.getByRole("button", { name: "Đăng ngay", exact: true }).click();
    if (trigger !== "cached") {
      await expect.poll(() => calls).toEqual(["moderate"]);
      release();
    }
    await expect.poll(() => calls).toEqual(["moderate", "save", "publish"]);
    await page.clock.runFor(3000);
    expect(calls.filter((call) => call === "moderate")).toHaveLength(1);
    expect(calls.filter((call) => call === "publish")).toHaveLength(1);
  });
}

for (const verdict of [
  "BLOCKED",
  "NOT_CHECKED",
  "HTTP_ERROR",
  "MALFORMED",
] as const) {
  test(`main editor moderation ${verdict} prevents publish`, async ({
    page,
  }) => {
    const postCalls: string[] = [];
    await page.route("**/api/v1/workspaces/workspace-1/posts**", (route) => {
      postCalls.push(route.request().url());
      return route.fulfill({ json: { success: true, data: {} } });
    });
    await page.route(
      "**/api/v1/workspaces/workspace-1/ai/captions/moderate",
      (route) =>
        route.fulfill({
          status: verdict === "HTTP_ERROR" ? 503 : 200,
          json: {
            success: true,
            data:
              verdict === "MALFORMED" ? {} : { status: verdict, issues: [] },
          },
        }),
    );
    await page
      .locator('[contenteditable="true"]')
      .fill("Caption requiring a check");
    await page.getByRole("button", { name: "Đăng ngay", exact: true }).click();
    await expect(page.getByTestId("editor-moderation")).toContainText(
      verdict === "BLOCKED"
        ? /bị hạn chế|restricted/
        : /Chưa thể hoàn tất|could not be completed/,
    );
    await expect(
      page.getByRole("button", { name: "Đăng ngay", exact: true }),
    ).toBeEnabled();
    expect(postCalls).toEqual([]);
    await expect(page.locator('[contenteditable="true"]')).toHaveText(
      "Caption requiring a check",
    );
  });
}

test("main editor moderation ignores a late pass after typing during Publish Now", async ({
  page,
}) => {
  await page.clock.install();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let checked = 0;
  const publishes: string[] = [];
  await page.route(
    "**/api/v1/workspaces/workspace-1/ai/captions/moderate",
    async (route) => {
      checked++;
      await gate;
      await route.fulfill({
        json: { success: true, data: { status: "PASSED", issues: [] } },
      });
    },
  );
  await page.route("**/api/v1/workspaces/workspace-1/posts**", (route) => {
    publishes.push(route.request().url());
    return route.fulfill({ json: { success: true, data: {} } });
  });
  const editor = page.locator('[contenteditable="true"]');
  await editor.fill("Old caption before checking");
  await page.getByRole("button", { name: "Đăng ngay", exact: true }).click();
  await expect.poll(() => checked).toBe(1);
  await editor.fill("New caption while checking");
  release();
  await expect(
    page.getByRole("button", { name: "Đăng ngay", exact: true }),
  ).toBeEnabled();
  await expect(page.getByTestId("editor-moderation")).toContainText(
    /3 giây|3 seconds/,
  );
  expect(publishes).toEqual([]);
});

for (const theme of ["light", "dark"]) {
  test(`main editor moderation ${theme} shows inline status on mobile`, async ({
    page,
  }) => {
    await page.addInitScript(
      (theme) => localStorage.setItem("vite-ui-theme", theme),
      theme,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.clock.install();
    await page.route(
      "**/api/v1/workspaces/workspace-1/ai/captions/moderate",
      (route) =>
        route.fulfill({
          json: {
            success: true,
            data: {
              status: "BLOCKED",
              issues: [
                { code: "profanity", message: "Review", excerpt: "caption" },
              ],
            },
          },
        }),
    );
    await page.locator('[contenteditable="true"]').fill("Test caption");
    await page.clock.runFor(3000);
    const status = page.getByTestId("editor-moderation");
    await expect(status).toContainText(/bị hạn chế|restricted/);
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    await status.scrollIntoViewIfNeeded();
    const box = await status.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(390);
    await status.screenshot({
      path: `test-results/main-editor-moderation-${theme}.png`,
    });
  });
}
