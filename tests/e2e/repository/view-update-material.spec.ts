import { test, expect, type Page } from "@playwright/test";
import { setup, envelope, workspaceId } from "./fixtures";
import type { MaterialItem } from "../../../src/types/material";

const full = {
  canPreview: true,
  canDownload: true,
  canRename: true,
  canUpdateType: true,
  canChangeAudience: true,
  canWatermark: true,
  canDelete: true,
  canRestore: false,
};
const profile = "aabbccdd-1234-4123-8123-123456789012";

async function repository(
  page: Page,
  options: {
    role?: string;
    theme?: string;
    conflict?: boolean;
    quota?: boolean;
  } = {},
) {
  await setup(page, options.role ?? "MANAGER", options.theme ?? "light");
  let material: MaterialItem = {
    id: "image-1",
    workspaceId,
    name: "summer.png",
    originalName: "camera.png",
    type: "RAW",
    mediaKind: "IMAGE",
    mimeType: "image/png",
    fileSize: 100,
    status: "READY",
    version: 0,
    rawWarning: true,
    previewUrl: "https://material-preview.example.test/image.png",
    previewExpiresAt: new Date(Date.now() + 300000).toISOString(),
    url: "",
    purpose: "MATERIAL",
    visibility: "CLIENT",
    clientProfileId: profile,
    createdBy: "repository-test-user",
    createdByName: "Creator A",
    createdAt: new Date().toISOString(),
    capabilities: {
      ...full,
      canChangeAudience: !options.role || options.role === "MANAGER",
    },
  };
  const calls: { method: string; path: string; search: URLSearchParams }[] = [];
  let conflict = !!options.conflict;
  let revoked = false;
  await page.route("https://material-preview.example.test/**", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await page.route(`**/api/v1/workspaces/${workspaceId}/members`, (route) =>
    route.fulfill({
      json: envelope([
        {
          id: "member",
          role: "CLIENT",
          isActive: true,
          clientProfileId: profile,
          fullName: "Client A",
        },
      ]),
    }),
  );
  await page.route(
    `**/api/v1/workspaces/${workspaceId}/materials**`,
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      calls.push({
        method: request.method(),
        path: url.pathname,
        search: url.searchParams,
      });
      if (revoked)
        return route.fulfill({
          status: 403,
          json: { success: false, error: { code: "WORKSPACE_ACCESS_DENIED" } },
        });
      if (url.pathname.endsWith("/storage-usage"))
        return route.fulfill({
          json: envelope({
            workspaceUsedBytes: "100",
            agencyUsedBytes: options.quota ? "35000000000" : "100",
            agencyReservedBytes: "0",
            agencyQuotaBytes: "21474836480",
            isQuotaExceeded: !!options.quota,
          }),
        });
      if (request.method() === "PATCH") {
        if (conflict) {
          conflict = false;
          material = { ...material, name: "latest.png", version: 1 };
          return route.fulfill({
            status: 409,
            json: {
              success: false,
              error: { code: "MATERIAL_VERSION_CONFLICT" },
            },
          });
        }
        const patch = request.postDataJSON();
        expect(patch.expectedVersion).toBe(material.version);
        material = {
          ...material,
          ...patch,
          version: material.version! + 1,
          rawWarning: patch.type === "RAW",
        };
        return route.fulfill({ json: envelope(material) });
      }
      if (url.pathname.endsWith("/preview"))
        return route.fulfill({
          json: envelope({
            materialId: material.id,
            previewUrl: material.previewUrl,
            previewExpiresAt: new Date(Date.now() + 300000).toISOString(),
            mimeType: material.mimeType,
          }),
        });
      if (url.pathname.endsWith("/image-1"))
        return route.fulfill({ json: envelope(material) });
      const purpose = url.searchParams.get("purpose");
      const kind = url.searchParams.get("mediaKind");
      const search = url.searchParams.get("search");
      const rows =
        (!purpose || purpose === material.purpose) &&
        (!kind || kind === material.mediaKind) &&
        (!search || material.name.startsWith(search))
          ? [material]
          : [];
      return route.fulfill({
        json: {
          ...envelope(rows),
          meta: {
            page: Number(url.searchParams.get("page") ?? 0),
            size: 20,
            total: rows.length,
          },
        },
      });
    },
  );
  return {
    calls,
    revoke: () => {
      revoked = true;
    },
  };
}

