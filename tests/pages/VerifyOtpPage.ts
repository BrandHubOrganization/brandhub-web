import { Page, Locator } from "@playwright/test";

/**
 * Page Object for VerifyOtpPage — 6 individual OTP digit inputs.
 */
export class VerifyOtpPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly otpInputs: Locator;
  readonly submitButton: Locator;
  readonly resendButton: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Xác thực email" });
    this.otpInputs = page.locator("input[inputmode='numeric']");
    this.submitButton = page.locator("form button[type='submit']");
    this.resendButton = page.getByRole("button", { name: /Gửi lại/ });
    this.backToLoginLink = page.getByText("Quay lại đăng nhập");
  }

  async goto(email?: string) {
    const url = email
      ? `/verify-otp?email=${encodeURIComponent(email)}`
      : "/verify-otp";
    await this.page.goto(url);
    await this.page.waitForLoadState("networkidle");
  }

  async fillOtp(code: string) {
    const digits = code.replace(/\D/g, "").slice(0, 6);
    for (let i = 0; i < digits.length; i++) {
      await this.otpInputs.nth(i).fill(digits[i]);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async clickResend() {
    await this.resendButton.click();
  }

  async getOtpValue(): Promise<string> {
    const values: string[] = [];
    for (let i = 0; i < 6; i++) {
      values.push(await this.otpInputs.nth(i).inputValue());
    }
    return values.join("");
  }
}
