import { expect, test, type Page } from "@playwright/test";
import { catalogFixture } from "./catalogFixture";

const ok = (data: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data }),
});

async function setupAgency(page: Page, role: "OWNER" | "MEMBER") {
  await page.addInitScript(() => {
    window.localStorage.setItem("brandhub-lang", "vi");
    window.localStorage.setItem("brandhub_current_agency_id", "agency-1");
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "u1",
            name: "Tester",
            email: "tester@brandhub.dev",
            role: "USER",
          },
          accessToken: "mock-token",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });
  await page.route("**/api/v1/agencies**", (route) =>
    route.fulfill(
      ok([
        {
          id: "agency-1",
          name: "Test Agency",
          ownerId: "u1",
          myRole: role,
          status: "ACTIVE",
          logoUrl: null,
          bannerUrl: null,
          description: null,
        },
      ]),
    ),
  );
  await page.route("**/api/v1/workspaces**", (route) => route.fulfill(ok([])));
  await page.route("**/api/v1/users/me**", (route) =>
    route.fulfill(ok({ id: "u1", fullName: "Tester" })),
  );
  await page.route("**/api/v1/notifications**", (route) =>
    route.fulfill(ok([])),
  );
  await page.route("**/api/v1/billing/plans", (route) =>
    route.fulfill(ok(catalogFixture)),
  );
  await page.route(
    "**/api/v1/billing/agencies/agency-1/subscription",
    (route) =>
      route.fulfill(
        ok({
          planCode: "BASIC",
          status: "ACTIVE",
          currentPeriodEnd: null,
        }),
      ),
  );
}

