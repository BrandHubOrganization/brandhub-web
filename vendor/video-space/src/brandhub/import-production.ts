import type { VideoSpaceContext } from "../../../../shared/video-space-protocol.ts";
import type { TProject } from "../project/types.ts";
import type { MediaAsset } from "../media/types.ts";
import type {
  OverlayTrack,
  VideoElement,
  AudioElement,
} from "../timeline/types.ts";
import type { ParamValues } from "../params/index.ts";
import type { MediaTime } from "../wasm/media-time.ts";

export const PRODUCTION_MUSIC = {
  "music-morning-notes": "morning-notes.wav",
  "music-night-window": "night-window.wav",
  "music-clean-horizon": "clean-horizon.wav",
  "music-little-launch": "little-launch.wav",
  "music-after-rain": "after-rain.wav",
} as const;

export interface ProductionSegment {
  sceneId: string;
  assetId: string;
  startFrame: number;
  sourceStartFrame: number;
  durationFrames: number;
  fadeInFrames: number;
}
interface TimedLayer {
  startFrame: number;
  endFrame: number;
}
interface PositionedLayer extends TimedLayer {
  centerX: number;
  centerY: number;
}
export interface ProductionBundle {
  productionId: string;
  projectId: string;
  name: string;
  fps: 24;
  width: number;
  height: number;
  totalFrames: number;
  preserveSourceAudio: boolean;
  segments: ProductionSegment[];
  texts: (PositionedLayer & {
    id: string;
    text: string;
    fontFamily: string;
    fontSizePx: number;
    color: string;
  })[];
  logo: (PositionedLayer & { assetId: string; widthPx: number }) | null;
  music:
    | (TimedLayer & {
        assetId: string;
        catalogId: keyof typeof PRODUCTION_MUSIC;
        gain: number;
      })
    | null;
}
type ImportContext = Pick<
  VideoSpaceContext,
  "userId" | "workspaceId" | "sourceProductionId"
>;
export interface ProductionImportServices {
  version: number;
  params(type: "video" | "audio" | "text" | "image"): ParamValues;
  lock<T>(name: string, run: () => Promise<T>): Promise<T>;
  getBundle(): Promise<unknown>;
  loadProject(id: string): Promise<TProject | null>;
  loadMedia(id: string): Promise<MediaAsset[]>;
  restoreProject(id: string): Promise<TProject>;
  readSource(segment: ProductionSegment): Promise<File>;
  readLogo(
    logo: NonNullable<ProductionBundle["logo"]>,
    projectId: string,
  ): Promise<File>;
  readMusic(id: keyof typeof PRODUCTION_MUSIC): Promise<File>;
  process(file: File): Promise<Omit<MediaAsset, "id">>;
  saveMedia(projectId: string, asset: MediaAsset): Promise<void>;
  saveProject(project: TProject): Promise<void>;
  openProject(id: string): Promise<void>;
  publish(id: string): Promise<void>;
}

const UUID = /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
function requireValue(condition: unknown): asserts condition {
  if (!condition) throw new Error("Invalid product video editing bundle");
}
function record(value: unknown, keys: string[]): Record<string, unknown> {
  requireValue(value && typeof value === "object" && !Array.isArray(value));
  requireValue(Object.keys(value).every((key) => keys.includes(key)));
  return value as Record<string, unknown>;
}
function id(value: unknown): asserts value is string {
  requireValue(typeof value === "string" && UUID.test(value));
}
function integer(value: unknown, min: number, max: number) {
  requireValue(
    typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= min &&
      value <= max,
  );
}

