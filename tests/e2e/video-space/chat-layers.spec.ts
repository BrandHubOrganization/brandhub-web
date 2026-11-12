import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import {
  VideoSpaceApiFixture,
  WORKSPACE,
  USER,
  JOB,
  FIXTURE_VIDEO,
  ARTIFACT_ROOT,
} from "./fixture";
import {
  assistantMessages,
  autoEditChatMessages,
} from "../../../vendor/video-space/src/brandhub/studio-messages";
for (const [locale, theme] of [
  ["vi", "light"],
  ["en", "dark"],
] as const) {
  test(`chat imports separate layers and Undo (${locale}/${theme})`, async ({
    page,
    context,
  }) => {
    const api = new VideoSpaceApiFixture();
    await api.install(context, USER, locale, theme);
    let sent = false;
    await context.route("**/auto-edits**", async (route) => {
      if (route.request().url().endsWith("/content")) {
        await route.fulfill({ contentType: "video/mp4", body: FIXTURE_VIDEO });
        return;
      }
      if (route.request().method() === "POST") sent = true;
      const project = [...api.projects.values()][0];
      const scenes = project?.snapshot.scenes as
        { tracks: { main: { elements: { mediaId: string }[] } } }[] | undefined;
      const asset = scenes?.[0].tracks.main.elements[0].mediaId;
      const job = {
        id: "66666666-6666-4666-8666-666666666666",
        status: "COMPLETED",
        stage: "completed",
        created_at: "2026-11-11T04:00:00Z",
        instruction: "Separate layers",
        summary: "Layers ready",
        output: { output_asset_id: "result" },
        plan: {
          editable: true,
          width: 320,
          height: 568,
          fps: 24,
          duration_frames: 24,
          clips: [0, 12].map((start) => ({
            asset_id: asset,
            start_frame: start,
            duration_frames: 12,
            source_start_seconds: start / 24,
            speed: 1,
            freeze: false,
            fit: "cover",
            zoom: 1,
            transition: "cut",
            transition_frames: 0,
          })),
          graphics: [
            {
              kind: "title",
              start_frame: 0,
              duration_frames: 24,
              text: "Editable title",
              x: 0.5,
              y: 0.5,
              color: "#FFFFFF",
              font_size: 40,
              panel: "box",
            },
          ],
          audio: [
            {
              asset_id: asset,
              role: "source",
              start_frame: 0,
              duration_frames: 24,
              source_start_seconds: 0,
              speed: 1,
              gain: 0.5,
            },
            {
              asset_id: null,
              music: "after-rain",
              role: "music",
              start_frame: 0,
              duration_frames: 24,
              source_start_seconds: 0,
              speed: 1,
              gain: 0.2,
            },
            {
              asset_id: null,
              sfx: "pop",
              role: "sfx",
              start_frame: 12,
              duration_frames: 12,
              source_start_seconds: 0,
              speed: 1,
              gain: 0.3,
            },
          ],
        },
      };
      await route.fulfill({
        status: route.request().method() === "POST" ? 202 : 200,
        json: {
          success: true,
          data: route.request().method() === "POST" ? job : sent ? [job] : [],
        },
      });
    });
    await page.goto(`/workspaces/${WORKSPACE}/video-space?jobId=${JOB}`);
    const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
    const t = assistantMessages[locale],
      c = autoEditChatMessages[locale];
    await editor
      .getByRole("button", { name: t.assistant, exact: true })
      .click({ timeout: 90000 });
    await editor
      .getByRole("textbox", { name: c.placeholder, exact: true })
      .fill("Separate layers");
    await editor.getByRole("button", { name: c.send, exact: true }).click();
    await expect(
      editor.getByText(c.layersAvailable, { exact: true }),
    ).toBeVisible();
    const project = [...api.projects.values()][0];
    const before = structuredClone(project.snapshot.scenes);
    await editor.getByRole("button", { name: c.apply, exact: true }).click();
    await expect(editor.getByText(c.applied, { exact: true })).toBeVisible();
    await expect
      .poll(() => (project.snapshot.scenes as unknown[]).length)
      .toBe((before as unknown[]).length + 1);
    const scenes = project.snapshot.scenes as {
      id: string;
      tracks: {
        main: { elements: unknown[] };
        overlay: { elements: { params: { content: string } }[] }[];
        audio: {
          elements: { params: { volume: number }; sourceUrl?: string }[];
        }[];
      };
    }[];
    const imported = scenes.at(-1)!;
    expect(imported.tracks.main.elements).toHaveLength(2);
    expect(imported.tracks.overlay[0].elements[0].params.content).toBe(
      "Editable title",
    );
    expect(imported.tracks.audio).toHaveLength(3);
    expect(imported.tracks.audio[0].elements[0].params.volume).toBeCloseTo(
      -6.0206,
    );
    expect(imported.tracks.audio[2].elements[0].sourceUrl).toBe(
      "/video-space/library/assets/sfx/pop.ogg",
    );
    mkdirSync(ARTIFACT_ROOT, { recursive: true });
    await page.screenshot({
      path: `${ARTIFACT_ROOT}/chat-layers-${locale}-${theme}.png`,
    });
    await editor.getByRole("button", { name: t.close, exact: true }).click();
    await editor
      .locator("[data-element-id]")
      .first()
      .click()
      .catch(() => undefined);
    await page.keyboard.press("Control+z");
    await editor.getByRole("button", { name: t.save, exact: true }).click();
    await expect
      .poll(() => (project.snapshot.scenes as unknown[]).length)
      .toBe((before as unknown[]).length);
  });
}
