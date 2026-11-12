import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import {
  VideoSpaceApiFixture,
  WORKSPACE,
  USER,
  JOB,
  ARTIFACT_ROOT,
} from "./fixture";
function tone() {
  const b = Buffer.alloc(44 + 16000);
  b.write("RIFF");
  b.writeUInt32LE(b.length - 8, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(8000, 24);
  b.writeUInt32LE(16000, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(16000, 40);
  for (let i = 0; i < 8000; i++)
    b.writeInt16LE(
      Math.round(8000 * Math.sin((i * 2 * Math.PI * 440) / 8000)),
      44 + i * 2,
    );
  return b;
}
for (const [locale, theme] of [
  ["en", "dark"],
  ["vi", "light"],
] as const) {
  test(`uploaded audio, color filters and real effects (${locale}/${theme})`, async ({
    page,
    context,
  }) => {
    const api = new VideoSpaceApiFixture();
    await api.install(context, USER, locale, theme);
    const failures: string[] = [];
    page.on("pageerror", (e) => failures.push(e.message));
    page.on("console", (message) => {
      if (
        /Unknown effect shader|Failed to render effect preview/.test(
          message.text(),
        )
      )
        failures.push(message.text());
    });
    await page.goto(`/workspaces/${WORKSPACE}/video-space?jobId=${JOB}`);
    const editor = page.frameLocator('iframe[src="/video-space/index.html"]');
    const save = locale === "en" ? "Save project" : "Lưu bản dựng";
    await expect(
      editor.getByRole("button", { name: save, exact: true }),
    ).toBeVisible({ timeout: 90000 });
    await editor.locator('input[type="file"]').first().setInputFiles({
      name: "my-sound.wav",
      mimeType: "audio/wav",
      buffer: tone(),
    });
    await editor.getByRole("button", { name: "Audio", exact: true }).click();
    const uploaded = locale === "en" ? "Uploaded" : "Đã tải lên";
    await editor.getByRole("button", { name: uploaded, exact: true }).click();
    const card = editor
      .locator("[data-uploaded-audio]")
      .filter({ hasText: "my-sound.wav" });
    await expect(card).toBeVisible();
    const audio = card.locator("audio");
    await expect
      .poll(() => audio.evaluate((a: HTMLAudioElement) => a.readyState))
      .toBeGreaterThanOrEqual(2);
    await audio.evaluate((a: HTMLAudioElement) => a.play());
    await expect
      .poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime))
      .toBeGreaterThan(0);
    await card.getByRole("button").click();
    const project = [...api.projects.values()][0];
    async function persist() {
      const rev = project.revision;
      await editor.getByRole("button", { name: save, exact: true }).click();
      await expect.poll(() => project.revision).toBeGreaterThan(rev);
    }
    await persist();
    type Element = {
      id: string;
      mediaId?: string;
      sourceType?: string;
      effects?: { type: string }[];
    };
    const tracks = () =>
      (
        project.snapshot.scenes as {
          tracks: {
            main: { elements: Element[] };
            audio: { elements: Element[] }[];
          };
        }[]
      )[0].tracks;
    const imported = project.assets.find((a) => a.name === "my-sound.wav")!;
    expect(tracks().audio.flatMap((t) => t.elements)).toContainEqual(
      expect.objectContaining({ sourceType: "upload", mediaId: imported.id }),
    );
    await editor
      .locator(`[data-element-id="${tracks().main.elements[0].id}"]`)
      .click();
    await editor.getByRole("button", { name: "Filters", exact: true }).click();
    const warm = editor.getByRole("button", {
      name: locale === "en" ? "Apply Warm" : "Áp dụng Ấm áp",
      exact: true,
    });
    const cool = editor.getByRole("button", {
      name: locale === "en" ? "Apply Cool" : "Áp dụng Mát dịu",
      exact: true,
    });
    const pixels = async (canvas: ReturnType<typeof warm.locator>) =>
      canvas.evaluate((c: HTMLCanvasElement) =>
        Array.from(
          c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data,
        ),
      );
    await expect
      .poll(async () => new Set(await pixels(warm.locator("canvas"))).size)
      .toBeGreaterThan(10);
    expect(await pixels(warm.locator("canvas"))).not.toEqual(
      await pixels(cool.locator("canvas")),
    );
    await warm.click();
    await persist();
    expect(tracks().main.elements[0].effects?.map((e) => e.type)).toContain(
      "filter-warm",
    );
    await cool.click();
    await persist();
    expect(tracks().main.elements[0].effects?.map((e) => e.type)).toEqual([
      "filter-cool",
    ]);
    await editor
      .getByRole("button", {
        name: locale === "en" ? "Clear filter" : "Bỏ bộ lọc",
        exact: true,
      })
      .click();
    await persist();
    expect(tracks().main.elements[0].effects ?? []).toHaveLength(0);
    await editor.getByRole("button", { name: "Effects", exact: true }).click();
    const effect = editor.getByRole("group", {
      name: locale === "en" ? "High contrast effect" : "Tương phản mạnh effect",
      exact: true,
    });
    await expect(effect).toBeVisible();
    for (const canvas of await editor
      .locator('div[role="group"][aria-label$=" effect"] canvas')
      .all()) {
      await expect
        .poll(async () => new Set(await pixels(canvas)).size)
        .toBeGreaterThan(10);
    }
    await effect.hover();
    await effect.getByRole("button").click();
    await persist();
    expect(tracks().main.elements[0].effects?.map((e) => e.type)).toContain(
      "effect-contrast",
    );
    mkdirSync(ARTIFACT_ROOT, { recursive: true });
    await page.screenshot({
      path: `${ARTIFACT_ROOT}/editor-resources-${locale}-${theme}.png`,
    });
    await editor.getByRole("button", { name: "Audio", exact: true }).click();
    await editor.getByRole("button", { name: uploaded, exact: true }).click();
    await editor
      .locator('input[type="file"]')
      .first()
      .setInputFiles({
        name: "second-sound.wav",
        mimeType: "audio/wav",
        buffer: tone(),
      });
    await expect(editor.locator("[data-uploaded-audio]")).toHaveCount(2);
    await persist();
    await page.screenshot({
      path: `${ARTIFACT_ROOT}/uploaded-audio-${locale}-${theme}.png`,
    });
    await editor
      .getByRole("button", { name: "Về thư viện dự án", exact: true })
      .click();
    await editor
      .getByRole("button", {
        name: `${locale === "en" ? "Open" : "Mở"} AI video ${JOB}`,
        exact: true,
      })
      .click();
    await expect(
      editor.getByRole("button", { name: save, exact: true }),
    ).toBeVisible();
    await editor.getByRole("button", { name: "Audio", exact: true }).click();
    await editor.getByRole("button", { name: uploaded, exact: true }).click();
    await expect(editor.locator("[data-uploaded-audio]")).toHaveCount(2);
    await expect(
      editor
        .locator("[data-uploaded-audio]")
        .filter({ hasText: "my-sound.wav" }),
    ).toBeVisible();
    expect(failures).toEqual([]);
  });
}
