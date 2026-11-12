import assert from "node:assert/strict";
import test from "node:test";

test("child bridge binds context, requests, responses and flush to the parent session", async () => {
  const listeners = new Map();
  const messages = [];
  const parent = {
    postMessage: (message, origin) => {
      messages.push({ message, origin });
    },
  };
  globalThis.window = {
    parent,
    location: { origin: "https://brandhub.example" },
    setInterval,
    clearInterval,
    setTimeout,
    clearTimeout,
    addEventListener: (type, listener) => listeners.set(type, listener),
  };
  globalThis.document = { documentElement: { lang: "vi" } };
  const bridge = await import("../src/platform/host.ts");
  const context = {
    type: "brandhub-video-space:context",
    version: 1,
    sessionId: "session-a",
    userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    workspaceId: "11111111-1111-4111-8111-111111111111",
    locale: "vi",
    theme: "dark",
    sourceProductionId: "55555555-5555-4555-8555-555555555555",
  };
  const emit = (data, overrides = {}) =>
    listeners.get("message")({
      data,
      origin: window.location.origin,
      source: parent,
      ...overrides,
    });
  const connected = bridge.connectHost();
  emit(context, { origin: "https://foreign.example" });
  assert.throws(() => bridge.getHostContext());
  emit(context, { source: {} });
  assert.throws(() => bridge.getHostContext());
  emit(context);
  assert.equal((await connected).sessionId, "session-a");
  emit({ ...context, locale: "en", theme: "light" });
  assert.equal(bridge.getHostContext().locale, "en");
  emit({ ...context, userId: "user-b" });
  assert.equal(bridge.getHostContext().userId, context.userId);
  emit({
    ...context,
    sourceProductionId: "66666666-6666-4666-8666-666666666666",
  });
  assert.equal(
    bridge.getHostContext().sourceProductionId,
    context.sourceProductionId,
  );
  emit({ ...context, sourceProductionId: undefined });
  assert.equal(
    bridge.getHostContext().sourceProductionId,
    context.sourceProductionId,
  );

  await assert.rejects(bridge.hostFetch("/api/v1/auth/refresh"), /outside/);
  const request = bridge.hostFetch(
    bridge.getProjectApiBase() + "?page=0&size=50",
  );
  const sent = messages.at(-1).message;
  assert.equal(sent.method, "GET");
  emit({
    type: "brandhub-video-space:response",
    version: 1,
    sessionId: "wrong",
    requestId: sent.requestId,
    status: 200,
    body: { data: ["foreign"] },
  });
  emit({
    type: "brandhub-video-space:response",
    version: 1,
    sessionId: "session-a",
    requestId: sent.requestId,
    status: 200,
    body: { data: ["owned"] },
  });
  assert.deepEqual(await (await request).json(), { data: ["owned"] });

  const form = new FormData();
  form.set("file", new File(["clip"], "clip.mp4", { type: "video/mp4" }));
  form.set("metadata", "{}");
  const uploaded = bridge.hostFetch(
    bridge.getProjectApiBase() +
      "/22222222-2222-4222-8222-222222222222/media/33333333-3333-4333-8333-333333333333",
    { method: "PUT", body: form },
  );
  const upload = messages.at(-1).message;
  assert.equal(upload.body.file.name, "clip.mp4");
  assert.equal(upload.body.metadata, "{}");
  emit({
    type: "brandhub-video-space:response",
    version: 1,
    sessionId: "session-a",
    requestId: upload.requestId,
    status: 200,
    body: { data: {} },
  });
  await uploaded;

  emit({
    type: "brandhub-video-space:command",
    version: 1,
    sessionId: "session-a",
    requestId: "flush-startup",
    command: "flush",
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    messages.at(-1).message.success,
    true,
    "a failed renderer startup must still allow returning without a draft",
  );
  bridge.setFlushHandler(async () => {
    throw new Error("disk full");
  });
  emit({
    type: "brandhub-video-space:command",
    version: 1,
    sessionId: "session-a",
    requestId: "flush-a",
    command: "flush",
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(messages.at(-1).message.success, false);
  assert.equal(messages.at(-1).message.error, "disk full");
  bridge.setFlushHandler(async () => {});
  emit({
    type: "brandhub-video-space:command",
    version: 1,
    sessionId: "session-a",
    requestId: "flush-b",
    command: "flush",
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(messages.at(-1).message.success, true);
  assert.ok(
    messages.every(
      ({ message, origin }) =>
        origin === window.location.origin && !("token" in message),
    ),
  );
  listeners.get("pagehide")();
});
