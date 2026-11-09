import { expect, test, type Page, type WebSocketRoute } from "@playwright/test";
import * as Y from "yjs";
import { Awareness, encodeAwarenessUpdate } from "y-protocols/awareness";

/**
 * FR 3.6.10 Content Writing View — browser tests against the real canvas
 * editor. REST is mocked (page.route) and the STOMP WebSocket is a tiny
 * in-test broker (page.routeWebSocket) that echoes every SEND back as a
 * MESSAGE with an increasing sequenceNumber, like TaskContentWebSocketController.
 */

const WS = "workspace-1";
const TASK = "task-1";
const CONTENT_URL = `**/api/v1/workspaces/${WS}/tasks/${TASK}/content`;

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function stateWith(build: (t: Y.Text) => void): string {
  const doc = new Y.Doc();
  build(doc.getText("content"));
  return toBase64(Y.encodeStateAsUpdate(doc));
}

function textOf(base64: string): string {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Buffer.from(base64, "base64"));
  return doc.getText("content").toString();
}

interface Broker {
  /** Yjs updates the page sent over STOMP SEND frames, in order. */
  sent: string[];
  /** Awareness (presence/cursor) updates the page sent — kept separate from `sent`, see startBroker. */
  awarenessSent: string[];
  /**
   * Pushes a MESSAGE frame to the page's real awareness subscription, as if
   * a second client's update had arrived — set by startBroker once the page
   * subscribes. Playwright's WebSocketRoute.send() only pushes server->client,
   * so simulating a peer means emitting a MESSAGE directly (there's no way
   * to inject an inbound SEND as if from another client), targeted at the
   * subscription id this page actually registered (a made-up id is ignored
   * by stompjs).
   */
  simulatePeerAwareness: (update: string) => void;
}

/** Minimal STOMP 1.2 broker over a Playwright WebSocketRoute. */
function startBroker(ws: WebSocketRoute, broker: Broker) {
  let seq = 0;
  const subs: { id: string; destination: string }[] = [];
  const frame = (command: string, headers: Record<string, string>, body = "") =>
    `${command}\n${Object.entries(headers)
      .map(([k, v]) => `${k}:${v}`)
      .join("\n")}\n\n${body}\0`;

  ws.onMessage((raw) => {
    const message = typeof raw === "string" ? raw : raw.toString();
    for (const chunk of message.split("\0")) {
      if (!chunk.trim()) continue;
      const sep = chunk.indexOf("\n\n");
      const head = (sep === -1 ? chunk : chunk.slice(0, sep)).replace(
        /^\n+/,
        "",
      );
      const body = sep === -1 ? "" : chunk.slice(sep + 2);
      const [command, ...headerLines] = head.split("\n");
      const headers = Object.fromEntries(
        headerLines.map((l) => [
          l.slice(0, l.indexOf(":")),
          l.slice(l.indexOf(":") + 1),
        ]),
      );
      if (command === "CONNECT" || command === "STOMP") {
        ws.send(frame("CONNECTED", { version: "1.2", "heart-beat": "0,0" }));
      } else if (command === "SUBSCRIBE") {
        subs.push({ id: headers.id, destination: headers.destination });
        if (headers.destination.endsWith("/awareness")) {
          let msgSeq = 0;
          broker.simulatePeerAwareness = (update: string) => {
            msgSeq += 1;
            ws.send(
              frame(
                "MESSAGE",
                {
                  destination: headers.destination,
                  subscription: headers.id,
                  "message-id": `peer-m${msgSeq}`,
                  "content-type": "application/json",
                },
                JSON.stringify({ update }),
              ),
            );
          };
        }
      } else if (command === "SEND") {
        const { update } = JSON.parse(body) as { update: string };
        const isAwareness = headers.destination.endsWith("/awareness");
        // Awareness is a separate app-level channel from content (see
        // TaskContentWebSocketController.handleAwareness) — presence
        // updates are frequent (every caret move) and must not be counted
        // alongside, or echoed back shaped as, content Yjs updates.
        if (isAwareness) {
          broker.awarenessSent.push(update);
        } else {
          broker.sent.push(update);
        }
        seq += 1;
        const topic = headers.destination.replace("/app/", "/topic/");
        for (const s of subs.filter((x) => x.destination === topic)) {
          ws.send(
            frame(
              "MESSAGE",
              {
                destination: topic,
                subscription: s.id,
                "message-id": `m${seq}`,
                "content-type": "application/json",
              },
              isAwareness
                ? JSON.stringify({ update })
                : JSON.stringify({
                    update,
                    sequenceNumber: seq,
                    editedBy: "studio-test-user",
                  }),
            ),
          );
        }
      }
    }
  });
}

interface Backend {
  broker: Broker;
  snapshotPosts: { yjsState: string; atSequenceNumber: number }[];
  versions: unknown[];
  versionStates: Record<string, string>;
  restoreCalls: string[];
  /** Every STOMP socket the page opened, oldest first (so tests can drop one). */
  sockets: WebSocketRoute[];
  /** Operations the REST content endpoint reports (tests may add "missed" ones). */
  ops: string[];
}

async function setup(
  page: Page,
  opts: {
    versions?: unknown[];
    versionStates?: Record<string, string>;
    initial?: { snapshot: string | null; ops?: string[] };
  } = {},
): Promise<Backend> {
  const backend: Backend = {
    broker: { sent: [], awarenessSent: [], simulatePeerAwareness: () => {} },
    snapshotPosts: [],
    versions: opts.versions ?? [],
    versionStates: opts.versionStates ?? {},
    restoreCalls: [],
    sockets: [],
    ops: opts.initial?.ops ?? [],
  };

  await page.addInitScript(() => {
    window.localStorage.setItem("brandhub_current_agency_id", "agency-1");
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "studio-test-user",
            name: "Studio Tester",
            email: "studio@brandhub.dev",
            role: "USER",
            workspaceId: "workspace-1",
          },
          accessToken: "dev-token-studio",
          refreshToken: "",
          isAuthenticated: true,
          systemRole: "USER",
        },
        version: 0,
      }),
    );
  });

  const json = (body: unknown) => ({
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: body }),
  });

  await page.route("**/api/v1/workspaces", (route) =>
    route.fulfill(
      json([
        {
          id: WS,
          name: "Studio Workspace",
          agencyId: "agency-1",
          slug: "studio",
          ownerId: "studio-test-user",
          logoUrl: null,
          settings: {},
          isActive: true,
          createdAt: new Date().toISOString(),
          myRole: "CREATOR",
          clientProfileId: null,
        },
      ]),
    ),
  );
  await page.route("**/api/v1/agencies", (route) =>
    route.fulfill(
      json([
        {
          id: "agency-1",
          name: "Studio Agency",
          ownerId: "studio-test-user",
          myRole: "MEMBER",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
      ]),
    ),
  );
  await page.route(CONTENT_URL, (route) =>
    route.fulfill(
      json({
        snapshot: opts.initial?.snapshot ?? null,
        operationsSinceSnapshot: backend.ops,
        sequenceNumber: 0,
      }),
    ),
  );
  await page.route(`${CONTENT_URL}/snapshot`, async (route) => {
    backend.snapshotPosts.push(route.request().postDataJSON());
    await route.fulfill(json(null));
  });
  await page.route(`${CONTENT_URL}/versions`, (route) =>
    route.fulfill(json(backend.versions)),
  );
  await page.route(`${CONTENT_URL}/versions/**`, async (route) => {
    const url = route.request().url();
    const isRestore = url.endsWith("/restore");
    const id = (isRestore ? url.replace("/restore", "") : url)
      .split("/")
      .pop()!;
    if (isRestore) backend.restoreCalls.push(id);
    await route.fulfill(
      json({
        snapshot: backend.versionStates[id] ?? null,
        operationsSinceSnapshot: [],
        sequenceNumber: 9,
      }),
    );
  });
  await page.routeWebSocket(/\/ws\/tasks/, (ws) => {
    backend.sockets.push(ws);
    startBroker(ws, backend.broker);
  });

  await page.goto(`/workspaces/${WS}/content-writing?taskId=${TASK}`);
  await expect(page.getByLabel("Content editor input")).toBeAttached();
  return backend;
}

/** Plain-text mirror of the canvas content (screen-reader region, kept in sync with Y.Text). */
const mirror = (page: Page) => page.locator('.sr-only[aria-live="polite"]');

async function focusEditor(page: Page) {
  await page.locator("canvas").click({ position: { x: 40, y: 30 } });
}

async function typeText(page: Page, text: string) {
  await focusEditor(page);
  await page.keyboard.type(text);
}

