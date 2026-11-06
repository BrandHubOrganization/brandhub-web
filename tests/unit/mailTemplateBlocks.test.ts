import { describe, expect, it } from "vitest";
import {
  BLOCK_TYPES,
  emptyLayout,
  insertBlock,
  moveBlock,
  newBlock,
  parseLayout,
  removeBlock,
  renderLayoutPreview,
  serializeLayout,
  updateBlockProps,
  validateBlocks,
} from "../../src/pages/mail-templates/blocks";

const ids = (bs: { id: string }[]) => bs.map((b) => b.id);

describe("mail block palette (B9)", () => {
  it("has exactly the 9 fixed block types", () => {
    expect(BLOCK_TYPES).toHaveLength(9);
    expect(new Set(BLOCK_TYPES).size).toBe(9);
  });

  it("creates unique ids and independent props per block", () => {
    const a = newBlock("heading");
    const b = newBlock("heading");
    expect(a.id).not.toBe(b.id);
    a.props.text = "x";
    expect(b.props.text).toBe("");
  });
});

describe("layout json round trip", () => {
  it("serialises and parses back", () => {
    const layout = { version: 1 as const, blocks: [newBlock("paragraph"), newBlock("divider")] };
    expect(parseLayout(serializeLayout(layout)).blocks.map((b) => b.type)).toEqual(["paragraph", "divider"]);
  });

  it.each([null, undefined, "", "not json", "{}", '{"blocks":"x"}'])("treats %p as an empty layout", (input) => {
    expect(parseLayout(input)).toEqual(emptyLayout());
  });

  it("reads uppercase type names written by the API or the seed", () => {
    const json = JSON.stringify({ version: 1, blocks: [{ id: "a", type: "CTA_BUTTON", props: { label: "Go", urlType: "site" } }] });
    expect(parseLayout(json).blocks.map((b) => b.type)).toEqual(["cta_button"]);
  });

  it("drops unknown block types and malformed entries", () => {
    const json = JSON.stringify({ blocks: [{ id: "1", type: "plate_block", props: {} }, null, { id: "2", type: "divider" }] });
    expect(parseLayout(json).blocks.map((b) => b.id)).toEqual(["2"]);
  });
});

describe("sortable list operations", () => {
  const list = () => ["a", "b", "c", "d"].map((id) => ({ ...newBlock("divider"), id }));

  it("moves a block forward and backward", () => {
    expect(ids(moveBlock(list(), 0, 2))).toEqual(["b", "c", "a", "d"]);
    expect(ids(moveBlock(list(), 3, 1))).toEqual(["a", "d", "b", "c"]);
  });

  it("clamps out-of-range targets and ignores a bad source", () => {
    expect(ids(moveBlock(list(), 0, 99))).toEqual(["b", "c", "d", "a"]);
    expect(ids(moveBlock(list(), 1, -5))).toEqual(["b", "a", "c", "d"]);
    const original = list();
    expect(moveBlock(original, 9, 0)).toBe(original);
  });

  it("inserts at an index, clamped to the ends", () => {
    const x = { ...newBlock("spacer"), id: "x" };
    expect(ids(insertBlock(list(), x, 2))).toEqual(["a", "b", "x", "c", "d"]);
    expect(ids(insertBlock(list(), x, 99))).toEqual(["a", "b", "c", "d", "x"]);
    expect(ids(insertBlock(list(), x, -1))).toEqual(["x", "a", "b", "c", "d"]);
  });

  it("removes and updates by id without mutating the input", () => {
    const original = [{ ...newBlock("heading"), id: "h" }];
    expect(removeBlock(original, "h")).toEqual([]);
    const updated = updateBlockProps(original, "h", { text: "Hi" });
    expect(updated[0].props.text).toBe("Hi");
    expect(original[0].props.text).toBe("");
  });
});

