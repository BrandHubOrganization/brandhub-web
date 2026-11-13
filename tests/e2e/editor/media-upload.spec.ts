import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";

const PIXEL_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "e2e-editor-user",
            name: "Editor Tester",
            email: "editor@brandhub.test",
            role: "ADMIN",
          },
          accessToken: "dev-token-editor",
          refreshToken: "",
          isAuthenticated: true,
          systemRole: "ADMIN",
        },
        version: 0,
      }),
    );
  });

  await page.route("**/api/v1/workspaces", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: "workspace-1",
            name: "Test Workspace",
            agencyId: "agency-1",
            slug: "test-workspace",
            ownerId: "e2e-editor-user",
            isActive: true,
            myRole: "CREATOR",
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    }),
  );

  await page.route("**/api/v1/workspaces/workspace-1/members/me", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { role: "CREATOR", permissions: ["POST_CREATE", "MATERIAL_UPLOAD"] },
      }),
    }),
  );
});

test.describe("Editor Media Upload E2E Flows", () => {
  test("surfaces 503 storage unavailable toast when upload-session schema is not ready", async ({
    page,
  }) => {
    let uploadSessionHit = false;

    await page.route("**/api/v1/workspaces/*/materials/upload-session", (route) => {
      uploadSessionHit = true;
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "STORAGE_SCHEMA_NOT_READY",
            message: "Repository migration or inventory is required",
          },
        }),
      });
    });

    await page.goto("/workspaces/workspace-1/editor");

    // Click on upload tab if not default
    const uploadTab = page.getByRole("tab", { name: /Tải lên từ máy|Upload from Device/i });
    if (await uploadTab.isVisible()) {
      await uploadTab.click();
    }

    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles({
      name: "banner-test.png",
      mimeType: "image/png",
      buffer: Buffer.from(PIXEL_PNG, "base64"),
    });

    await expect(async () => {
      expect(uploadSessionHit).toBe(true);
    }).toPass({ timeout: 5000 });

    await expect(
      page.locator("[data-sonner-toast]").filter({
        hasText: /Kho lưu trữ chưa sẵn sàng hoặc đang gián đoạn/i,
      }),
    ).toBeVisible({ timeout: 5000 });
  });

  test("blocks oversized files (>50MB) locally and never calls backend", async ({
    page,
  }) => {
    let uploadSessionHit = false;

    await page.route("**/api/v1/workspaces/*/materials/upload-session", (route) => {
      uploadSessionHit = true;
      return route.fulfill({ status: 200, body: "{}" });
    });

    await page.goto("/workspaces/workspace-1/editor");

    const fileInput = page.locator('input[type="file"][accept*="image"]');
    const tmpFile = path.join(os.tmpdir(), "giant-video-51mb.mp4");
    const fd = fs.openSync(tmpFile, "w");
    fs.ftruncateSync(fd, 51 * 1024 * 1024);
    fs.closeSync(fd);

    try {
      await fileInput.setInputFiles(tmpFile);

      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: /vượt quá dung lượng 50MB|exceeds the 50MB/i,
        }),
      ).toBeVisible({ timeout: 5000 });

      expect(uploadSessionHit).toBe(false);
    } finally {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    }
  });

  test("opens duplicate conflict modal when backend responds with 409 duplicate conflict", async ({
    page,
  }) => {
    await page.route("**/api/v1/workspaces/*/materials/upload-session", (route) => {
      return route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "MATERIAL_DUPLICATE_CONFLICT",
            message: "A material with the same name exists",
            details: {
              existingMaterialId: "mat-existing-1",
              existingName: "existing-photo.png",
              existingFolderId: null,
              reason: "SAME_NAME",
            },
          },
        }),
      });
    });

    await page.goto("/workspaces/workspace-1/editor");

    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles({
      name: "existing-photo.png",
      mimeType: "image/png",
      buffer: Buffer.from(PIXEL_PNG, "base64"),
    });

    // Verify DuplicateResolutionModal is displayed
    const modalTitle = page.getByRole("heading", { name: /Tệp đã tồn tại|File already exists/i });
    await expect(modalTitle).toBeVisible({ timeout: 5000 });

    // Verify option buttons are accessible
    await expect(page.getByRole("button", { name: /Bỏ qua|Skip/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Giữ cả hai|Keep both/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Ghi đè|Overwrite/i })).toBeVisible();
  });
});

