import { expect, test, type Page } from "@playwright/test";

const WORKSPACE_ID = "9899990d-4740-4dfb-bb4c-323f0c663986";
const AGENCY_ID = "58483ab3-0d75-409d-9945-a3a8bc281b9f";
const TEMPLATE_ID = "11111111-1111-4111-8111-111111111111";

function envelope<T>(data: T) {
  return { success: true, data, requestId: "e2e-request" };
}

function workspace(role: "OWNER" | "CLIENT" | "MANAGER") {
  return {
    id: WORKSPACE_ID,
    name: "Launch Workspace",
    agencyId: AGENCY_ID,
    logoUrl: null,
    settings: {
      industry: null,
      timezone: "Asia/Ho_Chi_Minh",
      defaultPlatforms: [],
      reportFrequency: null,
    },
    industry: null,
    companySize: null,
    website: null,
    phone: null,
    location: null,
    description: null,
    brandColor: null,
    logoIcon: null,
    tagline: null,
    foundedYear: null,
    facebookUrl: null,
    linkedinUrl: null,
    instagramUrl: null,
    createdAt: "2026-10-01T00:00:00Z",
    myRole: role,
    clientProfileId: null,
  };
}

function agency(role: "OWNER" | "CLIENT" | "MANAGER") {
  return {
    id: AGENCY_ID,
    name: "BrandHub Agency",
    ownerId: "owner-user",
    logoUrl: null,
    description: null,
    category: null,
    companySize: null,
    website: null,
    phone: null,
    location: null,
    brandColor: null,
    logoIcon: null,
    tagline: null,
    foundedYear: null,
    facebookUrl: null,
    linkedinUrl: null,
    instagramUrl: null,
    status: "ACTIVE",
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    myRole: role === "OWNER" ? "OWNER" : role === "MANAGER" ? "MEMBER" : null,
  };
}

const template = {
  id: TEMPLATE_ID,
  name: "Growth Sprint",
  type: "BY_DURATION",
  durationWeeks: 6,
  budgetAmount: null,
  scopeDescription: "Social content planning and production.",
  isTemplate: true,
  agencyId: null,
  sourceTemplateId: null,
  availableToWorkspaces: true,
  createdBy: "admin-user",
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
};

const agencyPackage = {
  ...template,
  id: "22222222-2222-4222-8222-222222222222",
  name: "Agency Growth Sprint",
  isTemplate: false,
  agencyId: AGENCY_ID,
  sourceTemplateId: TEMPLATE_ID,
};

