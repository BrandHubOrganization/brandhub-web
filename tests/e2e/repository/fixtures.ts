import type { Page } from "@playwright/test";

export const workspaceId = "9899990d-4740-4dfb-bb4c-323f0c663986";
export const agencyId = "58483ab3-0d75-409d-9945-a3a8bc281b9f";
export const envelope = (data: unknown) => ({
  success: true,
  data,
  requestId: "repository-ui-test",
});

export async function setup(page: Page, role = "MANAGER", theme = "light") {
  await page.addInitScript(
    ({ theme, workspaceId, agencyId }) => {
      localStorage.setItem("brandhub-lang", "vi");
      localStorage.setItem("vite-ui-theme", theme);
      localStorage.setItem("brandhub_current_agency_id", agencyId);
      localStorage.setItem(
        "brandhub-auth",
        JSON.stringify({
          state: {
            user: {
              id: "repository-test-user",
              fullName: "Repository tester",
              email: "repository@example.test",
              role: "USER",
              workspaceId,
            },
            accessToken: "disposable-ui-test",
            refreshToken: "",
            isAuthenticated: true,
            systemRole: "USER",
          },
          version: 0,
        }),
      );
    },
    { role, theme, workspaceId, agencyId },
  );
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const data =
      path === "/api/v1/workspaces"
        ? [
            {
              id: workspaceId,
              agencyId,
              name: "Repository Workspace",
              myRole: role,
              workspaceMediaPackageId: "package-1",
              packageNegotiationStatus: "APPROVED",
              settings: {},
              createdAt: "2026-10-01T00:00:00Z",
            },
          ]
        : path === "/api/v1/agencies"
          ? [
              {
                id: agencyId,
                name: "Test Agency",
                myRole: "MEMBER",
                status: "ACTIVE",
              },
            ]
          : path.endsWith("/media-package")
            ? {
                workspaceMediaPackageId: "package-1",
                negotiationStatus: "APPROVED",
              }
            : [];
    await route.fulfill({ json: envelope(data) });
  });
}
