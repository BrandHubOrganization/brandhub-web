import { Command } from "@/commands";
import type { EditorCore } from "@/core";
import type { ScalarAnimationChannel } from "@/animation/types";
import {
  buildElementFromMedia,
  buildLibraryAudioElement,
  buildTextElement,
} from "@/timeline/element-utils";
import { buildDefaultScene } from "@/timeline/scenes";
import { clampDb } from "@/timeline/audio-state";
import type {
  AudioElement,
  ImageElement,
  OverlayTrack,
  TScene,
  TextElement,
  VideoElement,
} from "@/timeline/types";
import { FONT_SIZE_SCALE_REFERENCE } from "@/text/typography";
import { generateUUID } from "@/utils/id";
import { TICKS_PER_SECOND, type MediaTime } from "@/wasm";
import { entranceAnimation } from "./resources/templates";

/** Server RenderPlan (ai-service server_video_edit_models.RenderPlan), already validated by the worker and Business. */
export interface RenderPlan {
  width: number;
  height: number;
  fps: 24 | 30;
  duration_frames: number;
  clips: {
    asset_id: string;
    start_frame: number;
    duration_frames: number;
    source_start_seconds: number;
    speed: number;
    freeze: boolean;
    fit: "cover" | "contain" | "blur";
    zoom: number;
    punch?: boolean;
    flash?: boolean;
    transition: "cut" | "dissolve" | "dip" | "slide";
    transition_frames: number;
  }[];
  graphics: {
    kind: "title" | "caption" | "score" | "circle" | "arrow" | "portrait" | "motion";
    motion?: string | null;
    width?: number;
    start_frame: number;
    duration_frames: number;
    text: string;
    x: number;
    y: number;
    color: string;
    font_size: number;
    font?: string;
    text_color?: string;
    panel?: "box" | "band" | "none";
    panel_color?: string;
    bold?: boolean;
    uppercase?: boolean;
    animation?: "none" | "fade" | "rise" | "pop" | "slam" | "words";
  }[];
  audio: {
    asset_id: string | null;
    sfx?: string | null;
    music?: string | null;
    role: "voice" | "music" | "source" | "sfx";
    start_frame: number;
    duration_frames: number;
    source_start_seconds: number;
    speed: number;
    gain: number;
  }[];
}

const FONTS: Record<string, string> = {
  "be-vietnam-pro": "Be Vietnam Pro",
  oswald: "Oswald",
  montserrat: "Montserrat",
  "playfair-display": "Playfair Display",
  bangers: "Bangers",
  quicksand: "Quicksand",
};
// Server entrance animations without a native equivalent fall back to the closest native one.
const ANIMATION = {
  fade: "fade",
  rise: "slide",
  pop: "pop",
  slam: "pop",
  words: "fade",
} as const;

function invalid(): never {
  throw new Error("VIDEO_RENDER_PLAN_INVALID");
}