for (const theme of ["light", "dark"] as const) {
  test(`Owner selects a service for a structured package in ${theme}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: theme === "dark" ? 375 : 1440, height: 900 });
    await setupSession(page, "OWNER", theme);
    let submitted = false;
    await page.route(`**/api/v1/agencies/${AGENCY_ID}/media-package-custom`, async route => {
      if (route.request().method() === "GET") {
        await route.fulfill({ json: envelope([]) }); return;
      }
      const body = route.request().postDataJSON();
      expect(body.offeringDetails.deliverables).toHaveLength(1);
      expect(body.durationWeeks).toBe(6);
      expect(body.offeringDetails.maxChanges).toBeUndefined();
      expect(body.offeringDetails.deliverables[0]).toMatchObject({ serviceType: "SOCIAL_POST", quantity: 12, unit: "bài" });
      submitted = true;
      await route.fulfill({ status: 201, json: envelope({ ...agencyPackage, ...body }) });
    });
    await page.goto(`/agency/${AGENCY_ID}/media-packages`);
    await page.getByRole("button", { name: "Tạo gói từ mẫu này" }).click();
    const workArea = page.getByRole("region", { name: "Tạo gói truyền thông tùy chỉnh", exact: true });
    await workArea.getByRole("button", { name: "6", exact: true }).click();
    await expect(workArea.getByRole("checkbox")).toHaveCount(4);
    await workArea.getByRole("checkbox", { name: "Bài đăng mạng xã hội" }).check();
    await workArea.getByRole("spinbutton", { name: /^Số lượng/ }).fill("12");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    await workArea.screenshot({ path: testInfo.outputPath(`offering-${theme}.png`) });
    await workArea.getByRole("button", { name: "Tạo gói tùy chỉnh" }).click();
    await expect.poll(() => submitted).toBe(true);
    await expect(workArea).not.toBeVisible();
  });
}

test("Manager creates and edits a total-quantity Campaign draft", async ({ page }, testInfo) => {
  await setupSession(page, "MANAGER", "dark");
  await page.setViewportSize({ width: 375, height: 900 });
  const deliverables = [{ id: "e5000000-0000-4000-8000-000000000301",
    serviceType: "SOCIAL_POST", name: "Frozen posts", quantity: 1, unit: "bài" }];
  const offering = { offeringModel: "CAMPAIGN", offeringDetails: { deliverables } };
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/media-package`, route => route.fulfill({
    json: envelope({ workspaceMediaPackageId: "selection-1", workspaceId: WORKSPACE_ID,
      mediaPackage: { ...agencyPackage, ...offering }, negotiationStatus: "APPROVED",
      finalTerms: { ...agencyPackage, ...offering }, termsVersion: 3,
      approvedByAgencyAt: "2026-10-01T00:00:00Z", approvedByClientAt: "2026-10-01T00:00:00Z" }),
  }));
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/media-packages`, route =>
    route.fulfill({ json: envelope([]) }));
  let campaign: Record<string, unknown> | null = null;
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/campaigns`, async route => {
    await route.fulfill({ json: envelope(campaign ? [campaign] : []) });
  });
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/campaigns/prepare`, async route => {
    expect(route.request().method()).toBe("POST");
    campaign = { id: "draft-1", name: agencyPackage.name, status: "DRAFT", contentVersion: 1,
      packageDriven: true, timeline: "{}", deliverablePlan: deliverables, allocationPeriod: null,
      packageTermsVersion: 3, workItems: [{ id: "work-1", deliverableId: deliverables[0].id,
        name: "Frozen posts", type: "POST", dueDate: null }] };
    await route.fulfill({ json: envelope(campaign) });
  });
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/campaigns/draft-1`, async route => {
    const body = route.request().postDataJSON();
    expect(body.expectedVersion).toBe(campaign?.contentVersion);
    expect(body.workItems).toHaveLength(1);
    expect(body.workItems[0].id).toBe("work-1");
    expect(body.workItems[0].dueDate).toEqual(expect.any(String));
    campaign = { ...campaign, ...body, contentVersion: body.expectedVersion + 1 };
    await route.fulfill({ json: envelope(campaign) });
  });
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/campaigns/draft-1/tasks`, route =>
    route.fulfill({ json: envelope([{ id: "task-1", campaignWorkItemId: "work-1", status: "TODO", type: "POST", name: "Frozen posts" }]) }));
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/tasks/task-1/workflow`, route =>
    route.fulfill({ json: envelope({
      id: "task-1", workspaceId: WORKSPACE_ID, campaignId: "draft-1", status: "TODO",
      type: "POST", name: "Frozen posts", description: "Task brief", workflowRevision: 1,
      dueDate: "2026-12-01T10:00:00Z", inputReferences: [],
      allowedActions: { canEditDetail: true, canAssign: false, canStart: false },
      dates: { ready: true, timezone: "Asia/Ho_Chi_Minh" },
    }) }));
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/tasks/task-1/subtasks`, async route => {
    const view = { canManage: true, members: [{ userId: "creator-1", displayName: "Creator" }], rows: [] };
    if (route.request().method() === "GET") {
      await route.fulfill({ json: envelope(view) });
      return;
    }
    const details = route.request().postDataJSON();
    expect(details.name).toBe("Prepare visuals");
    await route.fulfill({ json: envelope({ ...view, rows: [{
      subtask: { ...details, id: "subtask-1", status: "TODO" },
      assigneeName: "Creator", supervisorName: null, allowedStatuses: [],
    }] }) });
  });
  await page.goto(`/workspaces/${WORKSPACE_ID}/campaigns`);
  await page.getByRole("button", { name: "Chỉnh sửa kế hoạch" }).click();
  await page.getByLabel("Tên chiến dịch").fill("November plan");
  await page.getByLabel("Chiến lược triển khai", { exact: true }).selectOption("0");
  await expect(page.getByRole("button", { name: "Thêm đầu việc", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Ngày bắt đầu", { exact: true })).not.toHaveValue("");
  await page.getByLabel("Ngày kết thúc", { exact: true }).fill("2026-12-01");
  const workItems = page.getByRole("region", { name: "Đầu việc dự kiến" });
  await workItems.locator("summary").click();
  await expect(workItems.getByText("Task brief", { exact: true })).toBeVisible();
  await workItems.getByRole("button", { name: "Thêm công việc con" }).click();
  await workItems.getByLabel("Tên công việc con").fill("Prepare visuals");
  await workItems.getByRole("combobox", { name: "Người phụ trách", exact: true }).selectOption("creator-1");
  await workItems.getByRole("button", { name: "Lưu", exact: true }).click();
  await expect(workItems.getByText("Prepare visuals", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Tên chiến dịch")).toHaveValue("November plan");
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  await expect(page.getByRole("heading", { name: "November plan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Triển khai campaign" })).toHaveCount(0);
  await page.getByRole("button", { name: "Chỉnh sửa kế hoạch" }).click();
  await page.getByLabel("Tên chiến dịch").fill("Revised plan");
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  await expect(page.getByRole("heading", { name: "Revised plan" })).toBeVisible();
  await expect(page.getByText("Phiên bản 3 · Gói phiên bản 3")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("campaign-mobile-dark.png"), fullPage: true });
});

for (const initiallyAssigned of [true, false]) test(`Manager changes task settings independently (assigned: ${initiallyAssigned})`, async ({ page }) => {
  await setupSession(page, "MANAGER");
  await setupCampaignView(page, false);
  const deliverable = { id: "service-1", serviceType: "SOCIAL_POST", name: "Social posts", quantity: 1, unit: "bài" };
  const planned = { id: "work-1", deliverableId: deliverable.id, name: "Draft post", type: "POST", dueDate: "2026-12-01T10:00:00Z" };
  const workspace = `**/api/v1/workspaces/${WORKSPACE_ID}`;
  const taskPath = `${workspace}/tasks/task-1`;
  await page.route(`${workspace}/campaigns`, route => route.fulfill({ json: envelope([{
    id: "draft-1", name: "Supervisor test plan", status: "IN_PROGRESS", contentVersion: 1, packageDriven: true,
    deliverablePlan: [deliverable], workItems: [planned], timeline: "{}", packageTermsVersion: 3,
  }]) }));
  await page.route(`${workspace}/campaigns/draft-1/tasks`, route => route.fulfill({
    json: envelope([{ id: "task-1", campaignWorkItemId: planned.id, name: planned.name, status: "TODO", type: "POST" }]),
  }));
  let task = {
    id: "task-1", workspaceId: WORKSPACE_ID, campaignId: "draft-1", name: planned.name, type: "POST",
    status: "TODO", description: "Task brief", dueDate: planned.dueDate, inputReferences: [],
    assigneeId: initiallyAssigned ? "manager-1" : null, assigneeName: initiallyAssigned ? "Quản lý A" : null, supervisorId: "manager-1" as string | null,
    supervisorName: "Quản lý A" as string | null, workflowRevision: 0, requiresClientApproval: false,
    allowedActions: { canEditDetail: true, canAssign: true, canStart: false },
    dates: { ready: true, timezone: "Asia/Ho_Chi_Minh" },
  };
  await page.route(`${taskPath}/workflow`, route => route.fulfill({ json: envelope(task) }));
  await page.route(`${taskPath}/supervisor-options`, route => route.fulfill({
    json: envelope([{ userId: "manager-1", displayName: "Quản lý A" }, { userId: "reviewer-1", displayName: "Người B" }, { userId: "creator-2", displayName: "Người C" }]),
  }));
  await page.route(`${taskPath}/member-options`, route => route.fulfill({
    json: envelope([{ userId: "manager-1", displayName: "Quản lý A" }, { userId: "reviewer-1", displayName: "Người B" }, { userId: "creator-2", displayName: "Người C" }]),
  }));
  await page.route(`${taskPath}/field`, route => {
    const change = route.request().postDataJSON();
    if (change.field === "requiresClientApproval") {
      expect(change).toEqual({ field: "requiresClientApproval", value: true, expectedRevision: task.workflowRevision });
      expect(task.assigneeId).toBe(initiallyAssigned ? "manager-1" : null);
      task = { ...task, requiresClientApproval: true, workflowRevision: task.workflowRevision + 1 };
      return route.fulfill({ json: envelope(task) });
    }
    expect(change).toEqual({ field: "supervisorId", value: change.value, expectedRevision: task.workflowRevision });
    task = { ...task, supervisorId: change.value, supervisorName: change.value === "manager-1" ? "Quản lý A" : "Người B", workflowRevision: task.workflowRevision + 1 };
    return route.fulfill({ json: envelope(task) });
  });
  await page.route(`${taskPath}/assign`, route => {
    const { assigneeId } = route.request().postDataJSON();
    expect(["creator-2", "manager-1"]).toContain(assigneeId);
    const assignedToManager = assigneeId === "manager-1";
    task = { ...task, assigneeId, assigneeName: assignedToManager ? "Quản lý A" : "Người C", workflowRevision: task.workflowRevision + 1,
      allowedActions: { ...task.allowedActions, canStart: assignedToManager } };
    return route.fulfill({ json: envelope(task) });
  });
  await page.route(`${taskPath}/start`, route => {
    expect(route.request().postDataJSON()).toEqual({ expectedRevision: task.workflowRevision });
    task = { ...task, status: "IN_PROGRESS", workflowRevision: task.workflowRevision + 1,
      allowedActions: { ...task.allowedActions, canStart: false, canAssign: false } };
    return route.fulfill({ json: envelope(task) });
  });
  let status = "TODO";
  const subtaskView = () => ({ canManage: true, members: [], rows: [{
    subtask: { id: "child-1", name: "Chuẩn bị hình ảnh", status, assigneeId: "creator-1", dueDate: planned.dueDate },
    assigneeName: "Người A", allowedStatuses: status === "TODO" ? ["IN_PROGRESS", "IN_REVIEW", "FINISHED", "CANCELLED"] : ["TODO", "FINISHED"],
  }] });
  await page.route(`${taskPath}/subtasks`, route => route.fulfill({ json: envelope(subtaskView()) }));
  await page.route(`${taskPath}/subtasks/child-1/status`, route => {
    expect(route.request().postDataJSON()).toEqual({ status: "IN_PROGRESS" });
    status = "IN_PROGRESS";
    return route.fulfill({ json: envelope(subtaskView()) });
  });

  await page.goto(`/workspaces/${WORKSPACE_ID}/campaigns?tab=plan`);
  await page.getByText("Draft post", { exact: true }).click();
  const supervisor = page.getByRole("button", { name: "Chỉnh sửa Người giám sát", exact: true });
  const assignee = page.getByRole("button", { name: "Chỉnh sửa Người thực hiện", exact: true });
  const clientApproval = page.getByRole("button", { name: "Chỉnh sửa Cần khách hàng duyệt", exact: true });
  const initialAssignee = initiallyAssigned ? "Quản lý A" : "Chưa phân công";
  await expect(clientApproval).toHaveText("Không");
  await clientApproval.click();
  await page.getByRole("menuitem", { name: "Có", exact: true }).click();
  await expect(clientApproval).toHaveText("Có");
  await expect(supervisor).toHaveText("Quản lý A");
  await expect(assignee).toHaveText(initialAssignee);
  await supervisor.click();
  await page.getByRole("menuitem", { name: "Người B" }).click();
  await expect(supervisor).toHaveText("Người B");
  await expect(assignee).toHaveText(initialAssignee);
  await assignee.click();
  await page.getByRole("menuitem", { name: "Người C" }).click();
  await expect(assignee).toHaveText("Người C");
  await expect(supervisor).toHaveText("Người B");
  await supervisor.click();
  await page.getByRole("menuitem", { name: "Quản lý A" }).click();
  await expect(supervisor).toHaveText("Quản lý A");
  const statusButton = page.getByRole("button", { name: "Đổi trạng thái của Chuẩn bị hình ảnh" });
  await statusButton.click();
  await expect(page.getByRole("menuitem", { name: "Đã hủy" }).locator("span").first()).toHaveClass(/bg-rose/);
  await page.getByRole("menuitem", { name: "Đang thực hiện" }).click();
  await expect(statusButton.getByText("Đang thực hiện")).toHaveClass(/bg-sky/);
  const taskStatus = page.getByRole("button", { name: "Đổi trạng thái công việc", exact: true });
  await taskStatus.click();
  await expect(page.getByRole("menuitem", { name: "Bắt đầu làm" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await assignee.click();
  await page.getByRole("menuitem", { name: "Quản lý A" }).click();
  await expect(assignee).toHaveText("Quản lý A");
  await taskStatus.click();
  await page.getByRole("menuitem", { name: "Bắt đầu làm" }).click();
  await expect(taskStatus).toHaveText("Đang làm");
});

test("Draft delivery tab shows generated tasks and the approval step", async ({ page }) => {
  await setupSession(page, "CLIENT");
  await setupCampaignView(page, false);
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/campaigns/draft-1/tasks`, route =>
    route.fulfill({ json: envelope([{ id: "task-1", name: "Prepared draft task", type: "POST", status: "TODO" }]) }));
  await page.goto(`/workspaces/${WORKSPACE_ID}/campaigns?tab=delivery`);
  const delivery = page.getByRole("tabpanel");
  await expect(delivery.getByText("Prepared draft task")).toBeVisible();
  await expect(delivery.getByRole("button", { name: "Bắt đầu campaign" })).toHaveCount(0);
  await delivery.getByRole("button", { name: "Biên bản & Lịch sử" }).click();
  await expect(page.getByRole("tab", { name: /Biên bản & Lịch sử/ })).toHaveAttribute("aria-selected", "true");
});