test("catalog renders API names and changed quotas without seeded values", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  await page.route("**/api/v1/billing/plans", (route) =>
    route.fulfill(
      ok(
        catalogFixture.map((plan) =>
          plan.code === "PLUS"
            ? {
                ...plan,
                displayName: "Plus database revision",
                monthlyAiCredits: "9007199254740993",
              }
            : plan,
        ),
      ),
    ),
  );
  await page.goto("/subscription/plans");
  const plus = page.getByTestId("plan-PLUS");
  await expect(
    plus.getByRole("heading", { name: "Plus database revision" }),
  ).toBeVisible();
  await expect(
    plus.getByText("17 workspace hoạt động", { exact: true }),
  ).toBeVisible();
  await expect(
    plus.getByText("137 GB dung lượng lưu trữ", { exact: true }),
  ).toBeVisible();
  await expect(
    plus.getByText("9.007.199.254.740.993 AI credit mỗi tháng", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(plus.getByTestId("plan-price")).toContainText("490.000");
  await expect(plus.getByRole("button", { name: "Nâng cấp" })).toBeEnabled();
  await plus.getByRole("button", { name: "Nâng cấp" }).click();
  await expect(page).toHaveURL(/\/subscription\/plans$/);
  await expect(
    page.getByRole("dialog", { name: "Nâng Agency lên Plus" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("catalog failure has no seeded fallback and keyboard retry recovers", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  let isUnavailable = true;
  await page.route("**/api/v1/billing/plans", (route) =>
    route.fulfill(
      isUnavailable
        ? { status: 503, contentType: "application/json", body: "{}" }
        : ok(catalogFixture),
    ),
  );
  await page.goto("/subscription/plans");
  await expect(
    page.getByText("Không tải được danh sách gói", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("agency-plan-list")).toHaveCount(0);
  isUnavailable = false;
  await page.getByRole("button", { name: "Thử lại", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByTestId("agency-plan-list").locator("section"),
  ).toHaveCount(4);
});

test("empty catalog does not manufacture four products", async ({ page }) => {
  await setupAgency(page, "OWNER");
  await page.route("**/api/v1/billing/plans", (route) => route.fulfill(ok([])));
  await page.goto("/subscription/plans");
  await expect(
    page.getByRole("heading", { name: "Chưa có gói đăng ký" }),
  ).toBeVisible();
  await expect(page.getByTestId("agency-plan-list")).toHaveCount(0);
});

test("catalog sale state and configured checkout control the Plus action", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  await page.route("**/api/v1/billing/plans", (route) =>
    route.fulfill(
      ok(
        catalogFixture.map((plan) =>
          plan.code === "PLUS"
            ? {
                ...plan,
                isSellable: false,
                checkoutEnabled: false,
                priceMonthly: null,
              }
            : plan,
        ),
      ),
    ),
  );
  await page.goto("/subscription/plans");
  await expect(
    page.getByTestId("plan-PLUS").getByRole("button", { name: "Chưa mở bán" }),
  ).toBeDisabled();
  await expect(
    page.getByTestId("plan-PLUS").getByTestId("plan-price"),
  ).toHaveText("Chưa công bố giá");
  await expect(
    page
      .getByTestId("plan-BASIC")
      .getByRole("button", { name: "Gói hiện tại" }),
  ).toBeDisabled();
});

test("sellable Plus with unavailable provider does not offer payment", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  await page.route("**/api/v1/billing/plans", (route) =>
    route.fulfill(
      ok(
        catalogFixture.map((plan) =>
          plan.code === "PLUS" ? { ...plan, checkoutEnabled: false } : plan,
        ),
      ),
    ),
  );
  await page.goto("/subscription/plans");
  await expect(
    page
      .getByTestId("plan-PLUS")
      .getByRole("button", { name: "Thanh toán chưa sẵn sàng" }),
  ).toBeDisabled();
});

test("catalog follows light dark responsive and translated layouts", async ({
  page,
}, testInfo) => {
  await setupAgency(page, "OWNER");
  await page.goto("/subscription/plans");
  await expect(
    page
      .getByTestId("plan-PERSONAL")
      .getByText("2 không gian cá nhân", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByTestId("plan-PERSONAL").getByText(/workspace hoạt động/),
  ).toHaveCount(0);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const isDark of [false, true]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        isDark,
      );
      await expect(
        page.getByTestId("agency-plan-list").locator("section"),
      ).toHaveCount(4);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBeTruthy();
      await page.screenshot({
        path: testInfo.outputPath(
          `catalog-${width}-${isDark ? "dark" : "light"}.png`,
        ),
        fullPage: true,
        animations: "disabled",
      });
      expect(
        await page
          .getByTestId("agency-plan-list")
          .evaluate((grid) => grid.scrollWidth <= grid.clientWidth + 1),
      ).toBeTruthy();
      for (const card of await page
        .getByTestId("agency-plan-list")
        .locator("section")
        .all()) {
        expect(
          await card.evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          ),
        ).toBeTruthy();
      }
    }
  }
  await page.getByRole("button", { name: /^vi$/i }).click();
  await expect(
    page
      .getByTestId("plan-PLUS")
      .getByText("17 active workspaces", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("plan-PLUS")
      .getByText("7,777 AI credits per month", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("catalog-en-desktop.png"),
    fullPage: true,
  });
});

test("switching agencies never reuses the previous subscription status", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  const agencies = [
    {
      id: "agency-1",
      name: "Test Agency",
      ownerId: "u1",
      myRole: "OWNER",
      status: "ACTIVE",
    },
    {
      id: "agency-2",
      name: "Second Agency",
      ownerId: "u1",
      myRole: "OWNER",
      status: "ACTIVE",
    },
  ];
  await page.route("**/api/v1/agencies**", (route) =>
    route.fulfill(ok(agencies)),
  );
  await page.route("**/api/v1/agencies/agency-2", (route) =>
    route.fulfill(ok(agencies[1])),
  );
  await page.route(
    "**/api/v1/billing/agencies/agency-1/subscription",
    (route) =>
      route.fulfill(
        ok({
          planCode: "PLUS",
          status: "ACTIVE",
          currentPeriodEnd: null,
        }),
      ),
  );
  let releaseStatus: () => void = () => {};
  const statusReady = new Promise<void>((resolve) => {
    releaseStatus = resolve;
  });
  await page.route(
    "**/api/v1/billing/agencies/agency-2/subscription",
    async (route) => {
      await statusReady;
      await route.fulfill(
        ok({ planCode: "BASIC", status: "ACTIVE", currentPeriodEnd: null }),
      );
    },
  );
  await page.goto("/subscription/plans");
  await expect(
    page.getByTestId("plan-PLUS").getByRole("button", { name: "Gia hạn" }),
  ).toBeEnabled();
  await expect(page.getByTestId("agency-switcher")).toHaveAttribute(
    "data-plan",
    "PLUS",
  );
  await expect(page.getByTestId("agency-plus-badge")).toBeVisible();
  await page.getByRole("button", { name: /Test Agency/ }).click();
  await page.getByRole("menuitem", { name: /Second Agency/ }).click();
  await page.getByTestId("agency-upgrade-button").click();
  await expect(page).toHaveURL(/\/subscription\/plans$/);
  await expect(
    page
      .getByTestId("plan-PLUS")
      .getByRole("button", { name: "Chưa xác định gói" }),
  ).toBeDisabled();
  await expect(page.getByTestId("agency-plus-badge")).toHaveCount(0);
  releaseStatus();
  await expect(
    page.getByTestId("plan-PLUS").getByRole("button", { name: "Nâng cấp" }),
  ).toBeEnabled();
});

test("agency owner sees diamond beside notifications and opens agency plans", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  await page.goto("/agency");
  const upgrade = page.getByTestId("agency-upgrade-button");
  await expect(upgrade).toBeVisible();
  await upgrade.click();
  await expect(page).toHaveURL(/\/subscription\/plans$/);
  await expect(page.getByTestId("agency-plan-list")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plus" })).toBeVisible();
});

test("four subscription plans distinguishes personal and agency offers", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  await page.goto("/subscription/plans");
  const catalog = page.getByTestId("agency-plan-list");
  await expect(catalog.locator("section")).toHaveCount(4);
  await expect(
    catalog.getByRole("heading", { name: "Personal" }),
  ).toBeVisible();
  await expect(catalog.getByRole("heading", { name: "Basic" })).toBeVisible();
  await expect(catalog.getByRole("heading", { name: "Plus" })).toBeVisible();
  await expect(
    catalog.getByRole("heading", { name: "Enterprise" }),
  ).toBeVisible();
  await expect(
    catalog.getByRole("button", { name: "Chưa mở bán" }),
  ).toHaveCount(2);
  await expect(
    catalog.getByRole("button", { name: "Chưa mở bán" }).nth(0),
  ).toBeDisabled();
  await expect(
    catalog.getByRole("button", { name: "Chưa mở bán" }).nth(1),
  ).toBeDisabled();
});

test("catalog stays visible when current agency subscription cannot be loaded", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  await page.route(
    "**/api/v1/billing/agencies/agency-1/subscription",
    (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: "{}",
      }),
  );
  await page.goto("/subscription/plans");
  const catalog = page.getByTestId("agency-plan-list");
  await expect(catalog.locator("section")).toHaveCount(4);
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page
      .getByTestId("plan-PLUS")
      .getByRole("button", { name: "Chưa xác định gói" }),
  ).toBeDisabled();
  await expect(
    page.getByTestId("plan-BASIC").getByRole("button", { name: "Miễn phí" }),
  ).toBeDisabled();
});

