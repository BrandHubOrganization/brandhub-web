import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { VideoSpaceApiFixture, WORKSPACE } from "./fixture";

const evidence = path.resolve("../.tmp/product-video-pipeline-20261030/native");
const ffmpeg = process.env.FFMPEG_PATH ?? "ffmpeg";
const ffprobe = process.env.FFPROBE_PATH ?? "ffprobe";
const cors = {
  "access-control-allow-origin": "http://127.0.0.1:3215",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "authorization,content-type",
  "access-control-allow-methods": "GET,OPTIONS",
};
const productionId = "51000000-1111-4111-8111-111111111111";
const projectId = "52000000-1111-4111-8111-111111111111";
const sceneIds = [
  "53000000-1111-4111-8111-111111111111",
  "54000000-1111-4111-8111-111111111111",
];
const assetIds = [
  "55000000-1111-4111-8111-111111111111",
  "56000000-1111-4111-8111-111111111111",
];
const bundle = {
  productionId,
  projectId,
  name: "Native product fixture",
  fps: 24,
  width: 1280,
  height: 720,
  totalFrames: 360,
  preserveSourceAudio: true,
  segments: sceneIds.map((sceneId, i) => ({
    sceneId,
    assetId: assetIds[i],
    startFrame: i ? 168 : 0,
    sourceStartFrame: 0,
    durationFrames: i ? 192 : 180,
    fadeInFrames: i ? 12 : 0,
  })),
  texts: [
    {
      id: "57000000-1111-4111-8111-111111111111",
      text: "Khám phá sản phẩm",
      startFrame: 300,
      endFrame: 360,
      centerX: 640,
      centerY: 600,
      fontFamily: "Be Vietnam Pro",
      fontSizePx: 48,
      color: "#ffffff",
    },
  ],
  logo: null,
  music: null,
};
type Element = {
  id: string;
  mediaId?: string;
  duration: number;
  startTime: number;
  animations?: unknown;
};
type Scene = {
  tracks: {
    main: { elements: Element[] };
    overlay: { elements: Element[] }[];
    audio: { elements: Element[] }[];
  };
};

