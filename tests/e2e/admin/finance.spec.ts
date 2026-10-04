import { expect, test, type Page } from "@playwright/test";

// FR 3.10.1 / 3.10.11 / 3.10.12 UI against mocked API responses.
const revenue = {
  asOf: "2026-10-04T04:00:00Z",
  timezone: "Asia/Ho_Chi_Minh",
  from: "2026-10-01",
  to: "2026-10-04",
  plan: null,
  mrr: 473930000,
  arr: 5687160000,
  activeSubscriptions: 457,
  totals: [
    {
      currency: "VND",
      gross: 155330000,
      refunds: 2090000,
      net: 153240000,
      subscription: 66000000,
      aiCredit: 89330000,
      successfulTransactions: 144,
    },
    {
      currency: "USD",
      gross: 10,
      refunds: 0,
      net: 10,
      subscription: 0,
      aiCredit: 10,
      successfulTransactions: 1,
    },
  ],
  plans: [
    {
      plan: "BASIC",
      displayName: "Basic",
      priceMonthly: 490000,
      subscribers: 229,
      mrr: 112210000,
    },
    {
      plan: "PRO",
      displayName: "Pro",
      priceMonthly: 990000,
      subscribers: 160,
      mrr: 158400000,
    },
  ],
  daily: ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"].map(
    (date, i) => ({
      date,
      subscription: 10000000 * (i + 1),
      aiCredit: 5000000,
    }),
  ),
  transactions: [
    {
      id: "t1",
      customerName: "Võ Đức Dũng",
      customerEmail: "dung@example.test",
      type: "UPGRADE_PLAN",
      reference: "PLAN:PRO",
      amount: 990000,
      currency: "VND",
      status: "COMPLETED",
      payosTxId: "PAYOS_1",
      paidAt: "2026-10-03T10:00:00Z",
    },
    {
      id: "t2",
      customerName: "Đặng Hoài Linh",
      customerEmail: "linh@example.test",
      type: "BUY_CREDIT",
      reference: "CREDIT:10000",
      amount: 500000,
      currency: "VND",
      status: "REFUNDED",
      payosTxId: "PAYOS_2",
      paidAt: "2026-10-02T10:00:00Z",
    },
  ],
};

async function mockApi(
  page: Page,
  handle: (path: string, method: string, url: URL, body: unknown) => unknown,
) {
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "en");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "22222222-2222-2222-2222-222222222222",
            name: "Admin",
            role: "ADMIN",
          },
          accessToken: "test-access",
          isAuthenticated: true,
          systemRole: "ADMIN",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const result = handle(
      url.pathname,
      route.request().method(),
      url,
      route.request().postDataJSON(),
    );
    if (result instanceof Response) {
      await route.fulfill({ status: result.status, json: await result.json() });
      return;
    }
    const data =
      result ??
      (url.pathname === "/api/v1/users/me"
        ? { role: "ADMIN", fullName: "Admin" }
        : []);
    await route.fulfill({ json: { success: true, data } });
  });
}

test("revenue shows MRR, receipts split, other currencies and refunded payments", async ({
  page,
}) => {
  const requests: URL[] = [];
  await mockApi(page, (path, _method, url) => {
    if (path === "/api/v1/admin/revenue") {
      requests.push(url);
      return revenue;
    }
  });
  await page.goto("/admin?view=revenue");
  await expect(
    page.getByRole("region", { name: "MRR", exact: true }),
  ).toContainText("473,930,000");
  await expect(
    page.getByRole("region", { name: "Net receipts" }),
  ).toContainText("153,240,000");
  await expect(
    page.getByText("USD receipts are reported separately"),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "PRO plan" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "10,000 AI Credits" }),
  ).toBeVisible();
  await expect(page.getByText("Refunded", { exact: true })).toBeVisible();
  expect(requests[0].searchParams.get("timezone")).toBe("Asia/Ho_Chi_Minh");
  expect(requests[0].searchParams.get("from")).toMatch(/-01$/);

  const year = page.waitForRequest(
    (r) =>
      r.url().includes("/admin/revenue") &&
      new URL(r.url()).searchParams.get("from")?.endsWith("-01-01") === true,
  );
  await page.getByRole("button", { name: "This year" }).click();
  await year;
});

