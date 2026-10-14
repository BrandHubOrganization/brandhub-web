import { expect, test, type Page } from "@playwright/test";

/**
 * Mail templates: Admin library (DA-1259) and the "Send email" action on the Client page (DA-1002).
 * REST is mocked with page.route, so these tests cover the browser behaviour only.
 */

const ok = (data: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data }),
});

const summary = (id: string, name: string) => ({
  id, name, subject: `Subject of ${name}`, type: "SYSTEM_DEFAULT", attachmentCount: 0, createdBy: null,
  createdAt: "2026-10-01T00:00:00Z",
});

async function seedAuth(page: Page, admin: boolean, theme = "light") {
  await page.addInitScript(([isAdmin, t]) => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem("vite-ui-theme", t as string);
    localStorage.setItem("brandhub_current_agency_id", "agency-1");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: { id: "u1", fullName: "Tester", name: "Tester", email: "t@brandhub.dev",
            role: isAdmin ? "ADMIN" : "USER", workspaceId: "workspace-1" },
          accessToken: "dev-token", refreshToken: "", isAuthenticated: true,
          systemRole: isAdmin ? "ADMIN" : "USER",
        },
        version: 0,
      }),
    );
  }, [admin, theme]);
}

test.describe("Admin system mail templates", () => {
  for (const theme of ["light", "dark"]) {
    test(`lists, creates and deletes system templates (${theme}, no horizontal overflow)`, async ({ page }) => {
      await seedAuth(page, true, theme);
      const templates = [summary("s1", "Welcome new client"), summary("s2", "Approval request")];
      const calls: { method: string; url: string; body: unknown }[] = [];
      await page.route("**/api/v1/**", async (route) => {
        const req = route.request();
        const path = new URL(req.url()).pathname;
        if (path === "/api/v1/users/me") return route.fulfill(ok({ role: "ADMIN", fullName: "Admin" }));
        if (path.startsWith("/api/v1/admin/mail-templates")) {
          let body: unknown = null;
          try { body = req.postDataJSON(); } catch { /* no body */ }
          calls.push({ method: req.method(), url: req.url(), body });
          if (req.method() === "GET" && path.endsWith("/mail-templates")) {
            return route.fulfill(ok({ content: templates, number: 0, size: 20, totalElements: templates.length, totalPages: 1 }));
          }
          if (req.method() === "POST") {
            templates.unshift(summary("s3", String((body as { name: string }).name)));
            return route.fulfill(ok({ id: "s3", ...(body as object), type: "SYSTEM_DEFAULT", attachments: [] }, 201));
          }
          if (req.method() === "DELETE") return route.fulfill(ok(null));
        }
        return route.fulfill(ok([]));
      });

      await page.goto("/admin?view=mailTemplates");
      await expect(page.getByRole("heading", { name: "System mail templates" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Welcome new client" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Approval request" })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);

      await page.getByRole("button", { name: /Create template|Create/ }).first().click();
      await page.getByLabel("Template name *").fill("Monthly report");
      await page.getByLabel("Email subject *").fill("Report {{name}}");
      await page.locator(".ProseMirror").click();
      await page.keyboard.type("Numbers inside");
      await page.getByRole("button", { name: "Save" }).click();
      await expect.poll(() => calls.some((c) => c.method === "POST")).toBeTruthy();
      expect(calls.find((c) => c.method === "POST")!.body).toMatchObject({ name: "Monthly report" });

      page.once("dialog", (d) => void d.accept());
      await page.getByRole("button", { name: /Delete/ }).first().click();
      await expect.poll(() => calls.some((c) => c.method === "DELETE")).toBeTruthy();
    });
  }

  test("a non-admin cannot reach the admin library", async ({ page }) => {
    await seedAuth(page, false);
    await page.route("**/api/v1/**", (route) => route.fulfill(ok([])));
    await page.goto("/admin?view=mailTemplates");
    await expect(page.getByRole("heading", { name: "Welcome new client" })).toHaveCount(0);
  });
});

test.describe("Client page: send email", () => {
  test("opens the send dialog prefilled with the client contact", async ({ page }) => {
    await seedAuth(page, false);
    await page.route("**/api/v1/workspaces", (route) =>
      route.fulfill(ok([{ id: "workspace-1", name: "Acme", agencyId: "agency-1", slug: "acme", ownerId: "u1",
        logoUrl: null, settings: {}, isActive: true, createdAt: new Date().toISOString(), myRole: "OWNER",
        clientProfileId: null }])),
    );
    await page.route("**/api/v1/agencies", (route) =>
      route.fulfill(ok([{ id: "agency-1", name: "Agency", ownerId: "u1", myRole: "MEMBER", status: "ACTIVE",
        createdAt: new Date().toISOString() }])),
    );
    await page.route("**/api/v1/workspaces/workspace-1/mail-quota", (route) =>
      route.fulfill(ok({ day: "2026-10-12", workspaceUsed: 0, workspaceLimit: 100, systemRemaining: 400, remainingToday: 100 })),
    );
    await page.route("**/api/v1/workspaces/workspace-1/mail-templates**", (route) =>
      route.fulfill(ok({ content: [{ id: "t1", name: "Welcome", subject: "Hi", type: "CUSTOM", attachmentCount: 0,
        createdBy: "u1", createdAt: "2026-10-01T00:00:00Z" }], number: 0, size: 20, totalElements: 1, totalPages: 1 })),
    );
    // Client service falls back to its mock data (cli-101) when the API call fails.
    await page.route("**/api/v1/workspaces/workspace-1/clients/**", (route) => route.abort());
    // The button needs a current Workspace: enter one first, then move to the Client page in-app.
    await page.goto("/workspaces/workspace-1/mail-templates");
    await expect(page.getByRole("heading", { name: "Mail templates" })).toBeVisible();
    await page.evaluate(() => {
      window.history.pushState({}, "", "/clients/cli-101");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    const send = page.getByRole("button", { name: "Send email" });
    await expect(send).toBeVisible();
    await send.click();
    await expect(page.getByRole("heading", { name: "Send email" })).toBeVisible();
    await expect(page.getByLabel("Recipients")).toHaveValue(/contact@heineken\.vn/);
  });
});
