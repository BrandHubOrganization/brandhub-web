import { test, expect } from "@playwright/test";
import { VerifyOtpPage } from "../../pages/VerifyOtpPage";

test.describe("VerifyOtpPage", () => {
  test("redirects to /register when no email param", async ({ page: pwPage }) => {
    const page = new VerifyOtpPage(pwPage);
    await page.goto();
    await pwPage.waitForURL("**/register");
    expect(pwPage.url()).toContain("/register");
  });

  test("renders heading with email param", async ({ page: pwPage }) => {
    const page = new VerifyOtpPage(pwPage);
    await page.goto("test@brandhub.vn");
    await expect(page.heading).toBeVisible();
  });

  test("renders 6 OTP digit inputs", async ({ page: pwPage }) => {
    const page = new VerifyOtpPage(pwPage);
    await page.goto("test@brandhub.vn");
    await expect(page.otpInputs).toHaveCount(6);
  });

  test("fills and reads OTP digits", async ({ page: pwPage }) => {
    const page = new VerifyOtpPage(pwPage);
    await page.goto("test@brandhub.vn");
    await page.fillOtp("123456");
    expect(await page.getOtpValue()).toBe("123456");
  });

  test("submit disabled when OTP incomplete, enabled when full", async ({ page: pwPage }) => {
    const page = new VerifyOtpPage(pwPage);
    await page.goto("test@brandhub.vn");
    await expect(page.submitButton).toBeDisabled();
    await page.fillOtp("123456");
    await expect(page.submitButton).toBeEnabled();
  });

  test("renders resend button and back to login link", async ({ page: pwPage }) => {
    const page = new VerifyOtpPage(pwPage);
    await page.goto("test@brandhub.vn");
    await expect(page.resendButton).toBeVisible();
    await expect(page.backToLoginLink).toBeVisible();
  });

  test("back to login navigates to /login", async ({ page: pwPage }) => {
    const page = new VerifyOtpPage(pwPage);
    await page.goto("test@brandhub.vn");
    await page.backToLoginLink.click();
    await pwPage.waitForURL("**/login");
    expect(pwPage.url()).toContain("/login");
  });
});
