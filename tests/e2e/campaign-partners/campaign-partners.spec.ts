import { expect, test, type Page } from "@playwright/test";

const workspaceId = "9899990d-4740-4dfb-bb4c-323f0c663986";
const agencyId = "58483ab3-0d75-409d-9945-a3a8bc281b9f";
const campaignId = "11111111-1111-4111-8111-111111111111";
const partnerId = "22222222-2222-4222-8222-222222222222";
const linkId = "33333333-3333-4333-8333-333333333333";
const base = `/api/v1/workspaces/${workspaceId}`;
const url = `/workspaces/${workspaceId}/campaign-partners`;
const envelope = <T,>(data: T) => ({ success: true, data, requestId: "partner-e2e" });
const paged = <T,>(content: T[], number = 0, totalPages = 1) =>
  ({ content, number, size: 20, totalElements: content.length ? (totalPages - 1) * 20 + content.length : 0, totalPages });
const partner = { id: partnerId, partnerName: "Báo đối tác A", partnerType: "NEWSPAPER" };
const linked = { id: linkId, collaboratorId: partnerId, mediaCampaignId: campaignId,
  partnerName: partner.partnerName, partnerType: partner.partnerType, cooperationStatus: "CONTACTED",
  updatedBy: "manager-user", updatedByName: "Manager A", updatedAt: "2026-10-01T00:00:00Z" };

async function setup(page: Page, role: "MANAGER" | "CREATOR" | "CLIENT", approved = true) {
  await page.addInitScript(({ role, workspaceId, agencyId }) => {
    localStorage.setItem("brandhub-lang", "vi");
    localStorage.setItem("brandhub_current_agency_id", agencyId);
    localStorage.setItem("brandhub-auth", JSON.stringify({ state: {
      user: { id: "test-user", name: "Test User", email: "test@brandhub.dev", role: "USER", workspaceId },
      accessToken: `dev-token-${role.toLowerCase()}`, refreshToken: "", isAuthenticated: true, systemRole: "USER",
    }, version: 0 }));
  }, { role, workspaceId, agencyId });
  await page.route("**/api/v1/workspaces", route => route.fulfill({ json: envelope([{
    id: workspaceId, agencyId, name: "Partner Workspace", myRole: role,
    packageNegotiationStatus: approved ? "APPROVED" : "DRAFT", createdAt: linked.updatedAt,
    settings: { industry: null, timezone: "Asia/Ho_Chi_Minh", defaultPlatforms: [], reportFrequency: null },
  }]) }));
  await page.route("**/api/v1/agencies", route => route.fulfill({ json: envelope([{
    id: agencyId, name: "Partner Agency", ownerId: "owner-user", myRole: role === "CLIENT" ? null : "MEMBER",
    status: "ACTIVE", createdAt: linked.updatedAt,
  }]) }));
  await page.route(`**${base}/media-package`, route => route.fulfill({ json: envelope({
    workspaceMediaPackageId: "selection-1", workspaceId, negotiationStatus: approved ? "APPROVED" : "DRAFT",
    termsVersion: 1, mediaPackage: { id: partnerId, name: "Package", type: "BY_DURATION", durationWeeks: 4,
      isTemplate: false, agencyId }, finalTerms: { name: "Package", type: "BY_DURATION", durationWeeks: 4 },
  }) }));
  await page.route(`**${base}/media-packages`, route => route.fulfill({ json: envelope([]) }));
  await page.route(`**${base}/campaign-collaborators?*`, route => route.fulfill({ json: envelope({
    campaignId, campaignName: "Launch Campaign", canEdit: role !== "CLIENT", partners: paged([linked]),
  }) }));
  await page.route(`**${base}/collaborators?*`, route => route.fulfill({ json: envelope(paged([partner])) }));
}