test("Client can view but cannot edit Campaign; desktop light", async ({ page }, testInfo) => {
  await setupSession(page, "CLIENT");
  await setupCampaignView(page, false);
  await page.goto(`/workspaces/${WORKSPACE_ID}/campaigns`);
  await expect(page.getByRole("heading", { name: "Approved-source plan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Chỉnh sửa kế hoạch" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tạo Campaign nháp" })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("campaign-client-light.png"), fullPage: true });
});

test("Manager cannot silently convert a legacy monthly package", async ({ page }) => {
  await setupSession(page, "MANAGER");
  await setupCampaignView(page, true);
  await page.goto(`/workspaces/${WORKSPACE_ID}/campaigns`);
  await expect(page.getByRole("alert")).toContainText("Không tự chuyển sản lượng tháng");
  await expect(page.getByRole("button", { name: "Tạo Campaign nháp" })).toHaveCount(0);
});

test("Stale Campaign save preserves Manager input", async ({ page }) => {
  await setupSession(page, "MANAGER");
  await setupCampaignView(page, false);
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/campaigns/draft-1`, route =>
    route.fulfill({ status: 409, json: { success: false, error: { code: "CAMPAIGN_VERSION_CONFLICT" } } }));
  await page.goto(`/workspaces/${WORKSPACE_ID}/campaigns`);
  await page.getByRole("button", { name: "Chỉnh sửa kế hoạch" }).click();
  await page.getByLabel("Tên chiến dịch").fill("Unsaved input");
  await page.getByRole("button", { name: "Lưu nháp" }).click();
  await expect(page.getByText("Kế hoạch đã thay đổi.", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Tên chiến dịch")).toHaveValue("Unsaved input");
});

async function setupCampaignView(page: Page, legacy: boolean) {
  const deliverables = [{ id: "e5000000-0000-4000-8000-000000000301", serviceType: "SOCIAL_POST",
    name: "Frozen posts", quantity: 12, unit: "posts" }];
  const offering = { offeringModel: legacy ? "RETAINER" : "CAMPAIGN", offeringDetails: { deliverables } };
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/media-package`, route => route.fulfill({
    json: envelope({ workspaceMediaPackageId: "selection-1", workspaceId: WORKSPACE_ID,
      mediaPackage: { ...agencyPackage, ...offering }, negotiationStatus: "APPROVED",
      finalTerms: { ...agencyPackage, ...offering }, termsVersion: 3 }),
  }));
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/media-packages`, route => route.fulfill({ json: envelope([]) }));
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/campaigns`, route => route.fulfill({
    json: envelope(legacy ? [] : [{ id: "draft-1", name: "Approved-source plan", status: "DRAFT", contentVersion: 1,
      deliverablePlan: deliverables, workItems: [], timeline: "{}", packageTermsVersion: 3 }]),
  }));
}

async function setupSession(
  page: Page,
  role: "OWNER" | "CLIENT" | "MANAGER",
  theme: "light" | "dark" = "light",
) {
  await page.addInitScript(
    ({ activeRole, workspaceId, agencyId, theme }) => {
      localStorage.setItem("brandhub-lang", "vi");
      localStorage.setItem("vite-ui-theme", theme);
      localStorage.setItem("brandhub_current_agency_id", agencyId);
      localStorage.setItem(
        "brandhub-auth",
        JSON.stringify({
          state: {
            user: {
              id: "test-user",
              name:
                activeRole === "CLIENT"
                  ? "Client User"
                  : activeRole === "MANAGER"
                    ? "Manager User"
                    : "Owner User",
              email: "test@brandhub.dev",
              role: "USER",
              workspaceId,
            },
            accessToken: `dev-token-${activeRole.toLowerCase()}`,
            refreshToken: "",
            isAuthenticated: true,
            systemRole: "USER",
          },
          version: 0,
        }),
      );
    },
    {
      activeRole: role,
      workspaceId: WORKSPACE_ID,
      agencyId: AGENCY_ID,
      theme,
    },
  );
  await page.route("**/api/v1/workspaces", (route) =>
    route.fulfill({ json: envelope([workspace(role)]) }),
  );
  await page.route("**/api/v1/agencies", (route) =>
    route.fulfill({ json: envelope([agency(role)]) }),
  );
  await page.route("**/api/v1/media-package-templates", (route) =>
    route.fulfill({ json: envelope([template]) }),
  );
}

test("Client selects an available Agency package and sees the effective terms", async ({
  page,
}) => {
  await setupSession(page, "CLIENT");
  let selected = false;
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-packages`,
    (route) => route.fulfill({ json: envelope([agencyPackage]) }),
  );
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-package`,
    async (route) => {
      if (route.request().method() === "POST") {
        selected = true;
        await route.fulfill({
          status: 201,
          json: envelope({ workspaceMediaPackageId: "selection-1" }),
        });
        return;
      }
      if (!selected) {
        await route.fulfill({ status: 404, json: { success: false } });
        return;
      }
      await route.fulfill({
        json: envelope({
          workspaceMediaPackageId: "selection-1",
          workspaceId: WORKSPACE_ID,
          mediaPackage: agencyPackage,
          negotiationStatus: "DRAFT",
          finalTerms: {
            name: "Negotiated Growth Sprint",
            type: "BY_DURATION",
            durationWeeks: 8,
            budgetAmount: null,
            scopeDescription: "Negotiated content production scope.",
          },
          termsVersion: 1,
          approvedByAgencyAt: null,
          approvedByClientAt: null,
          createdAt: "2026-10-01T00:00:00Z",
          updatedAt: "2026-10-01T00:00:00Z",
        }),
      });
    },
  );

  await page.goto(`/workspaces/${WORKSPACE_ID}/media-package`);
  await expect(
    page.getByRole("heading", { name: "Chọn gói truyền thông", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Workspace chưa chọn gói truyền thông"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Chọn gói này" }).click();
  await expect(page.getByText("Phiên bản điều khoản 1")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Negotiated Growth Sprint" }),
  ).toBeVisible();
  await expect(page.getByText("8 tuần")).toBeVisible();
  await expect(page.getByText("Đã chọn", { exact: true })).toBeVisible();
});

test("Owner creates a validated custom package from Agency management", async ({
  page,
}) => {
  await setupSession(page, "OWNER");
  await page.route(
    `**/api/v1/agencies/${AGENCY_ID}/media-package-custom`,
    async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ json: envelope([]) });
        return;
      }
      const request = route.request().postDataJSON() as {
        sourceTemplateId: string;
        name: string;
        durationWeeks: number;
      };
      expect(request).toMatchObject({
        sourceTemplateId: TEMPLATE_ID,
        name: "Client Launch Package",
        durationWeeks: 8,
      });
      await route.fulfill({
        status: 201,
        json: envelope({
          ...template,
          id: "22222222-2222-4222-8222-222222222222",
          name: request.name,
          durationWeeks: request.durationWeeks,
          isTemplate: false,
          agencyId: AGENCY_ID,
          sourceTemplateId: TEMPLATE_ID,
          availableToWorkspaces: true,
        }),
      });
    },
  );

  await page.route(
    `**/api/v1/agencies/${AGENCY_ID}/media-packages/*/availability`,
    async (route) => {
      const request = route.request().postDataJSON() as { available: boolean };
      expect(request.available).toBe(false);
      await route.fulfill({
        json: envelope({
          ...agencyPackage,
          name: "Client Launch Package",
          durationWeeks: 8,
          availableToWorkspaces: false,
        }),
      });
    },
  );

  await page.goto(`/agency/${AGENCY_ID}/media-packages`);
  await page.getByRole("button", { name: "Tạo gói từ mẫu này" }).click();
  await page.getByLabel("Tên gói").fill("Client Launch Package");
  await page.getByLabel("Thời lượng (tuần)").fill("8");
  await page.getByRole("checkbox", { name: "Bài đăng mạng xã hội" }).check();
  await page.getByRole("button", { name: "Tạo gói tùy chỉnh" }).last().click();
  await expect(
    page.getByRole("heading", { name: "Client Launch Package" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Gói tùy chỉnh của Agency" }),
  ).toBeVisible();
  await expect(page.getByText("Đang khả dụng")).toBeVisible();
  await page.getByRole("button", { name: "Ẩn khỏi Workspace" }).click();
  await expect(page.getByText("Đã ẩn", { exact: true })).toBeVisible();
});

