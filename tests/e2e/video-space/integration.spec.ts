import { expect, test, type FrameLocator } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  VideoSpaceApiFixture,
  WORKSPACE,
  JOB,
  FIXTURE_HASH,
  ARTIFACT_ROOT,
  type SavedProject,
} from "./fixture";

type Clip = {
  id: string;
  type: string;
  duration: number;
  masks?: { type: string }[];
  effects?: { type: string }[];
  params?: Record<string, unknown>;
};
type Scene = {
  tracks: { main: { elements: Clip[] }; overlay: { elements: Clip[] }[] };
};
const scene = (project: SavedProject) =>
  (project.snapshot.scenes as Scene[])[0];
async function save(editor: FrameLocator, project: SavedProject) {
  const revision = project.revision;
  await editor
    .getByRole("button", { name: "Save project", exact: true })
    .click();
  await expect.poll(() => project.revision).toBe(revision + 1);
  await expect(
    editor.getByRole("button", { name: "Save project", exact: true }),
  ).toBeEnabled();
}

test("completed history imports, edits, saves, restores and exports with the native renderer", async ({
  page,
  context,
  browser,
}) => {
  const api = new VideoSpaceApiFixture();
  await api.install(context);
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto(`/workspaces/${WORKSPACE}/library`);
  await page
    .locator(`a[href="/workspaces/${WORKSPACE}/ai-studio/video"]`)
    .click();
  await expect(
    page.getByRole("button", { name: "Edit in Video Space", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit in Video Space", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`/video-space\\?jobId=${JOB}$`));
  const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(
    editor.getByRole("button", { name: "Save project", exact: true }),
  ).toBeVisible({ timeout: 90_000 });
  mkdirSync(ARTIFACT_ROOT, { recursive: true });
  await page.screenshot({
    path: path.join(ARTIFACT_ROOT, "first-source-open.png"),
  });
  console.log(
    "SOURCE_OPENED",
    path.join(ARTIFACT_ROOT, "first-source-open.png"),
  );
  expect(api.projects.size).toBe(1);
  const project = [...api.projects.values()][0];
  expect(project.revision).toBe(1);
  expect(project.assets).toHaveLength(1);
  expect(
    api.requests.filter((request) =>
      request.path.endsWith(`/ai/videos/${JOB}/content`),
    ),
  ).toHaveLength(1);
  expect(
    api.requests.filter(
      (request) =>
        request.path.startsWith("/session-") && request.method === "PUT",
    ),
  ).toHaveLength(1);
  expect(
    api.requests.find(
      (request) =>
        request.path.startsWith("/session-") && request.method === "PUT",
    )?.authorization,
  ).toBeUndefined();
  const clip = scene(project).tracks.main.elements[0];
  await editor.locator(`[data-element-id="${clip.id}"]`).click();
  for (let frame = 0; frame < 10; frame++)
    await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Control+b");
  await save(editor, project);
  expect(scene(project).tracks.main.elements).toHaveLength(2);
  await page.keyboard.press("Control+z");
  await save(editor, project);
  expect(scene(project).tracks.main.elements).toHaveLength(1);
  await page.keyboard.press("Control+Shift+z");
  await save(editor, project);
  expect(scene(project).tracks.main.elements).toHaveLength(2);
  console.log("SPLIT_UNDO_REDO_PASS");

  await editor.locator(`[data-element-id="${clip.id}"]`).click();
  await editor.getByRole("tab", { name: "Masks", exact: true }).click();
  await editor
    .getByRole("button", { name: "Mask: Hình tròn", exact: true })
    .click();
  await save(editor, project);
  expect(scene(project).tracks.main.elements[0].masks?.[0].type).toBe(
    "ellipse",
  );
  await editor
    .getByRole("button", { name: "Mask: Không áp dụng", exact: true })
    .click();
  await save(editor, project);
  expect(scene(project).tracks.main.elements[0].masks ?? []).toHaveLength(0);
  await editor
    .getByRole("button", { name: "Mask: Hình tròn", exact: true })
    .click();
  const tools = editor.getByRole("navigation", {
    name: "Editor tools",
    exact: true,
  });
  await tools.getByRole("button", { name: "Filters", exact: true }).click();
  await editor
    .getByRole("button", { name: "Áp dụng Đen trắng", exact: true })
    .click();
  await save(editor, project);
  expect(scene(project).tracks.main.elements[0].effects?.[0].type).toBe(
    "filter-mono",
  );
  console.log("MASK_FILTER_PASS");

  await tools.getByRole("button", { name: "Templates", exact: true }).click();
  await editor
    .getByRole("button", {
      name: "Add Product Launch to timeline",
      exact: true,
    })
    .click();
  await expect(
    editor.getByText("Product Launch added to timeline", { exact: true }),
  ).toBeVisible();
  await save(editor, project);
  const title = scene(project)
    .tracks.overlay.flatMap((track) => track.elements)
    .find(
      (element) =>
        element.type === "text" &&
        element.params?.content === "Sản phẩm mới ra mắt",
    )!;
  expect(title).toBeTruthy();
  await editor.locator(`[data-element-id="${title.id}"]`).click();
  await editor.getByRole("tab", { name: "Text", exact: true }).click();
  await editor
    .getByRole("button", { name: "Be Vietnam Pro", exact: true })
    .click();
  await editor
    .getByRole("textbox", { name: "Tìm font", exact: true })
    .fill("Lora");
  await editor.getByRole("button", { name: "Lora", exact: true }).click();
  await save(editor, project);
  expect(
    scene(project)
      .tracks.overlay.flatMap((track) => track.elements)
      .find((element) => element.id === title.id)?.params?.fontFamily,
  ).toBe("Lora");
  expect(project.assets[0].sha256).toBe(FIXTURE_HASH);
  await page.screenshot({
    path: path.join(ARTIFACT_ROOT, "editor-edited.png"),
  });
  writeFileSync(
    path.join(ARTIFACT_ROOT, "accepted-snapshot.json"),
    JSON.stringify(project, null, 2),
  );
  console.log("TEXT_LOCAL_FONT_SAVE_PASS");

  const fresh = await browser.newContext({
    viewport: { width: 1680, height: 1100 },
    acceptDownloads: true,
  });
  await api.install(fresh);
  const restored = await fresh.newPage();
  restored.on("pageerror", (error) => failures.push(error.message));
  await restored.goto(`/workspaces/${WORKSPACE}/video-space`);
  const restoredEditor = restored.frameLocator(
    'iframe[src="/video-space/index.html"]',
  );
  await restoredEditor
    .getByRole("button", {
      name: `Mở ${(project.snapshot.metadata as Record<string, unknown>).name}`,
      exact: true,
    })
    .click();
  await expect(
    restoredEditor.locator(`[data-element-id="${title.id}"]`),
  ).toBeVisible();
  await expect(
    restoredEditor.locator(`[data-element-id="${clip.id}"]`),
  ).toBeVisible();
  expect(
    api.requests.some(
      (request) =>
        request.path.endsWith(`/media/${project.assets[0].id}`) &&
        request.method === "GET",
    ),
  ).toBe(true);
  await restoredEditor
    .getByRole("button", { name: "Xuất video", exact: true })
    .click();
  const download = restored.waitForEvent("download", { timeout: 90_000 });
  await restoredEditor
    .getByRole("button", { name: "Xuất video", exact: true })
    .last()
    .click();
  const videoPath = path.join(ARTIFACT_ROOT, "restored-export.mp4");
  await (await download).saveAs(videoPath);
  const pixels = await restored.evaluate(async (encoded) => {
    const video = document.createElement("video");
    video.src = `data:video/mp4;base64,${encoded}`;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Exported MP4 cannot decode"));
    });
    video.currentTime = 0.1;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    return {
      width: canvas.width,
      height: canvas.height,
      center: [
        ...ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data,
      ],
      corner: [...ctx.getImageData(0, 0, 1, 1).data],
    };
  }, readFileSync(videoPath).toString("base64"));
  expect(pixels.center[0]).toBeGreaterThan(20);
  expect(Math.abs(pixels.center[0] - pixels.center[1])).toBeLessThan(5);
  expect(Math.abs(pixels.center[1] - pixels.center[2])).toBeLessThan(5);
  expect(pixels.corner.slice(0, 3).every((channel) => channel < 12)).toBe(true);
  writeFileSync(
    path.join(ARTIFACT_ROOT, "export-pixels.json"),
    JSON.stringify(pixels, null, 2),
  );
  await restored.screenshot({
    path: path.join(ARTIFACT_ROOT, "fresh-restored.png"),
  });
  await restored
    .getByRole("button", { name: "Back to Video AI", exact: true })
    .click();
  await expect(restored).toHaveURL(/\/ai-studio\/video$/);
  await fresh.close();
  console.log(
    "FRESH_RESTORE_EXPORT_PIXEL_BACK_FLUSH_PASS",
    JSON.stringify(pixels),
  );
  expect(failures).toEqual([]);
});
