import { Page, Locator } from "@playwright/test";

/**
 * Page Object for ForgotPasswordPage — uses Input component (label prop).
 */
export class ForgotPasswordPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;
  readonly successHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Quên mật khẩu?" });
    this.emailInput = page.getByLabel("Email");
    this.submitButton = page.locator("form button[type='submit']");
    this.backToLoginLink = page.getByText("Quay lại đăng nhập");
    this.successHeading = page.getByRole("heading", {
      name: "Kiểm tra email của bạn",
    });
  }

  async goto() {
    await this.page.goto("/forgot-password");
    await this.page.waitForLoadState("networkidle");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async submit() {
    await this.submitButton.click();
  }

  async isSuccessState(): Promise<boolean> {
    return await this.successHeading.isVisible();
  }
}
