import { test, expect, type Page } from "@playwright/test";
import { setup, envelope, workspaceId } from "./fixtures";
import type { MaterialItem } from "../../../src/types/material";

const material: MaterialItem = {
  id: "mat-download-1",
  workspaceId,
  name: "Chiến dịch mùa hè 2026.png",
  originalName: "camera.png",
  type: "WATERMARKED",
  mediaKind: "IMAGE",
  mimeType: "image/png",
  fileSize: 2048,
  status: "READY",
  version: 0,
  rawWarning: false,
  previewUrl: "https://material-preview.example.test/image.png",
  previewExpiresAt: new Date(Date.now() + 300000).toISOString(),
  url: "",
  purpose: "MATERIAL",
  visibility: "WORKSPACE",
  createdBy: "repository-test-user",
  createdByName: "Creator A",
  createdAt: new Date().toISOString(),
  capabilities: {
    canPreview: true,
    canDownload: true,
    canRename: true,
    canUpdateType: false,
    canChangeAudience: true,
    canWatermark: false,
    canDelete: true,
    canRestore: false,
  },
};

async function mountDownloadPage(
  page: Page,
  options: { theme?: string; quotaExceeded?: boolean } = {},
) {
  await setup(page, "MANAGER", options.theme ?? "light");
  let downloadCalls = 0;
  let storageHeaders: Record<string, string> = {};
  let nextMode: "ok" | "missing" | "unavailable" | "expired" | "delay" = "ok";
  let releaseDelayed: (() => void) | null = null;

  await page.route("https://material-preview.example.test/**", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );

  await page.route("https://storage-download.example.test/**", async (route) => {
    storageHeaders = route.request().headers();
    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition":
          "attachment; filename=\"Chien_dich_mua_he_2026.png\"; filename*=UTF-8''Chi%E1%BA%BFn%20d%E1%BB%8Bch%20m%C3%B9a%20h%C3%A8%202026.png",
      },
      body: Buffer.from("png-binary"),
    });
  });

  await page.route(
    `**/api/v1/workspaces/${workspaceId}/materials**`,
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname.endsWith("/storage-usage")) {
        return route.fulfill({
          json: envelope({
            workspaceUsedBytes: "2048",
            agencyUsedBytes: options.quotaExceeded ? "35000000000" : "2048",
            agencyReservedBytes: "0",
            agencyQuotaBytes: "21474836480",
            isQuotaExceeded: !!options.quotaExceeded,
          }),
        });
      }
      if (url.pathname.endsWith("/download") && request.method() === "POST") {
        downloadCalls += 1;
        if (nextMode === "delay") {
          await new Promise<void>((resolve) => {
            releaseDelayed = resolve;
          });
        }
        if (nextMode === "missing") {
          return route.fulfill({
            status: 409,
            json: {
              success: false,
              error: { code: "MATERIAL_STORAGE_MISSING" },
            },
          });
        }
        if (nextMode === "unavailable") {
          return route.fulfill({
            status: 503,
            json: {
              success: false,
              error: { code: "MATERIAL_STORAGE_UNAVAILABLE" },
            },
          });
        }
        const expiresAt =
          nextMode === "expired"
            ? new Date(Date.now() - 5000).toISOString()
            : new Date(Date.now() + 120000).toISOString();
        return route.fulfill({
          headers: { "Cache-Control": "no-store" },
          json: envelope({
            materialId: material.id,
            downloadUrl:
              "https://storage-download.example.test/signed-watermarked.png?X-Amz-Expires=120",
            expiresAt,
            filename: material.name,
            mimeType: "image/png",
            fileSize: 2048,
          }),
        });
      }
      if (url.pathname.endsWith(`/${material.id}`)) {
        return route.fulfill({ json: envelope(material) });
      }
      return route.fulfill({
        json: {
          ...envelope([material]),
          meta: { page: 0, size: 20, total: 1 },
        },
      });
    },
  );

  return {
    getDownloadCalls: () => downloadCalls,
    getStorageHeaders: () => storageHeaders,
    setMode: (mode: typeof nextMode) => {
      nextMode = mode;
    },
    release: () => {
      releaseDelayed?.();
    },
  };
}

for (const viewport of [
  { width: 375, height: 812, theme: "light" },
  { width: 768, height: 1024, theme: "dark" },
  { width: 1440, height: 900, theme: "light" },
]) {
  test(`downloads material from card and detail panel at ${viewport.width}px (${viewport.theme}) even when quota is exceeded`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    const ctrl = await mountDownloadPage(page, {
      theme: viewport.theme,
      quotaExceeded: true,
    });
    await page.goto(`/workspaces/${workspaceId}/library`);

    const cardDownloadBtn = page.getByRole("button", {
      name: `Tải xuống tài liệu ${material.name}`,
      exact: true,
    });
    await expect(cardDownloadBtn).toBeVisible();
    await expect(cardDownloadBtn).toBeEnabled();

    const downloadPromise = page.waitForEvent("download");
    await cardDownloadBtn.click();
    const download = await downloadPromise;
    expect(download.url()).toContain(
      "https://storage-download.example.test/signed-watermarked.png",
    );
    await expect(
      page.getByText(`Đã bắt đầu tải xuống "${material.name}"`),
    ).toBeVisible();
    expect(ctrl.getDownloadCalls()).toBe(1);
    expect(ctrl.getStorageHeaders().authorization).toBeUndefined();

    const stored = await page.evaluate(() => JSON.stringify(localStorage));
    expect(stored).not.toContain("storage-download.example.test");

    await page
      .getByRole("button", {
        name: `Mở tư liệu ${material.name}`,
        exact: true,
      })
      .click();
    const detailDownloadBtn = page
      .getByRole("dialog")
      .getByRole("button", {
        name: `Tải xuống tài liệu ${material.name}`,
        exact: true,
      });
    await expect(detailDownloadBtn).toBeVisible();
    const secondDownload = page.waitForEvent("download");
    await detailDownloadBtn.click();
    await secondDownload;
    expect(ctrl.getDownloadCalls()).toBe(2);
  });
}

test("surfaces specific error toasts for missing storage, unavailable storage, and expired links, and prevents double-click", async ({
  page,
}) => {
  const ctrl = await mountDownloadPage(page);
  await page.goto(`/workspaces/${workspaceId}/library`);

  const cardDownloadBtn = page.getByRole("button", {
    name: `Tải xuống tài liệu ${material.name}`,
    exact: true,
  });
  ctrl.setMode("missing");
  await cardDownloadBtn.click();
  await expect(
    page.getByText(
      "Không tìm thấy tệp gốc trên kho lưu trữ. Hệ thống đã ghi nhận để kiểm tra.",
    ),
  ).toBeVisible();

  ctrl.setMode("unavailable");
  await cardDownloadBtn.click();
  await expect(
    page.getByText(
      "Kho lưu trữ đang tạm thời gián đoạn. Vui lòng thử lại sau.",
    ),
  ).toBeVisible();

  ctrl.setMode("expired");
  await cardDownloadBtn.click();
  await expect(
    page.getByText(
      "Liên kết tải xuống đã hết hạn (120 giây). Vui lòng bấm Tải xuống lại.",
    ),
  ).toBeVisible();

  ctrl.setMode("delay");
  await cardDownloadBtn.click();
  await expect(cardDownloadBtn).toHaveAttribute("aria-busy", "true");
  await expect(cardDownloadBtn).toBeDisabled();
  expect(ctrl.getDownloadCalls()).toBe(4);
  const delayedDownload = page.waitForEvent("download");
  ctrl.release();
  await delayedDownload;
});
