import { Page, Locator } from "@playwright/test";

/**
 * Page Object for LoginPage — maps to existing Input, Button, AuthBrandPanel, BrandHubLogo components.
 * Selectors use component output: getByLabel (Input label prop), getByRole (Button children text).
 */
export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tabLogin: Locator;
  readonly tabRegister: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly forgotPasswordLink: Locator;
  readonly showPasswordToggle: Locator;
  readonly submitButton: Locator;
  readonly googleButton: Locator;
  readonly githubButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Chào mừng trở lại" });
    this.tabLogin = page.getByRole("button", {
      name: "Đăng nhập",
      exact: true,
    });
    this.tabRegister = page.getByRole("button", { name: "Đăng ký" });
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByPlaceholder("••••••••");
    this.forgotPasswordLink = page.getByText("Quên mật khẩu?");
    this.showPasswordToggle = page
      .locator("button.absolute.right-2\\.5")
      .first();
    this.submitButton = page.locator("form button[type='submit']");
    this.googleButton = page.getByRole("button", { name: "Google" });
    this.githubButton = page.getByRole("button", { name: "GitHub" });
  }

  async goto() {
    await this.page.goto("/login");
    await this.page.waitForLoadState("networkidle");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async clickTabRegister() {
    await this.tabRegister.click();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
