import { expect, test, type Page } from "@playwright/test";

const base = "/api/v1/billing/agencies/agency-1/invoices";
const order = {
  id: "order-1",
  agencyId: "agency-1",
  payerUserId: "u1",
  kind: "SUBSCRIPTION",
  status: "FULFILLED",
  planCode: "PLUS",
  amount: "9007199254740993",
  currency: "VND",
  createdAt: "2026-10-20T09:37:56Z",
  paidAt: "2026-10-20T09:38:00Z",
  fulfilledAt: "2026-10-20T09:38:01Z",
  expiresAt: "2026-10-20T10:07:56Z",
  periodStart: "2026-10-20T09:38:00Z",
  periodEnd: "2026-11-20T09:38:00Z",
  transferContent: "BHORDER1",
  receiptAvailable: true,
};
const ok = (data: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data }),
});
async function setup(page: Page, role = "OWNER") {
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "vi");
    localStorage.setItem("brandhub_current_agency_id", "agency-1");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "u1",
            name: "Tester",
            email: "test@example.test",
            role: "USER",
          },
          accessToken: "test-history-token",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/v1/agencies")
      return route.fulfill(
        ok([
          {
            id: "agency-1",
            name: "Test Agency",
            ownerId: "u1",
            myRole: role,
            status: "ACTIVE",
          },
        ]),
      );
    if (path === "/api/v1/users/me")
      return route.fulfill(ok({ userId: "u1", role: "USER" }));
    if (path.endsWith("/subscription"))
      return route.fulfill(
        ok({ planCode: "PLUS", status: "ACTIVE", currentPeriodEnd: null }),
      );
    return route.fulfill(ok([]));
  });
}

test("history uses actual orders, cursor filters, details, SePay lookup and receipt", async ({
  page,
}) => {
  await setup(page);
  const urls: string[] = [];
  let providerCalls = 0;
  await page.route(`**${base}*`, (route) => {
    const url = new URL(route.request().url());
    urls.push(url.search);
    return route.fulfill(
      ok({
        items: [
          {
            ...order,
            id: url.searchParams.has("cursor") ? "order-2" : "order-1",
          },
        ],
        nextCursor: url.searchParams.has("cursor") ? null : "cursor-next",
      }),
    );
  });
  await page.route(`**${base}/order-1`, (route) =>
    route.fulfill(
      ok({
        order,
        productSnapshot: '{"planCode":"PLUS"}',
        payments: [
          {
            id: "payment-1",
            amount: order.amount,
            currency: "VND",
            providerReference: "91665335",
            verificationState: "VERIFIED",
            paidAt: order.paidAt,
          },
        ],
        reviewReasons: [],
      }),
    ),
  );
  await page.route(`**${base}/order-1/sepay-transactions*`, (route) => {
    providerCalls++;
    return route.fulfill(
      ok({
        page: 1,
        hasMore: false,
        transactions: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            amount: order.amount,
            referenceNumber: "FT-EXACT",
            transactionDate: order.paidAt,
            webhookSuccess: 0,
          },
        ],
      }),
    );
  });
  await page.route(`**${base}/order-1/receipt`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: "BrandHub payment receipt",
    }),
  );
  await page.goto("/subscription/invoices");
  await expect(page.getByText("BHORDER1", { exact: true })).toBeVisible();
  await expect(
    page.getByText("9.007.199.254.740.993 VND", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tiếp", exact: true }).click();
  await expect(page.getByText("Trang 2")).toBeVisible();
  expect(urls.some((url) => url.includes("cursor=cursor-next"))).toBeTruthy();
  await page.getByRole("button", { name: "Trước", exact: true }).click();
  await page.getByRole("combobox").nth(0).selectOption("FULFILLED");
  await expect
    .poll(() => urls.some((url) => url.includes("status=FULFILLED")))
    .toBeTruthy();
  await page.getByRole("button", { name: "Chi tiết", exact: true }).click();
  await expect(page.getByText("91665335", { exact: false })).toBeVisible();
  expect(providerCalls).toBe(0);
  await page.getByRole("button", { name: "Tra cứu trên SePay" }).click();
  await expect(page.getByText("Mã tham chiếu: FT-EXACT")).toBeVisible();
  await expect(
    page.getByText("Webhook: Chưa gửi hoặc gửi thất bại"),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tải biên nhận (.txt)" }).click();
  expect((await download).suggestedFilename()).toBe(
    "brandhub-receipt-order-1.txt",
  );
});

test("history failure retries without fake data and empty is valid", async ({
  page,
}) => {
  await setup(page);
  let failed = true;
  await page.route(`**${base}*`, (route) =>
    route.fulfill(
      failed
        ? { status: 503, body: "{}" }
        : ok({ items: [], nextCursor: null }),
    ),
  );
  await page.goto("/subscription/invoices");
  await expect(page.getByRole("alert")).toContainText(
    "Không thể tải lịch sử thanh toán",
  );
  failed = false;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.getByText("Chưa có đơn thanh toán phù hợp.")).toBeVisible();
});

