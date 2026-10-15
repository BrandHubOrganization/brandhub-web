import { expect, test, type Page, type WebSocketRoute } from "@playwright/test";
import * as Y from "yjs";

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
      } else if (command === "SEND") {
        const { update } = JSON.parse(body) as { update: string };
        broker.sent.push(update);
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
              JSON.stringify({
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
    broker: { sent: [] },
    snapshotPosts: [],
    versions: opts.versions ?? [],
    versionStates: opts.versionStates ?? {},
    restoreCalls: [],
  };

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "brandhub-auth",
      JSON.stringify({
        state: {
          user: {
            id: "studio-test-user",
            name: "Studio Tester",
            email: "studio@brandhub.dev",
            role: "USER",
          },
          accessToken: "dev-token",
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
  await page.route(CONTENT_URL, (route) =>
    route.fulfill(
      json({
        snapshot: opts.initial?.snapshot ?? null,
        operationsSinceSnapshot: opts.initial?.ops ?? [],
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
  await page.routeWebSocket(/\/ws\/tasks/, (ws) =>
    startBroker(ws, backend.broker),
  );

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
