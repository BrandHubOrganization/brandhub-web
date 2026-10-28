import { test, expect, type Page } from "@playwright/test";
import { setup, envelope, workspaceId, agencyId } from "./fixtures";

async function dashboard(page: Page, role = "MANAGER") {
  await setup(page, role, role === "OWNER" ? "dark" : "light");
  await page.route("**/api/v1/workspaces/*/dashboard", (route) =>
    route.fulfill({
      json: envelope({
        workspace: {
          id: workspaceId,
          agencyId,
          name: "Repository Workspace",
          myRole: role,
          settings: {},
          status: "ACTIVE",
        },
        totalActiveMembers: 4,
        membersByRole: { CREATOR: 3, MANAGER: 1 },
        totalCampaigns: 0,
        campaignsByStatus: {},
        packageNegotiationStatus: null,
        agencyId,
        aiCreditMonth: "2026-10",
        agencyAiCreditsUsedThisMonth: 0,
      }),
    }),
  );
  await page.route("**/api/v1/workspaces/*/tasks?*", (route) =>
    route.fulfill({ json: envelope({ content: [], totalElements: 0 }) }),
  );
}

for (const role of ["OWNER", "MANAGER"])
  test(`${role} sees live setup on ordinary dashboard and authorizes with Google`, async ({
    page,
  }) => {
    await dashboard(page, role);
    await page.setViewportSize({
      width: role === "OWNER" ? 390 : 1440,
      height: 1000,
    });
    await page.route("**/api/v1/workspaces/*/storage/drive", (route) =>
      route.fulfill({
        json: envelope({
          enabled: true,
          connected: false,
          email: null,
          folderId: null,
        }),
      }),
    );
    let authorizations = 0;
    await page.route(
      "**/api/v1/workspaces/*/storage/drive/authorize",
      (route) => {
        authorizations++;
        return route.fulfill({
          json: envelope({
            authorizationUrl:
              "https://accounts.google.com/o/oauth2/v2/auth?state=test-state",
          }),
        });
      },
    );
    await page.route("https://accounts.google.com/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "Google authorization intercepted for local verification",
      }),
    );
    await page.goto(`/workspaces/${workspaceId}/dashboard`);
    await expect(
      page.getByRole("heading", {
        name: "Cho đội ngũ một nơi lưu tài liệu chung",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Tình huống mô phỏng" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Kết nối Google Drive", exact: true })
      .click();
    await page.waitForURL("https://accounts.google.com/**");
    expect(authorizations).toBe(1);
  });

test("disabled configuration stays visible and old preview parameters are removed", async ({
  page,
}) => {
  await dashboard(page);
  await page.route("**/api/v1/workspaces/*/storage/drive", (route) =>
    route.fulfill({
      json: envelope({
        enabled: false,
        connected: false,
        email: null,
        folderId: null,
      }),
    }),
  );
  await page.goto(
    `/workspaces/${workspaceId}/dashboard?storagePreview=1&variant=C&tab=overview`,
  );
  await expect(
    page.getByRole("button", { name: "Kết nối Google Drive", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText(/Kết nối Google Drive chưa được bật/),
  ).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.has("storagePreview"))
    .toBe(false);
  expect(new URL(page.url()).searchParams.get("tab")).toBe("overview");
  expect(new URL(page.url()).searchParams.has("variant")).toBe(false);
});

test("connected status uses real details and confirms agency-wide disconnect", async ({
  page,
}) => {
  await dashboard(page);
  let connected = true;
  let deleted = 0;
  await page.route("**/api/v1/workspaces/*/storage/drive", async (route) => {
    if (route.request().method() === "DELETE") {
      connected = false;
      deleted++;
    }
    await route.fulfill({
      json: envelope({
        enabled: true,
        connected,
        email: "real-owner@example.test",
        folderId: "real-folder-id",
      }),
    });
  });
  await page.route("**/api/v1/workspaces/*/materials/storage-usage", (route) =>
    route.fulfill({
      json: envelope({
        workspaceUsedBytes: "1024",
        agencyUsedBytes: "1073741824",
        agencyReservedBytes: "0",
        agencyQuotaBytes: "85899345920",
        storageMode: "CUSTOMER_DRIVE_FIRST",
        isQuotaExceeded: false,
        canExpandWithSubscription: true,
      }),
    }),
  );
  await page.goto(`/workspaces/${workspaceId}/dashboard`);
  await expect(
    page.getByText("real-owner@example.test", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("region", { name: "Lưu trữ tài liệu của agency" })
    .getByRole("button", { name: "Quản lý", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Mở thư mục agency trên Google Drive" }),
  ).toHaveAttribute(
    "href",
    "https://drive.google.com/drive/folders/real-folder-id",
  );
  await expect(page.getByText(/Dung lượng BrandHub đã dùng:/)).toBeVisible();
  await page.getByRole("button", { name: "Ngắt kết nối", exact: true }).click();
  const confirmation = page.getByRole("dialog", {
    name: "Ngắt Google Drive của agency?",
  });
  await expect(confirmation).toBeVisible();
  expect(deleted).toBe(0);
  await confirmation.getByRole("button", { name: "Hủy", exact: true }).click();
  expect(deleted).toBe(0);
  await page.getByRole("button", { name: "Ngắt kết nối", exact: true }).click();
  await confirmation
    .getByRole("button", { name: "Ngắt kết nối", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Cho đội ngũ một nơi lưu tài liệu chung",
    }),
  ).toBeVisible();
  expect(deleted).toBe(1);
});

for (const role of ["CREATOR", "CLIENT"])
  test(`${role} cannot manage dashboard storage`, async ({ page }) => {
    await dashboard(page, role);
    let reads = 0;
    await page.route("**/api/v1/workspaces/*/storage/drive", (route) => {
      reads++;
      return route.fulfill({
        json: envelope({ enabled: true, connected: false }),
      });
    });
    await page.goto(`/workspaces/${workspaceId}/dashboard`);
    await expect(
      page
        .getByRole("heading", { name: "Repository Workspace", exact: true })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Kết nối Google Drive", exact: true }),
    ).toHaveCount(0);
    expect(reads).toBe(0);
  });

test("status errors have a working retry instead of hiding the entry", async ({
  page,
}) => {
  await dashboard(page);
  let failing = true;
  await page.route("**/api/v1/workspaces/*/storage/drive", async (route) => {
    if (failing) {
      failing = false;
      await route.fulfill({ status: 503, json: { success: false } });
    } else
      await route.fulfill({
        json: envelope({ enabled: true, connected: false }),
      });
  });
  await page.goto(`/workspaces/${workspaceId}/dashboard`);
  const card = page.getByRole("region", {
    name: "Lưu trữ tài liệu của agency",
  });
  await expect(card.getByRole("alert")).toBeVisible();
  await card.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Kết nối Google Drive", exact: true }),
  ).toBeEnabled();
});