test("pending order has no receipt and missing SePay token leaves local detail visible", async ({
  page,
}) => {
  await setup(page);
  const pending = {
    ...order,
    status: "PENDING_PAYMENT",
    receiptAvailable: false,
    paidAt: null,
    fulfilledAt: null,
  };
  await page.route(`**${base}*`, (route) =>
    route.fulfill(ok({ items: [pending], nextCursor: null })),
  );
  await page.route(`**${base}/order-1`, (route) =>
    route.fulfill(
      ok({
        order: pending,
        productSnapshot: "{}",
        payments: [],
        reviewReasons: [],
      }),
    ),
  );
  await page.route(`**${base}/order-1/sepay-transactions*`, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: { code: "SEPAY_API_NOT_CONFIGURED" },
      }),
    }),
  );
  await page.goto("/subscription/invoices");
  await page.getByRole("button", { name: "Chi tiết", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tải biên nhận (.txt)" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Tra cứu trên SePay" }).click();
  await expect(page.getByText(/Chưa cấu hình API token SePay/)).toBeVisible();
  await expect(
    page.getByText("BrandHub chưa ghi nhận khoản tiền cho đơn này."),
  ).toBeVisible();
});

test("history fits mobile and supports dark mode and English", async ({
  page,
}) => {
  await setup(page);
  await page.route(`**${base}*`, (route) =>
    route.fulfill(ok({ items: [order], nextCursor: null })),
  );
  await page.goto("/subscription/invoices");
  await expect(page.getByText("BHORDER1", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: /^vi$/i }).click();
  await expect(
    page.getByRole("heading", { name: "Payment history" }),
  ).toBeVisible();
});

test("owner can reach payment history directly from agency dashboard sidebar", async ({
  page,
}) => {
  await setup(page);
  await page.route(`**${base}*`, (route) =>
    route.fulfill(ok({ items: [], nextCursor: null })),
  );
  await page.goto("/dashboard");
  const link = page.getByRole("link", {
    name: "Lịch sử thanh toán",
    exact: true,
  });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/subscription/invoices");
  await link.click();
  await expect(page).toHaveURL(/\/subscription\/invoices$/);
  await expect(page.getByText("Chưa có đơn thanh toán phù hợp.")).toBeVisible();
});

test("agency member does not see owner payment history sidebar entry", async ({
  page,
}) => {
  await setup(page, "MEMBER");
  await page.goto("/dashboard");
  await expect(
    page.getByRole("link", { name: "Lịch sử thanh toán", exact: true }),
  ).toHaveCount(0);
});

test("order details slide from right at one third desktop width and full mobile width", async ({
  page,
}, testInfo) => {
  await setup(page);
  await page.route(`**${base}*`, (route) =>
    route.fulfill(ok({ items: [order], nextCursor: null })),
  );
  await page.route(`**${base}/order-1`, (route) =>
    route.fulfill(
      ok({ order, productSnapshot: "{}", payments: [], reviewReasons: [] }),
    ),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/subscription/invoices");
  const trigger = page.getByRole("button", { name: "Chi tiết", exact: true });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Chi tiết", exact: true });
  await expect(drawer).toBeVisible();
  await expect
    .poll(async () => Math.round((await drawer.boundingBox())?.width || 0))
    .toBe(480);
  await expect
    .poll(async () => Math.round((await drawer.boundingBox())?.x || 0))
    .toBe(960);
  await expect(drawer.getByText("BHORDER1", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("drawer-desktop.png") });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await expect
    .poll(async () => Math.round((await drawer.boundingBox())?.width || 0))
    .toBe(375);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await expect.poll(() => drawer.evaluate((element) => {
    const channels = getComputedStyle(element).backgroundColor.match(/[0-9.]+/g)?.slice(0, 3).map(Number) || [];
    return channels.length === 3 && channels.every((value) => value < 80);
  })).toBeTruthy();
  await expect(drawer).toHaveCSS("color", "rgb(248, 250, 252)");
  await page.screenshot({
    path: testInfo.outputPath("drawer-mobile-dark.png"),
  });
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