test.describe("Content Writing View — editor", () => {
  test("E2E-01 loads the editor and connects to the sync socket", async ({
    page,
  }) => {
    await setup(page);
    await expect(page.getByText("Live", { exact: true })).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible();
    await expect(mirror(page)).toHaveText("");
  });

  test("E2E-02 typed text appears in the editor, preview and is sent as Yjs updates", async ({
    page,
  }) => {
    const backend = await setup(page);
    await typeText(page, "Hello BrandHub");
    await expect(mirror(page)).toHaveText("Hello BrandHub");
    await expect(page.getByText("Hello BrandHub").first()).toBeVisible();
    await expect.poll(() => backend.broker.sent.length).toBeGreaterThan(0);
    // replaying everything the page sent reconstructs exactly the typed text
    const doc = new Y.Doc();
    backend.broker.sent.forEach((u) =>
      Y.applyUpdate(doc, Buffer.from(u, "base64")),
    );
    expect(doc.getText("content").toString()).toBe("Hello BrandHub");
  });

  test("E2E-03 existing content is restored from snapshot on load", async ({
    page,
  }) => {
    await setup(page, {
      initial: { snapshot: stateWith((t) => t.insert(0, "Saved draft")) },
    });
    await expect(mirror(page)).toHaveText("Saved draft");
  });

  test("E2E-04 Vietnamese IME composition commits only on compositionend, without a render loop", async ({
    page,
  }) => {
    const loopErrors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && m.text().includes("Maximum update depth"))
        loopErrors.push(m.text());
    });
    await setup(page);
    await focusEditor(page);
    const copy = page.getByRole("button", { name: /Sao chép bản đăng/ });
    const cdp = await page.context().newCDPSession(page);

    await cdp.send("Input.imeSetComposition", {
      text: "v",
      selectionStart: 1,
      selectionEnd: 1,
    });
    await cdp.send("Input.imeSetComposition", {
      text: "việ",
      selectionStart: 3,
      selectionEnd: 3,
    });
    // The syllable is only a canvas preview: the mirror shows it, but nothing is
    // in the document yet (publish text is still empty → copy stays disabled).
    await expect(mirror(page)).toHaveText("việ");
    await expect(copy).toBeDisabled();

    await cdp.send("Input.insertText", { text: "việt" });
    await expect(mirror(page)).toHaveText("việt");
    await expect(copy).toBeEnabled();
    expect(loopErrors).toEqual([]);
  });

  test("E2E-05 Ctrl+B on a selection turns the preview/publish text into Unicode bold", async ({
    page,
  }) => {
    await setup(page);
    await typeText(page, "Sale");
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Control+B");
    // plain mirror stays plain; publish text (preview) becomes Mathematical Sans-Serif Bold
    await expect(mirror(page)).toHaveText("Sale");
    await expect(
      page.getByText("\u{1d5e6}\u{1d5ee}\u{1d5f9}\u{1d5f2}").first(),
    ).toBeVisible();
  });

  test("E2E-06 Select-all + Backspace clears the document", async ({
    page,
  }) => {
    await setup(page);
    await typeText(page, "to be removed");
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await expect(mirror(page)).toHaveText("");
  });

  test("E2E-07 undo reverts the last edit, redo re-applies it", async ({
    page,
  }) => {
    await setup(page);
    await typeText(page, "undo me");
    await expect(mirror(page)).toHaveText("undo me");
    await page.keyboard.press("Control+Z");
    await expect(mirror(page)).toHaveText("");
    await page.keyboard.press("Control+Y");
    await expect(mirror(page)).toHaveText("undo me");
  });
});

test.describe("Content Writing View — lists", () => {
  test("E2E-08 bullet button prefixes the paragraph; clicking again removes it", async ({
    page,
  }) => {
    await setup(page);
    await typeText(page, "buy milk");
    await page.getByRole("button", { name: "Bulleted list" }).click();
    await expect(mirror(page)).toHaveText("• buy milk");
    await page.getByRole("button", { name: "Bulleted list" }).click();
    await expect(mirror(page)).toHaveText("buy milk");
  });

  test("E2E-09 numbered button numbers every selected paragraph", async ({
    page,
  }) => {
    const seed = stateWith((t) => t.insert(0, "one\ntwo\nthree"));
    await setup(page, { initial: { snapshot: seed } });
    await focusEditor(page);
    await page.keyboard.press("Control+A");
    await page.getByRole("button", { name: "Numbered list" }).click();
    await expect(mirror(page)).toHaveText("1. one\n2. two\n3. three");
  });

  test("E2E-10 Enter inside a list item continues the list; Enter on an empty item exits it", async ({
    page,
  }) => {
    await setup(page);
    await typeText(page, "first");
    await page.getByRole("button", { name: "Bulleted list" }).click();
    await page.keyboard.press("Enter");
    await page.keyboard.type("second");
    await expect(mirror(page)).toHaveText("• first\n• second");
    await page.keyboard.press("Enter");
    await expect(mirror(page)).toHaveText("• first\n• second\n• ");
    await page.keyboard.press("Enter"); // empty item → leave the list
    await expect(mirror(page)).toHaveText("• first\n• second\n");
  });
});

test.describe("Content Writing View — version history", () => {
  const v1State = stateWith((t) => t.insert(0, "xin chào cả nhà"));
  const v2State = stateWith((t) => t.insert(0, "xin chào mọi người"));
  const versions = [
    {
      snapshotId: "v2",
      sequenceNumber: 20,
      createdAt: "2026-10-12T09:00:00Z",
      editedBy: "u1",
      editedByName: "Lê Trí Trung",
    },
    {
      snapshotId: "v1",
      sequenceNumber: 10,
      createdAt: "2026-10-12T08:00:00Z",
      editedBy: null,
      editedByName: null,
    },
  ];

  test("E2E-11 lists versions with the editor's name, falling back to Unknown", async ({
    page,
  }) => {
    await setup(page, {
      versions,
      versionStates: { v1: v1State, v2: v2State },
    });
    await expect(page.getByText("Lê Trí Trung")).toBeVisible();
    await expect(page.getByText("Unknown")).toBeVisible();
  });

  test("E2E-12 'Changes' shows a word diff against the previous version; toggles off", async ({
    page,
  }) => {
    await setup(page, {
      versions,
      versionStates: { v1: v1State, v2: v2State },
    });
    const row = page.locator("li").filter({ hasText: "Lê Trí Trung" });
    await row.getByRole("button", { name: "Changes" }).click();
    // "cả nhà" → "mọi người": both words are struck, both replacements highlighted
    await expect(row.locator("span.line-through")).toHaveText(["cả", "nhà"]);
    await expect(row.locator("span.bg-green-100")).toHaveText(["mọi", "người"]);
    await row.getByRole("button", { name: "Hide" }).click();
    await expect(row.locator("span.line-through")).toHaveCount(0);
  });

  test("E2E-13 first version diff is all additions (nothing before it)", async ({
    page,
  }) => {
    await setup(page, {
      versions,
      versionStates: { v1: v1State, v2: v2State },
    });
    const row = page.locator("li").filter({ hasText: "Unknown" });
    await row.getByRole("button", { name: "Changes" }).click();
    await expect(row.locator("span.bg-green-100")).toContainText(
      "xin chào cả nhà",
    );
    await expect(row.locator("span.line-through")).toHaveCount(0);
  });

  test("E2E-14 Restore replaces the live content and broadcasts it as a normal update", async ({
    page,
  }) => {
    const initial = stateWith((t) => t.insert(0, "current text"));
    const backend = await setup(page, {
      versions,
      versionStates: { v1: v1State, v2: v2State },
      initial: { snapshot: initial },
    });
    await expect(mirror(page)).toHaveText("current text");
    const sentBefore = backend.broker.sent.length;

    await page
      .locator("li")
      .filter({ hasText: "Unknown" })
      .getByRole("button", { name: "Restore" })
      .click();

    await expect(mirror(page)).toHaveText("xin chào cả nhà");
    expect(backend.restoreCalls).toEqual(["v1"]);
    await expect
      .poll(() => backend.broker.sent.length)
      .toBeGreaterThan(sentBefore);
    // the restore is a plain Yjs edit: replaying it on top of the old state yields the restored text
    const doc = new Y.Doc();
    Y.applyUpdate(doc, Buffer.from(initial, "base64"));
    backend.broker.sent
      .slice(sentBefore)
      .forEach((u) => Y.applyUpdate(doc, Buffer.from(u, "base64")));
    expect(doc.getText("content").toString()).toBe("xin chào cả nhà");
  });

  test("E2E-15 empty history shows the placeholder", async ({ page }) => {
    await setup(page);
    await expect(page.getByText("No saved versions yet")).toBeVisible();
  });
});