describe("validateBlocks mirrors the backend renderer", () => {
  const make = (type: Parameters<typeof newBlock>[0], props = {}) => {
    const b = newBlock(type);
    return { ...b, props: { ...b.props, ...props } };
  };

  it("accepts a valid layout", () => {
    const blocks = [
      make("header"),
      make("heading", { text: "Hello" }),
      make("image_banner", { imageUrl: "https://x/y.png", imageAlt: "alt" }),
      make("cta_button", { label: "Go", urlType: "custom", customUrl: "https://a.b" }),
      make("spacer", { heightPx: 0 }),
      make("footer"),
    ];
    expect(validateBlocks(blocks)).toEqual({});
  });

  it("requires text for heading and paragraph", () => {
    const h = make("heading");
    const p = make("paragraph", { text: "   " });
    expect(validateBlocks([h, p])).toEqual({ [h.id]: "textRequired", [p.id]: "textRequired" });
  });

  it("requires image url and alt, and http(s) only", () => {
    const missing = make("image_banner", { imageUrl: "https://x/y.png" });
    const js = make("image_banner", { imageUrl: "javascript:alert(1)", imageAlt: "a" });
    const badLink = make("image_banner", { imageUrl: "https://x/y.png", imageAlt: "a", linkUrl: "data:text/html,x" });
    expect(validateBlocks([missing, js, badLink])).toEqual({
      [missing.id]: "imageRequired",
      [js.id]: "urlHttp",
      [badLink.id]: "urlHttp",
    });
  });

  it("requires a custom url only for urlType custom, and it must be http(s)", () => {
    const site = make("cta_button", { label: "Go", urlType: "site" });
    const noUrl = make("cta_button", { label: "Go", urlType: "custom" });
    const bad = make("cta_button", { label: "Go", urlType: "custom", customUrl: "vbscript:x" });
    const noLabel = make("cta_button", { label: " " });
    expect(validateBlocks([site, noUrl, bad, noLabel])).toEqual({
      [noUrl.id]: "urlRequired",
      [bad.id]: "urlHttp",
      [noLabel.id]: "labelRequired",
    });
  });

  it("rejects a negative spacer height", () => {
    const s = make("spacer", { heightPx: -1 });
    expect(validateBlocks([s])).toEqual({ [s.id]: "heightInvalid" });
  });

  it("caps spacer height at 200 like the backend", () => {
    const ok = make("spacer", { heightPx: 200 });
    const over = make("spacer", { heightPx: 201 });
    const text = make("spacer", { heightPx: "24" });
    expect(validateBlocks([ok, over, text])).toEqual({
      [over.id]: "heightInvalid",
      [text.id]: "heightInvalid",
    });
  });

  it("treats uppercase scheme as valid http(s)", () => {
    const b = make("cta_button", { label: "Go", urlType: "custom", customUrl: "HTTPS://a.b" });
    expect(validateBlocks([b])).toEqual({});
  });

  it("flags a protocol-relative or relative url", () => {
    const a = make("cta_button", { label: "Go", urlType: "custom", customUrl: "//evil.io" });
    const b = make("cta_button", { label: "Go", urlType: "custom", customUrl: "/x" });
    expect(validateBlocks([a, b])).toEqual({ [a.id]: "urlHttp", [b.id]: "urlHttp" });
  });
});

describe("renderLayoutPreview", () => {
  it("escapes user text so it cannot inject markup", () => {
    const b = { ...newBlock("paragraph"), props: { text: '<img src=x onerror="alert(1)">' } };
    const html = renderLayoutPreview([b]);
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("omits an image with a non-http url", () => {
    const b = { ...newBlock("image_banner"), props: { imageUrl: "javascript:alert(1)", imageAlt: "a", linkUrl: "" } };
    expect(renderLayoutPreview([b])).not.toContain("<img");
  });

  it("wraps the blocks in the same email-safe frame as the server", () => {
    const html = renderLayoutPreview([newBlock("header"), { ...newBlock("heading"), props: { text: "Hi", align: "center" } }]);
    expect(html).toContain("max-width:600px");
    expect(html).toContain("border-top:4px solid #f05a28");
    expect(html).toContain("{{workspaceName}}");
    expect(html).toContain("text-align:center");
    expect(html).not.toContain("<script");
  });

  it("renders the CTA as a table button and escapes its label", () => {
    const html = renderLayoutPreview([{ ...newBlock("cta_button"), props: { label: "Go <now>", urlType: "site", customUrl: "" } }]);
    expect(html).toContain("background:#f05a28");
    expect(html).toContain("Go &lt;now&gt;");
  });

  it("renders blocks in order", () => {
    const html = renderLayoutPreview([
      { ...newBlock("heading"), props: { text: "First", align: "left" } },
      newBlock("divider"),
    ]);
    expect(html.indexOf("First")).toBeLessThan(html.indexOf("height:1px"));
  });
});

describe("layout locale", () => {
  const fixed = [newBlock("contact_strip"), newBlock("footer")];

  it("defaults to Vietnamese when serialising and keeps a stored locale when parsing", () => {
    expect(JSON.parse(serializeLayout({ version: 1, blocks: [] })).locale).toBe("vi");
    expect(JSON.parse(serializeLayout({ version: 1, locale: "en", blocks: [] })).locale).toBe("en");
    expect(parseLayout('{"version":1,"locale":"en","blocks":[]}').locale).toBe("en");
    expect(parseLayout('{"version":1,"blocks":[]}').locale).toBeUndefined();
    expect(parseLayout('{"version":1,"locale":"fr","blocks":[]}').locale).toBeUndefined();
  });

  it("previews the fixed lines in the chosen language", () => {
    const vi = renderLayoutPreview(fixed);
    expect(vi).toContain("Email được gửi từ {{workspaceName}} qua BrandHub.");
    const en = renderLayoutPreview(fixed, "en");
    expect(en).toContain("Sent by {{workspaceName}} via BrandHub.");
    expect(en).toContain("Contact: <strong");
    expect(en).not.toContain("Email được gửi");
  });
});
