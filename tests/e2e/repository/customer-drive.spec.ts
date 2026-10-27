import { test, expect } from "@playwright/test";
import { setup, envelope, workspaceId } from "./fixtures";

for (const role of ["OWNER", "MANAGER"]) {
  test(`${role} manages Drive while purchased S3 quota never locks available Drive`, async ({
    page,
  }, testInfo) => {
    await setup(page, role, role === "OWNER" ? "dark" : "light");
    await page.setViewportSize({ width: 390, height: 844 });
    let connected = true;
    let deletions = 0;
    await page.route("**/api/v1/workspaces/*/storage/drive", async (route) => {
      if (route.request().method() === "DELETE") {
        connected = false;
        deletions++;
      }
      await route.fulfill({
        json: envelope({
          enabled: true,
          connected,
          email: "owner@example.test",
          folderId: "folder",
        }),
      });
    });
    await page.route("**/api/v1/workspaces/*/materials?*", (route) =>
      route.fulfill({
        json: {
          ...envelope([]),
          meta: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
        },
      }),
    );
    await page.route(
      "**/api/v1/workspaces/*/materials/storage-usage",
      (route) =>
        route.fulfill({
          json: envelope({
            workspaceUsedBytes: "0",
            agencyUsedBytes: "100",
            agencyReservedBytes: "0",
            agencyQuotaBytes: "100",
            storageMode: "CUSTOMER_DRIVE_FIRST",
            isQuotaExceeded: false,
            canExpandWithSubscription: true,
          }),
        }),
    );
    await page.goto(`/workspaces/${workspaceId}/library`);
    await expect(
      page.getByRole("region", { name: "Lưu trữ Google Drive" }),
    ).toBeVisible();
    await expect(page.getByText("owner@example.test")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Tải lên Media", exact: true }),
    ).toBeEnabled();
    await page.getByRole("button", { name: "Quản lý", exact: true }).click();
    await page.screenshot({
      path: testInfo.outputPath(`drive-${role}.png`),
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Ngắt kết nối", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    const confirmation = page.getByRole("dialog", {
      name: "Ngắt Google Drive của agency?",
    });
    await expect(confirmation).toContainText("Xóa vĩnh viễn");
    await expect(confirmation).toContainText("tất cả workspace");
    await page.screenshot({
      path: testInfo.outputPath(`disconnect-warning-${role}.png`),
      animations: "disabled",
    });
    await confirmation
      .getByRole("button", { name: "Hủy", exact: true })
      .click();
    expect(deletions).toBe(0);
    await page
      .getByRole("button", { name: "Ngắt kết nối", exact: true })
      .click();
    await confirmation
      .getByRole("button", {
        name: "Xóa tài nguyên và ngắt kết nối",
        exact: true,
      })
      .click();
    await expect.poll(() => deletions).toBe(1);
    await expect(
      page.getByRole("button", { name: "Kết nối Google Drive", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Kết nối Google Drive", exact: true }),
    ).toBeEnabled();
    await expect(page.locator("body")).not.toContainText("refresh_token");
  });
}

for (const role of ["CREATOR", "CLIENT"])
  test(`${role} cannot configure the agency Drive`, async ({ page }) => {
    await setup(page, role);
    let storageReads = 0;
    await page.route("**/api/v1/workspaces/*/storage/drive", async (route) => {
      storageReads++;
      await route.fulfill({
        json: envelope({ enabled: true, connected: true }),
      });
    });
    await page.goto(`/workspaces/${workspaceId}/library`);
    await expect(
      page.getByRole("button", { name: "Tải lên Media", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Kết nối Google Drive", exact: true }),
    ).toHaveCount(0);
    expect(storageReads).toBe(0);
  });

test("OAuth callback completes once and removes authorization code from history", async ({
  page,
}) => {
  await setup(page);
  await page.addInitScript(
    ({ workspaceId }) => {
      sessionStorage.setItem("brandhub-drive-workspace", workspaceId);
      sessionStorage.setItem("brandhub-drive-actor", "repository-test-user");
    },
    { workspaceId },
  );
  let completions = 0;
  await page.route(
    "**/api/v1/workspaces/*/storage/drive/complete",
    async (route) => {
      completions++;
      expect(route.request().postDataJSON()).toEqual({
        code: "test-code",
        state: "test-state",
      });
      await route.fulfill({
        json: envelope({ enabled: true, connected: true }),
      });
    },
  );
  await page.goto("/storage/drive/callback?code=test-code&state=test-state");
  await expect(
    page.getByText("Đã kết nối Google Drive.", { exact: true }),
  ).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
  expect(completions).toBe(1);
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("brandhub-drive-workspace"),
    ),
  ).toBeNull();
});

test("Drive capacity failure retries once with a fresh reservation", async ({
  page,
}) => {
  await setup(page);
  const requests: string[] = [];
  let writes = 0;
  await page.route(
    "**/api/v1/workspaces/*/materials/upload-session",
    async (route) => {
      requests.push(route.request().postDataJSON().clientRequestId);
      await route.fulfill({
        json: envelope({
          sessionId: `session-${requests.length}`,
          materialId: "overflow",
          s3Key: "staging",
          uploadUrl: `https://storage.example.test/${requests.length}`,
          expiresAt: new Date(Date.now() + 600000).toISOString(),
        }),
      });
    },
  );
  await page.route("https://storage.example.test/**", async (route) => {
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "PUT, OPTIONS",
      "access-control-allow-headers": "content-type",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    writes++;
    await route.fulfill({
      status: writes === 1 ? 409 : 204,
      headers,
      ...(writes === 1
        ? { json: { error: { code: "DRIVE_STORAGE_FULL" } } }
        : {}),
    });
  });
  await page.route(
    "**/api/v1/workspaces/*/materials/upload-session/confirm",
    (route) =>
      route.fulfill({
        json: envelope({
          id: "overflow",
          workspaceId,
          name: "overflow.png",
          status: "READY",
          storageProvider: "SYSTEM_S3",
          type: "RAW",
          mediaKind: "IMAGE",
          createdAt: new Date().toISOString(),
        }),
      }),
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page
    .getByRole("button", { name: "Tải lên Media", exact: true })
    .click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "overflow.png",
    mimeType: "image/png",
    buffer: Buffer.from("test image bytes"),
  });
  await page.getByRole("button", { name: "Tải lên", exact: true }).click();
  await expect.poll(() => writes).toBe(2);
  await expect(page.getByText("overflow.png", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Tải lên", exact: true }),
  ).toHaveCount(0);
  expect(writes).toBe(2);
  expect(new Set(requests).size).toBe(2);
});

test("pending Drive deletion blocks connect and allows retry", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/v1/workspaces/*/storage/drive", (route) =>
    route.fulfill({
      json: envelope({
        enabled: true,
        connected: false,
        disconnecting: true,
        email: "old@example.test",
        folderId: "old-root",
      }),
    }),
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Đang chờ hoàn tất xóa tài nguyên Drive" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quản lý", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Kết nối lại", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Ngắt kết nối", exact: true }),
  ).toBeEnabled();
});

test("missing callback context is diagnosed without exposing OAuth values", async ({
  page,
}) => {
  await setup(page);
  const warnings: string[] = [];
  let completions = 0;
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });
  await page.route("**/storage/drive/complete", (route) => {
    completions++;
    return route.fulfill({ json: envelope({}) });
  });
  await page.goto(
    "/storage/drive/callback?code=private-code-fixture&state=private-state-fixture",
  );
  await expect(page.getByRole("alert")).toContainText("Không thể kết nối");
  await expect
    .poll(() => warnings.join("\n"))
    .toContain("missing_callback_context");
  expect(completions).toBe(0);
  expect(warnings.join("\n")).not.toContain("private-code-fixture");
  expect(warnings.join("\n")).not.toContain("private-state-fixture");
});

test("old Drive grant prompts reconnection for workspace sync", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/v1/workspaces/*/storage/drive", (route) =>
    route.fulfill({
      json: envelope({
        enabled: true,
        connected: true,
        syncEnabled: true,
        syncReady: false,
        email: "owner@example.test",
        folderId: "folder",
      }),
    }),
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await expect(
    page.getByRole("status").filter({ hasText: "cấp quyền Drive" }),
  ).toBeVisible();
});

test("upload explains which agency must connect Drive", async ({ page }) => {
  await setup(page);
  await page.route("**/api/v1/workspaces/*/materials/upload-session", (route) =>
    route.fulfill({
      status: 409,
      json: { success: false, error: { code: "DRIVE_NOT_CONNECTED" } },
    }),
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page
    .getByRole("button", { name: "Tải lên Media", exact: true })
    .click();
  const form = page.getByRole("form", { name: "Thêm tư liệu vào workspace" });
  await form
    .getByLabel("Tệp cần tải lên")
    .setInputFiles({
      name: "fixture.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\nfixture\n%%EOF"),
    });
  await form.getByRole("button", { name: "Tải lên", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText(
    "Agency của workspace này chưa kết nối Google Drive",
  );
});
