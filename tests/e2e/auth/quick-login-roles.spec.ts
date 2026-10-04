import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("brandhub-lang", "en"));
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path === "/api/v1/auth/login") data = { accessToken: "fresh-access" };
    if (path === "/api/v1/users/me")
      data = { userId: "user-id", fullName: "Dev user", role: "USER" };
    if (path === "/api/v1/workspaces")
      data = [
        {
          id: "creator-workspace",
          name: "Creator workspace",
          myRole: "CREATOR",
          packageNegotiationStatus: "APPROVED",
        },
        {
          id: "manager-workspace",
          name: "Manager workspace",
          myRole: "MANAGER",
          packageNegotiationStatus: "APPROVED",
        },
      ];
    if (
      path === "/api/v1/workspaces/manager-workspace" ||
      path === "/api/v1/workspaces/creator-workspace"
    ) {
      data = {
        id: path.split("/").at(-1),
        name: "Dev workspace",
        settings: {},
      };
    }
    await route.fulfill({ json: { success: true, data } });
  });
});

for (const [button, workspace] of [
  ["Workspace manager", "manager-workspace"],
  ["Creator", "creator-workspace"],
]) {
  test(`${button} quick login opens the workspace with its actual role`, async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/workspaces/${workspace}/dashboard$`),
    );
    const session = await page.evaluate(
      () => JSON.parse(localStorage.getItem("brandhub-auth")!).state,
    );
    expect(session.systemRole).toBe("USER");
    expect(session.accessToken).toBe("fresh-access");
  });
}

test("quick login completes 2FA before trying to load a profile", async ({
  page,
}) => {
  let profiles = 0;
  await page.route("**/api/v1/auth/login", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: { requireTwoFactor: true, twoFactorToken: "challenge" },
      },
    }),
  );
  await page.route("**/api/v1/users/me", (route) => {
    profiles++;
    return route.fulfill({ status: 401, json: { success: false } });
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "Owner", exact: true }).click();
  await expect(page).toHaveURL(/\/2fa-verify$/);
  expect(profiles).toBe(0);
  expect(
    await page.evaluate(() => sessionStorage.getItem("brandhub-2fa-token")),
  ).toBe("challenge");
});

test("a missing Manager workspace does not open one with another role", async ({
  page,
}) => {
  await page.route("**/api/v1/workspaces", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: [{ id: "creator-only", myRole: "CREATOR" }],
      },
    }),
  );
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Workspace manager", exact: true })
    .click();
  await expect(page).toHaveURL(/\/agency$/);
  await expect(page.locator("[data-sonner-toast]")).toContainText(
    "no workspace has the selected role",
  );
});
