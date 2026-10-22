import { expect, test } from "@playwright/test";

test("admin sees all agencies, filters agency and uses admin-only detail lookup", async ({
  page,
}) => {
  const aid = "11111111-1111-1111-1111-111111111111";
  await page.addInitScript(() => {
    localStorage.setItem("brandhub-lang", "vi");
    localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "admin-1",
            name: "Admin",
            email: "admin@example.test",
            role: "ADMIN",
          },
          accessToken: "admin-test-token",
          isAuthenticated: true,
          systemRole: "ADMIN",
        },
        version: 0,
      }),
    );
  });
  const row = {
    id: "order-1",
    agencyId: aid,
    agencyName: "Agency Alpha",
    payerUserId: "payer-1",
    kind: "SUBSCRIPTION",
    status: "PENDING_PAYMENT",
    planCode: "PLUS",
    amount: "5000",
    currency: "VND",
    createdAt: "2026-10-20T09:38:00Z",
    paidAt: null,
    fulfilledAt: null,
    periodStart: null,
    periodEnd: null,
    expiresAt: "2026-10-20T10:08:00Z",
    transferContent: "BHADMIN1",
    receiptAvailable: false,
  };
  const ok = (data: unknown) => ({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, data }),
  });
  const paths: string[] = [];
  await page.route("**/api/v1/**", (route) => {
    const url = new URL(route.request().url());
    paths.push(url.pathname + url.search);
    if (url.pathname === "/api/v1/users/me")
      return route.fulfill(ok({ userId: "admin-1", role: "ADMIN" }));
    if (url.pathname === "/api/v1/admin/billing/invoices")
      return route.fulfill(ok({ items: [row], nextCursor: null }));
    if (url.pathname.endsWith("/sepay-transactions"))
      return route.fulfill(ok({ transactions: [], page: 1, hasMore: false }));
    if (url.pathname.endsWith("/invoices/order-1"))
      return route.fulfill(
        ok({
          order: row,
          productSnapshot: "{}",
          payments: [],
          reviewReasons: [],
        }),
      );
    return route.fulfill(ok([]));
  });
  await page.goto("/admin/invoices");
  await expect(
    page.getByRole("heading", { name: "Lịch sử thanh toán toàn hệ thống" }),
  ).toBeVisible();
  await expect(page.getByText("Agency Alpha", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Chi tiết", exact: true }).click();
  await page.getByRole("button", { name: "Tra cứu trên SePay" }).click();
  await expect
    .poll(() =>
      paths.some(
        (path) =>
          path ===
          `/api/v1/admin/billing/agencies/${aid}/invoices/order-1/sepay-transactions?page=1`,
      ),
    )
    .toBeTruthy();
  expect(
    paths.some((path) => path.startsWith("/api/v1/billing/agencies/")),
  ).toBeFalsy();
  await page.getByRole("button", { name: "Đóng chi tiết", exact: true }).click();
  await page.getByLabel("Lọc theo ID agency (UUID)").fill(aid);
  await page.getByRole("button", { name: "Áp dụng", exact: true }).click();
  await expect
    .poll(() =>
      paths.some((path) =>
        path.includes(`/api/v1/admin/billing/invoices?agencyId=${aid}`),
      ),
    )
    .toBeTruthy();
  await expect(page.getByRole("button", { name: "Đóng chi tiết" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: /Lịch sử thanh toán/ }).first(),
  ).toHaveAttribute("href", "/admin/invoices");
});