test("legacy subscription URL redirects agency owners to plans", async ({
  page,
}) => {
  const routeWarnings: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "warning" &&
      message.text().includes("No routes matched")
    ) {
      routeWarnings.push(message.text());
    }
  });
  await setupAgency(page, "OWNER");
  await page.goto("/subscription");
  await expect(page).toHaveURL(/\/subscription\/plans$/);
  await expect(page.getByTestId("agency-plan-list")).toBeVisible();
  expect(routeWarnings).toEqual([]);
});

test("agency member does not see the upgrade diamond", async ({ page }) => {
  await setupAgency(page, "MEMBER");
  await page.goto("/agency");
  await expect(page.getByTestId("agency-upgrade-button")).toHaveCount(0);
});

test("checkout remains pending until the backend reports SePay fulfillment", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  const keys: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url().endsWith("/agency-1/orders")
    ) {
      keys.push(request.headers()["idempotency-key"]);
    }
  });
  await page.route("**/api/v1/billing/agencies/agency-1/orders", (route) =>
    route.fulfill(
      ok({
        orderId: "order-1",
        planCode: "PLUS",
        status: "PENDING_PAYMENT",
        amount: "490000",
        currency: "VND",
        transferContent: "BH123",
        qrUrl: "https://example.test/qr.png",
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      }),
    ),
  );
  await page.route(
    "**/api/v1/billing/agencies/agency-1/orders/order-1",
    (route) =>
      route.fulfill(
        ok({
          orderId: "order-1",
          planCode: "PLUS",
          status: "PENDING_PAYMENT",
          amount: "490000",
          currency: "VND",
          transferContent: "BH123",
          qrUrl: "https://example.test/qr.png",
          expiresAt: new Date(Date.now() + 600000).toISOString(),
        }),
      ),
  );
  await page.goto("/subscription/plans");
  await page
    .getByTestId("plan-PLUS")
    .getByRole("button", { name: "Nâng cấp" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Nâng Agency lên Plus" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/subscription\/plans$/);
  await expect(
    page.getByRole("button", { name: "Tạo mã QR thanh toán" }),
  ).toHaveCount(0);
  await expect(page.getByTestId("payment-state")).toHaveText(
    "Đang chờ thanh toán",
  );
  await expect(page.getByText("Agency đã được nâng cấp lên Plus.")).toHaveCount(
    0,
  );
  expect(keys).toHaveLength(1);
  expect(keys[0]).toBeTruthy();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByTestId("plan-PLUS")
    .getByRole("button", { name: "Nâng cấp" })
    .click();
  await expect(page.getByTestId("payment-state")).toHaveText(
    "Đang chờ thanh toán",
  );
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
});

