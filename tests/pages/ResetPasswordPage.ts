import { Page, Locator } from "@playwright/test";

/**
 * Page Object for ResetPasswordPage — uses Input, Button, PasswordStrengthMeter.
 */
export class ResetPasswordPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly showPasswordToggle: Locator;
  readonly showConfirmPasswordToggle: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;
  readonly strengthMeter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Đặt lại mật khẩu" });
    this.newPasswordInput = page.getByLabel("Mật khẩu mới");
    this.confirmPasswordInput = page.getByLabel("Xác nhận mật khẩu");
    this.showPasswordToggle = page
      .locator("button.absolute.right-2\\.5")
      .first();
    this.showConfirmPasswordToggle = page
      .locator("button.absolute.right-2\\.5")
      .nth(1);
    this.submitButton = page.locator("form button[type='submit']");
    this.backToLoginLink = page.getByText("Quay lại đăng nhập");
    this.strengthMeter = page.getByText(/Độ mạnh mật khẩu/);
  }

  async goto(token?: string) {
    const url = token ? `/reset-password?token=${token}` : "/reset-password";
    await this.page.goto(url);
    await this.page.waitForLoadState("networkidle");
  }

  async fillNewPassword(password: string) {
    await this.newPasswordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async isOnForgotPasswordPage(): Promise<boolean> {
    return this.page.url().includes("/forgot-password");
  }
}
