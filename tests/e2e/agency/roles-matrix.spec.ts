import { test, expect, type Page } from "@playwright/test";

const ok = (data: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data }),
});

async function setupAuth(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("brandhub-lang", "vi");
    window.localStorage.setItem("brandhub_current_agency_id", "agency-1");
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "u1",
            name: "Tester",
            email: "tester@brandhub.dev",
            role: "OWNER",
          },
          accessToken: "mock-token",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });

  await page.route("**/api/v1/agencies**", (route) =>
    route.fulfill(
      ok([
        {
          id: "agency-1",
          name: "Agency One",
          ownerId: "u1",
          myRole: "OWNER",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
      ]),
    ),
  );

  await page.route("**/api/v1/workspaces**", (route) => route.fulfill(ok([])));
  await page.route("**/api/v1/users/me**", (route) =>
    route.fulfill(
      ok({
        id: "u1",
        email: "tester@brandhub.dev",
        fullName: "Tester",
      }),
    ),
  );
}

test.describe("Agency Roles & Permission Matrix - UI & Component Standards", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto("/agency/agency-1/roles");
  });

  test("renders permission matrix with navigation tabs and standard tokens", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Ma trận phân quyền/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Danh sách vai trò/i })).toBeVisible();
    await expect(page.getByText(/Chủ sở hữu mặc định có toàn bộ đặc quyền/i)).toBeVisible();
  });

  test("opens create custom role modal with common Select and CharacterCounter", async ({ page }) => {
    const createBtn = page.getByRole("button", { name: /Tạo vai trò mới/i });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // Verify Dialog opened
    await expect(page.getByText(/Tạo vai trò mới \(Custom Role\)/i)).toBeVisible();

    // Verify Select component for role inheritance is present
    const selectElem = page.locator("select");
    await expect(selectElem).toBeVisible();

    // Enter description and verify CharacterCounter (max 200)
    const descTextarea = page.getByPlaceholder(/Mô tả phạm vi quyền hạn/i);
    await descTextarea.fill("Phụ trách thiết kế và sáng tạo nội dung truyền thông.");
    await expect(page.getByText(/\/\s*200/)).toBeVisible();

    // Trigger validation when name is empty
    const confirmBtn = page.getByRole("button", { name: /Khởi tạo vai trò/i });
    await confirmBtn.click();
    await expect(page.getByText(/Vui lòng nhập tên vai trò/i)).toBeVisible();

    // Enter valid name and close
    const nameInput = page.getByPlaceholder(/Ví dụ: Lead Designer/i);
    await nameInput.fill("Creative Director");
    await confirmBtn.click();

    // Verify dialog closes
    await expect(page.getByText(/Tạo vai trò mới \(Custom Role\)/i)).not.toBeVisible();
  });

  test("opens reset confirmation dialog with warning icon and action buttons", async ({ page }) => {
    const resetBtn = page.getByRole("button", { name: /Khôi phục mặc định/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Dialog title
    await expect(page.getByText(/Khôi phục phân quyền mặc định\?/i)).toBeVisible();

    // Cancel closes dialog
    const cancelBtn = page.getByRole("button", { name: /Hủy/i });
    await cancelBtn.click();
    await expect(page.getByText(/Khôi phục phân quyền mặc định\?/i)).not.toBeVisible();
  });
});