test("Plus owner can renew with a separate payment action and queued period disables another renewal", async ({
  page,
}) => {
  await setupAgency(page, "OWNER");
  let scheduled = false;
  let action: string | undefined;
  await page.route(
    "**/api/v1/billing/agencies/agency-1/subscription",
    (route) =>
      route.fulfill(
        ok({
          planCode: "PLUS",
          status: "ACTIVE",
          currentPeriodEnd: "2026-10-21T23:59:59+07:00",
          paidThrough: scheduled
            ? "2026-11-21T23:59:59+07:00"
            : "2026-10-21T23:59:59+07:00",
          renewalScheduled: scheduled,
        }),
      ),
  );
  await page.route("**/api/v1/billing/agencies/agency-1/orders", (route) => {
    action = route.request().postDataJSON().action;
    scheduled = true;
    return route.fulfill(
      ok({
        orderId: "renew-1",
        planCode: "PLUS",
        status: "FULFILLED",
        amount: "5000",
        currency: "VND",
        transferContent: "BHRENEW1",
        qrUrl: "https://example.test/qr.png",
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      }),
    );
  });
  await page.goto("/subscription/plans");
  await page
    .getByTestId("plan-PLUS")
    .getByRole("button", { name: "Gia hạn", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Gia hạn Agency Plus" }),
  ).toBeVisible();
  await expect.poll(() => action).toBe("RENEWAL");
  await expect(page.getByTestId("payment-state")).toHaveText("Đã ghi nhận gia hạn");
  await page.keyboard.press("Escape");
  await expect(
    page
      .getByTestId("plan-PLUS")
      .getByRole("button", { name: "Đã lên lịch gia hạn" }),
  ).toBeDisabled();
  await expect(
    page.getByText(/Credit kỳ mới được cấp khi kỳ mới bắt đầu/),
  ).toBeVisible();
});


test("QR countdown expires without confirming payment", async ({ page }) => {
  await setupAgency(page, "OWNER");
  const start = new Date("2026-10-21T06:00:00Z");
  await page.clock.install({ time: start });
  const order = {
    orderId: "countdown-order", planCode: "PLUS", status: "PENDING_PAYMENT",
    amount: "5000", currency: "VND", transferContent: "BHCOUNTDOWN",
    qrUrl: "https://example.test/qr.png",
    expiresAt: new Date(start.getTime() + 65000).toISOString(),
  };
  await page.route("**/api/v1/billing/agencies/agency-1/orders", route => route.fulfill(ok(order)));
  await page.route("**/api/v1/billing/agencies/agency-1/orders/countdown-order", route => route.fulfill(ok(order)));
  await page.goto("/subscription/plans");
  await page.getByTestId("plan-PLUS").getByRole("button", { name: "Nâng cấp" }).click();
  await expect(page.getByTestId("payment-countdown")).toBeVisible();
  await page.clock.pauseAt(new Date(start.getTime() + 30000));
  await expect(page.getByTestId("payment-countdown")).toContainText("00:35");
  await page.clock.fastForward(10000);
  await expect(page.getByTestId("payment-countdown")).toContainText("00:25");
  await page.clock.fastForward(60000);
  await expect(page.getByTestId("payment-countdown")).toContainText("00:00");
  await expect(page.getByRole("button", { name: "Tạo đơn mới" })).toBeVisible();
  await expect(page.getByRole("dialog").locator("img")).toHaveCount(0);
  await expect(page.getByTestId("payment-state")).toHaveText("Đang chờ thanh toán");
});


test("sidebar credit renders active Plus bigint balance and details", async ({ page }) => {
  await setupAgency(page, "OWNER");
  const failed = false;
  await page.route("**/api/v1/billing/agencies/agency-1/credits/summary", route => route.fulfill(failed ? {status:503,contentType:"application/json",body:JSON.stringify({success:false})} : ok({visible:true,agencyId:"agency-1",workspaceId:null,scope:"AGENCY",available:"9007199254740993",allocated:"18014398509481986",reserved:"10",expiresAt:"2026-12-01T00:00:00Z"})));
  await page.goto("/subscription/plans");
  const card = page.getByTestId("sidebar-ai-credit");

  await expect(card.getByRole("button",{name:"9.007.199.254.740.993"})).toBeVisible();
  await expect(card.getByRole("progressbar")).toHaveAttribute("aria-valuenow","50");
  await card.getByRole("button",{name:"9.007.199.254.740.993"}).click();
  await expect(card.getByText("Đang giữ cho tác vụ AI: 10")).toBeVisible();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await expect(card).toBeVisible();
});


test("credit block is hidden for agencies without active Plus", async ({page}) => {
  await setupAgency(page,"OWNER");
  await page.route("**/api/v1/billing/agencies/agency-1/credits/summary", route => route.fulfill(ok({visible:false,agencyId:"agency-1",workspaceId:null,scope:"AGENCY",available:"0",allocated:null,reserved:null,expiresAt:null})));
  await page.goto("/subscription/plans");
  await expect(page.getByTestId("agency-plan-list")).toBeVisible();
  await expect(page.getByTestId("sidebar-ai-credit")).toHaveCount(0);
});