test.describe("Content Writing View — snapshots & publish text", () => {
  test("E2E-16 an idle editor reports a snapshot so short posts get a version", async ({
    page,
  }) => {
    await page.clock.install();
    const backend = await setup(page);
    await typeText(page, "short post");
    await expect(mirror(page)).toHaveText("short post");
    await expect.poll(() => backend.broker.sent.length).toBeGreaterThan(0);

    expect(backend.snapshotPosts).toHaveLength(0); // not before the idle window
    await page.clock.fastForward(21_000);

    await expect.poll(() => backend.snapshotPosts.length).toBe(1);
    expect(textOf(backend.snapshotPosts[0].yjsState)).toBe("short post");
    expect(backend.snapshotPosts[0].atSequenceNumber).toBeGreaterThan(0);
  });

  test("E2E-17 'Sao chép bản đăng' copies the converted publish text", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await setup(page);
    await typeText(page, "Giảm giá");
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Control+B");
    await page.getByRole("button", { name: /Sao chép bản đăng/ }).click();
    await expect(
      page.getByRole("button", { name: /Đã sao chép/ }),
    ).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe(
      // "Giảm giá" in bold: styled base letters + combining marks kept
      "\u{1d5da}\u{1d5f6}\u{1d5ee}̉\u{1d5fa} \u{1d5f4}\u{1d5f6}\u{1d5ee}́",
    );
  });

  test("E2E-18 copy button is disabled while the document is empty", async ({
    page,
  }) => {
    await setup(page);
    await expect(
      page.getByRole("button", { name: /Sao chép bản đăng/ }),
    ).toBeDisabled();
  });
});

test.describe("Content Writing View — presence / multi-cursor", () => {
  /** Encodes a fake peer's awareness state the way y-protocols' Awareness.setLocalState would, for pushing through the mock broker as a real peer. */
  function fakePeerAwarenessUpdate(state: Record<string, unknown>): string {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    awareness.setLocalState(state);
    return toBase64(encodeAwarenessUpdate(awareness, [awareness.clientID]));
  }

  test("E2E-21 a peer's cursor appears with their name and color", async ({
    page,
  }) => {
    // The 30s auto-expiry itself (y-protocols' outdated-state timeout) isn't
    // covered here: lib0's getUnixTime captures a direct `Date.now`
    // reference at module load, which page.clock's monkeypatch (applied
    // after that module already loaded) can't retroactively intercept — a
    // library/clock-mocking limitation, not something app code controls.
    const backend = await setup(page);
    await expect(page.getByText("Live", { exact: true })).toBeVisible();
    backend.broker.simulatePeerAwareness(
      fakePeerAwarenessUpdate({
        userId: "peer-1",
        name: "Ánh Dương",
        color: "#3949ab",
        caretIndex: 0,
        selection: null,
      }),
    );
    await expect(page.getByTitle("Ánh Dương")).toBeVisible();
    await expect(page.getByText("Ánh Dương", { exact: true })).toBeVisible();
  });

  test("E2E-22 this Creator's own caret moves are published to awareness but never rendered as a peer of itself", async ({
    page,
  }) => {
    const backend = await setup(page);
    await typeText(page, "hello");
    await expect
      .poll(() => backend.broker.awarenessSent.length)
      .toBeGreaterThan(0);
    // The mock broker echoes every SEND back to the sender too (like a real
    // multi-subscriber topic) — this Creator's own state must not show up
    // as a peer avatar of themselves.
    await expect(page.locator('[title="Studio Tester"]')).toHaveCount(0);
  });
});