test("Client is hard-gated to /media-package when workspace has no package selected", async ({
  page,
}) => {
  await setupSession(page, "CLIENT");
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-packages`,
    (route) => route.fulfill({ json: envelope([agencyPackage]) }),
  );
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-package`,
    (route) => route.fulfill({ status: 404, json: { success: false } }),
  );

  // Attempting to visit /dashboard without selecting package
  await page.goto(`/workspaces/${WORKSPACE_ID}/dashboard`);
  // Must automatically redirect to /media-package
  await expect(page).toHaveURL(
    new RegExp(`/workspaces/${WORKSPACE_ID}/media-package$`),
  );
  // Sidebar displays Media Package and Chat for Client under Hard Gate
  await expect(
    page.getByRole("link", { name: /Gói dịch vụ|Gói truyền thông/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Trao đổi|Tin nhắn|Chat/i }),
  ).toBeVisible();
});

test("Utility redirect /media-package routes to workspace media-package", async ({
  page,
}) => {
  await setupSession(page, "CLIENT");
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-packages`,
    (route) => route.fulfill({ json: envelope([agencyPackage]) }),
  );
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-package`,
    (route) => route.fulfill({ status: 404, json: { success: false } }),
  );

  await page.goto(`/media-package`);
  await expect(page).toHaveURL(
    new RegExp(`/workspaces/${WORKSPACE_ID}/media-package$`),
  );
});