for (const [width, theme] of [
  [375, "light"],
  [768, "dark"],
  [1440, "light"],
] as const) {
  test(`view filters and inline update at ${width}px ${theme}`, async ({
    page,
  }, testInfo) => {
    const state = await repository(page, { theme, quota: true });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/workspaces/${workspaceId}/library`);
    const card = page.getByRole("button", {
      name: "Mở tư liệu summer.png",
      exact: true,
    });
    await expect(card).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Tải lên Media", exact: true }),
    ).toBeDisabled();
    expect(
      state.calls.filter((call) => call.path.endsWith("/materials")),
    ).toHaveLength(1);
    expect(
      state.calls.filter((call) => call.path.endsWith("/preview")),
    ).toHaveLength(0);
    await page
      .getByLabel("Mục đích sử dụng", { exact: true })
      .selectOption("BRAND_REFERENCE");
    await expect(
      page.getByText("Không tìm thấy tư liệu phù hợp với bộ lọc", {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Xóa bộ lọc", exact: true }).click();
    await card.click();
    const drawer = page.getByRole("dialog");
    await expect(
      drawer.getByRole("button", { name: "Chỉnh sửa thông tin", exact: true }),
    ).toBeVisible();
    await drawer
      .getByRole("button", { name: "Chỉnh sửa thông tin", exact: true })
      .click();
    const form = drawer.getByRole("form", { name: "Chỉnh sửa thông tin" });
    await expect(form.getByLabel("Tên hiển thị")).toBeFocused();
    await form.getByLabel("Tên hiển thị").fill("Chiến dịch mới");
    await form
      .getByLabel("Phân loại xử lý", { exact: true })
      .selectOption("RETOUCHED");
    await form
      .getByLabel("Mục đích sử dụng", { exact: true })
      .selectOption("BRAND_REFERENCE");
    await page.screenshot({
      path: testInfo.outputPath(`metadata-${width}-${theme}.png`),
      animations: "disabled",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await form
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await expect(
      drawer.getByRole("heading", { name: "Chiến dịch mới.png", exact: true }),
    ).toBeVisible();
    await expect(
      drawer.getByText("Ảnh chưa chỉnh sửa", { exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    const stored = await page.evaluate(() => JSON.stringify(localStorage));
    expect(stored).not.toContain("material-preview.example.test");
  });
}

test("stale version preserves input and reloads latest; Creator has no audience editor", async ({
  page,
}) => {
  await repository(page, { role: "CREATOR", conflict: true });
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page
    .getByRole("button", { name: "Mở tư liệu summer.png", exact: true })
    .click();
  const drawer = page.getByRole("dialog");
  await drawer
    .getByRole("button", { name: "Chỉnh sửa thông tin", exact: true })
    .click();
  const form = drawer.getByRole("form");
  await expect(form.getByLabel("Phạm vi chia sẻ", { exact: true })).toHaveCount(
    0,
  );
  await form.getByLabel("Tên hiển thị").fill("Unsaved");
  await form.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText(
    "vừa được người khác cập nhật",
  );
  await expect(form.getByLabel("Tên hiển thị")).toHaveValue("Unsaved");
  await form
    .getByRole("button", { name: "Tải lại dữ liệu mới nhất", exact: true })
    .click();
  await expect(drawer.getByRole("form").getByLabel("Tên hiển thị")).toHaveValue(
    "latest",
  );
  await page.keyboard.press("Escape");
  await expect(
    drawer.getByRole("button", { name: "Chỉnh sửa thông tin", exact: true }),
  ).toBeFocused();
});

test("revoked access clears cached cards on failed refetch", async ({
  page,
}) => {
  const state = await repository(page);
  await page.goto(`/workspaces/${workspaceId}/library`);
  await expect(page.getByText("summer.png", { exact: true })).toBeVisible();
  state.revoke();
  const denied = page.waitForResponse(response => response.url().includes("/materials?") && response.status() === 403);
  await page.evaluate(() => window.dispatchEvent(new Event("visibilitychange")));
  await denied;
  await expect(page.getByRole("alert")).toContainText(
    "không có quyền truy cập",
  );
  await expect(page.getByText("summer.png", { exact: true })).toHaveCount(0);
});

test("PATCH403 clears editor and preview after access is revoked", async ({
  page,
}) => {
  const state = await repository(page);
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page
    .getByRole("button", { name: "Mở tư liệu summer.png", exact: true })
    .click();
  const drawer = page.getByRole("dialog");
  await drawer
    .getByRole("button", { name: "Chỉnh sửa thông tin", exact: true })
    .click();
  state.revoke();
  await drawer
    .getByRole("form")
    .getByRole("button", { name: "Lưu thay đổi", exact: true })
    .click();
  await expect(
    page.getByRole("form", { name: "Chỉnh sửa thông tin" }),
  ).toHaveCount(0);
  await expect(
    page.locator('img[src*="material-preview.example.test"]'),
  ).toHaveCount(0);
});

test("bounded preview refresh stops on unusable expiry and workspace switch resets detail", async ({
  page,
}) => {
  const secondWorkspaceId = "11111111-2222-4333-8444-555555555555";
  const state = await repository(page);
  await page.route("**/api/v1/workspaces", (route) =>
    route.fulfill({
      json: envelope([
        {
          id: workspaceId,
          agencyId: "58483ab3-0d75-409d-9945-a3a8bc281b9f",
          name: "Repository Workspace",
          myRole: "MANAGER",
          workspaceMediaPackageId: "package-1",
          packageNegotiationStatus: "APPROVED",
          settings: {},
          createdAt: "2026-10-01T00:00:00Z",
        },
        {
          id: secondWorkspaceId,
          agencyId: "58483ab3-0d75-409d-9945-a3a8bc281b9f",
          name: "Second Workspace",
          myRole: "MANAGER",
          workspaceMediaPackageId: "package-2",
          packageNegotiationStatus: "APPROVED",
          settings: {},
          createdAt: "2026-10-01T00:00:00Z",
        },
      ]),
    }),
  );
  await page.route(
    `**/api/v1/workspaces/${workspaceId}/materials/image-1/preview`,
    (route) => {
      state.calls.push({
        method: "GET",
        path: new URL(route.request().url()).pathname,
        search: new URLSearchParams(),
      });
      return route.fulfill({
        json: envelope({
          materialId: "image-1",
          previewUrl: "https://material-preview.example.test/expired.png",
          previewExpiresAt: new Date(Date.now() + 1000).toISOString(),
          mimeType: "image/png",
        }),
      });
    },
  );
  await page.route(
    `**/api/v1/workspaces/${secondWorkspaceId}/materials**`,
    (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith("/storage-usage")) {
        return route.fulfill({
          json: envelope({
            workspaceUsedBytes: "0",
            agencyUsedBytes: "100",
            agencyReservedBytes: "0",
            agencyQuotaBytes: "21474836480",
            isQuotaExceeded: false,
          }),
        });
      }
      return route.fulfill({
        json: { ...envelope([]), meta: { page: 0, size: 20, total: 0 } },
      });
    },
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page
    .getByRole("button", { name: "Mở tư liệu summer.png", exact: true })
    .click();
  const drawer = page.getByRole("dialog");
  await drawer
    .getByRole("button", { name: "Làm mới bản xem trước", exact: true })
    .click();
  await expect(
    drawer.getByText("Không thể tải bản xem trước", { exact: true }),
  ).toBeVisible();
  expect(
    state.calls.filter((call) => call.path.endsWith("/preview")),
  ).toHaveLength(1);
  await page.goto(`/workspaces/${secondWorkspaceId}/library`);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("summer.png", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("Kho tư liệu chưa có tệp nào", { exact: true }),
  ).toBeVisible();
});