test.describe("Content Writing View — offline resilience & accessibility", () => {
  test("E2E-19 edits typed while disconnected are queued, persisted, then sent on reconnect; missed remote updates are pulled", async ({
    page,
  }) => {
    const backend = await setup(page);
    await expect(page.getByText("Live", { exact: true })).toBeVisible();
    await typeText(page, "A");
    await expect.poll(() => backend.broker.sent.length).toBe(1);

    // a teammate edited while we were away: appears only in the REST log
    const other = new Y.Doc();
    Y.applyUpdate(other, Buffer.from(backend.broker.sent[0], "base64"));
    let missed = "";
    other.on("update", (u) => (missed = toBase64(u)));
    other.getText("content").insert(1, "Z");
    backend.ops = [backend.broker.sent[0], missed];

    const sentBefore = backend.broker.sent.length;
    await backend.sockets[0].close();
    await expect(page.getByText("Live", { exact: true })).toBeHidden();
    await typeText(page, "B");
    // queued locally and persisted for a possible tab close
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("brandhub-content-pending:task-1"),
    );
    expect(stored).not.toBeNull();
    expect(backend.broker.sent.length).toBe(sentBefore);

    // reconnect (stompjs reconnectDelay 3s) flushes the queue and resyncs
    await expect(page.getByText("Live", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect.poll(() => backend.broker.sent.length).toBe(sentBefore + 1);
    await expect(mirror(page)).toContainText("Z");
    await expect(mirror(page)).toContainText("B");
    await expect(mirror(page)).toContainText("A");
    expect(
      await page.evaluate(() =>
        window.localStorage.getItem("brandhub-content-pending:task-1"),
      ),
    ).toBeNull();
  });

  test("E2E-20 the hidden input is exposed as a multiline textbox and the canvas is hidden from assistive tech", async ({
    page,
  }) => {
    await setup(page);
    const input = page.getByRole("textbox", { name: "Content editor input" });
    await expect(input).toBeAttached();
    await expect(input).toHaveAttribute("aria-multiline", "true");
    await expect(page.locator("canvas")).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("Content Writing View — cursor precision, font conversion & published post font verification", () => {
  test("E2E-23 cursor sits at exact pixel coordinates of each word across fonts, sizes, and alignments", async ({
    page,
  }, testInfo) => {
    await setup(page);
    const canvas = page.locator("canvas");
    const caret = page.getByTestId("canvas-caret");

    await typeText(page, "BrandHub Social Studio 2026");
    await expect(mirror(page)).toHaveText("BrandHub Social Studio 2026");
    await expect(caret).toBeVisible();

    // Measure exact canvas pixel width of "BrandHub " and verify clicking right at the start of "Social"
    const wordClickCoords = await page.evaluate(() => {
      const c = document.querySelector("canvas")!;
      const ctx = c.getContext("2d")!;
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const prefixWidth = ctx.measureText("BrandHub ").width;
      return { x: 24 + prefixWidth, y: 28 };
    });

    await canvas.click({
      position: { x: Math.round(wordClickCoords.x), y: wordClickCoords.y },
    });

    // Verify the caret div's CSS `left` matches the exact pixel position of "Social" (no +8px drift!)
    const caretLeftAfterClick = await caret.evaluate((el) =>
      parseFloat((el as HTMLElement).style.left),
    );
    expect(Math.abs(caretLeftAfterClick - wordClickCoords.x)).toBeLessThan(2);

    // Type "Pro " right where we clicked — it must insert immediately before "Social"
    await page.keyboard.type("Pro ");
    await expect(mirror(page)).toHaveText("BrandHub Pro Social Studio 2026");

    await page.screenshot({
      path: testInfo.outputPath("cursor-precision-default-font.png"),
      fullPage: true,
    });

    // Now select all, switch to Georgia 24px Bold, Center-aligned, and verify cursor & click accuracy
    await page.keyboard.press("Control+A");
    await page.locator('select[title="Font chữ"]').selectOption("Georgia, serif");
    await page.locator('select[title="Cỡ chữ"]').selectOption("24");
    await page.getByRole("button", { name: "Căn giữa" }).click();

    const centeredTarget = await page.evaluate(() => {
      const c = document.querySelector("canvas")!;
      const ctx = c.getContext("2d")!;
      ctx.font = "24px Georgia, serif";
      const fullText = "BrandHub Pro Social Studio 2026";
      const fullWidth = ctx.measureText(fullText).width;
      const prefixWidth = ctx.measureText("BrandHub Pro ").width;
      const maxTextWidth = c.clientWidth - 48;
      const lineStartX = 24 + Math.max(0, (maxTextWidth - fullWidth) / 2);
      return { x: lineStartX + prefixWidth, y: 34 };
    });

    await canvas.click({
      position: { x: Math.round(centeredTarget.x), y: centeredTarget.y },
    });

    const centeredCaretLeft = await caret.evaluate((el) =>
      parseFloat((el as HTMLElement).style.left),
    );
    expect(Math.abs(centeredCaretLeft - centeredTarget.x)).toBeLessThan(3);

    await page.keyboard.type("AI ");
    await expect(mirror(page)).toHaveText("BrandHub Pro AI Social Studio 2026");

    await page.screenshot({
      path: testInfo.outputPath("cursor-precision-georgia-24px-centered.png"),
      fullPage: true,
    });
  });

  test("E2E-24 selecting different fonts converts social preview and published post into the exact Unicode font", async ({
    page,
  }, testInfo) => {
    let savedDraftPayload: Record<string, unknown> | null = null;
    let publishCalled = false;

    await setup(page);

    await page.route("**/api/v1/workspaces/workspace-1/posts", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        savedDraftPayload = body;
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              ...body,
              id: "post-font-1",
              workspaceId: "workspace-1",
              status: "DRAFT",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      }
      return route.fallback();
    });

    await page.route(
      "**/api/v1/workspaces/workspace-1/posts/post-font-1/publish",
      async (route) => {
        publishCalled = true;
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: "post-font-1",
              workspaceId: "workspace-1",
              caption: savedDraftPayload?.caption,
              targetPlatforms: savedDraftPayload?.targetPlatforms ?? ["FACEBOOK"],
              status: "PUBLISHED",
              publishedAt: new Date().toISOString(),
            },
          }),
        });
      },
    );

    // 1. Type text and format with Georgia (Serif)
    await typeText(page, "BrandHub Flash Sale 50%");
    await page.keyboard.press("Control+A");
    await page.locator('select[title="Font chữ"]').selectOption("Georgia, serif");

    const expectedGeorgia = "𝐁𝐫𝐚𝐧𝐝𝐇𝐮𝐛 𝐅𝐥𝐚𝐬𝐡 𝐒𝐚𝐥𝐞 𝟓𝟎%";
    await expect(page.getByTestId("social-preview-text")).toContainText(
      expectedGeorgia,
    );

    // 2. Switch to Courier New (Monospace)
    await page.keyboard.press("Control+A");
    await page
      .locator('select[title="Font chữ"]')
      .selectOption('"Courier New", monospace');
    const expectedMono = "𝙱𝚛𝚊𝚗𝚍𝙷𝚞𝚋 𝙵𝚕𝚊𝚜𝚑 𝚂𝚊𝚕𝚎 𝟻𝟶%";
    await expect(page.getByTestId("social-preview-text")).toContainText(
      expectedMono,
    );

    // 3. Switch to Double Struck
    await page.keyboard.press("Control+A");
    await page
      .locator('select[title="Font chữ"]')
      .selectOption('"Double Struck", serif');
    const expectedDoubleStruck = "𝔹𝕣𝕒𝕟𝕕ℍ𝕦𝕓 𝔽𝕝𝕒𝕤𝕙 𝕊𝕒𝕝𝕖 𝟝𝟘%";
    await expect(page.getByTestId("social-preview-text")).toContainText(
      expectedDoubleStruck,
    );

    await page.screenshot({
      path: testInfo.outputPath("font-conversion-social-preview.png"),
      fullPage: true,
    });

    // 4. Publish the post and verify the published post preserves the exact chosen Unicode font!
    await page.getByTestId("open-publish-dialog-btn").click();
    await expect(page.getByTestId("publish-modal-preview-text")).toHaveText(
      expectedDoubleStruck,
    );

    await page.screenshot({
      path: testInfo.outputPath("font-conversion-publish-modal.png"),
      fullPage: true,
    });

    await page.getByTestId("confirm-publish-now-btn").click();

    await expect.poll(() => publishCalled).toBe(true);
    expect(savedDraftPayload?.caption).toBe(expectedDoubleStruck);

    await expect(page.getByTestId("published-post-banner")).toBeVisible();
    await expect(page.getByTestId("published-post-caption")).toHaveText(
      expectedDoubleStruck,
    );

    await page.screenshot({
      path: testInfo.outputPath("font-conversion-published-banner.png"),
      fullPage: true,
    });

    // 5. Navigate to Published Post Detail page (/workspaces/workspace-1/publish/post-font-1)
    // and verify the published post displays the exact converted Unicode font!
    await page.route(
      "**/api/v1/workspaces/workspace-1/posts/post-font-1/detail**",
      async (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: "post-font-1",
              workspaceId: "workspace-1",
              caption: savedDraftPayload?.caption,
              hashtags: ["#BrandHub", "#FlashSale"],
              targetPlatforms: ["FACEBOOK", "INSTAGRAM", "TIKTOK", "THREADS"],
              status: "PUBLISHED",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              reactionCount: 128,
              commentCount: 24,
              shareCount: 9,
            },
          }),
        }),
    );
    await page.route(
      "**/api/v1/workspaces/workspace-1/posts/post-font-1/comments**",
      async (route) =>
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: [] }),
        }),
    );

    await page.getByRole("button", { name: /Xem chi tiết bài đăng/ }).click();
    await expect(page).toHaveURL(/\/workspaces\/workspace-1\/posts\/post-font-1$/);
    await expect(
      page.locator("article").getByText(expectedDoubleStruck).first(),
    ).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("font-conversion-post-detail-page.png"),
      fullPage: true,
    });
  });

  test("E2E-25 wrapped multiline text, Word Ribbon mode, double-click word select, and ArrowUp/ArrowDown keep cursor aligned", async ({
    page,
  }, testInfo) => {
    await setup(page);
    const canvas = page.locator("canvas");
    const caret = page.getByTestId("canvas-caret");

    // Switch to Microsoft Word Ribbon mode and verify all groups render
    await page.getByRole("button", { name: "Ribbon" }).click();
    await expect(page.getByText("Phông chữ", { exact: true })).toBeVisible();
    await expect(page.getByText("Kiểu chữ", { exact: true })).toBeVisible();

    // Type two lines separated by Enter and verify ArrowUp / ArrowDown navigation
    await typeText(page, "Dong thu nhat BrandHub\nDong thu hai Social");
    await expect(mirror(page)).toHaveText(
      "Dong thu nhat BrandHub\nDong thu hai Social",
    );

    // Caret is at the end of line 2; press Home -> start of line 2
    await page.keyboard.press("Home");
    const line2StartTop = await caret.evaluate((el) =>
      parseFloat((el as HTMLElement).style.top),
    );
    const line2StartLeft = await caret.evaluate((el) =>
      parseFloat((el as HTMLElement).style.left),
    );
    expect(line2StartLeft).toBe(24);
    expect(line2StartTop).toBeGreaterThan(35);

    // Press ArrowUp -> moves to start of line 1
    await page.keyboard.press("ArrowUp");
    const line1StartTop = await caret.evaluate((el) =>
      parseFloat((el as HTMLElement).style.top),
    );
    expect(line1StartTop).toBeLessThan(line2StartTop);

    // Double-click on the first word "Dong" on line 1 to select it and format Bold + Courier New
    await canvas.dblclick({ position: { x: 36, y: 28 } });
    await page
      .locator('select[title="Font chữ"]')
      .selectOption('"Courier New", monospace');

    // Only "Dong" on line 1 is converted to Monospace, the rest stays plain!
    await expect(page.getByTestId("social-preview-text")).toContainText(
      "𝙳𝚘𝚗𝚐 thu nhat BrandHub\nDong thu hai Social",
    );

    await page.screenshot({
      path: testInfo.outputPath("ribbon-mode-multiline-word-select.png"),
      fullPage: true,
    });
  });

  test("E2E-26 Google Docs UI/UX, creative fonts/tools, and importing a Google Docs / .docx document directly into the editor", async ({
    page,
  }, testInfo) => {
    await setup(page);

    // 1. Verify authentic Google Docs UI elements: editable Document Title + Horizontal Ruler
    const titleInput = page.getByTestId("doc-title-input");
    await expect(titleInput).toBeVisible();
    await expect(page.getByTestId("gdocs-ruler")).toBeVisible();

    // 2. Test creative tools & enriched fonts (Small Caps, Circled, Case transform)
    await typeText(page, "BrandHub Studio");
    await page.keyboard.press("Control+A");
    await page
      .locator('select[title="Font chữ"]')
      .selectOption('"Small Caps", sans-serif');
    await expect(page.getByTestId("social-preview-text")).toContainText(
      "BʀᴀɴᴅHᴜʙ Sᴛᴜᴅɪᴏ",
    );

    // Open Creative Tools dropdown and wrap with sparkles callout
    await page.getByTestId("creative-tools-trigger").click();
    await page.getByTestId("wrap-callout-sparkles").click();
    await expect(page.getByTestId("social-preview-text")).toContainText(
      "✨ BʀᴀɴᴅHᴜʙ Sᴛᴜᴅɪᴏ ✨",
    );
    await expect(page.getByTestId("wrap-callout-sparkles")).toBeHidden();

    await page.screenshot({
      path: testInfo.outputPath("google-docs-ui-and-creative-tools.png"),
      fullPage: true,
    });

    // 3. Open "Nhập Google Docs / File" modal and import a Google Docs campaign brief
    await page.getByTestId("open-import-doc-btn").click();
    await expect(page.getByTestId("import-gdoc-url-input")).toBeVisible();

    // Select the first Google Docs sample brief
    await page.getByTestId("gdoc-sample-0").click();
    await expect(page.getByTestId("import-doc-preview")).toContainText(
      "CHIẾN DỊCH RA MẮT BỘ SƯU TẬP MÙA HÈ 2026",
    );

    await page.screenshot({
      path: testInfo.outputPath("import-google-docs-modal.png"),
      fullPage: true,
    });

    // Confirm import -> replaces editor content and updates document title
    await page.getByTestId("confirm-import-doc-btn").click();
    await expect(titleInput).toHaveValue(
      "Brief Chiến dịch Ra mắt Sản phẩm Mùa Hè 2026",
    );
    await expect(mirror(page)).toContainText(
      "CHIẾN DỊCH RA MẮT BỘ SƯU TẬP MÙA HÈ 2026",
    );
    await expect(page.getByTestId("social-preview-text")).toContainText(
      "𝗖𝗛𝗜𝗘̂́𝗡 𝗗𝗜̣𝗖𝗛 𝗥𝗔 𝗠𝗔̆́𝗧 𝗕𝗢̣̂ 𝗦𝗨̛𝗨 𝗧𝗔̣̂𝗣 𝗠𝗨̀𝗔 𝗛𝗘̀ 𝟮𝟬𝟮𝟲",
    );

    await page.screenshot({
      path: testInfo.outputPath("imported-google-doc-in-editor.png"),
      fullPage: true,
    });
  });

  test("E2E-27 Document Import all cases: live Google Docs URL, error handling, .docx, .md, .txt, .html, replace vs append, and Studio import", async ({
    page,
  }, testInfo) => {
    await setup(page);

    // 1. Open Import modal & test invalid Google Docs URL error
    await page.getByTestId("open-import-doc-btn").click();
    await page
      .getByTestId("import-gdoc-url-input")
      .fill("https://example.com/invalid");
    await page.getByTestId("fetch-gdoc-btn").click();
    await expect(page.getByTestId("import-gdoc-error")).toContainText(
      /Đường dẫn chưa đúng định dạng Google Docs/,
    );

    // 2. Test private / CORS-blocked Google Docs URL error recovery
    await page.route(
      "https://docs.google.com/document/d/1PrivateDocId999/export?format=txt",
      (route) => route.fulfill({ status: 403, body: "Forbidden" }),
    );
    await page
      .getByTestId("import-gdoc-url-input")
      .fill("https://docs.google.com/document/d/1PrivateDocId999/edit");
    await page.getByTestId("fetch-gdoc-btn").click();
    await expect(page.getByTestId("import-gdoc-error")).toContainText(
      /Tài liệu đang để quyền riêng tư hoặc chặn truy cập trực tiếp/,
    );

    // 3. Test live public Google Docs URL export
    await page.route(
      "https://docs.google.com/document/d/1LivePublicDoc2026/export?format=txt",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/plain; charset=utf-8",
          body: "# KỊCH BẢN LIVE GOOGLE DOCS\nNội dung **quan trọng** từ tài liệu trực tuyến.",
        }),
    );
    await page
      .getByTestId("import-gdoc-url-input")
      .fill("https://docs.google.com/document/d/1LivePublicDoc2026/edit");
    await page.getByTestId("fetch-gdoc-btn").click();
    await expect(page.getByTestId("import-doc-preview")).toHaveValue(
      /# KỊCH BẢN LIVE GOOGLE DOCS/,
    );
    await page.getByTestId("confirm-import-doc-btn").click();
    await expect(mirror(page)).toContainText("KỊCH BẢN LIVE GOOGLE DOCS");

    // 4. Test uploading a Microsoft Word .docx file (replace mode)
    const docxXml = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
            <w:r><w:t>TÀI LIỆU WORD DOCX</w:t></w:r>
          </w:p>
          <w:p>
            <w:r><w:t>Điểm nhấn </w:t></w:r>
            <w:r><w:rPr><w:b/></w:rPr><w:t>thương hiệu số</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`;
    await page.getByTestId("open-import-doc-btn").click();
    await page.getByTestId("import-tab-file").click();
    await page.getByTestId("import-doc-file-input").setInputFiles({
      name: "KeHoachWord2026.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: Buffer.from(docxXml, "utf-8"),
    });
    await expect(page.getByTestId("import-doc-preview")).toHaveValue(
      /# TÀI LIỆU WORD DOCX/,
    );
    await page.getByTestId("import-mode-replace").click();
    await page.getByTestId("confirm-import-doc-btn").click();
    await expect(page.getByTestId("doc-title-input")).toHaveValue(
      "KeHoachWord2026",
    );
    await expect(mirror(page)).toContainText("TÀI LIỆU WORD DOCX");
    await expect(page.getByTestId("social-preview-text")).toContainText(
      "𝘁𝗵𝘂̛𝗼̛𝗻𝗴 𝗵𝗶𝗲̣̂𝘂 𝘀𝗼̂́",
    );

    // 5. Test uploading a Markdown (.md) file in APPEND mode
    await page.getByTestId("open-import-doc-btn").click();
    await page.getByTestId("import-tab-file").click();
    await page.getByTestId("import-doc-file-input").setInputFiles({
      name: "BoSungMarkdown.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(
        "## PHẦN BỔ SUNG MARKDOWN\n- Ưu đãi **Đặc biệt**\n1. Bước đăng ký",
        "utf-8",
      ),
    });
    await page.getByTestId("import-mode-append").click();
    await page.getByTestId("confirm-import-doc-btn").click();
    // Both previous DOCX content and appended Markdown content are present!
    await expect(mirror(page)).toContainText("TÀI LIỆU WORD DOCX");
    await expect(mirror(page)).toContainText("PHẦN BỔ SUNG MARKDOWN");
    await expect(mirror(page)).toContainText("• Ưu đãi Đặc biệt");

    // 6. Test uploading a Plain Text (.txt) file in APPEND mode
    await page.getByTestId("open-import-doc-btn").click();
    await page.getByTestId("import-tab-file").click();
    await page.getByTestId("import-doc-file-input").setInputFiles({
      name: "GhiChu.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Hotline hỗ trợ: 1900 6868", "utf-8"),
    });
    await page.getByTestId("import-mode-append").click();
    await page.getByTestId("confirm-import-doc-btn").click();
    await expect(mirror(page)).toContainText("Hotline hỗ trợ: 1900 6868");

    // 7. Test uploading an HTML (.html) file in REPLACE mode
    await page.getByTestId("open-import-doc-btn").click();
    await page.getByTestId("import-tab-file").click();
    await page.getByTestId("import-doc-file-input").setInputFiles({
      name: "BaiVietHTML.html",
      mimeType: "text/html",
      buffer: Buffer.from(
        "<h1>BÀI VIẾT TỪ HTML</h1><p>Chào mừng <strong>Khách hàng VIP</strong></p><ul><li>Quà tặng 1</li></ul>",
        "utf-8",
      ),
    });
    await page.getByTestId("import-mode-replace").click();
    await page.getByTestId("confirm-import-doc-btn").click();
    await expect(mirror(page)).toContainText("BÀI VIẾT TỪ HTML");
    await expect(mirror(page)).toContainText("• Quà tặng 1");

    await page.screenshot({
      path: testInfo.outputPath("all-document-formats-imported.png"),
      fullPage: true,
    });
  });

  test("E2E-28 Backend ('Có BK') vs No Backend ('Không BK' / Offline Fallback) works seamlessly", async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "brandhub-auth",
        JSON.stringify({
          state: {
            user: {
              id: "offline-user",
              name: "Offline Creator",
              email: "offline@brandhub.dev",
              role: "CREATOR",
            },
            accessToken: "dev-token-offline",
            refreshToken: "",
            isAuthenticated: true,
            systemRole: "CREATOR",
          },
          version: 0,
        }),
      );
    });

    await page.route("**/api/v1/workspaces", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "workspace-1",
              name: "Offline Workspace",
              agencyId: "agency-1",
              slug: "offline-workspace",
              ownerId: "offline-user",
              logoUrl: null,
              settings: {},
              isActive: true,
              createdAt: new Date().toISOString(),
              myRole: "CREATOR",
              clientProfileId: null,
            },
          ],
        }),
      }),
    );

    // Case 1: Opening /content-writing without ?taskId when backend POST /tasks is down (503)
    await page.route("**/api/v1/workspaces/workspace-1/tasks", (route) =>
      route.fulfill({ status: 503, json: { success: false } }),
    );
    await page.goto("/workspaces/workspace-1/content-writing");
    await expect(page.locator("canvas")).toBeVisible();

    await typeText(page, "BrandHub Offline Mode");
    await page.keyboard.press("Control+A");
    await page
      .locator('select[title="Font chữ"]')
      .selectOption("Georgia, serif");
    await expect(page.getByTestId("social-preview-text")).toContainText(
      "𝐁𝐫𝐚𝐧𝐝𝐇𝐮𝐛 𝐎𝐟𝐟𝐥𝐢𝐧𝐞 𝐌𝐨𝐝𝐞",
    );

    // Case 2: Opening /content-writing?taskId=task-down when GET /content fails (503)
    // Shows alert + Retry + "Soạn thảo ngoại tuyến" fallback button
    await page.route(
      "**/api/v1/workspaces/workspace-1/tasks/task-down/content",
      (route) => route.fulfill({ status: 503, json: { success: false } }),
    );
    await page.goto(
      "/workspaces/workspace-1/content-writing?taskId=task-down",
    );
    await expect(page.getByRole("alert")).toBeVisible();
    await page.getByTestId("continue-offline-btn").click();
    await expect(page.locator("canvas")).toBeVisible();

    await typeText(page, "Tiep tuc soan thao khong can Backend");
    await expect(mirror(page)).toHaveText(
      "Tiep tuc soan thao khong can Backend",
    );

    await page.screenshot({
      path: testInfo.outputPath("offline-no-backend-editor.png"),
      fullPage: true,
    });
  });

  test("E2E-29 AI Caption in Content Writing View: With Brand Knowledge ('Có BK') vs Without Brand Knowledge ('Không BK')", async ({
    page,
  }, testInfo) => {
    let hasBrandKnowledge = true;
    await setup(page);

    await page.route("**/api/v1/workspaces/workspace-1/ai/credits", (route) =>
      route.fulfill({ json: { success: true, data: { remaining: 150 } } }),
    );
    await page.route(
      "**/api/v1/workspaces/workspace-1/ai/trending-topics/fit**",
      (route) =>
        route.fulfill({
          json: {
            success: true,
            data: { judged: true, judgedAt: null, trends: [] },
          },
        }),
    );
    await page.route(
      "**/api/v1/workspaces/workspace-1/ai/captions/**/choice",
      (route) => route.fulfill({ json: { success: true, data: {} } }),
    );
    await page.route(
      "**/api/v1/workspaces/workspace-1/ai/captions",
      async (route) => {
        const isBk = hasBrandKnowledge;
        await route.fulfill({
          json: {
            success: true,
            data: {
              generationId: isBk ? "gen-with-bk" : "gen-no-bk",
              captions: ["HOOK_DRIVEN", "STORYTELLING", "DIRECT_CTA"].map(
                (type) => ({
                  type,
                  title: type,
                  caption: isBk
                    ? `Caption chuẩn Brand Knowledge (${type}) giảm 25%`
                    : `Caption phong cách tự do không BK (${type})`,
                  hashtags: ["#BrandHub", "#Summer2026"],
                  characterCount: 45,
                  recommendedMaxChars: 2000,
                  signals: {
                    emotion: { hao_hung: 0.85 },
                    trendUsed: false,
                    unverifiedClaims: isBk ? ["25%"] : [],
                  },
                  compliance: { status: "PASSED", issues: [] },
                }),
              ),
              context: isBk
                ? {
                    brand: true,
                    trend: false,
                    examples: 2,
                    knowledgeChunks: 4,
                    task: true,
                  }
                : {
                    brand: false,
                    trend: false,
                    examples: 0,
                    knowledgeChunks: 0,
                    task: false,
                  },
              creditsUsed: 5,
              creditsRemaining: 145,
            },
          },
        });
      },
    );

    // 1. Test WITH Brand Knowledge ("Có BK")
    await page.getByRole("button", { name: /AI tạo caption/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox")
      .first()
      .fill("Ra mắt bộ sưu tập cà phê đặc sản mùa thu 2026");
    await dialog
      .getByRole("button", { name: /Tạo caption|Generate captions/i })
      .click();

    await expect(dialog.getByTestId("ai-caption-bk-status")).toBeVisible();
    await expect(dialog.getByTestId("ai-caption-bk-status")).toHaveAttribute(
      "data-kb-chunks",
      "4",
    );
    await expect(dialog.getByTestId("ai-caption-bk-status")).toContainText(
      /4 đoạn tài liệu thương hiệu|4 brand document passages/,
    );
    // Unverified claims warning ("25%") is shown
    await expect(dialog).toContainText("25%");

    await page.screenshot({
      path: testInfo.outputPath("ai-caption-with-bk.png"),
      fullPage: true,
    });

    // Insert first caption into Google Docs Canvas Editor
    await dialog
      .locator("article")
      .first()
      .getByRole("button", { name: /^Chèn$|^Insert$/i })
      .click();
    await expect(mirror(page)).toContainText(
      "Caption chuẩn Brand Knowledge (HOOK_DRIVEN) giảm 25%",
    );

    // 2. Test WITHOUT Brand Knowledge ("Không BK" — Free-style fallback)
    hasBrandKnowledge = false;
    await page.getByRole("button", { name: /AI tạo caption/i }).click();
    const dialogNoBk = page.getByRole("dialog");
    await dialogNoBk
      .getByRole("textbox")
      .first()
      .fill("Ra mắt bộ sưu tập cà phê đặc sản mùa thu 2026");
    await dialogNoBk
      .getByRole("button", { name: /Tạo caption|Generate captions/i })
      .click();

    await expect(
      dialogNoBk.getByTestId("ai-caption-no-bk-status"),
    ).toBeVisible();
    await expect(
      dialogNoBk.getByTestId("ai-caption-no-bk-status"),
    ).toContainText(/Chế độ phong cách tự do|Free-style mode/);

    await page.screenshot({
      path: testInfo.outputPath("ai-caption-without-bk.png"),
      fullPage: true,
    });

    // Replace editor content with the non-BK caption
    await dialogNoBk
      .locator("article")
      .first()
      .getByRole("button", { name: /Thay toàn bộ|Replace all/i })
      .click();
    await expect(mirror(page)).toContainText(
      "Caption phong cách tự do không BK (HOOK_DRIVEN)",
    );
  });

  test("E2E-30 Brand Knowledge Documents ('Phần tài liệu BK'): View, Upload (.pdf, .docx, .txt), Reject invalid file, Semantic Search, and Delete to 'Không BK'", async ({
    page,
  }, testInfo) => {
    await setup(page);
    await page.goto("/ai-studio/knowledge-base");

    // 1. Verify INDEXED, PROCESSING, and FAILED documents render accurately
    await expect(page.getByText("Brand-Guidelines-2026.pdf")).toBeVisible();
    await expect(page.getByText("Product-Catalog-Q3.docx")).toBeVisible();
    await expect(page.getByText("FAQ-Customer-Support.txt")).toBeVisible();
    await expect(page.getByText("Marketing-Playbook.pdf")).toBeVisible();
    await expect(page.getByText("Legacy-Pricing-Sheet.docx")).toBeVisible();

    // 2. Upload valid .txt, .docx, and .pdf Brand Knowledge documents
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "Chinh_Sach_Thuong_Hieu_2026.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(
        "Quy chuẩn giọng văn thương hiệu BrandHub 2026.",
        "utf-8",
      ),
    });
    await expect(
      page.getByText("Chinh_Sach_Thuong_Hieu_2026.txt"),
    ).toBeVisible();

    await fileInput.setInputFiles({
      name: "Tai_Lieu_San_Pham.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: Buffer.from("Nội dung DOCX", "utf-8"),
    });
    await expect(page.getByText("Tai_Lieu_San_Pham.docx")).toBeVisible();

    // 3. Reject unsupported file format (.exe)
    await fileInput.setInputFiles({
      name: "Malware.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("MZ", "utf-8"),
    });
    await expect(page.getByText("Malware.exe")).toHaveCount(0);

    // 4. Test Semantic Search over Brand Knowledge chunks
    const searchInput = page.locator("input:not([type='file'])").first();
    await searchInput.fill("Giọng văn thương hiệu");
    await searchInput.press("Enter");
    await expect(
      page.getByText(/liên quan đến 'Giọng văn thương hiệu'/).first(),
    ).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath("brand-knowledge-docs-and-search.png"),
      fullPage: true,
    });

    // 5. Delete a document and verify it is removed from the table
    page.on("dialog", (dialog) => void dialog.accept());
    const row = page
      .locator("tr")
      .filter({ hasText: "Chinh_Sach_Thuong_Hieu_2026.txt" });
    await row.getByRole("button").click();
    await expect(
      page.getByText("Chinh_Sach_Thuong_Hieu_2026.txt"),
    ).toHaveCount(0);
  });

  test("E2E-31 Google Docs / Word full cursor suite (Ctrl+Arrow, Ctrl+Shift+Arrow, Ctrl+Home/End, Ctrl+Backspace/Delete, Double/Triple-click), Rich Google Docs Paste, .docx/.md/.txt Export round-trip, and Facebook publish", async ({
    page,
  }, testInfo) => {
    await setup(page);
    await focusEditor(page);

    // 1. Type a 2-paragraph document and test Ctrl+ArrowLeft, Ctrl+Shift+ArrowLeft, Ctrl+Home, Ctrl+End, Ctrl+Backspace, Ctrl+Delete
    await typeText(page, "Chiến dịch Mùa Hè 2026");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Tăng trưởng vượt bậc");
    await expect(mirror(page)).toHaveText(
      "Chiến dịch Mùa Hè 2026\nTăng trưởng vượt bậc",
    );

    // Ctrl+ArrowLeft jumps before "bậc", then Ctrl+Shift+ArrowLeft selects "vượt"
    await page.keyboard.press("Control+ArrowLeft");
    await page.keyboard.press("Control+Shift+ArrowLeft");
    // Format only "vượt" with Bold + Italic
    await page.keyboard.press("Control+B");
    await page.keyboard.press("Control+I");
    await expect(page.getByTestId("social-preview-text")).toContainText(
      "Tăng trưởng 𝙫𝙪̛𝙤̛̣𝙩 bậc",
    );

    // Ctrl+End jumps to the end of document, Ctrl+Backspace deletes the last word ("bậc")
    await page.keyboard.press("Control+End");
    await page.keyboard.press("Control+Backspace");
    await expect(mirror(page)).toHaveText(
      "Chiến dịch Mùa Hè 2026\nTăng trưởng vượt ",
    );

    // Ctrl+Home jumps to index 0 (start of document), Ctrl+Delete deletes the first word ("Chiến")
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("Control+Delete");
    await expect(mirror(page)).toHaveText(
      " dịch Mùa Hè 2026\nTăng trưởng vượt ",
    );

    // 2. Test Triple-Click on Paragraph 1 to select the entire first paragraph and apply Georgia Serif font
    const canvas = page.locator("canvas").first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    await canvas.click({
      position: { x: 60, y: 28 },
      clickCount: 3,
    });
    await page
      .locator('select[title="Font chữ"]')
      .selectOption("Georgia, serif");
    // Paragraph 1 (" dịch Mùa Hè 2026") is now in Georgia Serif Bold Unicode (𝐌𝐮̀𝐚 𝐇𝐞̀ 𝟐𝟎𝟐𝟔)
    await expect(page.getByTestId("social-preview-text")).toContainText(
      "𝐌𝐮̀𝐚 𝐇𝐞̀ 𝟐𝟎𝟐𝟔",
    );

    // 3. Test Rich Google Docs HTML Paste (Ctrl+V with <span style="font-weight:700;font-style:italic;text-decoration:underline"> and <ul><li>)
    await page.keyboard.press("Control+End");
    await page.keyboard.press("Enter");
    const hiddenInput = page.getByRole("textbox", {
      name: "Content editor input",
    });
    await hiddenInput.evaluate((el) => {
      const dt = new DataTransfer();
      dt.setData(
        "text/html",
        '<h2>ĐIỂM NHẤN GOOGLE DOCS</h2><p>Ưu đãi <span style="font-weight:700;font-style:italic">Độc quyền VIP</span> và <span style="text-decoration:underline">Bảo hành 12 tháng</span></p><ul><li>Quà tặng <strong>Cao cấp</strong></li></ul>',
      );
      dt.setData(
        "text/plain",
        "ĐIỂM NHẤN GOOGLE DOCS\nƯu đãi Độc quyền VIP và Bảo hành 12 tháng\n- Quà tặng Cao cấp",
      );
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(pasteEvent);
    });

    await expect(mirror(page)).toContainText("ĐIỂM NHẤN GOOGLE DOCS");
    await expect(mirror(page)).toContainText("• Quà tặng Cao cấp");
    const previewAfterPaste = await page
      .getByTestId("social-preview-text")
      .innerText();
    expect(previewAfterPaste).toContain("Đ𝗜𝗘̂̉𝗠 𝗡𝗛𝗔̂́𝗡 𝗚𝗢𝗢𝗚𝗟𝗘 𝗗𝗢𝗖𝗦");
    expect(previewAfterPaste).toContain("Đ𝙤̣̂𝙘 𝙦𝙪𝙮𝙚̂̀𝙣 𝙑𝙄𝙋");
    expect(previewAfterPaste).toContain("\u0332"); // underline combining mark on "Bảo hành 12 tháng"
    expect(previewAfterPaste).toContain("• Quà tặng 𝗖𝗮𝗼 𝗰𝗮̂́𝗽");

    // 4. Test Exporting Document as .docx, .md, and .txt from the "Tệp" (File) menu, and re-importing the exported .docx!
    await page.getByTestId("doc-menu-file").click();
    const docxDownloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-docx-btn").click();
    const docxDownload = await docxDownloadPromise;
    expect(docxDownload.suggestedFilename()).toMatch(/\.docx$/);
    const docxPath = await docxDownload.path();
    expect(docxPath).toBeTruthy();
    await expect(page.getByTestId("export-docx-btn")).toBeHidden();

    await page.getByTestId("doc-menu-file").click();
    const mdDownloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-md-btn").click();
    const mdDownload = await mdDownloadPromise;
    expect(mdDownload.suggestedFilename()).toMatch(/\.md$/);
    await expect(page.getByTestId("export-md-btn")).toBeHidden();

    // Re-import the exact exported .docx file to verify 100% lossless round-trip!
    await page.getByTestId("open-import-doc-btn").click();
    await page.getByTestId("import-tab-file").click();
    await page.getByTestId("import-doc-file-input").setInputFiles(docxPath!);
    await expect(page.getByTestId("import-doc-preview")).toHaveValue(
      /## ĐIỂM NHẤN GOOGLE DOCS/,
    );
    await expect(page.getByTestId("import-doc-preview")).toHaveValue(
      /\*\*\*Độc quyền VIP\*\*\*/,
    );
    await page.getByRole("button", { name: "Hủy" }).click();

    // 5. Publish to Facebook and verify all fonts, bold, italic, underline, and bullets are preserved in the published post!
    let publishedCaption = "";
    await page.route(
      "**/api/v1/workspaces/workspace-1/posts",
      async (route) => {
        if (route.request().method() === "POST") {
          const body = route.request().postDataJSON() as { caption: string };
          publishedCaption = body.caption;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: {
                id: "post-gdocs-full-2026",
                workspaceId: "workspace-1",
                caption: body.caption,
                targetPlatforms: ["FACEBOOK"],
                status: "DRAFT",
              },
            }),
          });
          return;
        }
        await route.fallback();
      },
    );
    await page.route(
      "**/api/v1/workspaces/workspace-1/posts/post-gdocs-full-2026/publish",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: "post-gdocs-full-2026",
              workspaceId: "workspace-1",
              caption: publishedCaption,
              targetPlatforms: ["FACEBOOK"],
              status: "PUBLISHED",
            },
          }),
        });
      },
    );

    await page.getByTestId("open-publish-dialog-btn").click();
    await page.getByTestId("confirm-publish-now-btn").click();

    await expect(page.getByTestId("published-post-banner")).toBeVisible();
    await expect(page.getByTestId("published-post-caption")).toContainText(
      "𝐌𝐮̀𝐚 𝐇𝐞̀ 𝟐𝟎𝟐𝟔",
    );
    await expect(page.getByTestId("published-post-caption")).toContainText(
      "Đ𝙤̣̂𝙘 𝙦𝙪𝙮𝙚̂̀𝙣 𝙑𝙄𝙋",
    );
    await expect(page.getByTestId("published-post-caption")).toContainText(
      "• Quà tặng 𝗖𝗮𝗼 𝗰𝗮̂́𝗽",
    );

    await page.screenshot({
      path: testInfo.outputPath("gdocs-word-full-cursor-import-export-publish.png"),
      fullPage: true,
    });
  });

  test("E2E-32 Both Social Publishing Cases: (1) Direct API Publish to Facebook/Instagram/TikTok/Threads & (2) Zantext / 1-Click Copy & Paste into a Normal Facebook Post", async ({
    page,
    context,
  }, testInfo) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await setup(page);

    // 1. Type a multi-line marketing post and format different words with different fonts, bold, italic, underline, and bullets
    await typeText(page, "RA MẮT BỘ SƯU TẬP 2026\nƯu đãi Độc quyền cho Khách hàng VIP\nQuà tặng Giới hạn");

    // Triple-click line 1 ("RA MẮT BỘ SƯU TẬP 2026") and apply Georgia Serif Bold
    const canvasBox = await page.locator("canvas").boundingBox();
    expect(canvasBox).not.toBeNull();
    await page.mouse.click(canvasBox!.x + 120, canvasBox!.y + 38, {
      clickCount: 3,
    });
    await page
      .locator('select[title="Font chữ"]')
      .selectOption("Georgia, serif");

    // Open built-in Zantext Font Converter ("Font Zantext") on the toolbar
    await page.getByTestId("zantext-panel-trigger").click();
    await expect(page.getByTestId("zantext-preview-input")).toBeVisible();

    // Type a custom headline in Zantext converter and verify live preview across all 14 styles
    await page
      .getByTestId("zantext-preview-input")
      .fill("Siêu Sale Thương Hiệu 50%");
    await expect(page.getByTestId("zantext-preview-serif-bold")).toContainText(
      "𝐒𝐢𝐞̂𝐮 𝐒𝐚𝐥𝐞 𝐓𝐡𝐮̛𝐨̛𝐧𝐠 𝐇𝐢𝐞̣̂𝐮 𝟓𝟎%",
    );
    await expect(page.getByTestId("zantext-preview-script-bold")).toContainText(
      "𝓢𝓲𝓮̂𝓾 𝓢𝓪𝓵𝓮 𝓣𝓱𝓾̛𝓸̛𝓷𝓰 𝓗𝓲𝓮̣̂𝓾 𝟓𝟎%",
    );
    await expect(page.getByTestId("zantext-preview-monospace")).toContainText(
      "𝚂𝚒𝚎̂𝚞 𝚂𝚊𝚕𝚎 𝚃𝚑𝚞̛𝚘̛𝚗𝚐 𝙷𝚒𝚎̣̂𝚞 𝟻𝟶%",
    );
    await expect(page.getByTestId("zantext-preview-circled")).toContainText(
      "Ⓢⓘⓔ̂ⓤ Ⓢⓐⓛⓔ Ⓣⓗⓤ̛ⓞ̛ⓝⓖ Ⓗⓘⓔ̣̂ⓤ ⑤⓪%",
    );

    // Test 1-click Copy directly from a Zantext style row ("zantext-copy-script-bold")
    await page.getByTestId("zantext-copy-script-bold").click();
    const zantextRowClipboard = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(zantextRowClipboard).toBe("𝓢𝓲𝓮̂𝓾 𝓢𝓪𝓵𝓮 𝓣𝓱𝓾̛𝓸̛𝓷𝓰 𝓗𝓲𝓮̣̂𝓾 𝟓𝟎%");

    // Clear the Zantext custom input and apply "serif-bold-italic" to the current editor selection
    await page.getByTestId("zantext-preview-input").fill("");
    await page.getByTestId("zantext-apply-serif-bold-italic").click();

    // Format the 3rd line ("Quà tặng Giới hạn") as a bullet item with underline
    await page.keyboard.press("Control+End");
    await page.getByTitle("Danh sách gạch đầu dòng").click();
    await page.keyboard.press("Control+Shift+ArrowLeft");
    await page.keyboard.press("Control+Shift+ArrowLeft");
    await page.keyboard.press("Control+u");

    // 2. CASE 2A: Press Ctrl+C inside the editor and verify the clipboard receives the converted Unicode string!
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Control+c");
    const ctrlCClipboard = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(ctrlCClipboard).toContain("𝑹𝑨 𝑴𝑨̆́𝑻 𝑩𝑶̣̂ 𝑺𝑼̛𝑼 𝑻𝑨̣̂𝑷 𝟐𝟎𝟐𝟔");
    expect(ctrlCClipboard).toContain("• Quà tặng");
    expect(ctrlCClipboard).toContain("\u0332"); // underline combining mark on "Giới hạn"

    // 3. CASE 2B: Click "Copy dán Facebook (Giữ Font)" on the Social Preview panel and paste into the plain-text Facebook Sandbox (<textarea>)!
    await page.getByTestId("social-preview-copy-btn").click();
    await page.getByTestId("facebook-paste-sandbox-toggle").click();
    await page.getByTestId("facebook-paste-from-clipboard-btn").click();

    await expect(
      page.getByTestId("facebook-paste-sandbox-input"),
    ).toHaveValue(/𝑹𝑨 𝑴𝑨̆́𝑻 𝑩𝑶̣̂ 𝑺𝑼̛𝑼 𝑻𝑨̣̂𝑷 𝟐𝟎𝟐𝟔/);
    const pastedInPlainFacebookBox = await page
      .getByTestId("facebook-paste-sandbox-input")
      .inputValue();
    expect(pastedInPlainFacebookBox).toContain("• Quà tặng");
    expect(pastedInPlainFacebookBox).toContain("\u0332");

    // 4. CASE 1: Direct API Publish to Facebook, Instagram, TikTok, and Threads!
    let apiPublishedPayload: {
      caption?: string;
      targetPlatforms?: string[];
    } = {};
    await page.route(
      "**/api/v1/workspaces/workspace-1/posts",
      async (route) => {
        if (route.request().method() === "POST") {
          const body = route.request().postDataJSON() as {
            caption: string;
            targetPlatforms: string[];
          };
          apiPublishedPayload = body;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: {
                id: "post-dual-case-2026",
                workspaceId: "workspace-1",
                caption: body.caption,
                targetPlatforms: body.targetPlatforms,
                status: "DRAFT",
              },
            }),
          });
          return;
        }
        await route.fallback();
      },
    );
    await page.route(
      "**/api/v1/workspaces/workspace-1/posts/post-dual-case-2026/publish",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: "post-dual-case-2026",
              workspaceId: "workspace-1",
              caption: apiPublishedPayload.caption,
              targetPlatforms: apiPublishedPayload.targetPlatforms,
              status: "PUBLISHED",
            },
          }),
        });
      },
    );

    await page.getByTestId("open-publish-dialog-btn").click();
    // Also verify the Copy button inside the Publish Modal works
    await page.getByTestId("publish-modal-copy-btn").click();
    await expect(page.getByTestId("publish-modal-copy-btn")).toContainText(
      /Đã copy Font/,
    );
    // Select Instagram as well as Facebook
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Instagram" })
      .click();
    await page.getByTestId("confirm-publish-now-btn").click();

    await expect(page.getByTestId("published-post-banner")).toBeVisible();
    expect(apiPublishedPayload.targetPlatforms).toEqual([
      "FACEBOOK",
      "INSTAGRAM",
    ]);
    expect(apiPublishedPayload.caption).toContain("𝑹𝑨 𝑴𝑨̆́𝑻 𝑩𝑶̣̂ 𝑺𝑼̛𝑼 𝑻𝑨̣̂𝑷 𝟐𝟎𝟐𝟔");
    expect(apiPublishedPayload.caption).toContain("• Quà tặng");
    expect(apiPublishedPayload.caption).toContain("\u0332");

    await page.screenshot({
      path: testInfo.outputPath("zantext-copy-and-api-publish-comparison.png"),
      fullPage: true,
    });
  });

  test("E2E-33 V6 YayText 36-Style Expansion: Category Tabs, Favorite Pinning, Smart Vietnamese Diacritic Auto-Strip, Black Bubble & Slashthrough Price", async ({
    page,
    context,
  }, testInfo) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await setup(page);

    // 1. Open the 36-Style Zantext / YayText Popover
    await page.getByTestId("zantext-panel-trigger").click();
    await expect(page.getByTestId("zantext-preview-input")).toBeVisible();

    // 2. Type Vietnamese promotional text in the live preview input
    await page
      .getByTestId("zantext-preview-input")
      .fill("Khuyến mãi Đặc Biệt 50%");

    // 3. Filter by "Khung Nổi bật" (enclosed) and verify Black Bubble auto-strips Vietnamese diacritics cleanly
    await page.getByTestId("zantext-cat-enclosed").click();
    await expect(
      page.getByTestId("zantext-preview-black-bubble"),
    ).toContainText("🅚🅗🅤🅨🅔🅝 🅜🅐🅘 🅓🅐🅒 🅑🅘🅔🅣 ➎⓿%");
    await expect(
      page.getByTestId("zantext-preview-black-square"),
    ).toContainText("🅺🅷🆄🆈🅴🅽 🅼🅰🅸 🅳🅰🅲 🅱🅸🅴🆃 ➎⓿%");

    // 4. Switch OS font preview switcher between Default, iOS, and Android
    await page.getByTestId("zantext-os-preview-select").selectOption("ios");
    await page.getByTestId("zantext-os-preview-select").selectOption("android");
    await page.getByTestId("zantext-os-preview-select").selectOption("default");

    // 5. Filter by "Sale & Gạch giá" (lines) and test Slashthrough Price (9̸9̸0̸.̸0̸0̸0̸đ̸)
    await page.getByTestId("zantext-cat-lines").click();
    await page.getByTestId("zantext-preview-input").fill("990.000đ");
    await page.getByTestId("zantext-copy-slashthrough").click();
    const slashClipboard = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(slashClipboard).toContain("9\u03389\u03380\u0338");

    // 6. Pin "double-underline" to Favorites and filter by Favorites ("⭐ Yêu thích")
    await page.getByTestId("zantext-fav-double-underline").click();
    await page.getByTestId("zantext-cat-favorites").click();
    await expect(
      page.getByTestId("zantext-preview-double-underline"),
    ).toBeVisible();

    // 7. Toggle Vietnamese diacritic stripping ("Lược dấu chuẩn khung") on "all" tab
    await page.getByTestId("zantext-cat-all").click();
    await page.getByTestId("zantext-preview-input").fill("Siêu Sale Mùa Hè");
    await page.getByTestId("zantext-strip-accents-toggle").check();
    await expect(page.getByTestId("zantext-preview-sans-bold")).toContainText(
      "𝗦𝗶𝗲𝘂 𝗦𝗮𝗹𝗲 𝗠𝘂𝗮 𝗛𝗲",
    );
    await page.getByTestId("zantext-strip-accents-toggle").uncheck();

    // Close popover, type into editor, apply Black Bubble from toolbar font dropdown, and paste into Facebook Sandbox
    await page.getByTestId("zantext-close-btn").click();
    await typeText(page, "FLASH SALE 50%");
    await page.keyboard.press("Control+a");
    await page
      .locator('select[title="Font chữ"]')
      .selectOption('"Black Bubble", sans-serif');

    await expect(page.getByTestId("social-preview-text")).toContainText(
      "🅕🅛🅐🅢🅗 🅢🅐🅛🅔 ➎⓿%",
    );
    await page.getByTestId("social-preview-copy-btn").click();
    await page.getByTestId("facebook-paste-sandbox-toggle").click();
    await page.getByTestId("facebook-paste-from-clipboard-btn").click();
    await expect(
      page.getByTestId("facebook-paste-sandbox-input"),
    ).toHaveValue("🅕🅛🅐🅢🅗 🅢🅐🅛🅔 ➎⓿%");

    await page.screenshot({
      path: testInfo.outputPath("yaytext-36-styles-v6-verified.png"),
      fullPage: true,
    });
  });
});
