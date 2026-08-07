import { test, expect } from "@playwright/test";
import { ResetPasswordPage } from "../../pages/ResetPasswordPage";

test.describe("ResetPasswordPage", () => {
  test("redirects to /forgot-password when no token param", async ({ page: pwPage }) => {
    const page = new ResetPasswordPage(pwPage);
    await page.goto();
    await pwPage.waitForURL("**/forgot-password");
    expect(pwPage.url()).toContain("/forgot-password");
  });

  test("renders with valid token", async ({ page: pwPage }) => {
    const page = new ResetPasswordPage(pwPage);
    await page.goto("valid-token-123");
    await expect(page.heading).toBeVisible();
  });

  test("renders password inputs via Input component", async ({ page: pwPage }) => {
    const page = new ResetPasswordPage(pwPage);
    await page.goto("valid-token-123");
    await expect(page.newPasswordInput).toBeVisible();
    await expect(page.confirmPasswordInput).toBeVisible();
  });

  test("shows PasswordStrengthMeter when typing", async ({ page: pwPage }) => {
    const page = new ResetPasswordPage(pwPage);
    await page.goto("valid-token-123");
    await page.fillNewPassword("StrongP1!");
    await expect(page.strengthMeter).toBeVisible();
  });

  test("validates password min length (8 chars)", async ({ page: pwPage }) => {
    const page = new ResetPasswordPage(pwPage);
    await page.goto("valid-token-123");
    await page.fillNewPassword("Short1");
    await page.fillConfirmPassword("Short1");
    await page.submit();
    await expect(pwPage.locator("[data-slot='input-error']").first()).toBeVisible({ timeout: 3000 });
  });

  test("validates confirm password match", async ({ page: pwPage }) => {
    const page = new ResetPasswordPage(pwPage);
    await page.goto("valid-token-123");
    await page.fillNewPassword("ValidPass1");
    await page.fillConfirmPassword("OtherPass1");
    await page.submit();
    await expect(pwPage.locator("[data-slot='input-error']").first()).toBeVisible({ timeout: 3000 });
  });

  test("submits valid passwords and redirects to /login", async ({ page: pwPage }) => {
    await pwPage.route("**/api/v1/auth/reset-password", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: null }),
      });
    });

    const page = new ResetPasswordPage(pwPage);
    await page.goto("valid-token-123");
    await page.fillNewPassword("ValidPass1");
    await page.fillConfirmPassword("ValidPass1");
    await page.submit();
    await pwPage.waitForURL("**/login", { timeout: 5000 });
    expect(pwPage.url()).toContain("/login");
  });

  test("shows error on expired token API response", async ({ page: pwPage }) => {
    await pwPage.route("**/api/v1/auth/reset-password", (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          success: false,
          error: { code: "TOKEN_EXPIRED", message: "Token đã hết hạn" },
        }),
      });
    });

    const page = new ResetPasswordPage(pwPage);
    await page.goto("expired-token");
    await page.fillNewPassword("ValidPass1");
    await page.fillConfirmPassword("ValidPass1");
    await page.submit();
    await expect(pwPage.getByText(/Token đã hết hạn/)).toBeVisible({ timeout: 5000 });
  });

  test("back to login navigates to /login", async ({ page: pwPage }) => {
    const page = new ResetPasswordPage(pwPage);
    await page.goto("valid-token-123");
    await page.backToLoginLink.click();
    await pwPage.waitForURL("**/login");
    expect(pwPage.url()).toContain("/login");
  });
});
