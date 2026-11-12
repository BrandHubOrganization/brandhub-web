import assert from "node:assert/strict";
import test from "node:test";
import * as production from "../src/brandhub/import-production.ts";

const uuid = (n) => `${String(n).padStart(8, "0")}-1111-4111-8111-111111111111`;
const context = {
  userId: uuid(1),
  workspaceId: uuid(2),
  sourceProductionId: uuid(3),
};
function bundle(seconds = 15) {
  const three = seconds === 20;
  return {
    productionId: uuid(3),
    projectId: uuid(4),
    name: "Nước hoa",
    fps: 24,
    width: 720,
    height: 1280,
    totalFrames: seconds * 24,
    preserveSourceAudio: true,
    segments: (three ? [0, 156, 312] : [0, 168]).map((startFrame, i) => ({
      sceneId: uuid(10 + i),
      assetId: uuid(20 + i),
      startFrame,
      sourceStartFrame: 0,
      durationFrames: three ? 168 : i === 0 ? 180 : 192,
      fadeInFrames: i === 0 ? 0 : 12,
    })),
    texts: [
      {
        id: uuid(30),
        text: "Khám phá",
        startFrame: 300,
        endFrame: 360,
        centerX: 400,
        centerY: 1050,
        fontFamily: "Be Vietnam Pro",
        fontSizePx: 48,
        color: "#ffffff",
      },
    ],
    logo: null,
    music: null,
  };
}
function services(input) {
  const events = [],
    projects = new Map(),
    assets = new Map();
  const api = {
    version: 31,
    params: () => ({ opacity: 1, volume: 0 }),
    async lock(name, run) {
      events.push(["lock", name]);
      return run();
    },
    async getBundle() {
      return structuredClone(input);
    },
    async loadProject(id) {
      return projects.get(id) ?? null;
    },
    async loadMedia() {
      return [...assets.values()];
    },
    async restoreProject() {
      throw Object.assign(new Error("missing"), { status: 404 });
    },
    async readSource(segment) {
      events.push(["read", segment.assetId]);
      return new File(["source"], `${segment.assetId}.mp4`, {
        type: "video/mp4",
      });
    },
    async readLogo() {
      return new File(["logo"], "logo.png", { type: "image/png" });
    },
    async readMusic(id) {
      return new File(["music"], `${id}.wav`, { type: "audio/wav" });
    },
    async process(file) {
      return {
        file,
        name: file.name,
        type: file.type.startsWith("video")
          ? "video"
          : file.type.startsWith("image")
            ? "image"
            : "audio",
        duration: file.type.startsWith("audio") ? 19.1429 : 8,
        width: 720,
        height: 1280,
        hasAudio: true,
        fps: 24,
      };
    },
    async saveMedia(id, asset) {
      events.push(["media", asset.id]);
      assets.set(asset.id, asset);
    },
    async saveProject(project) {
      events.push(["snapshot"]);
      projects.set(project.metadata.id, project);
    },
    async openProject(id) {
      events.push(["open", id]);
    },
    async publish(id) {
      events.push(["publish", id]);
    },
  };
  return { api, events, projects, assets };
}

test("importer exposes production entry and rejects unsafe semantic bundles before writes", async () => {
  assert.equal(typeof production.importProduction, "function");
  for (const change of [
    (b) => {
      b.totalFrames = -1;
    },
    (b) => {
      b.segments[1].startFrame += 0.5;
    },
    (b) => {
      b.segments[0].sourceStartFrame = -1;
    },
    (b) => {
      b.url = "https://evil.test";
    },
    (b) => {
      b.segments[0].url = "https://evil.test";
    },
    (b) => {
      b.productionId = uuid(99);
    },
    (b) => {
      b.music = {
        assetId: uuid(50),
        catalogId: "evil",
        startFrame: 0,
        endFrame: 360,
        gain: 0.2,
      };
    },
  ]) {
    const b = bundle();
    change(b);
    const state = services(b);
    await assert.rejects(production.importProduction(context, state.api));
    assert.deepEqual(
      state.events,
      [],
      "malformed bundles do not acquire lock or write media",
    );
  }
});

