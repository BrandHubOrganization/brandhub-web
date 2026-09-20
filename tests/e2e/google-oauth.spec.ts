import { expect, test } from "@playwright/test";

test("Google callback saves profile and removes token from address", async ({ page }) => {
  await page.route("**/api/v1/users/me", async (route) => {
    expect(route.request().headers().authorization).toBe("Bearer test-google-token");
    await route.fulfill({ json: { success: true, data: {
      userId: "google-user", fullName: "Google User", email: "user@example.com", role: "USER",
    } } });
  });
  await page.goto("/oauth-callback#token=test-google-token");
  await expect(page).toHaveURL("http://localhost:3000/");
  const auth = await page.evaluate(() => JSON.parse(localStorage.getItem("brandhub-auth") ?? "{}").state);
  expect(auth.isAuthenticated).toBe(true);
  expect(auth.user.id).toBe("google-user");
  expect(auth.systemRole).toBe("USER");
});

test("Cancelled Google login clears stale session and returns to login", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("brandhub-auth", JSON.stringify({
    state: { accessToken: "stale", refreshToken: "stale", isAuthenticated: true, user: { id: "old" } },
    version: 0,
  })));
  await page.goto("/oauth-callback?error=oauth_failed");
  await expect(page).toHaveURL(/\/login$/);
  const auth = await page.evaluate(() => JSON.parse(localStorage.getItem("brandhub-auth") ?? "{}").state);
  expect(auth.isAuthenticated).toBe(false);
  expect(auth.accessToken).toBeNull();
});

test("Profile failure does not leave the Google token authenticated", async ({ page }) => {
  await page.route("**/api/v1/users/me", (route) => route.fulfill({ status: 500, json: { success: false } }));
  await page.goto("/oauth-callback#token=test-google-token");
  await expect(page).toHaveURL(/\/login$/);
  const auth = await page.evaluate(() => JSON.parse(localStorage.getItem("brandhub-auth") ?? "{}").state);
  expect(auth.isAuthenticated).toBe(false);
  expect(auth.accessToken).toBeNull();
});