test("Manager links partner and manually advances or reverses status", async ({ page }) => {
  await setup(page, "MANAGER");
  let rows: typeof linked[] = [];
  await page.route(`**${base}/campaign-collaborators?*`, route => route.fulfill({ json: envelope({
    campaignId, campaignName: "Launch Campaign", canEdit: true, partners: paged(rows),
  }) }));
  await page.route(`**${base}/campaigns/${campaignId}/collaborators`, async route => {
    expect(route.request().postDataJSON()).toEqual({ collaboratorId: partnerId });
    rows = [{ ...linked }];
    await route.fulfill({ status: 201, json: envelope(rows[0]) });
  });
  await page.route(`**${base}/campaigns/${campaignId}/collaborators/${linkId}`, async route => {
    const body = route.request().postDataJSON() as { cooperationStatus: string; expectedUpdatedAt: string };
    expect(body.expectedUpdatedAt).toBe(rows[0].updatedAt);
    rows = [{ ...rows[0], cooperationStatus: body.cooperationStatus, updatedAt: "2026-10-02T00:00:00Z" }];
    await route.fulfill({ json: envelope(rows[0]) });
  });
  await page.goto(url);
  await expect(page.getByText("Chiến dịch chưa có đối tác được gán.")).toBeVisible();
  await page.getByLabel("Chọn đối tác").selectOption(partnerId);
  await page.getByRole("button", { name: "Gán đối tác", exact: true }).click();
  const status = page.getByLabel(`Trạng thái hợp tác với ${partner.partnerName}`);
  await expect(status).toHaveValue("CONTACTED");
  await status.selectOption("NEGOTIATING");
  await expect(status).toHaveValue("NEGOTIATING");
  await status.selectOption("CONTACTED");
  await expect(status).toHaveValue("CONTACTED");
});

test("Creator accesses partner tracking without Campaign approval controls", async ({ page }) => {
  await setup(page, "CREATOR");
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Đối tác chiến dịch", exact: true })).toBeVisible();
  await expect(page.getByLabel("Chọn đối tác")).toBeVisible();
  await expect(page.getByRole("button", { name: "Duyệt phiên bản này" })).toHaveCount(0);
});

test("Client reads status without write controls or directory request", async ({ page }) => {
  await setup(page, "CLIENT");
  let directoryRequests = 0;
  page.on("request", request => { if (request.url().includes(`${base}/collaborators?`)) directoryRequests++; });
  await page.goto(url);
  await expect(page.getByRole("heading", { name: partner.partnerName })).toBeVisible();
  await expect(page.getByText("Đã liên hệ", { exact: true })).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  expect(directoryRequests).toBe(0);
});

test("No Campaign shows guidance without loading partner directory", async ({ page }) => {
  await setup(page, "MANAGER");
  await page.route(`**${base}/campaign-collaborators?*`, route => route.fulfill({ json: envelope({
    campaignId: null, campaignName: null, canEdit: true, partners: paged([]),
  }) }));
  await page.goto(url);
  await expect(page.getByText("Manager cần tạo Campaign trước khi gán đối tác.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Gán đối tác", exact: true })).toHaveCount(0);
});

test("Empty directory explains E50-08 dependency", async ({ page }) => {
  await setup(page, "MANAGER");
  await page.route(`**${base}/collaborators?*`, route => route.fulfill({ json: envelope(paged([])) }));
  await page.goto(url);
  await expect(page.getByText("Agency chưa có đối tác trong danh bạ.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Gán đối tác", exact: true })).toHaveCount(0);
});

test("Stale update shows conflict and refreshes server status", async ({ page }) => {
  await setup(page, "MANAGER");
  let conflict = false;
  await page.route(`**${base}/campaign-collaborators?*`, route => route.fulfill({ json: envelope({
    campaignId, campaignName: "Launch Campaign", canEdit: true,
    partners: paged([{ ...linked, cooperationStatus: conflict ? "CONFIRMED" : "CONTACTED" }]),
  }) }));
  await page.route(`**${base}/campaigns/${campaignId}/collaborators/${linkId}`, async route => {
    conflict = true;
    await route.fulfill({ status: 409, json: { success: false, error: { code: "COOPERATION_VERSION_CONFLICT" } } });
  });
  await page.goto(url);
  await page.getByLabel(`Trạng thái hợp tác với ${partner.partnerName}`).selectOption("LIVE");
  await expect(page.getByText("Người khác đã cập nhật đối tác này.", { exact: false })).toBeVisible();
  await expect(page.getByLabel(`Trạng thái hợp tác với ${partner.partnerName}`)).toHaveValue("CONFIRMED");
});