for (const seconds of [15, 20])
  test(`${seconds}s builds one native scene, immutable full sources, incoming linear fades and hard audio switches`, async () => {
    const b = bundle(seconds),
      state = services(b);
    const result = await production.importProduction(context, state.api);
    assert.equal(result.projectId, b.projectId);
    assert.equal(result.cloudSaved, true);
    const p = state.projects.get(b.projectId),
      scene = p.scenes[0];
    assert.equal(p.metadata.duration, seconds * 120000);
    assert.deepEqual(p.settings.fps, { numerator: 24, denominator: 1 });
    assert.equal(p.scenes.length, 1);
    assert.equal(scene.tracks.main.elements[0].mediaId, b.segments[0].assetId);
    const incoming = scene.tracks.overlay
      .filter((t) => t.type === "video")
      .flatMap((t) => t.elements);
    assert.deepEqual(
      incoming.map((e) => e.startTime),
      b.segments
        .slice(1)
        .reverse()
        .map((s) => s.startFrame * 5000),
    );
    for (const e of [scene.tracks.main.elements[0], ...incoming]) {
      assert.equal(e.sourceDuration, 8 * 120000);
      assert.equal(e.isSourceAudioEnabled, false);
      assert.equal(e.params.opacity, 1);
    }
    assert.deepEqual(
      incoming[0].animations.opacity.keys.map((k) => [
        k.time,
        k.value,
        k.segmentToNext,
      ]),
      [
        [0, 0, "linear"],
        [60000, 1, "linear"],
      ],
    );
    const audio = scene.tracks.audio[0].elements;
    assert.deepEqual(
      audio.map((e) => [e.startTime, e.duration]),
      b.segments.map((s, i) => [
        s.startFrame * 5000,
        ((b.segments[i + 1]?.startFrame ?? b.totalFrames) - s.startFrame) *
          5000,
      ]),
    );
    const text = scene.tracks.overlay[0].elements[0];
    assert.equal(text.params.fontSize, (48 * 90) / 1280);
    assert.equal(text.params["transform.positionX"], 40);
    assert.equal(text.params["transform.positionY"], 410);
    assert.equal(state.assets.size, b.segments.length);
    assert.deepEqual(
      [...state.assets.keys()],
      b.segments.map((s) => s.assetId),
    );
    assert.ok(
      state.events.findIndex(([name]) => name === "snapshot") >
        state.events.findLastIndex(([name]) => name === "media"),
    );
    assert.ok(
      state.events[0][1].includes(
        `${context.userId}:${context.workspaceId}:${b.projectId}`,
      ),
    );
  });

test("repeat open retains manual local edits and does not fetch, import or publish again", async () => {
  const state = services(bundle());
  await production.importProduction(context, state.api);
  state.projects.get(
    uuid(4),
  ).scenes[0].tracks.overlay[0].elements[0].params.content = "Manual edit";
  state.events.length = 0;
  await production.importProduction(context, state.api);
  assert.equal(
    state.projects.get(uuid(4)).scenes[0].tracks.overlay[0].elements[0].params
      .content,
    "Manual edit",
  );
  assert.deepEqual(
    state.events.map(([name]) => name),
    ["lock", "open"],
  );
});

test("restores accepted remote project before importing and fails closed on non404 errors", async () => {
  const b = bundle(),
    state = services(b);
  await production.importProduction(context, state.api);
  const accepted = state.projects.get(b.projectId);
  accepted.metadata.videoSpaceRevision = 5;
  accepted.metadata.name = "Manual remote";
  state.projects.clear();
  state.events.length = 0;
  state.api.restoreProject = async () => {
    state.projects.set(b.projectId, accepted);
    return accepted;
  };
  await production.importProduction(context, state.api);
  assert.equal(state.projects.get(b.projectId).metadata.name, "Manual remote");
  assert.deepEqual(
    state.events.map(([name]) => name),
    ["lock", "open"],
  );
  for (const status of [403, 409, 500]) {
    const failed = services(b);
    failed.api.restoreProject = async () => {
      throw Object.assign(new Error("denied"), { status });
    };
    await assert.rejects(
      production.importProduction(context, failed.api),
      /denied/,
    );
    assert.equal(failed.projects.size, 0);
    assert.equal(failed.assets.size, 0);
  }
});

