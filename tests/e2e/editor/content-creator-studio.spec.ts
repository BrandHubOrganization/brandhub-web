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
  }) => {
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
          data: { hashtags: ["#CoffeeLaunch", "coffeelaunch", "#NewBlend"] },
        },
      });
    });
    const generate = page.getByRole("button", {
      name:
        language === "vi" ? /Gợi ý hashtag từ API/ : /Get hashtag suggestions/,
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
          ? "API chưa trả về hashtag phù hợp."
          : "The API returned no matching hashtags.",
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