export function validateProductionBundle(
  value: unknown,
  productionId: string,
): ProductionBundle {
  const b = record(value, [
    "productionId",
    "projectId",
    "name",
    "fps",
    "width",
    "height",
    "totalFrames",
    "preserveSourceAudio",
    "segments",
    "texts",
    "logo",
    "music",
  ]);
  id(b.productionId);
  id(b.projectId);
  requireValue(b.productionId === productionId);
  requireValue(
    typeof b.name === "string" && b.name.length > 0 && b.name.length <= 160,
  );
  requireValue(
    b.fps === 24 &&
      ((b.width === 720 && b.height === 1280) ||
        (b.width === 1280 && b.height === 720)),
  );
  requireValue(b.totalFrames === 360 || b.totalFrames === 480);
  requireValue(typeof b.preserveSourceAudio === "boolean");
  const total = b.totalFrames,
    width = Number(b.width),
    height = Number(b.height);
  const timings =
    total === 360
      ? [
          [0, 180],
          [168, 192],
        ]
      : [
          [0, 168],
          [156, 168],
          [312, 168],
        ];
  requireValue(
    Array.isArray(b.segments) && b.segments.length === timings.length,
  );
  const assetIds = new Set<string>(),
    sceneIds = new Set<string>();
  for (const [i, raw] of b.segments.entries()) {
    const s = record(raw, [
      "sceneId",
      "assetId",
      "startFrame",
      "sourceStartFrame",
      "durationFrames",
      "fadeInFrames",
    ]);
    id(s.sceneId);
    id(s.assetId);
    requireValue(!assetIds.has(s.assetId) && !sceneIds.has(s.sceneId));
    assetIds.add(s.assetId);
    sceneIds.add(s.sceneId);
    integer(s.startFrame, 0, total);
    integer(s.sourceStartFrame, 0, 192);
    integer(s.durationFrames, 1, 192);
    integer(s.fadeInFrames, 0, 12);
    requireValue(
      s.startFrame === timings[i][0] &&
        s.durationFrames === timings[i][1] &&
        s.sourceStartFrame === 0 &&
        s.fadeInFrames === (i === 0 ? 0 : 12),
    );
  }
  const timed = (layer: Record<string, unknown>) => {
    integer(layer.startFrame, 0, total - 1);
    integer(layer.endFrame, Number(layer.startFrame) + 1, total);
  };
  const positioned = (layer: Record<string, unknown>) => {
    timed(layer);
    integer(layer.centerX, 0, width);
    integer(layer.centerY, 0, height);
  };
  requireValue(Array.isArray(b.texts) && b.texts.length <= 20);
  const textIds = new Set<string>();
  for (const raw of b.texts) {
    const t = record(raw, [
      "id",
      "text",
      "startFrame",
      "endFrame",
      "centerX",
      "centerY",
      "fontFamily",
      "fontSizePx",
      "color",
    ]);
    id(t.id);
    requireValue(!textIds.has(t.id));
    textIds.add(t.id);
    positioned(t);
    requireValue(
      typeof t.text === "string" && t.text.length > 0 && t.text.length <= 4096,
    );
    requireValue(t.fontFamily === "Be Vietnam Pro");
    integer(t.fontSizePx, 1, height);
    requireValue(
      typeof t.color === "string" && /^#[a-f0-9]{6}$/i.test(t.color),
    );
  }
  if (b.logo !== null) {
    const logo = record(b.logo, [
      "assetId",
      "startFrame",
      "endFrame",
      "centerX",
      "centerY",
      "widthPx",
    ]);
    id(logo.assetId);
    requireValue(!assetIds.has(logo.assetId));
    assetIds.add(logo.assetId);
    positioned(logo);
    integer(logo.widthPx, 1, width);
  }
  if (b.music !== null) {
    const music = record(b.music, [
      "assetId",
      "catalogId",
      "startFrame",
      "endFrame",
      "gain",
    ]);
    id(music.assetId);
    requireValue(!assetIds.has(music.assetId));
    timed(music);
    requireValue(
      typeof music.catalogId === "string" &&
        Object.hasOwn(PRODUCTION_MUSIC, music.catalogId),
    );
    requireValue(
      typeof music.gain === "number" &&
        Number.isFinite(music.gain) &&
        music.gain >= 0 &&
        music.gain <= 1,
    );
  }
  return value as ProductionBundle;
}

// 24fps on the native 120000-tick clock is an exact integer mapping.
const ticks = (frames: number) => (frames * 5000) as MediaTime;
function completeProject(
  project: TProject,
  assets: MediaAsset[],
  projectId: string,
) {
  if (
    project.metadata.id !== projectId ||
    !project.scenes.length ||
    !project.scenes.some((s) => s.id === project.currentSceneId)
  )
    return false;
  return project.scenes.every((s) =>
    [...s.tracks.overlay, s.tracks.main, ...s.tracks.audio].every((track) =>
      track.elements.every(
        (element) =>
          !("mediaId" in element) ||
          assets.some((a) => a.id === element.mediaId && a.file.size > 0),
      ),
    ),
  );
}

