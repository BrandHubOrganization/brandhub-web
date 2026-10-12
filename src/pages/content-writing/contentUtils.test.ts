import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  applySnapshotToDoc,
  diffText,
  toPublishText,
  yjsStateToText,
} from "./contentUtils";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/** Builds a base64 Yjs state containing `text` (optionally with formatting). */
function stateWith(build: (t: Y.Text) => void): string {
  const doc = new Y.Doc();
  build(doc.getText("content"));
  return toBase64(Y.encodeStateAsUpdate(doc));
}

/** Wires two docs like the STOMP relay: local updates are applied to the peer with origin "remote". */
function relay(a: Y.Doc, b: Y.Doc) {
  a.on(
    "update",
    (u: Uint8Array, o: unknown) =>
      o !== "remote" && Y.applyUpdate(b, u, "remote"),
  );
  b.on(
    "update",
    (u: Uint8Array, o: unknown) =>
      o !== "remote" && Y.applyUpdate(a, u, "remote"),
  );
}

describe("yjsStateToText", () => {
  it("TC-UTIL-01 returns '' for a null snapshot", () => {
    expect(yjsStateToText(null)).toBe("");
  });

  it("TC-UTIL-02 decodes plain text from a base64 Yjs state", () => {
    expect(yjsStateToText(stateWith((t) => t.insert(0, "Xin chào")))).toBe(
      "Xin chào",
    );
  });

  it("TC-UTIL-03 ignores formatting attributes when reading text", () => {
    const s = stateWith((t) => {
      t.insert(0, "bold");
      t.format(0, 4, { bold: true });
    });
    expect(yjsStateToText(s)).toBe("bold");
  });
});

describe("diffText", () => {
  const joined = (parts: ReturnType<typeof diffText>, type: string) =>
    parts
      .filter((p) => p.type === type)
      .map((p) => p.text)
      .join("");

  it("TC-DIFF-01 identical text → a single 'same' part, no add/del", () => {
    expect(diffText("a b c", "a b c")).toEqual([
      { type: "same", text: "a b c" },
    ]);
  });

  it("TC-DIFF-02 first version (empty before) → everything is an addition", () => {
    expect(diffText("", "hello world")).toEqual([
      { type: "add", text: "hello world" },
    ]);
  });

  it("TC-DIFF-03 everything removed → everything is a deletion", () => {
    expect(diffText("hello world", "")).toEqual([
      { type: "del", text: "hello world" },
    ]);
  });

  it("TC-DIFF-04 replaced word shows as del + add around unchanged context", () => {
    const parts = diffText("xin chào cả nhà", "xin chào mọi người");
    expect(joined(parts, "del")).toContain("cả");
    expect(joined(parts, "add")).toContain("mọi");
    expect(parts[0]).toEqual({ type: "same", text: "xin chào " });
  });

  it("TC-DIFF-05 rebuilding old/new from the parts is lossless", () => {
    const before = "Sale 50% hôm nay tại cửa hàng";
    const after = "Sale 70% hôm nay online tại cửa hàng";
    const parts = diffText(before, after);
    const rebuildBefore = parts
      .filter((p) => p.type !== "add")
      .map((p) => p.text)
      .join("");
    const rebuildAfter = parts
      .filter((p) => p.type !== "del")
      .map((p) => p.text)
      .join("");
    expect(rebuildBefore).toBe(before);
    expect(rebuildAfter).toBe(after);
  });

  it("TC-DIFF-06 both empty → no parts", () => {
    expect(diffText("", "")).toEqual([]);
  });

  it("TC-DIFF-07 inputs over the size cap fall back to whole del + whole add (no freeze)", () => {
    const big = (w: string) =>
      Array.from({ length: 2500 }, (_, i) => `${w}${i}`).join(" ");
    const before = big("a");
    const after = big("b");
    expect(diffText(before, after)).toEqual([
      { type: "del", text: before },
      { type: "add", text: after },
    ]);
  });
});

describe("toPublishText", () => {
  it("TC-FONT-01 plain text passes through unchanged", () => {
    expect(toPublishText([{ insert: "Hello world" }])).toBe("Hello world");
  });

  it("TC-FONT-02 decomposed Vietnamese is NFC-normalized", () => {
    const decomposed = "Việt"; // e + dot below + circumflex
    const out = toPublishText([{ insert: decomposed }]);
    expect(out).toBe("Việt");
    expect(out).toBe(out.normalize("NFC"));
  });

  it("TC-FONT-03 bold ASCII letters and digits become Mathematical Sans-Serif Bold", () => {
    expect(
      toPublishText([{ insert: "Az09", attributes: { bold: true } }]),
    ).toBe("\u{1d5d4}\u{1d607}\u{1d7ec}\u{1d7f5}");
  });

  it("TC-FONT-04 italic ASCII letters become Sans-Serif Italic; digits stay plain", () => {
    expect(
      toPublishText([{ insert: "Az1", attributes: { italic: true } }]),
    ).toBe("\u{1d608}\u{1d63b}1");
  });

  it("TC-FONT-05 bold+italic uses the Bold Italic set", () => {
    expect(
      toPublishText([
        { insert: "Aa", attributes: { bold: true, italic: true } },
      ]),
    ).toBe("\u{1d63c}\u{1d656}");
  });

  it("TC-FONT-06 styled Vietnamese keeps the combining marks on the styled base letter", () => {
    const out = toPublishText([{ insert: "ệ", attributes: { bold: true } }]);
    // base 'e' styled bold + dot below + circumflex combining marks
    expect(out).toBe("\u{1d5f2}̣̂");
  });

  it("TC-FONT-07 đ/Đ and punctuation/emoji in a styled run stay as they are", () => {
    const out = toPublishText([
      { insert: "đ! 😀", attributes: { bold: true } },
    ]);
    expect(out).toBe("đ! 😀");
  });

  it("TC-FONT-08 mixed runs are concatenated in order; unstyled runs untouched", () => {
    const out = toPublishText([
      { insert: "Sale " },
      { insert: "50%", attributes: { bold: true } },
      { insert: " off" },
    ]);
    expect(out).toBe("Sale \u{1d7f1}\u{1d7ec}% off");
  });

  it("TC-FONT-09 non-text embeds are skipped; underline/color-only runs stay plain", () => {
    expect(
      toPublishText([
        { insert: "a", attributes: { underline: true, color: "#f00" } },
        {},
        { insert: "b" },
      ]),
    ).toBe("ab");
  });

  it("TC-FONT-10 list prefixes pass through as literal text", () => {
    expect(toPublishText([{ insert: "• one\n2. two" }])).toBe("• one\n2. two");
  });

  it("TC-FONT-11 empty delta → ''", () => {
    expect(toPublishText([])).toBe("");
  });
});

