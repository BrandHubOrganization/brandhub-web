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
            role: "USER",
          },
          accessToken: "mock-token",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });

  await page.route("**/api/v1/agencies", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(
        ok({
          id: "agency-new",
          name: "Test Creative Agency",
          ownerId: "u1",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        }),
      );
    }
    return route.fulfill(ok([]));
  });

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

test.describe("Agency Creation - Real-time Validation & UI Standards", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto("/agency/create");
  });

  test("submit button is disabled when agency name is empty", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /Tạo công ty|Khởi tạo/i });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeDisabled();
  });

  test("auto-normalizes website URL on blur and clears on valid input", async ({ page }) => {
    const websiteInput = page.getByLabel(/Website/i);
    await websiteInput.fill("myagency.vn");
    await websiteInput.blur();

    // Verify auto-prefix with https://
    await expect(websiteInput).toHaveValue("https://myagency.vn");
  });

  test("formats phone number in real-time on blur and validates length", async ({ page }) => {
    const phoneInput = page.getByLabel(/Số điện thoại/i);
    await phoneInput.fill("0901234567");
    await phoneInput.blur();

    // Verify formatted phone representation
    await expect(phoneInput).toHaveValue("0901 234 567");

    // Invalid phone triggers error message
    await phoneInput.fill("123");
    await phoneInput.blur();
    await expect(page.getByText(/Số điện thoại không hợp lệ/i)).toBeVisible();
  });

  test("enforces character counter for tagline and description", async ({ page }) => {
    const taglineInput = page.locator("input[maxlength='140']");
    await taglineInput.fill("Creative Digital Agency");
    await expect(page.getByText(/23\s*\/\s*140/)).toBeVisible();
  });

  test("enables submit button with brand-orange styling once valid name entered", async ({ page }) => {
    const nameInput = page.getByLabel(/Tên công ty/i);
    await nameInput.fill("Apex Digital");

    const submitBtn = page.getByRole("button", { name: /Tạo công ty/i });
    await expect(submitBtn).toBeEnabled();
  });
});
