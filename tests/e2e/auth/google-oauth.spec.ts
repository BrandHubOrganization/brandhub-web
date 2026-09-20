import { expect, test } from "@playwright/test";
import { OAuthCallbackPage } from "../../pages/OAuthCallbackPage";

test("Google callback saves profile and removes token from address", async ({ page }) => {
  const callback = new OAuthCallbackPage(page);
  await callback.mockProfile();
  await callback.open();
  await callback.expectAuthenticated();
});

const messages = {
  en: {
    cancelled: "Google sign-in was cancelled or could not be completed. Please try again.",
    profile: "Unable to fetch user information. Please try again.",
    loading: "Completing Google sign-in",
  },
  vi: {
    cancelled: "Đăng nhập Google đã bị hủy hoặc chưa hoàn tất. Vui lòng thử lại.",
    profile: "Không thể lấy thông tin người dùng. Vui lòng thử lại.",
    loading: "Đang hoàn tất đăng nhập Google",
  },
};

for (const language of ["vi", "en"] as const) {
  test(`Cancelled Google login clears session and shows ${language} error`, async ({ page }) => {
    const callback = new OAuthCallbackPage(page);
    await callback.configureAppearance(language);
    await callback.seedStaleSession();
    await callback.open("?error=oauth_failed");
    await callback.expectSignedOut();
    await callback.expectError(messages[language].cancelled);
  });

  test(`Profile failure clears session and shows ${language} error`, async ({ page }) => {
    const callback = new OAuthCallbackPage(page);
    await callback.configureAppearance(language);
    await callback.mockProfile(500);
    await callback.open();
    await callback.expectSignedOut();
    await callback.expectError(messages[language].profile);
  });
}

for (const width of [375, 768, 1440]) {
  for (const theme of ["light", "dark"]) {
    test(`OAuth loading is accessible at ${width}px in ${theme} mode`, async ({ page }, testInfo) => {
      const callback = new OAuthCallbackPage(page);
      await callback.configureAppearance("vi", theme);
      await page.setViewportSize({ width, height: 900 });
      await page.route("**/api/v1/users/me", () => {});
      await callback.open();
      await expect(page.getByRole("status", { name: messages.vi.loading })).toBeVisible();
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expect(page).toHaveURL(/\/oauth-callback$/);
      await page.screenshot({ path: testInfo.outputPath(`oauth-${theme}-${width}.png`) });
    });
  }
}
