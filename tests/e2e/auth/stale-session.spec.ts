import { expect, test } from "@playwright/test";

for (const mode of ["password", "quick-login"]) {
  test(`${mode} can replace a stale session and use the new token`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("brandhub-lang", "en");
      localStorage.setItem(
        "brandhub-auth",
        JSON.stringify({
          state: {
            accessToken: "dev-token-expired",
            refreshToken: "old-refresh",
            user: null,
            isAuthenticated: false,
            systemRole: null,
          },
          version: 0,
        }),
      );
      sessionStorage.setItem("brandhub-auth-redirect", "/admin");
    });
    let loginAuthorization: string | undefined;
    let profileAuthorization: string | undefined;
    await page.route("**/api/v1/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/api/v1/admin/statistics") {
        await route.fulfill({ status: 503, json: { success: false } });
        return;
      }
      let data: unknown = [];
      if (path === "/api/v1/auth/login") {
        loginAuthorization = route.request().headers().authorization;
        if (loginAuthorization) {
          await route.fulfill({
            status: 401,
            json: {
              success: false,
              error: {
                code: "UNAUTHORIZED",
                message: "Invalid or expired token",
              },
            },
          });
          return;
        }
        data = { accessToken: "fresh-access", refreshToken: "fresh-refresh" };
      } else if (path === "/api/v1/users/me") {
        profileAuthorization = route.request().headers().authorization;
        data = {
          userId: "22222222-2222-2222-2222-222222222222",
          role: "ADMIN",
          fullName: "Test Admin",
          email: "admin@example.test",
        };
      } else if (path === "/api/v1/admin/users") {
        data = { items: [], page: 1, size: 20, total: 0 };
      }
      await route.fulfill({ json: { success: true, data } });
    });
    await page.goto("/login");
    if (mode === "password") {
      await page.getByLabel("Email").fill("admin@example.test");
      await page.locator('input[type="password"]').fill("Password123");
      await page.locator('form button[type="submit"]').click();
    } else {
      await page
        .getByRole("button", { name: "Admin Panel", exact: true })
        .click();
    }
    await expect(page).toHaveURL(/\/admin$/);
    expect(loginAuthorization).toBeUndefined();
    expect(profileAuthorization).toBe("Bearer fresh-access");
    const session = await page.evaluate(
      () => JSON.parse(localStorage.getItem("brandhub-auth")!).state,
    );
    expect(session.accessToken).toBe("fresh-access");
    expect(session.refreshToken).toBe("fresh-refresh");
  });
}
