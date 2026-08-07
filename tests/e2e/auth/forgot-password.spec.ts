import { test, expect } from "@playwright/test";
import { ForgotPasswordPage } from "../../pages/ForgotPasswordPage";

test.describe("ForgotPasswordPage", () => {
  let page: ForgotPasswordPage;

  test.beforeEach(async ({ page: pwPage }) => {
    page = new ForgotPasswordPage(pwPage);
    await page.goto();
  });

  test("renders heading and email input via Input component", async () => {
    await expect(page.heading).toBeVisible();
    await expect(page.emailInput).toBeVisible();
  });

  test("submits and shows success state", async ({ page: pwPage }) => {
    await pwPage.route("**/api/v1/auth/forgot-password", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: null }),
      });
    });

    await page.fillEmail("test@brandhub.vn");
    await page.submit();
    await expect(page.successHeading).toBeVisible({ timeout: 5000 });
  });

  test("back to login navigates to /login", async ({ page: pwPage }) => {
    await page.backToLoginLink.first().click();
    await pwPage.waitForURL("**/login");
    expect(pwPage.url()).toContain("/login");
  });

  test("shows error toast on API failure via sonner", async ({ page: pwPage }) => {
    await pwPage.route("**/api/v1/auth/forgot-password", (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          success: false,
          error: { code: "NOT_FOUND", message: "Email không tồn tại" },
        }),
      });
    });

    await page.fillEmail("no@brandhub.vn");
    await page.submit();
    await expect(pwPage.getByText(/Email không tồn tại/)).toBeVisible({ timeout: 5000 });
  });
});
