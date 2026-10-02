import { expect, test, type Page } from "@playwright/test";

const WORKSPACE_ID = "9899990d-4740-4dfb-bb4c-323f0c663986";
const AGENCY_ID = "58483ab3-0d75-409d-9945-a3a8bc281b9f";
const TEMPLATE_ID = "11111111-1111-4111-8111-111111111111";

function envelope<T>(data: T) {
  return { success: true, data, requestId: "e2e-request" };
}

function workspace(role: "OWNER" | "CLIENT") {
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

function agency(role: "OWNER" | "CLIENT") {
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
    myRole: role === "OWNER" ? "OWNER" : null,
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

async function setupSession(
  page: Page,
  role: "OWNER" | "CLIENT",
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
              name: activeRole === "CLIENT" ? "Client User" : "Owner User",
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

test("Client sees the package selection prompt on the Workspace dashboard", async ({
  page,
}) => {
  await setupSession(page, "CLIENT");
  await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/dashboard`, (route) =>
    route.fulfill({
      json: envelope({
        workspace: workspace("CLIENT"),
        totalActiveMembers: 2,
        membersByRole: { CLIENT: 1, MANAGER: 1 },
        totalCampaigns: 0,
        campaignsByStatus: {},
        packageNegotiationStatus: null,
        agencyId: AGENCY_ID,
        aiCreditMonth: "2026-10",
        agencyAiCreditsUsedThisMonth: 0,
      }),
    }),
  );
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-packages`,
    (route) => route.fulfill({ json: envelope([agencyPackage]) }),
  );
  await page.route(
    `**/api/v1/workspaces/${WORKSPACE_ID}/media-package`,
    (route) => route.fulfill({ status: 404, json: { success: false } }),
  );

  await page.goto(`/workspaces/${WORKSPACE_ID}/dashboard`);
  await expect(
    page.getByRole("heading", {
      name: "Workspace chưa chọn gói truyền thông",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Chọn gói truyền thông" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/workspaces/${WORKSPACE_ID}/media-package$`),
  );
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
