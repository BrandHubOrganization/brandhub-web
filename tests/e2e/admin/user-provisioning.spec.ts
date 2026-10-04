import { expect, test, type Page } from "@playwright/test";

// FR 3.10.7 create user, FR 3.10.8 update user, and the public activation page.
const detail = {
  id: "77777777-7777-7777-7777-777777777777",
  email: "peer.admin@example.test",
  fullName: "Peer Admin",
  phone: null,
  bio: null,
  avatarUrl: null,
  role: "ADMIN",
  status: "ACTIVE",
  requirePasswordReset: false,
  emailVerifiedAt: "2026-10-01T00:00:00Z",
  createdAt: "2026-10-01T00:00:00Z",
  yellow: 0,
  orange: 0,
  red: 0,
  agencyOwner: false,
  currentPlan: "BASIC",
  currentPeriodEnd: "2026-11-01T00:00:00Z",
  pendingPlan: null,
  pendingEffectiveAt: null,
  rowVersion: 3,
};

async function asAdmin(
  page: Page,
  onWrite: (method: string, path: string, body: unknown) => void,
) {
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "22222222-2222-2222-2222-222222222222",
            fullName: "Admin",
            email: "admin@example.test",
          },
          isAuthenticated: true,
          systemRole: "ADMIN",
          accessToken: "test-access",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    if (method !== "GET") onWrite(method, path, route.request().postDataJSON());
    let data: unknown = [];
    if (path === "/api/v1/users/me")
      data = { role: "ADMIN", fullName: "Admin" };
    if (path === "/api/v1/admin/users" && method === "GET")
      data = {
        items: [
          {
            ...detail,
            cleanPeriodEndsAt: null,
            reactivateAt: null,
            pendingReviewId: null,
          },
        ],
        page: 1,
        size: 20,
        total: 1,
      };
    if (path === "/api/v1/admin/plans")
      data = [
        { name: "BASIC", displayName: "Basic", priceMonthly: 490000 },
        { name: "PRO", displayName: "Pro", priceMonthly: 990000 },
      ];
    if (
      path === `/api/v1/admin/users/${detail.id}` ||
      (path === "/api/v1/admin/users" && method === "POST")
    )
      data = detail;
    await route.fulfill({ json: { success: true, data } });
  });
}

test("create user requires a strong password when one is typed and sends the request", async ({
  page,
}) => {
  const writes: { method: string; path: string; body: unknown }[] = [];
  await asAdmin(page, (method, path, body) =>
    writes.push({ method, path, body }),
  );
  await page.goto("/admin?view=users");
  await page.getByRole("button", { name: "Create user" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("input").nth(0).fill("New Person");
  await dialog.locator('input[type="email"]').fill("New.Person@Example.test");
  await dialog.locator('input[type="password"]').fill("weakpass");
  await expect(
    dialog.getByRole("button", { name: "Create account" }),
  ).toBeDisabled();
  await dialog.locator('input[type="password"]').fill("");
  await dialog.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByText("Account created and activation email queued."),
  ).toBeVisible();
  expect(writes[0]).toMatchObject({
    method: "POST",
    path: "/api/v1/admin/users",
    body: {
      fullName: "New Person",
      email: "New.Person@Example.test",
      role: "USER",
      password: null,
    },
  });
});

test("editing a peer admin locks the role, keeps email read-only and needs a reason", async ({
  page,
}) => {
  const writes: { method: string; path: string; body: unknown }[] = [];
  await asAdmin(page, (method, path, body) =>
    writes.push({ method, path, body }),
  );
  await page.goto("/admin?view=users");
  await page.getByRole("button", { name: "Edit" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("You cannot change another administrator's role."),
  ).toBeVisible();
  await expect(
    dialog.getByRole("combobox", { name: "System role" }),
  ).toBeDisabled();
  await expect(
    dialog.locator('input[value="peer.admin@example.test"]'),
  ).toBeDisabled();
  const save = dialog.getByRole("button", { name: "Save changes" });
  await expect(save).toBeDisabled();
  await dialog.locator("textarea").last().fill("Ticket 42");
  await save.click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0]).toMatchObject({
    method: "PATCH",
    body: { role: "ADMIN", justification: "Ticket 42", rowVersion: 3 },
  });
  expect(writes[0].body).not.toHaveProperty("email");
});

test("activation page sets the user's own password through the link", async ({
  page,
}) => {
  const calls: string[] = [];
  await page.addInitScript(() => localStorage.setItem("brandhub-lang", "en"));
  await page.route("**/api/v1/auth/activation/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    calls.push(path);
    await route.fulfill({
      json: {
        success: true,
        data: path.endsWith("/verify")
          ? { email: "new@example.test", fullName: "New Person" }
          : null,
      },
    });
  });
  await page.goto("/activate-account?token=abc");
  await expect(
    page.getByText("set a password for new@example.test"),
  ).toBeVisible();
  const fields = page.locator('input[type="password"]');
  await fields.nth(0).fill("NoSymbol123");
  await fields.nth(1).fill("NoSymbol123");
  await page.getByRole("button", { name: "Activate account" }).click();
  await expect(
    page
      .getByText("At least 8 characters with a number and a special character.")
      .first(),
  ).toBeVisible();
  expect(calls).not.toContain("/api/v1/auth/activation/complete");
  await fields.nth(0).fill("Strong#Pass9");
  await fields.nth(1).fill("Strong#Pass9");
  await page.getByRole("button", { name: "Activate account" }).click();
  await expect(page).toHaveURL(/\/login/);
  expect(calls).toContain("/api/v1/auth/activation/complete");
});
