import { test, expect } from "@playwright/test";
import { setup, envelope, workspaceId } from "./fixtures";

for (const [width, theme] of [
  [1440, "light"],
  [375, "dark"],
] as const) {
  test(`trash selection and scoped actions ${width} ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    await setup(page, "MANAGER", theme);
    const operations: string[] = [];
    const removed = new Set<string>();
    let failSecond = true;
    const files = ["first", "second"].map((id) => ({
      id,
      name: `${id}.mp4`,
      workspaceId,
      type: "RAW",
      mediaKind: "VIDEO",
      status: "DELETED",
      version: 3,
      fileSize: 1024,
      url: "",
      createdAt: new Date().toISOString(),
      deletedAt: new Date().toISOString(),
      capabilities: { canRestore: true, canPurge: true },
    }));
    await page.route(
      `**/api/v1/workspaces/${workspaceId}/materials**`,
      async (route) => {
        const url = new URL(route.request().url());
        if (route.request().method() === "POST") {
          operations.push(url.pathname);
          if (url.pathname.endsWith("/trash/purge")) {
            removed.add("first");
            removed.add("second");
            removed.add("folder");
            return route.fulfill({
              json: envelope({
                requested: 1,
                skipped: 0,
                foldersRequested: 1,
                foldersSkipped: 0,
              }),
            });
          }
          if (!url.pathname.includes("/folders/"))
            expect(url.searchParams.get("expectedVersion")).toBe("3");
          if (url.pathname.endsWith("/second/restore") && failSecond) {
            failSecond = false;
            return route.fulfill({
              status: 409,
              json: {
                success: false,
                error: { code: "MATERIAL_VERSION_CONFLICT" },
              },
            });
          }
          const id = url.pathname.split("/").at(-2)!;
          removed.add(id);
          return route.fulfill({ json: envelope({ ...files[0], id }) });
        }
        const items =
          url.searchParams.get("deleted") === "true"
            ? files.filter(
                (item) =>
                  !removed.has(item.id) &&
                  item.name.includes(url.searchParams.get("search") ?? ""),
              )
            : [];
        return route.fulfill({
          json: envelope({
            files: { items, meta: { page: 0, size: 20, total: items.length } },
            folders: removed.has("folder")
              ? []
              : [{ id: "folder", name: "Campaign assets", itemCount: 0 }],
            breadcrumbs: [],
          }),
        });
      },
    );
    await page.goto(`/workspaces/${workspaceId}/library`);
    await page.getByTestId("tab-trash-library").click();
    const selectAll = page.getByRole("checkbox", {
      name: "Chọn tất cả trên trang",
    });
    await expect(selectAll).toBeVisible();
    await page
      .getByRole("checkbox", { name: "Chọn first.mp4", exact: true })
      .focus();
    await page.keyboard.press("Space");
    await expect(selectAll).toHaveJSProperty("indeterminate", true);
    await page.getByRole("button", { name: "Bỏ chọn", exact: true }).click();
    await selectAll.check();
    await page
      .getByRole("button", { name: "Xóa vĩnh viễn", exact: true })
      .click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toContainText("3");
    await expect(
      dialog.getByRole("button", { name: "Hủy", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    expect(operations).toHaveLength(0);
    await expect(dialog).toBeHidden();
    await page.screenshot({
      path: testInfo.outputPath(`trash-${width}-${theme}.png`),
      fullPage: true,
      animations: "disabled",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Khôi phục", exact: true }).click();
    await expect(
      page.getByRole("checkbox", { name: "Chọn second.mp4", exact: true }),
    ).toBeChecked();
    await expect(
      page.getByText("Đã chọn 1 mục", { exact: true }),
    ).toBeVisible();
    expect(operations.filter((path) => path.endsWith("/restore"))).toHaveLength(
      3,
    );
    await page.getByRole("button", { name: "Khôi phục", exact: true }).click();
    await expect(
      page.getByRole("checkbox", { name: "Chọn second.mp4", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Dọn sạch thùng rác", exact: true })
      .click();
    await expect(dialog).toContainText("bộ lọc");
    await dialog.getByRole("button", { name: "Hủy", exact: true }).click();
    expect(operations.some((path) => path.endsWith("/trash/purge"))).toBe(
      false,
    );
    removed.clear();
    await page.getByRole("textbox", { name: /Tìm theo tên tệp/ }).fill("first");
    const first = page.getByRole("checkbox", {
      name: "Chọn first.mp4",
      exact: true,
    });
    await first.check();
    await page
      .getByRole("button", { name: "Xóa vĩnh viễn", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "Xóa vĩnh viễn", exact: true })
      .click();
    await expect(first).toHaveCount(0);
    expect(removed.has("second")).toBe(false);
    await page
      .getByRole("button", { name: "Dọn sạch thùng rác", exact: true })
      .click();
    await expect(dialog).toContainText("bộ lọc");
    await dialog
      .getByRole("button", { name: "Dọn sạch thùng rác", exact: true })
      .click();
    await expect(dialog).toBeHidden();
    expect(
      operations.filter((path) => path.endsWith("/trash/purge")),
    ).toHaveLength(1);
    expect(removed.has("second")).toBe(true);
  });
}

test("restores independently trashed child after parent and keeps protected items disabled", async ({
  page,
}) => {
  await setup(page, "MANAGER", "light");
  const calls: string[] = [];
  const remaining = new Set(["parent", "child"]);
  await page.route(
    `**/api/v1/workspaces/${workspaceId}/materials**`,
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() === "POST") {
        const id = path.split("/").at(-2)!;
        calls.push(id);
        if (id === "child") expect(remaining.has("parent")).toBe(false);
        remaining.delete(id);
        return route.fulfill({ json: envelope({}) });
      }
      const folders = [
        { id: "child", name: "Child", parentFolderId: "parent", itemCount: 0 },
        { id: "parent", name: "Parent", itemCount: 0 },
      ].filter((item) => remaining.has(item.id));
      return route.fulfill({
        json: envelope({
          folders,
          breadcrumbs: [],
          files: {
            items: [
              {
                id: "protected",
                name: "Protected.pdf",
                type: "RAW",
                status: "DELETED",
                createdAt: new Date().toISOString(),
                capabilities: { canRestore: false, canPurge: false },
              },
            ],
            meta: { page: 0, size: 20, total: 1 },
          },
        }),
      });
    },
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page.getByTestId("tab-trash-library").click();
  await expect(
    page.getByRole("checkbox", { name: "Chọn Protected.pdf", exact: true }),
  ).toBeDisabled();
  await page.getByRole("checkbox", { name: "Chọn tất cả trên trang" }).check();
  await page.getByRole("button", { name: "Khôi phục", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Chọn Child", exact: true }),
  ).toHaveCount(0);
  expect(calls).toEqual(["parent", "child"]);
});

test("English trash labels fit the tablet layout", async ({
  page,
}, testInfo) => {
  await setup(page, "MANAGER", "dark");
  await page.addInitScript(() => localStorage.setItem("brandhub-lang", "en"));
  await page.setViewportSize({ width: 768, height: 950 });
  await page.route(`**/api/v1/workspaces/${workspaceId}/materials**`, (route) =>
    route.fulfill({
      json: envelope({
        folders: [{ id: "folder", name: "Campaign assets", itemCount: 0 }],
        breadcrumbs: [],
        files: { items: [], meta: { page: 0, size: 20, total: 0 } },
      }),
    }),
  );
  await page.goto(`/workspaces/${workspaceId}/library`);
  await page.getByTestId("tab-trash-library").click();
  await expect(
    page.getByRole("checkbox", { name: "Select all on this page" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Empty trash", exact: true }),
  ).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath("trash-tablet-english.png"),
    fullPage: true,
    animations: "disabled",
  });
});