test("Manager can access media-package in workspace", async ({ page }) => {
  await setupSession(page, "MANAGER");
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-packages`,
    (route) => route.fulfill({ json: envelope([agencyPackage]) }),
  );
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-package`,
    (route) => route.fulfill({ status: 404, json: { success: false } }),
  );

  await page.goto(`/workspaces/${WORKSPACE_ID}/media-package`);
  await expect(page).toHaveURL(
    new RegExp(`/workspaces/${WORKSPACE_ID}/media-package$`),
  );
  await expect(
    page.getByRole("heading", { name: "Chọn gói truyền thông", exact: true }),
  ).toBeVisible();
});

for (const width of [375, 768, 1440]) {
  for (const theme of ["light", "dark"] as const) {
    test(`Media Package is responsive in ${theme} at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await setupSession(page, "CLIENT", theme);
      await page.route(
        `**/api/v1/workspaces/${WORKSPACE_ID}/media-packages`,
        (route) => route.fulfill({ json: envelope([agencyPackage]) }),
      );
      await page.route(
        `**/api/v1/workspaces/${WORKSPACE_ID}/media-package`,
        (route) => route.fulfill({ status: 404, json: { success: false } }),
      );

      await page.goto(`/workspaces/${WORKSPACE_ID}/media-package`);
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expect(
        page.getByRole("heading", {
          name: "Chọn gói truyền thông",
          exact: true,
        }),
      ).toBeVisible();
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
      await page.screenshot({
        path: testInfo.outputPath(`media-package-${theme}-${width}.png`),
        fullPage: true,
      });
    });
  }
}
