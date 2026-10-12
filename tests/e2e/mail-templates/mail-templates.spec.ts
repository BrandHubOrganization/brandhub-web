import { expect, test, type Page, type Route } from "@playwright/test";

/**
 * Mail Template UI (FR 3.6.28-3.6.32): REST is mocked with page.route, so these tests cover the
 * browser behaviour only (render, validation, request payloads), not the backend.
 */

const WS = "workspace-1";
const API = `**/api/v1/workspaces/${WS}`;

interface Mock {
  templates: Record<string, unknown>[];
  calls: { method: string; url: string; body: unknown }[];
  quota: { remainingToday: number };
  batches: Record<string, unknown>[];
}

const ok = (data: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data }),
});

const summary = (id: string, name: string, type = "CUSTOM", extra: object = {}) => ({
  id, name, subject: `Subject of ${name}`, type, attachmentCount: 0, createdBy: "u1",
  createdAt: "2026-10-01T00:00:00Z", ...extra,
});

async function setup(page: Page, mock: Partial<Mock> = {}): Promise<Mock> {
  const state: Mock = {
    templates: mock.templates ?? [summary("t1", "Welcome"), summary("s1", "System starter", "SYSTEM_DEFAULT")],
    calls: [],
    quota: mock.quota ?? { remainingToday: 90 },
    batches: mock.batches ?? [],
  };
  await page.addInitScript(() => {
    window.localStorage.setItem("brandhub_current_agency_id", "agency-1");
    window.localStorage.setItem("brandhub-lang", "en");
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: { id: "u1", name: "Tester", email: "t@brandhub.dev", role: "USER", workspaceId: "workspace-1" },
          accessToken: "dev-token", refreshToken: "", isAuthenticated: true, systemRole: "USER",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/workspaces", (route) =>
    route.fulfill(ok([{ id: WS, name: "Acme", agencyId: "agency-1", slug: "acme", ownerId: "u1", logoUrl: null,
      settings: {}, isActive: true, createdAt: new Date().toISOString(), myRole: "CREATOR", clientProfileId: null }])),
  );
  await page.route("**/api/v1/agencies", (route) =>
    route.fulfill(ok([{ id: "agency-1", name: "Agency", ownerId: "u1", myRole: "MEMBER", status: "ACTIVE",
      createdAt: new Date().toISOString() }])),
  );
  const record = async (route: Route) => {
    const req = route.request();
    let body: unknown;
    try { body = req.postDataJSON(); } catch { body = null; }
    state.calls.push({ method: req.method(), url: req.url(), body });
    return { req, body };
  };
  await page.route(`${API}/mail-quota`, (route) =>
    route.fulfill(ok({ day: "2026-10-12", workspaceUsed: 10, workspaceLimit: 100, systemRemaining: 400,
      remainingToday: state.quota.remainingToday })),
  );
  await page.route(`${API}/mail-batches**`, async (route) => {
    const { req } = await record(route);
    const url = new URL(req.url());
    if (req.method() === "POST") return route.fulfill(ok(null));
    if (/mail-batches\/[^/]+$/.test(url.pathname)) {
      const batch = state.batches[0];
      return route.fulfill(ok({
        batch,
        deliveries: { content: [{ id: "d1", recipient: "a@example.test", recipientName: "A", status: "SENT",
          attempts: 1, lastError: null, nextAttemptAt: null, sentAt: null }], number: 0, size: 100,
          totalElements: 1, totalPages: 1 },
      }));
    }
    return route.fulfill(ok({ content: state.batches, number: 0, size: 20, totalElements: state.batches.length,
      totalPages: 1 }));
  });
  await page.route(`${API}/mail-templates**`, async (route) => {
    const { req, body } = await record(route);
    const url = new URL(req.url());
    const path = url.pathname.replace(/^.*\/mail-templates/, "");
    if (req.method() === "GET" && path === "") {
      const q = url.searchParams.get("q")?.toLowerCase();
      const content = state.templates.filter((t) => !q || String(t.name).toLowerCase().includes(q));
      return route.fulfill(ok({ content, number: 0, size: 20, totalElements: content.length, totalPages: 1 }));
    }
    if (req.method() === "POST" && path === "") {
      const created = { ...(body as object), id: "new1", workspaceId: WS, type: "CUSTOM", attachments: [],
        clonedFromId: null, createdBy: "u1", createdAt: "2026-10-12T00:00:00Z", updatedAt: "2026-10-12T00:00:00Z" };
      state.templates.unshift(summary("new1", String((body as { name: string }).name)));
      return route.fulfill(ok(created, 201));
    }
    if (req.method() === "GET") {
      return route.fulfill(ok({ id: path.slice(1), workspaceId: WS, name: "Welcome", subject: "Hi {{name}}",
        bodyHtml: "<p>Hello {{name}} about {{campaign}}</p>", type: "CUSTOM",
        attachments: [{ attachmentId: "a1", name: "brief.pdf", contentType: "application/pdf", size: 2048 }],
        clonedFromId: null, createdBy: "u1", createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z" }));
    }
    if (req.method() === "POST" && path.endsWith("/preview")) {
      return route.fulfill(ok({ subject: "Hi An", bodyHtml: "<p>Hello An about Sale</p>", missingVariables: [] }));
    }
    if (req.method() === "POST" && path.endsWith("/send-test")) return route.fulfill(ok(null));
    if (req.method() === "POST" && path.endsWith("/send")) {
      return route.fulfill(ok({ batchId: "b1", status: "QUEUED", total: 3, accepted: 2,
        rejected: [{ email: "bad", reason: "INVALID_EMAIL" }], scheduledAt: null }, 202));
    }
    if (req.method() === "DELETE") return route.fulfill(ok(null));
    return route.fulfill(ok(null));
  });
  await page.goto(`/workspaces/${WS}/mail-templates`);
  return state;
}

test.describe("Mail templates - list", () => {
  test("shows workspace and system templates with the system badge", async ({ page }) => {
    await setup(page);
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "System starter" })).toBeVisible();
    await expect(page.getByText("System", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Use template" })).toBeVisible();
  });

  test("search sends the query and the empty state is shown", async ({ page }) => {
    const mock = await setup(page);
    await page.getByLabel("Search templates by name").fill("zzz");
    await expect(page.getByText("There are no mail templates yet.")).toBeVisible();
    expect(mock.calls.some((c) => c.url.includes("q=zzz"))).toBeTruthy();
  });

  test("shows an error with retry when the list fails", async ({ page }) => {
    await setup(page);
    await page.route(`${API}/mail-templates**`, (route) => route.fulfill({ status: 500, body: "{}" }));
    await page.getByLabel("Search templates by name").fill("x");
    await expect(page.getByRole("alert")).toContainText("Could not load the mail templates.");
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  test("delete asks for confirmation and calls DELETE", async ({ page }) => {
    const mock = await setup(page);
    await page.getByRole("button", { name: "Delete" }).first().click();
    await expect(page.getByText("Delete this template?")).toBeVisible();
    await page.getByRole("button", { name: "Delete", exact: true }).last().click();
    await expect.poll(() => mock.calls.some((c) => c.method === "DELETE")).toBeTruthy();
  });
});

test.describe("Mail templates - create", () => {
  test("blocks an empty form and posts bodyHtml when valid", async ({ page }) => {
    const mock = await setup(page);
    await page.getByRole("button", { name: "Create template" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("alert")).toContainText("valid name, subject and content");
    await page.getByLabel("Template name *").fill("Promo");
    await page.getByLabel("Email subject *").fill("Big sale {{name}}");
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Hello customer");
    await page.getByRole("button", { name: "Save" }).click();
    await expect
      .poll(() => mock.calls.some((c) => c.method === "POST" && c.url.endsWith("/mail-templates")))
      .toBeTruthy();
    const post = mock.calls.find((c) => c.method === "POST" && c.url.endsWith("/mail-templates"))!;
    expect(post.body).toMatchObject({ name: "Promo", subject: "Big sale {{name}}" });
    expect(String((post.body as { bodyHtml: string }).bodyHtml)).toContain("Hello customer");
  });

  test("inserts a variable chip into the body", async ({ page }) => {
    await setup(page);
    await page.getByRole("button", { name: "Create template" }).click();
    await page.locator(".ProseMirror").click();
    await page.getByRole("button", { name: "{{name}}" }).click();
    await expect(page.locator(".ProseMirror")).toContainText("{{name}}");
  });
});

test.describe("Mail templates - send", () => {
  async function openSend(page: Page) {
    await page.getByRole("button", { name: "Send" }).first().click();
    await expect(page.getByRole("heading", { name: "Send email" })).toBeVisible();
  }

  test("parses a CSV, asks for the missing shared variable and sends", async ({ page }) => {
    const mock = await setup(page);
    await openSend(page);
    await page.getByLabel("Recipients").fill("email,name\nan@example.test,An\nbad,Bo\nbinh@example.test,Binh");
    await expect(page.getByTestId("recipient-summary")).toContainText("2 valid recipients");
    await expect(page.getByTestId("recipient-summary")).toContainText("1 invalid rows");
    await expect(page.getByText("{{campaign}}")).toBeVisible();
    const send = page.getByRole("button", { name: "Send now" });
    await expect(send).toBeDisabled();
    await page.getByLabel("{{campaign}}").fill("Sale");
    await expect(send).toBeEnabled();
    await send.click();
    await expect(page.getByTestId("send-result")).toContainText("2 of 3 emails were queued.");
    await expect(page.getByTestId("send-result")).toContainText("INVALID_EMAIL");
    const post = mock.calls.find((c) => c.method === "POST" && c.url.endsWith("/send"))!;
    expect(post.body).toMatchObject({
      recipients: [{ email: "an@example.test", name: "An" }, { email: "binh@example.test", name: "Binh" }],
      variables: { campaign: "Sale" },
      attachmentIds: ["a1"],
    });
  });

  test("lets the sender drop a default attachment", async ({ page }) => {
    const mock = await setup(page);
    await openSend(page);
    await page.getByLabel("Recipients").fill("email,name\nan@example.test,An");
    await page.getByLabel("{{campaign}}").fill("Sale");
    await page.getByLabel("brief.pdf").uncheck();
    await page.getByRole("button", { name: "Send now" }).click();
    await expect(page.getByTestId("send-result")).toBeVisible();
    const post = mock.calls.find((c) => c.method === "POST" && c.url.endsWith("/send"))!;
    expect((post.body as { attachmentIds: string[] }).attachmentIds).toEqual([]);
  });

  test("blocks send-now over the daily quota but allows scheduling", async ({ page }) => {
    await setup(page, { quota: { remainingToday: 1 } });
    await openSend(page);
    await page.getByLabel("Recipients").fill("email,name\na@example.test,A\nb@example.test,B");
    await page.getByLabel("{{campaign}}").fill("Sale");
    await expect(page.getByTestId("quota-line")).toContainText("over the daily limit");
    await expect(page.getByRole("button", { name: "Send now" })).toBeDisabled();
    const inFiveDays = new Date(Date.now() + 5 * 24 * 3600 * 1000 - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    await page.getByLabel("Schedule (optional)").fill(inFiveDays);
    await expect(page.getByRole("button", { name: "Schedule send" })).toBeEnabled();
  });

  test("rejects a schedule closer than five minutes", async ({ page }) => {
    await setup(page);
    await openSend(page);
    await page.getByLabel("Recipients").fill("email,name\na@example.test,A");
    await page.getByLabel("{{campaign}}").fill("Sale");
    const soon = new Date(Date.now() + 60 * 1000 - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    await page.getByLabel("Schedule (optional)").fill(soon);
    await expect(page.getByText("between 5 minutes and 30 days")).toBeVisible();
    await expect(page.getByRole("button", { name: "Schedule send" })).toBeDisabled();
  });

  test("preview and send-test call the API", async ({ page }) => {
    const mock = await setup(page);
    await openSend(page);
    await page.getByLabel("Recipients").fill("email,name\nan@example.test,An");
    await page.getByLabel("{{campaign}}").fill("Sale");
    await page.getByRole("button", { name: "Preview" }).click();
    await expect(page.getByTestId("mail-preview")).toContainText("Hello An about Sale");
    await page.getByRole("button", { name: "Send test to me" }).click();
    await expect.poll(() => mock.calls.some((c) => c.url.endsWith("/send-test"))).toBeTruthy();
  });

  test("recipients above 200 disable sending", async ({ page }) => {
    await setup(page);
    await openSend(page);
    const many = Array.from({ length: 201 }, (_, i) => `u${i}@example.test`).join("\n");
    await page.getByLabel("Recipients").fill(many);
    await page.getByLabel("{{campaign}}").fill("Sale");
    await expect(page.getByRole("button", { name: "Send now" })).toBeDisabled();
    await expect(page.getByTestId("recipient-summary")).toContainText("at most 200 recipients");
  });
});

test.describe("Mail batches", () => {
  const batch = {
    id: "b1", templateId: "t1", templateName: "Welcome", kind: "SEND", status: "SCHEDULED", subject: "Hi",
    total: 3, accepted: 3, rejected: 0, sent: 0, failed: 0, suppressed: 0, scheduledAt: "2026-10-20T01:00:00Z",
    createdAt: "2026-10-12T00:00:00Z", completedAt: null, sentBy: "u1", senderName: "Tester",
  };

  test("lists batches, shows recipients and cancels a scheduled one", async ({ page }) => {
    const mock = await setup(page, { batches: [batch] });
    await page.goto(`/workspaces/${WS}/mail-templates/batches`);
    await expect(page.getByText("Welcome")).toBeVisible();
    await page.getByRole("button", { name: /Welcome/ }).click();
    await expect(page.getByText("a@example.test")).toBeVisible();
    await page.getByRole("button", { name: "Cancel schedule" }).click();
    await expect
      .poll(() => mock.calls.some((c) => c.method === "POST" && c.url.endsWith("/b1/cancel")))
      .toBeTruthy();
  });

  test("shows an empty state", async ({ page }) => {
    await setup(page, { batches: [] });
    await page.goto(`/workspaces/${WS}/mail-templates/batches`);
    await expect(page.getByText("Nothing has been sent yet.")).toBeVisible();
  });
});

test.describe("Unsubscribe page (public)", () => {
  test("describes the sender, confirms and unsubscribes without logging in", async ({ page }) => {
    const calls: string[] = [];
    await page.route("**/api/v1/public/mail/unsubscribe**", async (route) => {
      calls.push(route.request().method());
      if (route.request().method() === "GET") {
        return route.fulfill(ok({ workspaceName: "Acme", maskedEmail: "a***@example.test" }));
      }
      return route.fulfill(ok(null));
    });
    await page.addInitScript(() => window.localStorage.setItem("brandhub-lang", "en"));
    await page.goto("/mail/unsubscribe?token=abc.def");
    await expect(page.getByText("Stop receiving emails from Acme at a***@example.test?")).toBeVisible();
    await page.getByRole("button", { name: "Unsubscribe" }).click();
    await expect(page.getByText("You have been unsubscribed.")).toBeVisible();
    // StrictMode may issue the describe call twice in dev; the unsubscribe itself must happen once.
    expect(calls[0]).toBe("GET");
    expect(calls.filter((m) => m === "POST")).toEqual(["POST"]);
  });

  test("shows an invalid link message", async ({ page }) => {
    await page.route("**/api/v1/public/mail/unsubscribe**", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: { code: "VALIDATION_ERROR" } }),
      }),
    );
    await page.addInitScript(() => window.localStorage.setItem("brandhub-lang", "en"));
    await page.goto("/mail/unsubscribe?token=bad");
    await expect(page.getByRole("alert")).toContainText("invalid or has been modified");
  });
});
