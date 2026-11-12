import { expect, test } from "@playwright/test";
import {
  VideoSpaceApiFixture,
  WORKSPACE,
  USER,
  JOB,
  FIXTURE_VIDEO,
} from "./fixture";

for (const variant of [
  { locale: "en", theme: "dark" },
  { locale: "vi", theme: "light" },
]) {
  test(`automatic render resumes and downloads without changing the timeline (${variant.locale}/${variant.theme})`, async ({
    page,
    context,
  }) => {
    const api = new VideoSpaceApiFixture();
    await page.setViewportSize({ width: 1366, height: 768 });
    await api.install(context, USER, variant.locale, variant.theme);
    const id = "55555555-5555-4555-8555-555555555555";
    let admitted = false,
      submits = 0,
      reads = 0,
      revision = 0;
    let originalTracks: unknown;
    await context.route("**/auto-edits**", async (route) => {
      const request = route.request();
      expect(request.headers()["authorization"]).toBe(
        "Bearer fixture-access-token",
      );
      if (request.url().endsWith("/content")) {
        await route.fulfill({ contentType: "video/mp4", body: FIXTURE_VIDEO });
        return;
      }
      if (request.method() === "POST") {
        submits++;
        admitted = true;
        expect(request.headers()["idempotency-key"]).toBeTruthy();
        const project = [...api.projects.values()][0];
        revision = project.revision;
        expect(request.postDataJSON().expected_revision).toBe(revision);
        originalTracks = structuredClone(project.snapshot.scenes);
      } else if (admitted) reads++;
      const completed = reads >= 3;
      const job = {
        id,
        status: completed ? "COMPLETED" : "RUNNING",
        stage: completed ? "completed" : "rendering",
        progress: completed ? 100 : 55,
        base_revision: revision,
        output: completed ? { output_asset_id: id } : null,
      };
      await route.fulfill({
        status: request.method() === "POST" ? 202 : 200,
        json: {
          success: true,
          data: request.method() === "POST" ? job : admitted ? [job] : [],
        },
      });
    });
    await page.goto(`/workspaces/${WORKSPACE}/video-space?jobId=${JOB}`);
    const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
    const en = variant.locale === "en";
    const assistant = en ? "AI assistant" : "Trợ lý AI";
    await editor
      .getByRole("button", { name: assistant, exact: true })
      .click({ timeout: 90_000 });
    await editor
      .getByRole("textbox", {
        name: en ? "Editing instruction" : "Yêu cầu chỉnh sửa",
        exact: true,
      })
      .fill("Make a concise edit with clear pacing");
    await editor.locator(".bh-chat-render-tools > summary").click();
    await editor
      .getByRole("button", {
        name: en ? "Render video automatically" : "Dựng video tự động",
        exact: true,
      })
      .press("Enter");
    await expect(
      editor.getByText(en ? "Rendering video" : "Đang dựng video", {
        exact: true,
      }),
    ).toBeVisible();
    const downloadButton = editor.getByRole("button", {
      name: en ? "Download MP4" : "Tải video MP4",
      exact: true,
    });
    await expect(downloadButton).toBeVisible({ timeout: 30_000 });
    const downloaded = page.waitForEvent("download");
    await downloadButton.click();
    expect((await downloaded).suggestedFilename()).toBe(`auto-edit-${id}.mp4`);
    await editor
      .getByRole("button", { name: en ? "Close" : "Đóng", exact: true })
      .click();
    await editor.getByRole("button", { name: assistant, exact: true }).click();
    await editor.locator(".bh-chat-render-tools > summary").click();
    await expect(downloadButton).toBeVisible();
    await downloadButton.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        editor
          .locator(".bh-ai-panel")
          .evaluate((element) =>
            Math.abs(element.getBoundingClientRect().right - window.innerWidth),
          ),
      )
      .toBeLessThan(1);
    expect(submits).toBe(1);
    expect([...api.projects.values()][0].snapshot.scenes).toEqual(
      originalTracks,
    );
    await expect(
      editor.getByRole("textbox", {
        name: en ? "Editing instruction" : "Yêu cầu chỉnh sửa",
        exact: true,
      }),
    ).toBeInViewport();
    await page.screenshot({
      path: `../.tmp/server-video-editor-20261110/runtime/ui-${variant.locale}-${variant.theme}.png`,
    });
  });
}

