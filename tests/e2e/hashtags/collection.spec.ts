import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function setup(page: Page, language = "en", theme = "light", staleOnRemove = false) {
  await page.addInitScript(
    ({ language, theme }) => {
      localStorage.setItem(
        "brandhub-auth",
        JSON.stringify({
          state: {
            user: { id: "hashtag-user", name: "Creator", role: "USER" },
            accessToken: "dev-token-hashtags",
            isAuthenticated: true,
            systemRole: "USER",
          },
          version: 0,
        }),
      );
      localStorage.setItem("i18nextLng", language);
      localStorage.setItem("language", language);
      localStorage.setItem("brandhub-lang", language);
      localStorage.setItem("theme", theme);
    },
    { language, theme },
  );
  await page.route("**/api/**", (route) =>
    route.fulfill({ json: { success: true, data: [] } }),
  );
  await page.route("**/api/v1/workspaces", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: [
          {
            id: "workspace-1",
            name: "Workspace One",
            agencyId: "agency-1",
            myRole: "CREATOR",
            status: "ACTIVE",
            packageNegotiationStatus: "APPROVED",
            workspaceMediaPackageId: "package-1",
            settings: {},
          },
          {
            id: "workspace-2",
            name: "Workspace Two",
            agencyId: "agency-1",
            myRole: "CREATOR",
            status: "ACTIVE",
            packageNegotiationStatus: "APPROVED",
            workspaceMediaPackageId: "package-2",
            settings: {},
          },
        ],
      },
    }),
  );
  const entries: {
    id: string;
    workspaceId: string;
    tag: string;
    purpose: string;
    addedBy: string;
    addedByName: string;
    isRequired: boolean;
    campaignId: string | null;
    version: number;
    createdAt: string;
    deleted?: boolean;
  }[] = [];
  let failReads = false;
  let shouldConflict = staleOnRemove;
  await page.route("**/api/v1/workspaces/*/hashtags**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const workspaceId = url.pathname.split("/")[4];
    if (request.method() === "DELETE") {
      const hashtagId = url.pathname.split("/").at(-1);
      const entry = entries.find((item) => item.id === hashtagId);
      if (entry && shouldConflict) {
        shouldConflict = false;
        entry.purpose = "EVENT_SPECIFIC";
        entry.isRequired = true;
        entry.campaignId = "campaign-updated";
        entry.version += 1;
        return route.fulfill({
          status: 409,
          json: { success: false, error: { code: "HASHTAG_CHANGED" } },
        });
      }
      if (entry) entry.deleted = true;
      return route.fulfill({ json: { success: true, data: null } });
    }
    if (request.method() === "POST") {
      const body = request.postDataJSON() as { tag: string; purpose: string };
      const tag = body.tag.trim().replace(/^#/, "");
      if (
        entries.some(
          (entry) =>
            entry.workspaceId === workspaceId &&
            entry.tag.toLowerCase() === tag.toLowerCase(),
        )
      ) {
        return route.fulfill({
          status: 409,
          json: { success: false, error: { code: "HASHTAG_ALREADY_EXISTS" } },
        });
      }
      const entry = {
        id: String(entries.length),
        workspaceId,
        tag,
        purpose: body.purpose,
        addedBy: "hashtag-user",
        addedByName: "Creator One",
        isRequired: false,
        campaignId: null,
        version: 0,
        createdAt: "2026-10-09T08:00:00Z",
      };
      entries.push(entry);
      return route.fulfill({
        status: 201,
        json: { success: true, data: entry },
      });
    }
    if (failReads)
      return route.fulfill({
        status: 403,
        json: { success: false, error: { code: "FORBIDDEN" } },
      });
    if (request.method() === "GET" && url.pathname.split("/").length === 7) {
      const entry = entries.find((item) => item.id === url.pathname.split("/").at(-1) && !item.deleted);
      return route.fulfill({
        status: entry ? 200 : 404,
        json: entry
          ? { success: true, data: entry }
          : { success: false, error: { code: "HASHTAG_NOT_FOUND" } },
      });
    }
    const items = entries.filter(
      (entry) =>
        !entry.deleted && entry.workspaceId === workspaceId &&
        entry.tag
          .toLowerCase()
          .includes((url.searchParams.get("q") ?? "").toLowerCase()),
    );
    await route.fulfill({
      json: {
        success: true,
        data: {
          items,
          page: 0,
          size: 20,
          totalElements: items.length,
          totalPages: items.length ? 1 : 0,
        },
      },
    });
  });
  await page.goto("/workspaces/workspace-1/hashtags");
  return {
    entries,
    deny: () => {
      failReads = true;
    },
  };
}

