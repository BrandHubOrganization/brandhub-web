import { expect, test } from "@playwright/test";
import { setup, envelope, workspaceId } from "./fixtures";

for (const [width, theme] of [
  [375, "light"],
  [768, "dark"],
  [1440, "light"],
] as const) {
  test(`upload becomes visible only after READY at ${width}px ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await setup(page, "MANAGER", theme);
    let confirmed = false;
    // Library now reads the API rather than merging uploads into a mocked list.
    await page.route(
      new RegExp(`/api/v1/workspaces/${workspaceId}/materials(?:\\?.*)?$`),
      (route) =>
        route.fulfill({
          json: envelope(
            confirmed
              ? [
                  {
                    id: "material-1",
                    workspaceId,
                    name: "repository-fixture.pdf",
                    type: "RAW",
                    mediaKind: "FILE",
                    status: "READY",
                    fileSize: 22,
                    createdAt: "2026-10-24T00:00:00Z",
                  },
                ]
              : [],
          ),
        }),
    );
    let releaseConfirm!: () => void;
    const pending = new Promise<void>((resolve) => {
      releaseConfirm = resolve;
    });
    await page.route(
      `**/api/v1/workspaces/${workspaceId}/materials/upload-session`,
      async (route) => {
        expect(route.request().postDataJSON()).toMatchObject({
          context: "LIBRARY",
          visibility: "INTERNAL",
          type: "RAW",
        });
        await route.fulfill({
          json: envelope({
            sessionId: "session-1",
            materialId: "material-1",
            s3Key: "staging/1",
            uploadUrl: "https://repository-storage.example.test/staging/1",
            expiresAt: new Date(Date.now() + 600_000).toISOString(),
          }),
        });
      },
    );
    await page.route(
      "https://repository-storage.example.test/**",
      async (route) => {
        expect(route.request().headers().authorization).toBeUndefined();
        await route.fulfill({
          status: 200,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "PUT, OPTIONS",
            "access-control-allow-headers": "content-type",
          },
        });
      },
    );
    await page.route(
      `**/api/v1/workspaces/${workspaceId}/materials/upload-session/confirm`,
      async (route) => {
        await pending;
        confirmed = true;
        await route.fulfill({
          status: 201,
          json: envelope({
            id: "material-1",
            workspaceId,
            name: "repository-fixture.pdf",
            originalName: "repository-fixture.pdf",
            type: "RAW",
            mediaKind: "FILE",
            status: "READY",
            fileSize: 22,
            createdAt: "2026-10-24T00:00:00Z",
            previewUrl: null,
          }),
        });
      },
    );
    await page.goto(`/workspaces/${workspaceId}/library`);
    await page
      .getByRole("button", { name: "Tải lên Media", exact: true })
      .click();
    const form = page.getByRole("form", { name: "Thêm tư liệu vào workspace" });
    await expect(form).toBeVisible();
    await form.getByLabel("Tệp cần tải lên").focus();
    await expect(form.getByLabel("Tệp cần tải lên")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(form.getByLabel("Trạng thái xử lý")).toBeFocused();
    await page.screenshot({
      path: testInfo.outputPath(`repository-form-${width}-${theme}.png`),
      fullPage: true,
    });
    await form.getByLabel("Tệp cần tải lên").setInputFiles({
      name: "repository-fixture.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\nfixture\n%%EOF"),
    });
    await form.getByRole("button", { name: "Tải lên", exact: true }).click();
    await expect(form.getByRole("status")).toContainText("kiểm tra");
    await expect(
      page.getByText("repository-fixture.pdf", { exact: true }),
    ).toHaveCount(0);
    releaseConfirm();
    await expect(
      page.getByText("repository-fixture.pdf", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    const stored = await page.evaluate(() => JSON.stringify(localStorage));
    expect(stored).not.toContain("repository-storage.example.test");
    await page.screenshot({
      path: testInfo.outputPath(`repository-${width}-${theme}.png`),
      fullPage: true,
    });
  });
}

test("quota rejection is actionable and OWNER can upload", async ({ page }) => {
  await setup(page);
  await page.route(`**/materials/upload-session`, (route) =>
    route.fulfill({
      status: 422,
      json: {
        success: false,
        error: { code: "STORAGE_QUOTA_EXCEEDED" },
        requestId: "quota",
      },
    }),
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page
    .getByRole("button", { name: "Tải lên Media", exact: true })
    .click();
  await page.getByLabel("Tệp cần tải lên").setInputFiles({
    name: "a.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("fixture"),
  });
  await page.getByRole("button", { name: "Tải lên", exact: true }).click();
  await expect(page.getByRole("alert").first()).toContainText("dung lượng");
  await expect(
    page
      .getByRole("form")
      .getByRole("button", { name: "Thử lại", exact: true }),
  ).toBeEnabled();
  await setup(page, "OWNER");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Tải lên Media", exact: true }),
  ).toBeVisible();
});
