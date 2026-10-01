import { expect, type Page } from "@playwright/test";

export class SystemHealthPage {
  constructor(readonly page: Page) {}

  async setup(language = "en", theme = "light") {
    await this.page.addInitScript(
      ({ language, theme }) => {
        localStorage.setItem("brandhub-lang", language);
        localStorage.setItem("vite-ui-theme", theme);
        localStorage.setItem(
          "brandhub-auth",
          JSON.stringify({
            version: 0,
            state: {
              accessToken: "dev-token-monitoring",
              isAuthenticated: true,
              systemRole: "ADMIN",
              user: {
                id: "monitor-admin",
                name: "Operator",
                email: "test@example.com",
                role: "ADMIN",
              },
            },
          }),
        );
      },
      { language, theme },
    );
    await this.page.route("**/api/v1/users/me", (route) =>
      route.fulfill({
        json: {
          success: true,
          data: { userId: "monitor-admin", role: "ADMIN" },
        },
      }),
    );
    await this.page.route("**/api/v1/workspaces**", (route) =>
      route.fulfill({ json: { success: true, data: [] } }),
    );
    await this.mockServers();
    await this.mockTargets();
  }

  async mockServers(status = 200) {
    await this.page.route("**/api/monitoring/servers?*", (route) =>
      route.fulfill({
        status,
        json: {
          success: status === 200,
          data: {
            serverTime: "2026-09-24T00:00:00Z",
            totalPages: 1,
            servers: [
              {
                serverId: "host-1",
                name: "Gateway host",
                ipAddress: "10.0.1.10",
                environment: "test",
                deployedServices: ["api-gateway"],
                cpuPercent: 12.5,
                ramPercent: null,
                diskPercent: 20,
                uptimeSeconds: 3600,
                lastSeenAt: "2026-09-24T00:00:00Z",
                status: "ONLINE",
              },
            ],
          },
        },
      }),
    );
  }

  async mockTargets(status = 200) {
    await this.page.route("**/api/monitoring/health-targets?*", (route) =>
      route.fulfill({
        status,
        json: {
          success: status === 200,
          data: {
            serverTime: "2026-09-24T00:00:00Z",
            totalPages: 1,
            targets: [
              {
                targetId: "target-1",
                name: "Business readiness",
                kind: "SERVICE",
                environment: "test",
                serverId: "host-1",
                instanceId: "business-1",
                serviceName: "business",
                collectorId: "collector-1",
                checkScope: "READINESS",
                status: "DOWN",
                lastKnownStatus: "DOWN",
                reasonCode: "TIMEOUT",
                checkedAt: "2026-09-24T00:00:00Z",
                receivedAt: "2026-09-24T00:00:01Z",
                latencyMs: 5000,
                httpStatus: null,
                runtimeState: null,
                runtimeHealth: null,
                collectorLastSeenAt: "2026-09-24T00:00:00Z",
              },
            ],
          },
        },
      }),
    );
  }

  async open() {
    await this.page.goto("/admin/system-health");
  }
  async healthTab() {
    await this.page
      .getByRole("tab", { name: "Services & Dependencies" })
      .click();
  }
  async expectHost() {
    await expect(
      this.page.getByRole("heading", { name: "Gateway host" }),
    ).toBeVisible();
  }
}