test("timeline-only auto edit opens the agent plan as a new undoable scene and memory can be forgotten", async ({
  page,
  context,
}) => {
  const api = new VideoSpaceApiFixture();
  await page.setViewportSize({ width: 1366, height: 768 });
  await api.install(context, USER, "vi", "light");
  const id = "66666666-6666-4666-8666-666666666666";
  let body: Record<string, unknown> = {};
  let notes = ["Chữ to, đậm", "Không dùng nhạc lofi"];
  await context.route("**/auto-edit-memory", async (route) => {
    if (route.request().method() === "PUT") notes = route.request().postDataJSON().notes;
    await route.fulfill({ json: { success: true, data: { notes } } });
  });
  await context.route("**/auto-edits**", async (route) => {
    const request = route.request();
    const project = [...api.projects.values()][0];
    const scenes = project?.snapshot.scenes as
      | { tracks: { main: { elements: { mediaId: string }[] } } }[]
      | undefined;
    if (request.method() === "POST") body = request.postDataJSON();
    const media = scenes?.[0].tracks.main.elements[0].mediaId;
    const job = {
      id,
      status: body.instruction ? "COMPLETED" : "RUNNING",
      stage: body.instruction ? "completed" : "queued",
      progress: body.instruction ? 100 : 0,
      base_revision: project?.revision ?? 1,
      output: null,
      render_mp4: false,
      summary: "Dựng 2 shot, tiêu đề lớn và nhạc nền.",
      agent: { turns: 6, previews: 2 },
      plan: {
        width: 1080, height: 1920, fps: 24, duration_frames: 96,
        clips: [
          { asset_id: media, start_frame: 0, duration_frames: 52, source_start_seconds: 0, speed: 1, freeze: false,
            fit: "cover", zoom: 1.08, punch: false, flash: false, transition: "cut", transition_frames: 0 },
          { asset_id: media, start_frame: 44, duration_frames: 52, source_start_seconds: 0.2, speed: 1, freeze: false,
            fit: "cover", zoom: 1, punch: true, flash: false, transition: "dissolve", transition_frames: 8 },
        ],
        graphics: [
          { kind: "title", start_frame: 0, duration_frames: 40, text: "Matcha latte đá", x: 0.5, y: 0.85, color: "#ff7029",
            font_size: 120, font: "oswald", text_color: "#F7F3E8", panel: "band", panel_color: "#1F4D2B", bold: true,
            uppercase: true, animation: "slam" },
        ],
        audio: [
          { asset_id: null, music: "morning-notes", sfx: null, role: "music", start_frame: 0, duration_frames: 96,
            source_start_seconds: 0, speed: 1, gain: 0.75 },
        ],
      },
    };
    await route.fulfill({
      status: request.method() === "POST" ? 202 : 200,
      json: { success: true, data: request.method() === "POST" ? job : body.instruction ? [job] : [] },
    });
  });
  await page.goto(`/workspaces/${WORKSPACE}/video-space?jobId=${JOB}`);
  const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
  await editor.getByRole("button", { name: "Trợ lý AI", exact: true }).click({ timeout: 90_000 });
  await editor.getByRole("textbox", { name: "Yêu cầu chỉnh sửa", exact: true }).fill("Dựng video matcha");
  await editor.locator(".bh-chat-render-tools > summary").click();
  await editor.getByText("AI đang ghi nhớ 2 sở thích của bạn").click();
  await editor.getByRole("button", { name: "Xóa ghi nhớ: Không dùng nhạc lofi", exact: true }).click();
  await expect(editor.getByText("AI đang ghi nhớ 1 sở thích của bạn")).toBeVisible();
  expect(notes).toEqual(["Chữ to, đậm"]);
  await editor.getByRole("checkbox").click();
  await editor.getByRole("button", { name: "Dựng video tự động", exact: true }).press("Enter");
  await expect(editor.getByText("Dựng 2 shot, tiêu đề lớn và nhạc nền.")).toBeVisible({ timeout: 30_000 });
  expect(body.render_mp4).toBe(false);
  await expect(editor.getByRole("button", { name: "Tải video MP4", exact: true })).toHaveCount(0);
  const project = [...api.projects.values()][0];
  const before = (project.snapshot.scenes as unknown[]).length;
  await editor.getByRole("button", { name: "Mở trên timeline", exact: true }).click();
  await expect(editor.getByText(/Chỉ có trong MP4.*punch.*slam/)).toBeVisible();
  await editor.getByRole("button", { name: "Đóng", exact: true }).click();
  await editor.getByRole("button", { name: "Lưu bản dựng", exact: true }).click();
  await expect.poll(() => (project.snapshot.scenes as unknown[]).length).toBe(before + 1);
  const scene = (project.snapshot.scenes as {
    id: string; tracks: { main: { elements: { params: Record<string, unknown>; startTime: number; duration: number }[] };
      overlay: { elements: { params: Record<string, unknown> }[] }[]; audio: { elements: { sourceUrl?: string }[] }[] };
  }[]).at(-1)!;
  expect(project.snapshot.currentSceneId).toBe(scene.id);
  const [first, second] = scene.tracks.main.elements;
  expect(first.startTime + first.duration).toBe(second.startTime);  // overlap became a native transition
  expect(second.params["bh.transition"]).toBe("dissolve");
  expect(scene.tracks.overlay[0].elements[0].params).toMatchObject({
    content: "MATCHA LATTE ĐÁ", fontFamily: "Oswald", color: "#F7F3E8", fontWeight: "bold", "background.enabled": true,
  });
  expect(scene.tracks.audio[0].elements[0].sourceUrl).toBe("/video-space/library/assets/music/morning-notes.wav");
});
