import { expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { registerDefaultEffects } from "../../vendor/video-space/src/effects/definitions";
import { effectsRegistry } from "../../vendor/video-space/src/effects/registry";
import { buildDefaultParamValues } from "../../vendor/video-space/src/params/registry";
vi.mock("@/wasm", () => ({
  TICKS_PER_SECOND: 120000,
  ZERO_MEDIA_TIME: 0,
  mediaTime: ({ ticks }: { ticks: number }) => ticks,
  mediaTimeFromSeconds: ({ seconds }: { seconds: number }) =>
    Math.round(seconds * 120000),
  mediaTimeToSeconds: ({ time }: { time: number }) => time / 120000,
  roundMediaTime: ({ time }: { time: number }) => Math.round(time),
}));
it("registers real effect data and distinct color presets idempotently", () => {
  registerDefaultEffects();
  const definitions = effectsRegistry.getAll();
  expect(
    definitions.filter((item) => item.category !== "filter").length,
  ).toBeGreaterThanOrEqual(7);
  expect(
    definitions.filter((item) => item.category === "filter").length,
  ).toBeGreaterThanOrEqual(8);
  for (const definition of definitions) {
    const opts = {
      effectParams: buildDefaultParamValues(definition.params),
      width: 320,
      height: 180,
    };
    const passes =
      definition.renderer.buildPasses?.(opts) ??
      definition.renderer.passes.map((pass) => ({
        shader: pass.shader,
        uniforms: pass.uniforms(opts),
      }));
    expect(passes.length).toBeGreaterThan(0);
    for (const pass of passes) {
      expect(["color-adjust", "gaussian-blur"]).toContain(pass.shader);
      if (pass.shader === "gaussian-blur")
        expect(pass.uniforms.u_sigma).toBeGreaterThan(0);
      for (const value of Object.values(pass.uniforms))
        expect(
          (Array.isArray(value) ? value : [value]).every(Number.isFinite),
        ).toBe(true);
    }
  }
  registerDefaultEffects();
  expect(effectsRegistry.getAll()).toHaveLength(definitions.length);
});
it("bundles the effect preview at the URL the service loads", () => {
  const file = path.resolve(
    "vendor/video-space/src/services/renderer/effect-preview.ts",
  );
  const url = readFileSync(file, "utf8").match(
    /PREVIEW_IMAGE_PATH = "([^"]+)"/,
  )![1];
  expect(url.startsWith("/video-space/")).toBe(true);
  expect(
    existsSync(
      path.resolve(
        "vendor/video-space/public",
        url.replace("/video-space/", ""),
      ),
    ),
  ).toBe(true);
});

it("keeps audio/filter labels and every effect name parallel in VI/EN", async () => {
  const { editorResourceMessages } =
    await import("../../vendor/video-space/src/brandhub/resources/messages");
  expect(Object.keys(editorResourceMessages.vi).sort()).toEqual(
    Object.keys(editorResourceMessages.en).sort(),
  );
  expect(Object.keys(editorResourceMessages.vi.names).sort()).toEqual(
    Object.keys(editorResourceMessages.en.names).sort(),
  );
  registerDefaultEffects();
  for (const definition of effectsRegistry.getAll())
    expect(editorResourceMessages.en.names).toHaveProperty(definition.type);
});
