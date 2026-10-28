import { test, expect } from "@playwright/test";
import { setup, envelope, workspaceId } from "./fixtures";

for (const [status, width, theme, storageDown] of [
  ["FAILED", 375, "light", false],
  ["UPLOADING", 768, "dark", false],
  ["READY", 1440, "light", false],
  ["READY", 375, "dark", true],
] as const) {
  test(`PNG preview handles ${status} storageDown=${storageDown}`, async ({
    page,
  }, testInfo) => {
    await setup(page, "MANAGER", theme);
    await page.setViewportSize({ width, height: 1000 });
    let previews = 0;
    const material = {
      id: "png-1",
      workspaceId,
      name: "drive.png",
      type: "RAW",
      mediaKind: "IMAGE",
      mimeType: "image/png",
      status,
      createdAt: "2026-10-27T00:00:00Z",
      previewUnavailableReason:
        status === "READY" ? "STORAGE_UNAVAILABLE" : undefined,
      capabilities: { canPreview: false, canDownload: false },
    };
    await page.route(
      `**/api/v1/workspaces/${workspaceId}/materials**`,
      (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith("/preview")) {
          previews++;
          if (storageDown)
            return route.fulfill({
              status: 503,
              json: { success: false, error: { code: "STORAGE_UNAVAILABLE" } },
            });
          return route.fulfill({
            json: envelope({
              previewUrl: "https://preview.example.test/image.png",
              previewExpiresAt: new Date(Date.now() + 300000).toISOString(),
              mimeType: "image/png",
            }),
          });
        }
        return route.fulfill({
          json: envelope(
            path.endsWith("/png-1")
              ? material
              : path.endsWith("/storage-usage")
                ? {}
                : [material],
          ),
        });
      },
    );
    await page.route("https://preview.example.test/**", (route) =>
      route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=",
          "base64",
        ),
      }),
    );
    await page.goto(`/workspaces/${workspaceId}/library`);
    await page
      .getByRole("button", { name: "Mở tư liệu drive.png", exact: true })
      .click();
    const preview = page.getByRole("region", { name: "Xem trước" });
    if (status === "READY") {
      if (storageDown) {
        await expect(preview).toContainText("Không thể tải bản xem trước");
        const retry = preview.getByRole("button", {
          name: "Làm mới bản xem trước",
        });
        await retry.focus();
        await expect(retry).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(preview).toContainText("Không thể tải bản xem trước");
        expect(previews).toBe(2);
      } else await expect(preview.getByRole("img")).toBeVisible();
      if (!storageDown) expect(previews).toBe(1);
    } else {
      await expect(preview).toContainText(
        status === "FAILED" ? "Vui lòng tải lại tệp" : "Đang tải lên",
      );
      expect(previews).toBe(0);
    }
    await expect(preview).not.toContainText("không hỗ trợ");
    await page.screenshot({
      path: testInfo.outputPath("preview.png"),
      fullPage: true,
    });
  });
}