/** Builds a NEW scene from the plan; returns it with the plan features the editor cannot represent (MP4 only). */
export function renderPlanScene({
  plan,
  name,
  canvas,
  mediaIds,
}: {
  plan: RenderPlan;
  name: string;
  canvas: { width: number; height: number };
  mediaIds: Map<string, { type: "video" | "image" | "audio"; duration?: number }>;
}): { scene: TScene; mp4Only: string[] } {
  if (
    !plan ||
    ![24, 30].includes(plan.fps) ||
    !Array.isArray(plan.clips) ||
    !plan.clips.length ||
    !Array.isArray(plan.graphics) ||
    !Array.isArray(plan.audio)
  )
    invalid();
  const tick = TICKS_PER_SECOND / plan.fps;
  const time = (frames: number) => Math.round(frames * tick) as MediaTime;
  const seconds = (value: number) => Math.round(value * TICKS_PER_SECOND) as MediaTime;
  const sx = canvas.width / plan.width,
    sy = canvas.height / plan.height;
  const mp4Only = new Set<string>();
  const scene = buildDefaultScene({ name, isMain: false });

  // Main track must be contiguous: an overlapping (dissolve/slide) incoming clip becomes a native transition.
  const clips = [...plan.clips].sort((a, b) => a.start_frame - b.start_frame);
  const main: (VideoElement | ImageElement)[] = clips.map((clip, index) => {
    const media = mediaIds.get(clip.asset_id);
    if (!media || media.type === "audio") invalid();
    const next = clips[index + 1];
    const end = next ? Math.min(clip.start_frame + clip.duration_frames, next.start_frame) : clip.start_frame + clip.duration_frames;
    const frames = Math.max(1, end - clip.start_frame);
    const base = buildElementFromMedia({
      mediaId: clip.asset_id,
      mediaType: media.type,
      name: `Shot ${index + 1}`,
      duration: time(frames),
      startTime: time(clip.start_frame),
    }) as Omit<VideoElement | ImageElement, "id">;
    const element = { ...base, id: generateUUID() } as VideoElement | ImageElement;
    if (element.type === "video") {
      const source = seconds(media.duration ?? 0);
      const used = Math.round(frames * tick * clip.speed);
      element.trimStart = seconds(clip.source_start_seconds);
      element.sourceDuration = source || ((element.trimStart + used) as MediaTime);
      element.trimEnd = Math.max(0, (element.sourceDuration ?? 0) - element.trimStart - used) as MediaTime;
      element.isSourceAudioEnabled = false;  // worker never keeps source audio implicitly
      if (clip.speed !== 1) element.retime = { rate: clip.speed };
    }
    if (clip.zoom > 1) {
      // Push-in as scale keyframes over the shot, the same motion the server renders.
      const channel = (): ScalarAnimationChannel => ({
        keys: [
          { id: generateUUID(), time: 0 as MediaTime, value: 1, segmentToNext: "linear", tangentMode: "auto" },
          { id: generateUUID(), time: time(frames), value: clip.zoom, segmentToNext: "linear", tangentMode: "auto" },
        ],
      });
      element.animations = { "transform.scaleX": channel(), "transform.scaleY": channel() };
    }
    if (clip.transition === "dissolve" || clip.transition === "slide") {
      element.params = {
        ...element.params,
        "bh.transition": clip.transition === "dissolve" ? "dissolve" : "slide-left",
        "bh.transition.duration": time(Math.max(1, clip.transition_frames)),
      };
    }
    if (clip.transition === "dip") mp4Only.add("chuyển cảnh dip (đen)");
    if (clip.punch) mp4Only.add("zoom giật theo nhịp (punch)");
    if (clip.flash) mp4Only.add("flash trắng");
    if (clip.freeze) mp4Only.add("đóng băng khung hình");
    if (clip.fit !== "cover") mp4Only.add("khung contain/blur");
    return element;
  });
  scene.tracks.main.elements = main;

  const overlay: OverlayTrack[] = [];
  for (const g of plan.graphics) {
    // A HyperFrames motion title becomes plain styled text on the timeline; its designed motion stays in the MP4.
    if (g.kind === "motion") mp4Only.add(`chữ động HyperFrames (${g.motion})`);
    if (!["title", "caption", "score", "motion"].includes(g.kind)) {
      mp4Only.add("đồ họa vòng tròn/mũi tên/chân dung");
      continue;
    }
    const content = g.uppercase ? g.text.toUpperCase() : g.text;
    const y = (g.y - 0.5) * plan.height * sy;
    const text = {
      ...buildTextElement({
        raw: {
          name: content.slice(0, 40),
          duration: time(g.duration_frames),
          params: {
            content,
            fontFamily: FONTS[g.font ?? "be-vietnam-pro"] ?? "Be Vietnam Pro",
            fontSize: (g.font_size * FONT_SIZE_SCALE_REFERENCE) / plan.height,
            color: g.kind === "score" ? g.color : (g.text_color ?? "#FFFFFF"),
            fontWeight: g.bold ? "bold" : "normal",
            "transform.positionX": (g.x - 0.5) * plan.width * sx,
            "transform.positionY": y,
            ...((g.panel ?? "box") !== "none" && {
              "background.enabled": true,
              "background.color": g.panel_color ?? "#05080F",
            }),
          },
        },
        startTime: time(g.start_frame),
      }),
      id: generateUUID(),
    } as TextElement;
    const animation = g.animation ?? "none";
    if (animation !== "none") text.animations = entranceAnimation({ animation: ANIMATION[animation], y });
    if (animation === "slam" || animation === "words") mp4Only.add(`chữ động ${animation}`);
    if (g.panel === "none") mp4Only.add("viền/bóng chữ không nền");
    overlay.push({ id: generateUUID(), name: content.slice(0, 24) || "Text", type: "text", hidden: false, elements: [text] });
  }
  scene.tracks.overlay = overlay;

  const audio: AudioElement[] = [];
  for (const a of plan.audio) {
    const volume = a.gain > 0 ? clampDb(20 * Math.log10(a.gain)) : 0;
    if (a.music) {
      const element = {
        ...buildLibraryAudioElement({
          sourceUrl: `/video-space/library/assets/music/${a.music}.wav`,
          name: a.music,
          duration: time(a.duration_frames),
          startTime: time(a.start_frame),
        }),
        id: generateUUID(),
      } as AudioElement;
      element.params = { ...element.params, volume, muted: a.gain === 0 };
      audio.push(element);
    } else if (a.asset_id && mediaIds.get(a.asset_id)?.type === "audio") {
      const media = mediaIds.get(a.asset_id)!;
      const base = buildElementFromMedia({
        mediaId: a.asset_id,
        mediaType: "audio",
        name: a.role,
        duration: time(a.duration_frames),
        startTime: time(a.start_frame),
      });
      const element = { ...base, id: generateUUID() } as AudioElement;
      element.trimStart = seconds(a.source_start_seconds);
      element.sourceDuration = seconds(media.duration ?? 0) || element.sourceDuration;
      element.trimEnd = Math.max(0, (element.sourceDuration ?? 0) - element.trimStart - time(a.duration_frames) * a.speed) as MediaTime;
      element.params = { ...element.params, volume, muted: a.gain === 0 };
      audio.push(element);
    } else if (a.asset_id) {
      // Source audio of a video clip: unmute that clip on the main track.
      for (const element of main) if (element.type === "video" && element.mediaId === a.asset_id) element.isSourceAudioEnabled = true;
    } else {
      mp4Only.add("hiệu ứng âm thanh SFX");
    }
  }
  scene.tracks.audio = audio.map((element) => ({
    id: generateUUID(),
    name: element.name,
    type: "audio" as const,
    muted: false,
    elements: [element],
  }));
  return { scene, mp4Only: [...mp4Only] };
}

/** Adds the plan as a new scene and switches to it; one Undo restores the previous scenes and selection. */
export class ImportRenderPlanCommand extends Command {
  private previous: { scenes: TScene[]; current: string } | null = null;
  constructor(
    private editor: EditorCore,
    private scene: TScene,
  ) {
    super();
  }
  execute() {
    const project = this.editor.project.getActive();
    this.previous = { scenes: [...this.editor.scenes.getScenes()], current: project.currentSceneId };
    this.apply([...this.previous.scenes, this.scene], this.scene.id);
    return undefined;
  }
  undo() {
    if (this.previous) this.apply(this.previous.scenes, this.previous.current);
  }
  private apply(scenes: TScene[], current: string) {
    this.editor.scenes.setScenes({ scenes, activeSceneId: current });
    const project = this.editor.project.getActive();
    this.editor.project.setActiveProject({ project: { ...project, scenes, currentSceneId: current } });
    this.editor.save.markDirty();
  }
}
