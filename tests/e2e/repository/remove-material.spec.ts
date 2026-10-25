import { expect, test, type Page } from "@playwright/test";

const workspaceId = "9899990d-4740-4dfb-bb4c-323f0c663986";
const agencyId = "58483ab3-0d75-409d-9945-a3a8bc281b9f";
const envelope = (data: unknown) => ({
  success: true,
  data,
  requestId: "repository-ui-test",
});

async function setup(page: Page, role = "MANAGER", theme = "light") {
  await page.addInitScript(
    ({ theme, workspaceId, agencyId }) => {
      localStorage.setItem("brandhub-lang", "vi");
      localStorage.setItem("vite-ui-theme", theme);
      localStorage.setItem("brandhub_current_agency_id", agencyId);
      localStorage.setItem(
        "brandhub-auth",
        JSON.stringify({
          state: {
            user: {
              id: "repository-test-user",
              fullName: "Repository tester",
              email: "repository@example.test",
              role: "USER",
              workspaceId,
            },
            accessToken: "disposable-ui-test",
            refreshToken: "",
            isAuthenticated: true,
            systemRole: "USER",
          },
          version: 0,
        }),
      );
    },
    { role, theme, workspaceId, agencyId },
  );
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const data =
      path === "/api/v1/workspaces"
        ? [
            {
              id: workspaceId,
              agencyId,
              name: "Repository Workspace",
              myRole: role,
              workspaceMediaPackageId: "package-1",
              packageNegotiationStatus: "APPROVED",
              settings: {},
              createdAt: "2026-10-01T00:00:00Z",
            },
          ]
        : path === "/api/v1/agencies"
          ? [
              {
                id: agencyId,
                name: "Test Agency",
                myRole: "MEMBER",
                status: "ACTIVE",
              },
            ]
          : path.endsWith("/media-package")
            ? {
                workspaceMediaPackageId: "package-1",
                negotiationStatus: "APPROVED",
              }
            : [];
    await route.fulfill({ json: envelope(data) });
  });
}

for (const [width, theme] of [
  [375, "light"],
  [768, "dark"],
  [1440, "light"],
] as const) {
  test(`delete, cancel focus, Trash and restore at ${width}px ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await setup(page, "MANAGER", theme);
    const initial = {
      id: "file-1",
      workspaceId,
      name: "retained-photo.png",
      type: "RAW",
      mediaKind: "IMAGE",
      mimeType: "image/png",
      fileSize: 100,
      status: "READY",
      version: 2,
      createdBy: "other-user",
      createdAt: new Date().toISOString(),
    };
    let material = {
      ...initial,
      deletedAt: undefined as string | undefined,
      purgeAfter: undefined as string | undefined,
    };
    let removed = false;
    await page.route(
      `**/api/v1/workspaces/${workspaceId}/materials**`,
      async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (request.method() === "DELETE") {
          expect(url.searchParams.get("expectedVersion")).toBe("2");
          removed = true;
          material = {
            ...material,
            status: "DELETED",
            version: 3,
            deletedAt: new Date().toISOString(),
            purgeAfter: new Date(Date.now() + 30 * 86400000).toISOString(),
          };
          return route.fulfill({ json: envelope(material) });
        }
        if (url.pathname.endsWith("/restore")) {
          expect(url.searchParams.get("expectedVersion")).toBe("3");
          removed = false;
          material = {
            ...material,
            status: "READY",
            version: 4,
            deletedAt: undefined,
            purgeAfter: undefined,
          };
          return route.fulfill({ json: envelope(material) });
        }
        const trash = url.searchParams.get("deleted") === "true";
        const rows = trash === removed ? [material] : [];
        await route.fulfill({
          json: {
            ...envelope(rows),
            meta: { page: 0, size: 20, total: rows.length },
          },
        });
      },
    );
    await page.goto(`/workspaces/${workspaceId}/library`);
    const remove = page.getByRole("button", {
      name: "Chuyển tài liệu retained-photo.png vào thùng rác",
    });
    await expect(remove).toBeVisible();
    await remove.click();
    const dialog = page.getByRole("alertdialog");
    await expect(
      dialog.getByRole("button", { name: "Hủy", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(remove).toBeFocused();
    await remove.click();
    await expect(dialog).toContainText("30 ngày");
    await page.screenshot({
      path: testInfo.outputPath(`delete-${width}-${theme}.png`),
      fullPage: true,
    });
    await dialog
      .getByRole("button", { name: "Chuyển vào thùng rác", exact: true })
      .click();
    await expect(dialog).not.toBeVisible();
    await page.getByRole("tab", { name: "Thùng rác", exact: true }).click();
    const restore = page.getByRole("button", {
      name: "Khôi phục tài liệu retained-photo.png",
    });
    await expect(restore).toBeEnabled();
    await expect(page.getByText("Còn 30 ngày để khôi phục")).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`trash-${width}-${theme}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await restore.click();
    await expect(
      page.getByText("Thùng rác trống.", { exact: true }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Kho tài liệu", exact: true }).click();
    await expect(
      page.getByText("retained-photo.png", { exact: true }),
    ).toBeVisible();
  });
}

test("Creator has no delete action on another user material", async ({
  page,
}) => {
  await setup(page, "CREATOR");
  await page.route(`**/api/v1/workspaces/${workspaceId}/materials**`, (route) =>
    route.fulfill({
      json: envelope([
        {
          id: "other",
          workspaceId,
          name: "other.pdf",
          type: "RAW",
          createdBy: "other",
          status: "READY",
          createdAt: new Date().toISOString(),
        },
      ]),
    }),
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await expect(page.getByText("other.pdf", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Chuyển tài liệu/ }),
  ).toHaveCount(0);
});

test("English confirmation and Undo restore a material at 375px", async ({
  page,
}) => {
  await setup(page);
  await page.addInitScript(() => localStorage.setItem("brandhub-lang", "en"));
  await page.setViewportSize({ width: 375, height: 1000 });
  const initial = {
    id: "undo-file",
    workspaceId,
    name: "undo.pdf",
    type: "RAW",
    status: "READY",
    version: 0,
    createdBy: "repository-test-user",
    createdAt: new Date().toISOString(),
  };
  let deleted = false;
  await page.route(
    `**/api/v1/workspaces/${workspaceId}/materials**`,
    async (route) => {
      if (route.request().method() === "DELETE") {
        deleted = true;
        return route.fulfill({
          json: envelope({
            ...initial,
            status: "DELETED",
            version: 1,
            deletedAt: new Date().toISOString(),
          }),
        });
      }
      if (route.request().url().includes("/restore")) {
        deleted = false;
        return route.fulfill({ json: envelope({ ...initial, version: 2 }) });
      }
      await route.fulfill({ json: envelope(deleted ? [] : [initial]) });
    },
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page
    .getByRole("button", { name: "Move material undo.pdf to trash" })
    .click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText("30 days");
  await expect(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await dialog
    .getByRole("button", { name: "Move to trash", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByText("undo.pdf", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