test("add, reload, duplicate, search and workspace isolation", async ({
  page,
}) => {
  const { entries } = await setup(page);
  await expect(
    page.getByText("No hashtags yet.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add hashtag", exact: true }).click();
  await page.getByLabel("Hashtag", { exact: true }).fill("#ThươngHiệu");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "#ThươngHiệu" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "#ThươngHiệu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add hashtag", exact: true }).click();
  await page.getByLabel("Hashtag", { exact: true }).fill("#thươnghiệu");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("already exists");
  await expect(page.getByLabel("Hashtag", { exact: true })).toHaveValue(
    "#thươnghiệu",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(entries).toHaveLength(1);
  await page.getByLabel("Search hashtags").fill("missing");
  await expect(page.getByText("No matching hashtags.")).toBeVisible();
  await page.goto("/workspaces/workspace-2/hashtags");
  await expect(
    page.getByText("No hashtags yet.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "#ThươngHiệu" })).toHaveCount(
    0,
  );
});

test("access loss hides stale data and disables Add", async ({ page }) => {
  const state = await setup(page);
  await page.getByRole("button", { name: "Add hashtag", exact: true }).click();
  await page.getByLabel("Hashtag", { exact: true }).fill("brand");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "#brand" })).toBeVisible();
  state.deny();
  await page.getByLabel("Search hashtags").fill("brand");
  await expect(page.getByRole("alert")).toContainText("no longer have access");
  await expect(page.getByRole("heading", { name: "#brand" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Add hashtag", exact: true }),
  ).toBeDisabled();
});

test("remove confirms soft deletion and preserves the recorded entry", async ({ page }) => {
  const { entries } = await setup(page);
  await page.getByRole("button", { name: "Add hashtag", exact: true }).click();
  await page.getByLabel("Hashtag", { exact: true }).fill("seasonal");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "#seasonal" })).toBeVisible();
  await page.getByRole("button", { name: "Remove hashtag #seasonal" }).click();
  await expect(page.getByText("Hashtags already used in existing posts remain unchanged.")).toBeVisible();
  await page.getByRole("button", { name: "Remove hashtag", exact: true }).click();
  await expect(page.getByRole("heading", { name: "#seasonal" })).toHaveCount(0);
  expect(entries).toHaveLength(1);
  expect(entries[0].deleted).toBe(true);
});

test("stale removal reloads changed scope and requires a second confirmation", async ({ page }) => {
  const { entries } = await setup(page, "en", "light", true);
  await page.getByRole("button", { name: "Add hashtag", exact: true }).click();
  await page.getByLabel("Hashtag", { exact: true }).fill("eventtag");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("button", { name: "Remove hashtag #eventtag" }).click();
  await page.getByRole("button", { name: "Remove hashtag", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("changed since you opened");
  await expect(page.getByText("Campaign campaign-updated")).toBeVisible();
  await expect(page.getByText("Event-specific", { exact: true })).toBeVisible();
  expect(entries[0].deleted).toBeFalsy();
  await page.getByRole("button", { name: "Remove hashtag", exact: true }).click();
  await expect(page.getByRole("heading", { name: "#eventtag" })).toHaveCount(0);
  expect(entries[0].deleted).toBe(true);
});

for (const language of ["en", "vi"]) {
  for (const theme of ["light", "dark"]) {
    test(`${language} ${theme} layout`, async ({ page }, testInfo) => {
      await setup(page, language, theme);
      const title = language === "vi" ? "Kho hashtag" : "Hashtag collection";
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        theme === "dark",
      );
      for (const width of [375, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(
          page.getByRole("button", {
            name: language === "vi" ? "Thêm hashtag" : "Add hashtag",
            exact: true,
          }),
        ).toBeVisible();
        await page.screenshot({
          path: testInfo.outputPath(`${language}-${theme}-${width}.png`),
          fullPage: true,
        });
      }
    });
  }
}
