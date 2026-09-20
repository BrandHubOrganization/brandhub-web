import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export class OAuthCallbackPage {
  constructor(readonly page: Page) {}

  async open(callback = "#token=test-google-token") {
    await this.page.goto(`/oauth-callback${callback}`);
  }

  async configureAppearance(language: "vi" | "en", theme = "light") {
    await this.page.addInitScript(({ language, theme }) => {
      localStorage.setItem("brandhub-lang", language);
      localStorage.setItem("vite-ui-theme", theme);
    }, { language, theme });
  }

  async mockProfile(status = 200) {
    await this.page.route("**/api/v1/users/me", async (route) => {
      expect(route.request().headers().authorization).toBe("Bearer test-google-token");
      await route.fulfill({ status, json: { success: status === 200, data: {
        userId: "google-user", fullName: "Google User", email: "user@example.com", role: "USER",
      } } });
    });
  }

  async mockApiFallback() {
    // Stub every unmocked API call so the dashboard shell never hits the real
    // gateway (401 -> refresh -> logout). Register first; specific routes below win.
    await this.page.route("**/api/v1/**", (route) =>
      route.fulfill({ status: 200, json: { success: true, data: [] } }),
    );
  }

  async mockWorkspaceAccess() {
    await this.page.route("**/api/v1/workspaces", (route) => {
      route.fulfill({ status: 200, json: { success: true, data: [{
        id: "ws-google", name: "Google Workspace", slug: "google-workspace",
        ownerId: "google-user", logoUrl: null,
        settings: { industry: null, timezone: null, defaultPlatforms: null, reportFrequency: null },
        isActive: true, createdAt: "2026-01-01T00:00:00Z",
      }] } });
    });
    await this.page.route("**/api/v1/workspaces/ws-google/members", (route) => {
      route.fulfill({ status: 200, json: { success: true, data: [{
        id: "member-google", workspaceId: "ws-google", userId: "google-user",
        fullName: "Google User", email: "user@example.com", role: "OWNER",
        joinedAt: null, isActive: true,
      }] } });
    });
  }

  async seedStaleSession() {
    await this.page.addInitScript(() => localStorage.setItem("brandhub-auth", JSON.stringify({
      state: { accessToken: "stale", refreshToken: "stale", isAuthenticated: true, user: { id: "old" } },
      version: 0,
    })));
  }

  async expectAuthenticated() {
    await expect(this.page).toHaveURL(/\/$/);
    const state = await this.readAuthState();
    expect(state).toMatchObject({ isAuthenticated: true, user: { id: "google-user" }, systemRole: "USER" });
  }

  async expectSignedOut() {
    await expect(this.page).toHaveURL(/\/login$/);
    expect(await this.readAuthState()).toMatchObject({ isAuthenticated: false, accessToken: null });
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message, { exact: true })).toBeVisible();
  }

  private async readAuthState(): Promise<unknown> {
    return this.page.evaluate(() => JSON.parse(localStorage.getItem("brandhub-auth") ?? "{}").state);
  }
}