describe("applySnapshotToDoc (restore)", () => {
  it("TC-RESTORE-01 replaces current text with the snapshot's text", () => {
    const live = new Y.Doc();
    live.getText("content").insert(0, "current version");
    applySnapshotToDoc(
      live,
      stateWith((t) => t.insert(0, "old version")),
    );
    expect(live.getText("content").toString()).toBe("old version");
  });

  it("TC-RESTORE-02 keeps formatting attributes of the restored content", () => {
    const live = new Y.Doc();
    live.getText("content").insert(0, "x");
    const snap = stateWith((t) => {
      t.insert(0, "Bold!");
      t.format(0, 5, { bold: true });
    });
    applySnapshotToDoc(live, snap);
    expect(live.getText("content").toDelta()).toEqual([
      { insert: "Bold!", attributes: { bold: true } },
    ]);
  });

  it("TC-RESTORE-03 null snapshot is a no-op", () => {
    const live = new Y.Doc();
    live.getText("content").insert(0, "keep me");
    applySnapshotToDoc(live, null);
    expect(live.getText("content").toString()).toBe("keep me");
  });

  it("TC-RESTORE-04 restoring an empty snapshot clears the doc", () => {
    const live = new Y.Doc();
    live.getText("content").insert(0, "something");
    applySnapshotToDoc(
      live,
      stateWith(() => {}),
    );
    expect(live.getText("content").toString()).toBe("");
  });

  it("TC-RESTORE-05 restore is a normal update: a second client converges to the restored text", () => {
    const a = new Y.Doc();
    const b = new Y.Doc();
    relay(a, b);

    a.getText("content").insert(0, "draft one");
    const snapshot = toBase64(Y.encodeStateAsUpdate(a)); // version 1
    a.getText("content").delete(0, a.getText("content").length);
    a.getText("content").insert(0, "totally rewritten");
    expect(b.getText("content").toString()).toBe("totally rewritten");

    applySnapshotToDoc(a, snapshot);
    expect(a.getText("content").toString()).toBe("draft one");
    expect(b.getText("content").toString()).toBe("draft one");
  });

  it("TC-RESTORE-06 an edit made after restore is kept and converges", () => {
    const a = new Y.Doc();
    const b = new Y.Doc();
    relay(a, b);

    a.getText("content").insert(0, "v1");
    const snap = toBase64(Y.encodeStateAsUpdate(a));
    a.getText("content").insert(2, " plus more");
    applySnapshotToDoc(a, snap);
    b.getText("content").insert(2, "!"); // collaborator types right after the restore

    expect(a.getText("content").toString()).toBe("v1!");
    expect(b.getText("content").toString()).toBe("v1!");
  });
});

describe("CRDT convergence (concurrent edits)", () => {
  it("TC-SYNC-01 two clients inserting at the same index converge to identical text", () => {
    const a = new Y.Doc();
    const b = new Y.Doc();
    a.getText("content").insert(0, "base");
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

    // concurrent, offline from each other
    a.getText("content").insert(4, " A");
    b.getText("content").insert(4, " B");

    Y.applyUpdate(a, Y.encodeStateAsUpdate(b));
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

    const ta = a.getText("content").toString();
    expect(ta).toBe(b.getText("content").toString());
    expect(ta).toContain("A");
    expect(ta).toContain("B");
    expect(ta.startsWith("base")).toBe(true);
  });

  it("TC-SYNC-02 replaying snapshot + operation tail reconstructs the same document", () => {
    const writer = new Y.Doc();
    const updates: Uint8Array[] = [];
    writer.on("update", (u: Uint8Array) => updates.push(u));
    const t = writer.getText("content");
    t.insert(0, "hello");
    t.insert(5, " world");
    t.format(0, 5, { bold: true });

    const reader = new Y.Doc();
    updates.forEach((u) => Y.applyUpdate(reader, u));
    expect(reader.getText("content").toDelta()).toEqual(t.toDelta());
  });

  it("TC-SYNC-03 applying the same update twice is idempotent (echoed broadcast)", () => {
    const writer = new Y.Doc();
    let update: Uint8Array = new Uint8Array();
    writer.on("update", (u: Uint8Array) => (update = u));
    writer.getText("content").insert(0, "once");

    const reader = new Y.Doc();
    Y.applyUpdate(reader, update);
    Y.applyUpdate(reader, update);
    expect(reader.getText("content").toString()).toBe("once");
  });
});