test("Failed list provides a working retry", async ({ page }) => {
  await setup(page, "CLIENT");
  let fail = true;
  await page.route(`**${base}/campaign-collaborators?*`, route => route.fulfill(fail
    ? { status: 403, json: { success: false, error: { code: "FORBIDDEN" } } }
    : { json: envelope({ campaignId, campaignName: "Launch Campaign", canEdit: false, partners: paged([linked]) }) }));
  await page.goto(url);
  await expect(page.getByRole("alert")).toContainText("Không thể tải hoặc lưu đối tác");
  fail = false;
  await page.getByRole("button", { name: "Tải lại" }).click();
  await expect(page.getByRole("heading", { name: partner.partnerName })).toBeVisible();
});

test("Forbidden update does not show a false successful status", async ({ page }) => {
  await setup(page, "MANAGER");
  await page.route(`**${base}/campaigns/${campaignId}/collaborators/${linkId}`, route => route.fulfill({
    status: 403, json: { success: false, error: { code: "FORBIDDEN" } },
  }));
  await page.goto(url);
  await page.getByLabel(`Trạng thái hợp tác với ${partner.partnerName}`).selectOption("LIVE");
  await expect(page.getByText("Bạn không có quyền cập nhật đối tác của chiến dịch.")).toBeVisible();
  await expect(page.getByLabel(`Trạng thái hợp tác với ${partner.partnerName}`)).toHaveValue("CONTACTED");
});

test("Partner list and Agency directory paginate independently", async ({ page }) => {
  await setup(page, "MANAGER");
  await page.route(`**${base}/campaign-collaborators?*`, route => {
    const number = Number(new URL(route.request().url()).searchParams.get("page"));
    return route.fulfill({ json: envelope({ campaignId, campaignName: "Launch Campaign", canEdit: true,
      partners: paged([{ ...linked, partnerName: `Linked page ${number + 1}` }], number, 2) }) });
  });
  await page.route(`**${base}/collaborators?*`, route => {
    const number = Number(new URL(route.request().url()).searchParams.get("page"));
    return route.fulfill({ json: envelope(paged([{ ...partner, partnerName: `Directory page ${number + 1}` }], number, 2)) });
  });
  await page.goto(url);
  const picker = page.getByRole("region", { name: "Gán đối tác của Agency" });
  await picker.getByRole("button", { name: "Trang sau" }).click();
  await expect(page.getByLabel("Chọn đối tác")).toContainText("Directory page 2");
  await expect(page.getByRole("heading", { name: "Linked page 1" })).toBeVisible();
  await page.getByRole("navigation", { name: "Phân trang đối tác" }).getByRole("button", { name: "Trang sau" }).click();
  await expect(page.getByRole("heading", { name: "Linked page 2" })).toBeVisible();
});

test("Manager stays package-gated before approval", async ({ page }) => {
  await setup(page, "MANAGER", false);
  await page.goto(url);
  await expect(page).toHaveURL(new RegExp(`/workspaces/${workspaceId}/media-package$`));
});

for (const theme of ["light", "dark"]) {
  test(`Partner tracking fits mobile in ${theme} theme`, async ({ page }, testInfo) => {
    await setup(page, "MANAGER");
    await page.addInitScript(theme => localStorage.setItem("vite-ui-theme", theme), theme);
    await page.setViewportSize({ width: 375, height: 850 });
    await page.goto(url);
    await expect(page.getByRole("heading", { name: partner.partnerName })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`partners-${theme}.png`), fullPage: true });
  });
}
