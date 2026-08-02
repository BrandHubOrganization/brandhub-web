import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/RegisterPage";

test.describe("RegisterPage", () => {
  let page: RegisterPage;

  test.beforeEach(async ({ page: pwPage }) => {
    page = new RegisterPage(pwPage);
    await page.goto();
  });

  test("renders all inputs via Input component", async () => {
    await expect(page.heading).toBeVisible();
    await expect(page.fullNameInput).toBeVisible();
    await expect(page.emailInput).toBeVisible();
    await expect(page.passwordInput).toBeVisible();
    await expect(page.confirmPasswordInput).toBeVisible();
  });

  test("navigates to /login from Dang nhap tab", async ({ page: pwPage }) => {
    await page.tabLogin.click();
    await pwPage.waitForURL("**/login");
    expect(pwPage.url()).toContain("/login");
  });

  test("navigates to /login from Da co tai khoan link", async ({
    page: pwPage,
  }) => {
    await page.loginLink.click();
    await pwPage.waitForURL("**/login");
    expect(pwPage.url()).toContain("/login");
  });

  test("shows PasswordStrengthMeter when typing password", async () => {
    await page.fillPassword("weak");
    await expect(page.strengthMeter).toBeVisible();
  });

  test("shows inline validation errors from Input error prop on empty submit", async ({
    page: pwPage,
  }) => {
    // bypass HTML5 required validation so React validation runs
    await pwPage.evaluate(() => {
      document
        .querySelectorAll("input[required]")
        .forEach((el) => el.removeAttribute("required"));
    });
    await page.submit();
    const error = await page.getFieldError();
    expect(error).toBeTruthy();
  });

  test("validates confirm password mismatch", async () => {
    await page.fillFullName("Test User");
    await page.fillEmail("test@brandhub.vn");
    await page.fillPassword("password123");
    await page.fillConfirmPassword("different-password");
    await page.submit();
    const error = await page.getFieldError();
    expect(error).toBeTruthy();
  });

  test("no inline errors with valid data", async () => {
    await page.fillFullName("Test User");
    await page.fillEmail("test@brandhub.vn");
    await page.fillPassword("StrongPass1");
    await page.fillConfirmPassword("StrongPass1");
    const error = await page.getFieldError();
    expect(error).toBeFalsy();
  });
});