function buildProject(
  b: ProductionBundle,
  assets: MediaAsset[],
  services: ProductionImportServices,
): TProject {
  const now = new Date(),
    sceneId = crypto.randomUUID();
  const base = (start: number, duration: number) => ({
    id: crypto.randomUUID(),
    startTime: ticks(start),
    duration: ticks(duration),
    trimStart: ticks(0),
    trimEnd: ticks(0),
  });
  const videos: VideoElement[] = b.segments.map((s) => ({
    ...base(s.startFrame, s.durationFrames),
    name: `Scene ${b.segments.indexOf(s) + 1}`,
    type: "video",
    mediaId: s.assetId,
    sourceDuration: ticks(192),
    trimStart: ticks(s.sourceStartFrame),
    trimEnd: ticks(192 - s.sourceStartFrame - s.durationFrames),
    isSourceAudioEnabled: false,
    hidden: false,
    params: services.params("video"),
    ...(s.fadeInFrames
      ? {
          animations: {
            opacity: {
              keys: [
                {
                  id: crypto.randomUUID(),
                  time: ticks(0),
                  value: 0,
                  segmentToNext: "linear" as const,
                  tangentMode: "flat" as const,
                },
                {
                  id: crypto.randomUUID(),
                  time: ticks(s.fadeInFrames),
                  value: 1,
                  segmentToNext: "linear" as const,
                  tangentMode: "flat" as const,
                },
              ],
            },
          },
        }
      : {}),
  }));
  const videoTrack = (elements: VideoElement[]) => ({
    id: crypto.randomUUID(),
    name: elements[0].name,
    type: "video" as const,
    elements,
    muted: false,
    hidden: false,
  });
  const overlay: OverlayTrack[] = videos
    .slice(1)
    .reverse()
    .map((video) => videoTrack([video]));
  for (const t of b.texts)
    overlay.unshift({
      id: crypto.randomUUID(),
      name: "Text",
      type: "text",
      hidden: false,
      elements: [
        {
          ...base(t.startFrame, t.endFrame - t.startFrame),
          id: t.id,
          type: "text",
          name: t.text,
          params: {
            ...services.params("text"),
            content: t.text,
            fontFamily: t.fontFamily,
            fontSize: (t.fontSizePx * 90) / b.height,
            color: t.color,
            "transform.positionX": t.centerX - b.width / 2,
            "transform.positionY": t.centerY - b.height / 2,
          },
        },
      ],
    });
  if (b.logo) {
    const logo = b.logo,
      asset = assets.find((a) => a.id === logo.assetId)!;
    const containScale = Math.min(
      b.width / asset.width!,
      b.height / asset.height!,
    );
    const scale = logo.widthPx / (asset.width! * containScale);
    overlay.unshift({
      id: crypto.randomUUID(),
      name: "Logo",
      type: "video",
      muted: true,
      hidden: false,
      elements: [
        {
          ...base(logo.startFrame, logo.endFrame - logo.startFrame),
          name: "Logo",
          type: "image",
          mediaId: logo.assetId,
          params: {
            ...services.params("image"),
            "transform.positionX": logo.centerX - b.width / 2,
            "transform.positionY": logo.centerY - b.height / 2,
            "transform.scaleX": scale,
            "transform.scaleY": scale,
          },
        },
      ],
    });
  }
  const sourceAudio: AudioElement[] = b.preserveSourceAudio
    ? b.segments.flatMap((s, i) => {
        if (!assets.find((a) => a.id === s.assetId)?.hasAudio) return [];
        const duration =
          (b.segments[i + 1]?.startFrame ?? b.totalFrames) - s.startFrame;
        return [
          {
            ...base(s.startFrame, duration),
            type: "audio" as const,
            sourceType: "upload" as const,
            name: `Scene ${i + 1} audio`,
            mediaId: s.assetId,
            sourceDuration: ticks(192),
            trimStart: ticks(s.sourceStartFrame),
            trimEnd: ticks(192 - s.sourceStartFrame - duration),
            params: services.params("audio"),
          },
        ];
      })
    : [];
  const audio = sourceAudio.length
    ? [
        {
          id: crypto.randomUUID(),
          type: "audio" as const,
          name: "Source audio",
          muted: false,
          elements: sourceAudio,
        },
      ]
    : [];
  if (b.music) {
    const m = b.music,
      asset = assets.find((a) => a.id === m.assetId)!;
    const sourceFrames = Math.floor(asset.duration! * 24);
    const duration = Math.min(m.endFrame - m.startFrame, sourceFrames);
    audio.push({
      id: crypto.randomUUID(),
      type: "audio",
      name: m.catalogId,
      muted: false,
      elements: [
        {
          ...base(m.startFrame, duration),
          type: "audio",
          sourceType: "upload",
          name: m.catalogId,
          mediaId: m.assetId,
          sourceDuration: ticks(sourceFrames),
          trimEnd: ticks(sourceFrames - duration),
          params: {
            ...services.params("audio"),
            volume: m.gain === 0 ? -60 : 20 * Math.log10(m.gain),
            muted: m.gain === 0,
          },
        },
      ],
    });
  }
  return {
    metadata: {
      id: b.projectId,
      name: b.name,
      duration: ticks(b.totalFrames),
      createdAt: now,
      updatedAt: now,
    },
    scenes: [
      {
        id: sceneId,
        name: b.name,
        isMain: true,
        tracks: { overlay, main: videoTrack([videos[0]]), audio },
        bookmarks: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
    currentSceneId: sceneId,
    version: services.version,
    settings: {
      fps: { numerator: 24, denominator: 1 },
      canvasSize: { width: b.width, height: b.height },
      originalCanvasSize: { width: b.width, height: b.height },
      canvasSizeMode: "preset",
      background: { type: "color", color: "#000000" },
    },
  };
}

export async function importProduction(
  context: ImportContext,
  services: ProductionImportServices,
) {
  id(context.sourceProductionId);
  id(context.userId);
  id(context.workspaceId);
  const b = validateProductionBundle(
    await services.getBundle(),
    context.sourceProductionId,
  );
  return services.lock(
    `brandhub-production-import:${context.userId}:${context.workspaceId}:${b.projectId}`,
    async () => {
      const existing = await services.loadProject(b.projectId);
      const assets = await services.loadMedia(b.projectId);
      try {
        if (existing) {
          if (!completeProject(existing, assets, b.projectId))
            throw new Error(
              "The existing local draft is incomplete. Open the project library to recover it.",
            );
          await services.openProject(b.projectId);
          return {
            projectId: b.projectId,
            reopened: true,
            cloudSaved: !!existing.metadata.videoSpaceRevision,
          };
        }
        try {
          const remote = await services.restoreProject(b.projectId);
          const restoredAssets = await services.loadMedia(b.projectId);
          const complete = completeProject(remote, restoredAssets, b.projectId);
          for (const asset of restoredAssets)
            if (asset.url) URL.revokeObjectURL(asset.url);
          if (!remote.metadata.videoSpaceRevision || !complete)
            throw new Error("The accepted project is incomplete");
          await services.openProject(b.projectId);
          return { projectId: b.projectId, reopened: true, cloudSaved: true };
        } catch (error) {
          if (!(
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          ))
            throw error;
        }
        const ensureAsset = async (
          assetId: string,
          type: MediaAsset["type"],
          read: () => Promise<File>,
        ) => {
          let asset = assets.find((a) => a.id === assetId);
          if (!asset) {
            const file = await read();
            if (!file.size || file.size > 128 * 1024 * 1024)
              throw new Error("Invalid production media size");
            asset = { ...(await services.process(file)), id: assetId };
            validateAsset(asset, type);
            await services.saveMedia(b.projectId, asset);
            assets.push(asset);
          } else validateAsset(asset, type);
          return asset;
        };
        for (const s of b.segments)
          await ensureAsset(s.assetId, "video", () => services.readSource(s));
        if (b.logo)
          await ensureAsset(b.logo.assetId, "image", () =>
            services.readLogo(b.logo!, b.projectId),
          );
        if (b.music)
          await ensureAsset(b.music.assetId, "audio", () =>
            services.readMusic(b.music!.catalogId),
          );
        const project = buildProject(b, assets, services);
        // The first visible snapshot is complete; failed media imports leave no empty project.
        await services.saveProject(project);
        await services.openProject(b.projectId);
        try {
          await services.publish(b.projectId);
          return { projectId: b.projectId, reopened: false, cloudSaved: true };
        } catch {
          return { projectId: b.projectId, reopened: false, cloudSaved: false };
        }
      } finally {
        for (const asset of assets)
          if (asset.url) URL.revokeObjectURL(asset.url);
      }
    },
  );
}

function validateAsset(asset: MediaAsset, type: MediaAsset["type"]) {
  if (asset.type !== type || !asset.file.size)
    throw new Error("Invalid production media type");
  if (
    type !== "image" &&
    (!Number.isFinite(asset.duration) || asset.duration! <= 0)
  )
    throw new Error("Could not decode production media");
  if (
    type === "video" &&
    (Math.floor(asset.duration! * 24 + 0.001) < 192 || asset.fps !== 24)
  )
    throw new Error(
      "The source video is shorter than eight seconds or has an invalid frame rate",
    );
  if (type !== "audio" && (!asset.width || !asset.height))
    throw new Error("Could not decode production image dimensions");
}

export async function createProjectFromProduction() {
  const { getProductionImportServices } =
    await import("./production-runtime.ts");
  const { context, services } = await getProductionImportServices();
  return importProduction(context, services);
}
