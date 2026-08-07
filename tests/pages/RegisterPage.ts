import { Page, Locator } from "@playwright/test";

/**
 * Page Object for RegisterPage — uses Input (label/error props), Button, PasswordStrengthMeter.
 */
export class RegisterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tabLogin: Locator;
  readonly tabRegister: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly showPasswordToggle: Locator;
  readonly showConfirmPasswordToggle: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly strengthMeter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Tạo tài khoản" });
    this.tabLogin = page
      .getByRole("button", { name: "Đăng nhập", exact: true })
      .first();
    this.tabRegister = page.getByRole("button", { name: "Đăng ký" });
    this.fullNameInput = page.getByLabel("Họ và tên");
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Mật khẩu", { exact: true });
    this.confirmPasswordInput = page.getByLabel("Xác nhận mật khẩu");
    this.showPasswordToggle = page
      .locator("button.absolute.right-2\\.5")
      .first();
    this.showConfirmPasswordToggle = page
      .locator("button.absolute.right-2\\.5")
      .nth(1);
    this.submitButton = page.locator("form button[type='submit']");
    this.loginLink = page.getByText("Đã có tài khoản?").locator("button");
    this.strengthMeter = page.getByText(/Độ mạnh mật khẩu/);
  }

  async goto() {
    await this.page.goto("/register");
    await this.page.waitForLoadState("networkidle");
  }

  async fillFullName(name: string) {
    await this.fullNameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  /** Input component shows error via data-slot="input-error" */
  async getFieldError(): Promise<string | null> {
    const err = this.page.locator("[data-slot='input-error']").first();
    return (await err.isVisible()) ? await err.textContent() : null;
  }
}
