import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

test.describe("LoginPage", () => {
  let page: LoginPage;

  test.beforeEach(async ({ page: pwPage }) => {
    page = new LoginPage(pwPage);
    await page.goto();
  });

  test("renders heading via h1 component", async () => {
    await expect(page.heading).toBeVisible();
    await expect(page.heading).toHaveText("Chào mừng trở lại");
  });

  test("renders email and password inputs with Input component labels", async () => {
    await expect(page.emailInput).toBeVisible();
    await expect(page.passwordInput).toBeVisible();
  });

  test("renders Google and GitHub buttons via Button component", async () => {
    await expect(page.googleButton).toBeVisible();
    await expect(page.githubButton).toBeVisible();
  });

  test("navigates to /register when clicking Dang ky tab", async ({
    page: pwPage,
  }) => {
    await page.clickTabRegister();
    await pwPage.waitForURL("**/register");
    expect(pwPage.url()).toContain("/register");
  });

  test("navigates to /forgot-password when clicking Quen mat khau?", async ({
    page: pwPage,
  }) => {
    await page.clickForgotPassword();
    await pwPage.waitForURL("**/forgot-password");
    expect(pwPage.url()).toContain("/forgot-password");
  });

  test("fills email and password using Input component", async () => {
    await page.fillEmail("test@brandhub.vn");
    await page.fillPassword("password123");
    await expect(page.emailInput).toHaveValue("test@brandhub.vn");
    await expect(page.passwordInput).toHaveValue("password123");
  });

  test("submit button visible and enabled via Button component", async () => {
    await expect(page.submitButton).toBeVisible();
    await expect(page.submitButton).toBeEnabled();
  });
});
