import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  ARTIFACT_ROOT,
  VideoSpaceApiFixture,
  WORKSPACE,
  OTHER_WORKSPACE,
  USER,
  OTHER_USER,
  JOB,
} from "./fixture";

test("denied source keeps a useful error and safe return without upload or generation", async ({
  page,
  context,
}) => {
  const api = new VideoSpaceApiFixture();
  api.sourceDenied = true;
  await api.install(context);
  await page.goto(`/workspaces/${WORKSPACE}/video-space?jobId=${JOB}`);
  const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(editor.getByRole("alert")).toContainText(
    /permission|unavailable|access/i,
  );
  expect(api.sessions.size).toBe(0);
  expect(api.projects.size).toBe(0);
  await page.screenshot({
    path: path.join(ARTIFACT_ROOT, "source-denied.png"),
  });
  await page
    .getByRole("button", { name: "Back to Video AI", exact: true })
    .click();
  await expect(page).toHaveURL(/\/ai-studio\/video$/);
  await expect(
    page.getByRole("button", { name: "Edit in Video Space", exact: true }),
  ).toBeVisible();
  expect(
    api.requests.some(
      (request) =>
        request.path.endsWith("/ai/videos") && request.method === "POST",
    ),
  ).toBe(false);
});

test("same browser keeps user and workspace project storage isolated without deleting prior data", async ({
  page,
  context,
}) => {
  const api = new VideoSpaceApiFixture();
  await api.install(context);
  await page.goto(`/workspaces/${WORKSPACE}/video-space?jobId=${JOB}`);
  let editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(
    editor.getByRole("button", { name: "Save project", exact: true }),
  ).toBeVisible();
  const project = [...api.projects.values()][0];
  const name = (project.snapshot.metadata as Record<string, unknown>)
    .name as string;
  const ownerDatabases = await page
    .frames()
    .find((frame) => frame.url().includes("/video-space/index.html"))!
    .evaluate(async () =>
      (await indexedDB.databases())
        .map((database) => database.name)
        .filter(Boolean),
    );
  expect(ownerDatabases.length).toBeGreaterThan(0);
  await page.goto(`/workspaces/${OTHER_WORKSPACE}/video-space`);
  editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(
    editor.getByText("Máy chủ đã kết nối", { exact: true }),
  ).toBeVisible();
  await expect(
    editor.getByRole("button", { name: `Mở ${name}`, exact: true }),
  ).toHaveCount(0);
  const workspaceDatabases = await page
    .frames()
    .find((frame) => frame.url().includes("/video-space/index.html"))!
    .evaluate(async () =>
      (await indexedDB.databases())
        .map((database) => database.name)
        .filter(Boolean),
    );
  expect(workspaceDatabases.length).toBeGreaterThan(ownerDatabases.length);
  expect(
    ownerDatabases.every((database) => workspaceDatabases.includes(database)),
  ).toBe(true);

  api.currentUserId = OTHER_USER;
  await page.evaluate((userId) => {
    const auth = JSON.parse(localStorage.getItem("brandhub-auth")!);
    auth.state.user.id = userId;
    localStorage.setItem("brandhub-auth", JSON.stringify(auth));
  }, OTHER_USER);
  await page.goto(`/workspaces/${WORKSPACE}/video-space`);
  editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(
    editor.getByText("Máy chủ đã kết nối", { exact: true }),
  ).toBeVisible();
  await expect(
    editor.getByRole("button", { name: `Mở ${name}`, exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: path.join(ARTIFACT_ROOT, "other-user-isolated.png"),
  });

  api.currentUserId = USER;
  await page.evaluate((userId) => {
    const auth = JSON.parse(localStorage.getItem("brandhub-auth")!);
    auth.state.user.id = userId;
    localStorage.setItem("brandhub-auth", JSON.stringify(auth));
  }, USER);
  await page.goto(`/workspaces/${WORKSPACE}/video-space`);
  editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(
    editor.getByRole("button", { name: `Mở ${name}`, exact: true }),
  ).toBeVisible();
  writeFileSync(
    path.join(ARTIFACT_ROOT, "storage-isolation.json"),
    JSON.stringify(
      { ownerDatabases, workspaceDatabases, ownerProjectRetained: true },
      null,
      2,
    ),
  );
});

test("host themes and locales reach the frame with readable native foreground and narrow return actions", async ({
  browser,
}) => {
  mkdirSync(ARTIFACT_ROOT, { recursive: true });
  const evidence: unknown[] = [];
  for (const theme of ["light", "dark"]) {
    const locale = theme === "light" ? "en" : "vi";
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const api = new VideoSpaceApiFixture();
    await api.install(context, USER, locale, theme);
    const page = await context.newPage();
    await page.goto(`/workspaces/${WORKSPACE}/video-space`);
    const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
    await expect(
      editor.getByRole("heading", { name: "Bản dựng của bạn", exact: true }),
    ).toBeVisible();
    const frame = page
      .frames()
      .find((child) => child.url().includes("/video-space/index.html"))!;
    const colors = await frame.evaluate(() => {
      const style = getComputedStyle(document.body);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      const rgba = (color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data];
      };
      return {
        theme: document.documentElement.className,
        locale: document.documentElement.lang,
        color: style.color,
        background: style.backgroundColor,
        foreground: rgba(style.color),
        backgroundRgb: rgba(style.backgroundColor),
      };
    });
    expect(colors.theme).toContain(theme);
    expect(colors.locale).toBe(locale);
    const luminance = (rgb: number[]) =>
      rgb
        .slice(0, 3)
        .map((channel) => channel / 255)
        .map((channel) =>
          channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4,
        )
        .reduce(
          (sum, channel, index) =>
            sum + channel * [0.2126, 0.7152, 0.0722][index],
          0,
        );
    const foreground = luminance(colors.foreground),
      background = luminance(colors.backgroundRgb);
    const contrast =
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05);
    expect(contrast).toBeGreaterThan(4.5);
    evidence.push({ ...colors, contrast });
    await page.screenshot({
      path: path.join(ARTIFACT_ROOT, `theme-${theme}-${locale}.png`),
    });
    for (const width of [768, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(
        page.getByRole("button", {
          name: locale === "en" ? "Back to Video AI" : "Quay lại Video AI",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          locale === "en"
            ? "Use Chrome or Edge on a computer to edit videos."
            : "Dùng trình duyệt Chrome hoặc Edge trên máy tính để chỉnh sửa video.",
          { exact: true },
        ),
      ).toBeVisible();
      await page.screenshot({
        path: path.join(ARTIFACT_ROOT, `host-${locale}-${width}.png`),
      });
    }
    await context.close();
  }
  writeFileSync(
    path.join(ARTIFACT_ROOT, "theme-contrast.json"),
    JSON.stringify(evidence, null, 2),
  );
});

test("renderer startup failure still allows returning to Video AI", async ({
  page,
  context,
}) => {
  const api = new VideoSpaceApiFixture();
  await api.install(context);
  await context.route("**/*.wasm", (route) =>
    route.fulfill({ status: 503, body: "Renderer unavailable" }),
  );
  await page.goto(`/workspaces/${WORKSPACE}/video-space`);
  const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(editor.getByRole("alert")).toContainText(
    "Could not load the video renderer",
  );
  await page
    .getByRole("button", { name: "Back to Video AI", exact: true })
    .click();
  await expect(page).toHaveURL(/\/ai-studio\/video$/);
  expect(api.sessions.size).toBe(0);
});
