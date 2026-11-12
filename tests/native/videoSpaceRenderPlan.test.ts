import { describe, expect, it, vi } from "vitest";
import {
  renderPlanScene,
  type RenderPlan,
} from "../../vendor/video-space/src/brandhub/import-render-plan";
import { autoEditChatMessages } from "../../vendor/video-space/src/brandhub/studio-messages";
vi.mock(
  "@/commands",
  () => import("../../vendor/video-space/src/commands/base-command"),
);
vi.mock("@/wasm", () => ({
  TICKS_PER_SECOND: 120000,
  ZERO_MEDIA_TIME: 0,
  mediaTime: ({ ticks }: { ticks: number }) => ticks,
  mediaTimeFromSeconds: ({ seconds }: { seconds: number }) =>
    Math.round(seconds * 120000),
  mediaTimeToSeconds: ({ time }: { time: number }) => time / 120000,
  roundMediaTime: ({ time }: { time: number }) => Math.round(time),
}));
const plan: RenderPlan = {
  width: 320,
  height: 568,
  fps: 30,
  duration_frames: 90,
  clips: [
    {
      asset_id: "video",
      start_frame: 0,
      duration_frames: 90,
      source_start_seconds: 0,
      speed: 1,
      freeze: false,
      fit: "cover",
      zoom: 1,
      transition: "cut",
      transition_frames: 0,
    },
  ],
  graphics: [
    {
      kind: "title",
      start_frame: 0,
      duration_frames: 30,
      text: "Hello",
      x: 0.5,
      y: 0.5,
      color: "#FFFFFF",
      font_size: 40,
    },
  ],
  audio: [
    {
      asset_id: "video",
      role: "source",
      start_frame: 30,
      duration_frames: 30,
      source_start_seconds: 1,
      speed: 2,
      gain: 0.5,
    },
    {
      asset_id: null,
      music: "after-rain",
      role: "music",
      start_frame: 0,
      duration_frames: 90,
      source_start_seconds: 2,
      speed: 1,
      gain: 0.2,
    },
    {
      asset_id: null,
      sfx: "click",
      role: "sfx",
      start_frame: 60,
      duration_frames: 10,
      source_start_seconds: 0,
      speed: 1,
      gain: 0,
    },
  ],
};
function build(value = plan) {
  return renderPlanScene({
    plan: value,
    name: "Claude",
    canvas: { width: 320, height: 568 },
    mediaIds: new Map([["video", { type: "video", duration: 10 }]]),
  });
}
describe("editable render plan", () => {
  it("separates source audio, music and SFX while retaining timing, trim, speed and gain", () => {
    const { scene, mp4Only } = build();
    expect(scene.tracks.overlay[0].elements[0].params.content).toBe("Hello");
    expect(scene.tracks.main.elements[0].isSourceAudioEnabled).toBe(false);
    const tracks = scene.tracks.audio;
    expect(tracks).toHaveLength(3);
    const voice = tracks[0].elements[0];
    expect(voice).toMatchObject({
      type: "audio",
      sourceType: "upload",
      mediaId: "video",
      startTime: 120000,
      duration: 120000,
      trimStart: 120000,
      retime: { rate: 2 },
    });
    expect(voice.params.volume).toBeCloseTo(-6.0206);
    expect(tracks[1].elements[0].trimStart).toBe(240000);
    expect(tracks[2].elements[0]).toMatchObject({
      sourceType: "library",
      sourceUrl: "/video-space/library/assets/sfx/click.ogg",
    });
    expect(tracks[2].elements[0].params.muted).toBe(true);
    expect(mp4Only).not.toContain("hiệu ứng âm thanh SFX");
  });
  it("rejects a missing audio source instead of enabling unrelated clips", () => {
    const bad = { ...plan, audio: [{ ...plan.audio[0], asset_id: "missing" }] };
    expect(() => build(bad)).toThrow("VIDEO_RENDER_PLAN_INVALID");
  });
  it("keeps long music audible by repeating the bundled track without losing trim", () => {
    const long = {
      ...plan,
      duration_frames: 1800,
      audio: [{ ...plan.audio[1], duration_frames: 1800 }],
    };
    const { scene } = build(long);
    const pieces = scene.tracks.audio.flatMap((track) => track.elements);
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.reduce((sum, piece) => sum + piece.duration, 0)).toBe(
      7200000,
    );
    expect(pieces[0].trimStart).toBe(240000);
    expect(pieces.at(-1)!.startTime + pieces.at(-1)!.duration).toBe(7200000);
  });
  it("keeps chat labels parallel", () => {
    expect(Object.keys(autoEditChatMessages.vi).sort()).toEqual(
      Object.keys(autoEditChatMessages.en).sort(),
    );
  });
});