test("report export shows MSG122 instead of creating an empty file", async ({
  page,
}) => {
  await mockApi(page, (path, method) => {
    if (path === "/api/v1/admin/reports" && method === "POST")
      return new Response(
        JSON.stringify({ success: false, error: { code: "NO_DATA_IN_RANGE" } }),
        { status: 422 },
      );
  });
  await page.goto("/admin?view=reports");
  await page.getByLabel("From").fill("2025-01-01");
  await page.getByLabel("To").fill("2025-01-31");
  await page.getByRole("button", { name: "Download PDF" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "No data in the selected date range",
  );
});

test("composer requires a plan for BY_PLAN, sends trimmed content and maps a past schedule to MSG45", async ({
  page,
}) => {
  const bodies: Record<string, unknown>[] = [];
  let fail = false;
  await mockApi(page, (path, method, _url, body) => {
    if (path === "/api/v1/admin/notifications/plans")
      return [{ name: "PRO", displayName: "Pro" }];
    if (path === "/api/v1/admin/notifications/audience-count")
      return { count: 160 };
    if (path === "/api/v1/admin/notifications" && method === "POST") {
      bodies.push(body as Record<string, unknown>);
      if (fail)
        return new Response(
          JSON.stringify({
            success: false,
            error: { code: "NOTIFICATION_SCHEDULE_INVALID" },
          }),
          { status: 400 },
        );
      return { id: "n1" };
    }
    if (path === "/api/v1/admin/notifications")
      return { items: [], page: 1, size: 10, total: 0 };
  });
  await page.goto("/admin?view=email");
  await expect(page.getByText("No notifications yet")).toBeVisible();
  await page.getByRole("button", { name: "Compose notification" }).click();
  await page
    .locator('input[maxlength="200"]')
    .fill("  Scheduled maintenance  ");
  await page
    .locator("textarea")
    .fill("BrandHub will be down from 23:00 to 23:30.");
  await page.getByText("By plan", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Send now" })).toBeDisabled();
  await page.locator("label", { hasText: /^Pro$/ }).locator("input").check();
  await expect(page.getByText("About 160 recipients")).toBeVisible();
  await page.getByRole("button", { name: "Send now" }).click();
  await expect(page.getByText("Notification sent.")).toBeVisible();
  expect(bodies[0]).toMatchObject({
    title: "Scheduled maintenance",
    targetType: "BY_PLAN",
    targetValues: ["PRO"],
    action: "SEND_NOW",
  });

  fail = true;
  await page.getByRole("button", { name: "Compose notification" }).click();
  await page.locator('input[maxlength="200"]').fill("Scheduled maintenance");
  await page
    .locator("textarea")
    .fill("BrandHub will be down from 23:00 to 23:30.");
  await page.locator('input[type="datetime-local"]').fill("2020-01-01T10:00");
  await page.getByRole("button", { name: "Schedule" }).click();
  await expect(page.getByRole("alert")).toContainText("invalid or in the past");
});

for (const theme of ["light", "dark"]) {
  test(`revenue ${theme} has no horizontal overflow on mobile`, async ({
    page,
  }, info) => {
    await mockApi(page, (path) =>
      path === "/api/v1/admin/revenue" ? revenue : undefined,
    );
    await page.addInitScript(
      (value) => localStorage.setItem("vite-ui-theme", value),
      theme,
    );
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/admin?view=revenue");
    await expect(
      page.getByRole("region", { name: "MRR", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`revenue-${theme}.png`),
      fullPage: true,
    });
  });
}