test("production imports real native sources, saves manual edits, reopens locally/remotely and exports exact timing", async ({
  page,
  context,
  browser,
}) => {
  mkdirSync(evidence, { recursive: true });
  const clips = ["red", "blue"].map((color, i) => {
    const file = path.join(evidence, `${color}-8s-24fps.mp4`);
    execFileSync(ffmpeg, [
      "-y",
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      `color=c=${color}:s=1280x720:r=24:d=8`,
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${i ? 880 : 440}:sample_rate=48000:duration=8`,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "30",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-shortest",
      file,
    ]);
    return readFileSync(file);
  });
  const api = new VideoSpaceApiFixture();
  const reads: string[] = [];
  const install = async (target: typeof context) => {
    await api.install(target);
    await target.route(
      `**/ai/video-productions/${productionId}/**`,
      async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        if (route.request().method() === "OPTIONS")
          return route.fulfill({ headers: cors });
        if (pathname.endsWith("/editing-bundle"))
          return route.fulfill({
            json: { success: true, data: bundle },
            headers: cors,
          });
        const i = sceneIds.findIndex((id) =>
          pathname.endsWith(`/scenes/${id}/content`),
        );
        expect(i).toBeGreaterThanOrEqual(0);
        reads.push(sceneIds[i]);
        return route.fulfill({
          body: clips[i],
          contentType: "video/mp4",
          headers: cors,
        });
      },
    );
    await target.route(
      new RegExp(`/video-projects/${projectId}/media/[^/]+$`),
      async (route) => {
        const i = assetIds.findIndex((id) =>
          route.request().url().endsWith(`/media/${id}`),
        );
        expect(i).toBeGreaterThanOrEqual(0);
        return route.fulfill({
          body: clips[i],
          contentType: "video/mp4",
          headers: cors,
        });
      },
    );
  };
  await install(context);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const url = `/workspaces/${WORKSPACE}/video-space?productionId=${productionId}`;
  await page.goto(url);
  let editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(
    editor.getByRole("button", { name: "Save project", exact: true }),
  ).toBeVisible({ timeout: 90000 });
  await expect.poll(() => api.projects.get(projectId)?.revision).toBe(1);
  const accepted = api.projects.get(projectId)!;
  const scene = () => (accepted.snapshot.scenes as Scene[])[0];
  expect(accepted.id).toBe(projectId);
  expect(accepted.assets.map((a) => a.id)).toEqual(assetIds);
  expect(scene().tracks.main.elements[0].duration).toBe(180 * 5000);
  expect(scene().tracks.overlay.at(-1)!.elements[0].startTime).toBe(168 * 5000);
  expect(scene().tracks.audio[0].elements.map((e) => e.duration)).toEqual([
    168 * 5000,
    192 * 5000,
  ]);
  await page.screenshot({ path: path.join(evidence, "native-import.png") });

  const main = scene().tracks.main.elements[0];
  await editor.locator(`[data-element-id="${main.id}"]`).click();
  for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Control+b");
  await editor
    .getByRole("button", { name: "Save project", exact: true })
    .click();
  await expect.poll(() => accepted.revision).toBe(2);
  expect(scene().tracks.main.elements.length).toBe(2);
  const manualIds = scene().tracks.main.elements.map((e) => e.id);
  await page.goto(url);
  editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await expect(
    editor.getByRole("button", { name: "Save project", exact: true }),
  ).toBeVisible();
  for (const id of manualIds)
    await expect(editor.locator(`[data-element-id="${id}"]`)).toBeVisible();
  expect(reads).toHaveLength(2);
  expect(accepted.revision).toBe(2);
  writeFileSync(
    path.join(evidence, "accepted-native-manual.json"),
    JSON.stringify(accepted, null, 2),
  );

  const fresh = await browser.newContext({
    viewport: { width: 1680, height: 1100 },
    acceptDownloads: true,
  });
  await install(fresh);
  const restored = await fresh.newPage();
  restored.on("pageerror", (e) => errors.push(e.message));
  await restored.goto(url);
  const remoteEditor = restored.frameLocator(
    'iframe[src="/video-space/index.html"]',
  );
  await expect(
    remoteEditor.getByRole("button", { name: "Save project", exact: true }),
  ).toBeVisible();
  for (const id of manualIds)
    await expect(
      remoteEditor.locator(`[data-element-id="${id}"]`),
    ).toBeVisible();
  expect(reads).toHaveLength(2);
  expect(accepted.revision).toBe(2);
  await restored.screenshot({
    path: path.join(evidence, "native-remote-manual.png"),
  });
  await remoteEditor
    .getByRole("button", { name: "Xuất video", exact: true })
    .click();
  const download = restored.waitForEvent("download", { timeout: 120000 });
  await remoteEditor
    .getByRole("button", { name: "Xuất video", exact: true })
    .last()
    .click();
  const output = path.join(evidence, "native-export.mp4");
  await (await download).saveAs(output);
  const probe = JSON.parse(
    execFileSync(
      ffprobe,
      ["-v", "error", "-count_frames", "-show_streams", "-of", "json", output],
      { encoding: "utf8" },
    ),
  );
  writeFileSync(
    path.join(evidence, "native-export-probe.json"),
    JSON.stringify(probe, null, 2),
  );
  const video = probe.streams.find(
    (s: { codec_type: string }) => s.codec_type === "video",
  );
  expect(Number(video.nb_read_frames)).toBe(360);
  expect(video.r_frame_rate).toBe("24/1");
  expect(Number(video.duration)).toBeCloseTo(15, 2);
  execFileSync(ffmpeg, ["-v", "error", "-i", output, "-f", "null", "-"]);
  const pixel = (seconds: string) => [
    ...execFileSync(ffmpeg, [
      "-v",
      "error",
      "-ss",
      seconds,
      "-i",
      output,
      "-frames:v",
      "1",
      "-vf",
      "crop=1:1:640:360,format=rgb24",
      "-f",
      "rawvideo",
      "-",
    ]),
  ];
  const pixels = {
    first: pixel("1"),
    incoming: pixel("7.25"),
    second: pixel("8"),
  };
  writeFileSync(
    path.join(evidence, "native-export-pixels.json"),
    JSON.stringify(pixels),
  );
  expect(pixels.first[0]).toBeGreaterThan(200);
  expect(pixels.first[2]).toBeLessThan(30);
  expect(pixels.incoming[0]).toBeGreaterThan(70);
  expect(pixels.incoming[2]).toBeGreaterThan(70);
  expect(pixels.second[2]).toBeGreaterThan(200);
  expect(pixels.second[0]).toBeLessThan(30);
  expect(errors).toEqual([]);
  await fresh.close();
});