test("upload or snapshot CAS failure retains complete local draft and allows manual reopen", async () => {
  for (const status of [409, 413, 500]) {
    const state = services(bundle());
    state.api.publish = async () => {
      throw Object.assign(new Error("cloud pending"), { status });
    };
    const result = await production.importProduction(context, state.api);
    assert.equal(result.cloudSaved, false);
    assert.equal(state.projects.size, 1);
    assert.equal(state.assets.size, 2);
    const reopened = await production.importProduction(context, state.api);
    assert.equal(reopened.reopened, true);
  }
});

test("partial media failure exposes no empty project and retries from retained immutable media", async () => {
  const state = services(bundle()),
    read = state.api.readSource;
  state.api.readSource = async (segment) => {
    if (segment.assetId === uuid(21)) throw new Error("fetch failed");
    return read(segment);
  };
  await assert.rejects(
    production.importProduction(context, state.api),
    /fetch failed/,
  );
  assert.equal(state.projects.size, 0);
  assert.equal(state.assets.size, 1);
  state.api.readSource = read;
  await production.importProduction(context, state.api);
  assert.equal(state.projects.size, 1);
  assert.equal(
    state.events.filter(([name, id]) => name === "media" && id === uuid(20))
      .length,
    1,
  );
});

test("two first-open tabs share the scoped lock and the second reopens the completed project", async () => {
  const state = services(bundle());
  let previous = Promise.resolve();
  state.api.lock = async (name, run) => {
    const acquired = previous;
    let release;
    previous = new Promise((resolve) => {
      release = resolve;
    });
    await acquired;
    try {
      state.events.push(["lock", name]);
      return await run();
    } finally {
      release();
    }
  };
  const results = await Promise.all([
    production.importProduction(context, state.api),
    production.importProduction(context, state.api),
  ]);
  assert.equal(results[0].reopened, false);
  assert.equal(results[1].reopened, true);
  assert.equal(state.events.filter(([name]) => name === "snapshot").length, 1);
  assert.equal(state.events.filter(([name]) => name === "publish").length, 1);
  assert.equal(state.events.filter(([name]) => name === "read").length, 2);
});

test("existing incomplete local drafts fail closed without replacing their timeline", async () => {
  const state = services(bundle());
  await production.importProduction(context, state.api);
  const original = state.projects.get(uuid(4));
  state.assets.clear();
  state.events.length = 0;
  await assert.rejects(
    production.importProduction(context, state.api),
    /incomplete/,
  );
  assert.equal(state.projects.get(uuid(4)), original);
  assert.deepEqual(
    state.events.map(([name]) => name),
    ["lock"],
  );
});

test("short music ends naturally with no loop; logo remains an editable image above video", async () => {
  const b = bundle(20);
  b.music = {
    assetId: uuid(50),
    catalogId: "music-little-launch",
    startFrame: 0,
    endFrame: 480,
    gain: 0.2,
  };
  b.logo = {
    assetId: uuid(51),
    startFrame: 0,
    endFrame: 480,
    centerX: 600,
    centerY: 150,
    widthPx: 120,
  };
  const state = services(b);
  await production.importProduction(context, state.api);
  const scene = state.projects.get(b.projectId).scenes[0],
    music = scene.tracks.audio[1].elements[0];
  assert.equal(music.duration, Math.floor(19.1429 * 24) * 5000);
  assert.equal(music.params.volume, 20 * Math.log10(0.2));
  assert.equal(scene.tracks.overlay[0].elements[0].type, "image");
  assert.equal(
    scene.tracks.overlay[0].elements[0].params["transform.scaleX"],
    120 / 720,
  );
});
