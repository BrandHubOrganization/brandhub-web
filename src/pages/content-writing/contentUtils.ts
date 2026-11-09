import * as Y from "yjs";
import type { DeltaOp, RunAttrs } from "./components/richText";

/** Decodes a base64 Yjs state and returns the plain text of the "content" Y.Text. */
export function yjsStateToText(base64: string | null): string {
  if (!base64) return "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const doc = new Y.Doc();
  Y.applyUpdate(doc, bytes);
  return doc.getText("content").toString();
}

/**
 * Restore = a normal edit on the live doc. A CRDT can't rewind by merging an
 * older state (merge is a union), so replace the text with the snapshot's
 * content (formatting included). The resulting Yjs update persists and
 * broadcasts like any other edit.
 */
export function applySnapshotToDoc(yDoc: Y.Doc, snapshotBase64: string | null): void {
  if (!snapshotBase64) return;
  const binary = atob(snapshotBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const old = new Y.Doc();
  Y.applyUpdate(old, bytes);
  const delta = old.getText("content").toDelta();
  const text = yDoc.getText("content");
  yDoc.transact(() => {
    text.delete(0, text.length);
    text.applyDelta(delta);
  });
}

// ── Diff ────────────────────────────────────────────────────────────────

export interface DiffPart {
  type: "same" | "add" | "del";
  text: string;
}

// LCS table is O(n*m); social posts are short, so cap and fall back to a
// whole-text replace instead of freezing the tab on a pathological input.
const MAX_DIFF_CELLS = 4_000_000;

/** Word-level diff of `before` → `after`. */
export function diffText(before: string, after: string): DiffPart[] {
  const a = before.split(/(\s+)/).filter(Boolean);
  const b = after.split(/(\s+)/).filter(Boolean);
  if (a.length * b.length > MAX_DIFF_CELLS) {
    return [
      ...(before ? [{ type: "del" as const, text: before }] : []),
      ...(after ? [{ type: "add" as const, text: after }] : []),
    ];
  }

  const dp = Array.from(
    { length: a.length + 1 },
    () => new Uint16Array(b.length + 1),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const parts: DiffPart[] = [];
  const push = (type: DiffPart["type"], text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.type === type) last.text += text;
    else parts.push({ type, text });
  };
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push("same", a[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push("del", a[i++]);
    } else {
      push("add", b[j++]);
    }
  }
  while (i < a.length) push("del", a[i++]);
  while (j < b.length) push("add", b[j++]);
  return parts;
}

// ── Publish text (Unicode font & style conversion — YayText / Zantext V6) ──

// Social platforms (Facebook, Instagram, TikTok, Threads) render plain
// Unicode only — rich HTML bold/italic/font-family from the editor would be
// stripped. Convert styled runs into Mathematical Alphanumeric Unicode symbols,
// Enclosed Alphanumerics, Phonetic Modifiers, and Combining Overlays so Creators
// never have to copy-paste through external YayText/Zantext tools.

interface UnicodeAlphabetSet {
  upper: number;
  lower: number;
  digit: number | null;
  exceptions?: Record<string, string>;
}

// 1. Sans-Serif (Default / Inter / Arial / Verdana / Montserrat)
const SANS_BOLD: UnicodeAlphabetSet = {
  upper: 0x1d5d4,
  lower: 0x1d5ee,
  digit: 0x1d7ec,
};
const SANS_ITALIC: UnicodeAlphabetSet = {
  upper: 0x1d608,
  lower: 0x1d622,
  digit: null,
};
const SANS_BOLD_ITALIC: UnicodeAlphabetSet = {
  upper: 0x1d63c,
  lower: 0x1d656,
  digit: 0x1d7ec,
};

// 2. Serif (Georgia / Times New Roman / Playfair Display)
const SERIF_BOLD: UnicodeAlphabetSet = {
  upper: 0x1d400,
  lower: 0x1d41a,
  digit: 0x1d7ce,
};
const SERIF_ITALIC: UnicodeAlphabetSet = {
  upper: 0x1d434,
  lower: 0x1d44e,
  digit: null,
  exceptions: { h: "\u210e" }, // Planck constant slot in BMP
};
const SERIF_BOLD_ITALIC: UnicodeAlphabetSet = {
  upper: 0x1d468,
  lower: 0x1d482,
  digit: 0x1d7ce,
};

// 3. Monospace (Courier New)
const MONOSPACE: UnicodeAlphabetSet = {
  upper: 0x1d670,
  lower: 0x1d68a,
  digit: 0x1d7f6,
};

// 4. Script / Calligraphy (Brush Script MT / Cursive / Pacifico)
const SCRIPT_REGULAR: UnicodeAlphabetSet = {
  upper: 0x1d49c,
  lower: 0x1d4b6,
  digit: null,
  exceptions: {
    B: "\u212c",
    E: "\u2130",
    F: "\u2131",
    H: "\u210b",
    I: "\u2110",
    L: "\u2112",
    M: "\u2133",
    R: "\u211b",
    e: "\u212f",
    g: "\u210a",
    o: "\u2134",
  },
};
const SCRIPT_BOLD: UnicodeAlphabetSet = {
  upper: 0x1d4d0,
  lower: 0x1d4ea,
  digit: 0x1d7ce,
};

// 5. Double-Struck (Chữ nét đôi: 𝔸𝔹ℂ 𝕒𝕓𝕔 𝟘𝟙𝟚)
const DOUBLE_STRUCK: UnicodeAlphabetSet = {
  upper: 0x1d538,
  lower: 0x1d552,
  digit: 0x1d7d8,
  exceptions: {
    C: "\u2102",
    H: "\u210d",
    N: "\u2115",
    P: "\u2119",
    Q: "\u211a",
    R: "\u211d",
    Z: "\u2124",
  },
};

// 6. Fraktur / Gothic (Chữ cổ điển: 𝔉𝔯𝔞𝔨𝔱𝔲𝔯 / 𝕭𝖔𝖑𝖉 𝕱𝖗𝖆𝖐𝖙𝖚𝖗)
const FRAKTUR_REGULAR: UnicodeAlphabetSet = {
  upper: 0x1d504,
  lower: 0x1d51e,
  digit: null,
  exceptions: {
    C: "\u212d",
    H: "\u210c",
    I: "\u2111",
    R: "\u211c",
    Z: "\u2128",
  },
};
const FRAKTUR_BOLD: UnicodeAlphabetSet = {
  upper: 0x1d56c,
  lower: 0x1d586,
  digit: 0x1d7ce,
};

// 7. Small Caps (Chữ in hoa nhỏ: BʀᴀɴᴅHᴜʙ)
const SMALL_CAPS_MAP: Record<string, string> = {
  a: "ᴀ",
  b: "ʙ",
  c: "ᴄ",
  d: "ᴅ",
  e: "ᴇ",
  f: "ꜰ",
  g: "ɢ",
  h: "ʜ",
  i: "ɪ",
  j: "ᴊ",
  k: "ᴋ",
  l: "ʟ",
  m: "ᴍ",
  n: "ɴ",
  o: "ᴏ",
  p: "ᴘ",
  q: "ǫ",
  r: "ʀ",
  s: "ꜱ",
  t: "ᴛ",
  u: "ᴜ",
  v: "ᴠ",
  w: "ᴡ",
  x: "x",
  y: "ʏ",
  z: "ᴢ",
};
const SMALL_CAPS_SET: UnicodeAlphabetSet = {
  upper: 0x41,
  lower: 0x61,
  digit: null,
  exceptions: SMALL_CAPS_MAP,
};

// 8. Circled / White Bubble (Chữ đóng khung tròn trắng: ⒷⓡⓐⓝⓓⒽⓤⓑ ①②③)
const CIRCLED_SET: UnicodeAlphabetSet = {
  upper: 0x24b6,
  lower: 0x24d0,
  digit: 0x245f, // '1' (0x31) -> 0x245f + 1 = 0x2460 (①)
  exceptions: {
    "0": "\u24ea",
  },
};

// 9. Black Bubble / Negative Circled (Chữ tròn nền đen YayText: 🅑🅤🅑🅑🅛🅔 ⓿➊➋)
const BLACK_BUBBLE_DIGITS: Record<string, string> = {
  "0": "\u24ff", // ⓿
  "1": "\u278a", // ➊
  "2": "\u278b", // ➋
  "3": "\u278c", // ➌
  "4": "\u278d", // ➍
  "5": "\u278e", // ➎
  "6": "\u278f", // ➏
  "7": "\u2790", // ➐
  "8": "\u2791", // ➑
  "9": "\u2792", // ➒
};
const BLACK_BUBBLE_SET: UnicodeAlphabetSet = {
  upper: 0x1f150,
  lower: 0x1f150,
  digit: null,
  exceptions: BLACK_BUBBLE_DIGITS,
};

// 10. Squared / White Square (Chữ đóng khung vuông trắng: 🄱🅁🄰🄽🄳🄷🅄🄱)
const SQUARED_SET: UnicodeAlphabetSet = {
  upper: 0x1f130,
  lower: 0x1f130,
  digit: null,
};

// 11. Black Square / Negative Squared (Chữ vuông nền đen YayText: 🅱🆁🅰🅽🅳🅷🆄🅱)
const BLACK_SQUARE_SET: UnicodeAlphabetSet = {
  upper: 0x1f170,
  lower: 0x1f170,
  digit: null,
  exceptions: BLACK_BUBBLE_DIGITS,
};

// 12. Parenthesized (Chữ đóng khung ngoặc đơn YayText: ⒫⒜⒭⒠⒩ ⑴⑵⑶)
const PARENTHESIZED_SET: UnicodeAlphabetSet = {
  upper: 0x249c,
  lower: 0x249c,
  digit: 0x2473, // '1' -> 0x2474 (⑴)
  exceptions: {
    "0": "\u24ea",
  },
};

// 13. Fullwidth / Vaporwave (Chữ giãn cách: ＢｒａｎｄＨｕｂ ２０２６)
const FULLWIDTH_SET: UnicodeAlphabetSet = {
  upper: 0xff21,
  lower: 0xff41,
  digit: 0xff10,
};

// 14. Superscript (Chữ mũ nhỏ YayText: ˢᵘᵖᵉʳˢᶜʳᶦᵖᵗ ⁰¹²³⁴⁵⁶⁷⁸⁹)
const SUPERSCRIPT_MAP: Record<string, string> = {
  A: "ᴬ",
  B: "ᴮ",
  C: "ᶜ",
  D: "ᴰ",
  E: "ᴱ",
  F: "ᶠ",
  G: "ᴳ",
  H: "ᴴ",
  I: "ᴵ",
  J: "ᴶ",
  K: "ᴷ",
  L: "ᴸ",
  M: "ᴹ",
  N: "ᴺ",
  O: "ᴼ",
  P: "ᴾ",
  Q: "Q",
  R: "ᴿ",
  S: "ˢ",
  T: "ᵀ",
  U: "ᵁ",
  V: "ⱽ",
  W: "ᵂ",
  X: "ˣ",
  Y: "ʸ",
  Z: "ᶻ",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ᶦ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  q: "۹",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
};
const SUPERSCRIPT_SET: UnicodeAlphabetSet = {
  upper: 0x41,
  lower: 0x61,
  digit: null,
  exceptions: SUPERSCRIPT_MAP,
};

// 15. Subscript (Chữ chỉ số dưới YayText: ₛᵤ₆ₛ꜀ᵣᵢₚₜ ₀₁₂₃₄₅₆₇₈₉)
const SUBSCRIPT_MAP: Record<string, string> = {
  a: "ₐ",
  b: "₆",
  c: "꜀",
  d: "𝒹",
  e: "ₑ",
  f: "𝒻",
  g: "₉",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  q: "q",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  w: "w",
  x: "ₓ",
  y: "ᵧ",
  z: "₂",
  A: "ₐ",
  B: "₆",
  C: "꜀",
  D: "𝒹",
  E: "ₑ",
  F: "𝒻",
  G: "₉",
  H: "ₕ",
  I: "ᵢ",
  J: "ⱼ",
  K: "ₖ",
  L: "ₗ",
  M: "ₘ",
  N: "ₙ",
  O: "ₒ",
  P: "ₚ",
  Q: "Q",
  R: "ᵣ",
  S: "ₛ",
  T: "ₜ",
  U: "ᵤ",
  V: "ᵥ",
  W: "W",
  X: "ₓ",
  Y: "ᵧ",
  Z: "₂",
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
};
const SUBSCRIPT_SET: UnicodeAlphabetSet = {
  upper: 0x41,
  lower: 0x61,
  digit: null,
  exceptions: SUBSCRIPT_MAP,
};

// 16. Upside-Down Flip (Chữ lộn ngược 180° YayText: qnpuɐɹB)
const UPSIDE_DOWN_MAP: Record<string, string> = {
  a: "ɐ",
  b: "q",
  c: "ɔ",
  d: "p",
  e: "ǝ",
  f: "ɟ",
  g: "ƃ",
  h: "ɥ",
  i: "ᴉ",
  j: "ɾ",
  k: "ʞ",
  l: "ן",
  m: "ɯ",
  n: "u",
  o: "o",
  p: "d",
  q: "b",
  r: "ɹ",
  s: "s",
  t: "ʇ",
  u: "n",
  v: "ʌ",
  w: "ʍ",
  x: "x",
  y: "ʎ",
  z: "z",
  A: "∀",
  B: "ᙠ",
  C: "Ɔ",
  D: "ᗡ",
  E: "Ǝ",
  F: "Ⅎ",
  G: "⅁",
  H: "H",
  I: "I",
  J: "ſ",
  K: "ʞ",
  L: "˥",
  M: "W",
  N: "N",
  O: "O",
  P: "Ԁ",
  Q: "Ό",
  R: "ᴚ",
  S: "S",
  T: "⊥",
  U: "∩",
  V: "Λ",
  W: "M",
  X: "X",
  Y: "⅄",
  Z: "Z",
  "0": "0",
  "1": "Ɩ",
  "2": "ᄅ",
  "3": "Ɛ",
  "4": "ㄣ",
  "5": "ϛ",
  "6": "9",
  "7": "ㄥ",
  "8": "8",
  "9": "6",
  "?": "¿",
  "!": "¡",
  ".": "˙",
  ",": "'",
};

const REVERSE_UPSIDE_DOWN_MAP: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const [k, v] of Object.entries(UPSIDE_DOWN_MAP)) {
    if (!m.has(v)) m.set(v, k);
  }
  return m;
})();

/**
 * Strips Vietnamese diacritics to clean ASCII base letters (`Khuyến mãi Đặc Biệt` -> `Khuyen mai Dac Biet`).
 * Used automatically for Enclosed shapes (`Black Bubble`, `Black Square`, `Regional Flag`, `Upside-Down`)
 * or when the user enables the `Lược dấu chuẩn khung` toggle so glyphs never break on iOS/Android.
 */
export function stripVietnameseAccents(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFC");
}

export type SocialFontCategory =
  | "sans"
  | "sans-bold"
  | "sans-italic"
  | "sans-bold-italic"
  | "serif-bold"
  | "serif-italic"
  | "serif-bold-italic"
  | "monospace"
  | "script"
  | "script-bold"
  | "double-struck"
  | "fraktur"
  | "fraktur-bold"
  | "small-caps"
  | "circled"
  | "black-bubble"
  | "squared"
  | "black-square"
  | "parenthesized"
  | "regional-indicator"
  | "fullwidth"
  | "superscript"
  | "subscript"
  | "double-underline"
  | "slashthrough"
  | "tilde-strike"
  | "overline"
  | "under-asterisks"
  | "lightning-above"
  | "upside-down"
  | "air-quotes"
  | "lenticular-brackets"
  | "sparkles-decorator"
  | "stars-wave-decorator"
  | "arrow-pointer-decorator";

export function classifyFontFamily(font?: string): SocialFontCategory {
  if (!font) return "sans";
  const lower = font.toLowerCase();
  if (lower.includes("black bubble") || lower.includes("negative circled")) {
    return "black-bubble";
  }
  if (lower.includes("black square") || lower.includes("negative squared")) {
    return "black-square";
  }
  if (lower.includes("parenthesized")) return "parenthesized";
  if (lower.includes("regional flag") || lower.includes("regional indicator")) {
    return "regional-indicator";
  }
  if (lower.includes("superscript")) return "superscript";
  if (lower.includes("subscript")) return "subscript";
  if (lower.includes("double underline")) return "double-underline";
  if (lower.includes("slash price") || lower.includes("slashthrough")) {
    return "slashthrough";
  }
  if (lower.includes("tilde wave") || lower.includes("tilde strike")) {
    return "tilde-strike";
  }
  if (lower.includes("overline")) return "overline";
  if (lower.includes("under asterisks") || lower.includes("star below")) {
    return "under-asterisks";
  }
  if (lower.includes("lightning above") || lower.includes("zigzag flash")) {
    return "lightning-above";
  }
  if (lower.includes("upside down") || lower.includes("flip")) {
    return "upside-down";
  }
  if (lower.includes("air quotes")) return "air-quotes";
  if (lower.includes("bold brackets") || lower.includes("lenticular")) {
    return "lenticular-brackets";
  }
  if (lower.includes("sparkles banner")) return "sparkles-decorator";
  if (lower.includes("star wave banner")) return "stars-wave-decorator";
  if (lower.includes("arrow pointer")) return "arrow-pointer-decorator";
  if (lower.includes("fullwidth")) return "fullwidth";
  if (lower.includes("squared")) return "squared";
  if (lower.includes("circled")) return "circled";
  if (lower.includes("small caps")) return "small-caps";
  if (lower.includes("bold fraktur")) return "fraktur-bold";
  if (
    lower.includes("fraktur") ||
    lower.includes("old english") ||
    lower.includes("gothic")
  ) {
    return "fraktur";
  }
  if (lower.includes("pacifico")) return "script-bold";
  if (lower.includes("playfair")) return "serif-bold-italic";
  if (lower.includes("verdana")) return "sans-bold-italic";
  if (lower.includes("roboto")) return "sans-italic";
  if (lower.includes("montserrat") || lower.includes("arial")) {
    return "sans-bold";
  }
  if (lower.includes("courier") || lower.includes("monospace")) {
    return "monospace";
  }
  if (
    lower.includes("brush script") ||
    lower.includes("cursive") ||
    lower.includes("script")
  ) {
    return "script";
  }
  if (lower.includes("double") || lower.includes("struck")) {
    return "double-struck";
  }
  if (lower.includes("times new roman")) {
    return "serif-italic";
  }
  if (lower.includes("georgia") || lower.includes("serif")) {
    return "serif-bold";
  }
  return "sans";
}

function selectUnicodeSet(attrs: RunAttrs): UnicodeAlphabetSet | null {
  const bold = !!attrs.bold;
  const italic = !!attrs.italic;
  const category = classifyFontFamily(attrs.font);

  switch (category) {
    case "monospace":
      return MONOSPACE;
    case "script":
      return bold ? SCRIPT_BOLD : SCRIPT_REGULAR;
    case "script-bold":
      return SCRIPT_BOLD;
    case "double-struck":
      return DOUBLE_STRUCK;
    case "fraktur":
      return bold ? FRAKTUR_BOLD : FRAKTUR_REGULAR;
    case "fraktur-bold":
      return FRAKTUR_BOLD;
    case "small-caps":
      return SMALL_CAPS_SET;
    case "circled":
      return CIRCLED_SET;
    case "black-bubble":
      return BLACK_BUBBLE_SET;
    case "squared":
      return SQUARED_SET;
    case "black-square":
      return BLACK_SQUARE_SET;
    case "parenthesized":
      return PARENTHESIZED_SET;
    case "fullwidth":
      return FULLWIDTH_SET;
    case "superscript":
      return SUPERSCRIPT_SET;
    case "subscript":
      return SUBSCRIPT_SET;
    case "sparkles-decorator":
    case "arrow-pointer-decorator":
      return SANS_BOLD;
    case "stars-wave-decorator":
      return SCRIPT_BOLD;
    case "serif-bold-italic":
      return SERIF_BOLD_ITALIC;
    case "serif-italic":
      if (bold && italic) return SERIF_BOLD_ITALIC;
      if (bold) return SERIF_BOLD;
      return SERIF_ITALIC;
    case "serif-bold":
      if (bold && italic) return SERIF_BOLD_ITALIC;
      if (italic) return SERIF_ITALIC;
      return SERIF_BOLD;
    case "sans-bold-italic":
      return SANS_BOLD_ITALIC;
    case "sans-italic":
      return bold ? SANS_BOLD_ITALIC : SANS_ITALIC;
    case "sans-bold":
      return italic ? SANS_BOLD_ITALIC : SANS_BOLD;
    case "sans":
    default:
      if (bold && italic) return SANS_BOLD_ITALIC;
      if (bold) return SANS_BOLD;
      if (italic) return SANS_ITALIC;
      return null;
  }
}

function mapCharToSet(ch: string, set: UnicodeAlphabetSet | null): string {
  if (!set) return ch;
  if (set.exceptions && set.exceptions[ch]) {
    return set.exceptions[ch];
  }
  const code = ch.charCodeAt(0);
  if (code >= 0x41 && code <= 0x5a) {
    return String.fromCodePoint(set.upper + code - 0x41);
  }
  if (code >= 0x61 && code <= 0x7a) {
    return String.fromCodePoint(set.lower + code - 0x61);
  }
  if (set.digit !== null && code >= 0x30 && code <= 0x39) {
    return String.fromCodePoint(set.digit + code - 0x30);
  }
  return ch;
}

const ALL_UNICODE_SETS: UnicodeAlphabetSet[] = [
  SANS_BOLD,
  SANS_ITALIC,
  SANS_BOLD_ITALIC,
  SERIF_BOLD,
  SERIF_ITALIC,
  SERIF_BOLD_ITALIC,
  MONOSPACE,
  SCRIPT_REGULAR,
  SCRIPT_BOLD,
  DOUBLE_STRUCK,
  FRAKTUR_REGULAR,
  FRAKTUR_BOLD,
  SMALL_CAPS_SET,
  CIRCLED_SET,
  BLACK_BUBBLE_SET,
  SQUARED_SET,
  BLACK_SQUARE_SET,
  PARENTHESIZED_SET,
  FULLWIDTH_SET,
  SUPERSCRIPT_SET,
  SUBSCRIPT_SET,
];

const REVERSE_UNICODE_MAP: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const set of ALL_UNICODE_SETS) {
    for (let i = 0; i < 26; i++) {
      const lowerAscii = String.fromCharCode(0x61 + i);
      const lowerStyled = mapCharToSet(lowerAscii, set);
      if (lowerStyled !== lowerAscii && !map.has(lowerStyled)) {
        map.set(lowerStyled, lowerAscii);
      }
      const upperAscii = String.fromCharCode(0x41 + i);
      const upperStyled = mapCharToSet(upperAscii, set);
      if (upperStyled !== upperAscii) {
        map.set(upperStyled, upperAscii);
      }
    }
    for (let d = 0; d < 10; d++) {
      const digitAscii = String.fromCharCode(0x30 + d);
      const digitStyled = mapCharToSet(digitAscii, set);
      if (digitStyled !== digitAscii && !map.has(digitStyled)) {
        map.set(digitStyled, digitAscii);
      }
    }
  }
  // Regional Indicator Symbols (🇦..🇿 -> A..Z)
  for (let i = 0; i < 26; i++) {
    map.set(String.fromCodePoint(0x1f1e6 + i), String.fromCharCode(0x41 + i));
  }
  return map;
})();

const DECORATOR_BANNERS: Array<[string, string]> = [
  ["˜”*°•.˜”*°• ", " •°*”˜.•°*”˜"],
  ["¸,ø¤º°`°º¤ø,¸ ", " ¸,ø¤º°°º¤ø,¸"],
  ["»»——⍟ ", " ⍟——««"],
];

const COMBINING_STYLE_MARKS = new Set([
  "\u0332", // single underline
  "\u0333", // double underline
  "\u0336", // single strikethrough
  "\u0338", // long solidus (slashthrough)
  "\u0334", // tilde overlay
  "\u0305", // overline
  "\u0359", // asterisk below
  "\u035b", // zigzag above
]);

/**
 * Strips all 36 YayText / Zantext Unicode styles, enclosed shapes, regional flags,
 * character brackets (`『c』`, `【c】`), decorator banners, and combining overlays
 * (`\u0332`, `\u0333`, `\u0336`, `\u0338`, `\u0334`, `\u0305`, `\u0359`, `\u035b`)
 * back to standard NFC plain text while keeping Vietnamese diacritics intact.
 */
export function stripUnicodeStyling(text: string): string {
  if (!text) return "";
  let working = text;

  // 1. Strip line-level decorator banners if present
  for (const [prefix, suffix] of DECORATOR_BANNERS) {
    working = working
      .split("\n")
      .map((line) => {
        let l = line;
        if (l.startsWith(prefix)) l = l.slice(prefix.length);
        if (l.endsWith(suffix)) l = l.slice(0, -suffix.length);
        return l;
      })
      .join("\n");
  }

  // 2. Strip character-level Air Quotes 『c』 and Bold Brackets 【c】
  if (working.includes("『") && working.includes("』")) {
    working = working.replace(/『([^』])』/g, "$1");
  }
  if (working.includes("【") && working.includes("】")) {
    working = working.replace(/【([^】])】/g, "$1");
  }

  // 3. Collapse Regional Indicator spacing (🇦 🇧 🇨 -> 🇦🇧🇨, triple space -> single space)
  if (/[\u{1F1E6}-\u{1F1FF}]/u.test(working)) {
    working = working
      .replace(/([\u{1F1E6}-\u{1F1FF}])\s+(?=[\u{1F1E6}-\u{1F1FF}])/gu, "$1")
      .replace(/\s{2,}/g, " ");
  }

  // 4. Detect Upside-Down text (contains distinct upside-down code points) and un-reverse
  if (/[ɐɔǝɟƃɥᴉɾʞןɯɹʇʌʍʎ∀ᙠƆᗡƎℲ⅁˥ԀΌᴚ⊥∩Λ⅄¿¡]/.test(working)) {
    working = working
      .split("\n")
      .map((line) =>
        Array.from(line)
          .reverse()
          .map((ch) => REVERSE_UPSIDE_DOWN_MAP.get(ch) ?? ch)
          .join(""),
      )
      .join("\n");
  }

  let out = "";
  for (const ch of Array.from(working)) {
    if (COMBINING_STYLE_MARKS.has(ch)) continue;
    out += REVERSE_UNICODE_MAP.get(ch) ?? ch;
  }
  return out.normalize("NFC");
}

export type ZantextCategoryId =
  | "all"
  | "favorites"
  | "emphasis"
  | "lines"
  | "enclosed"
  | "luxury"
  | "modern"
  | "creative";

export interface ZantextCategoryMeta {
  id: ZantextCategoryId;
  label: string;
}

export const ZANTEXT_CATEGORIES: ZantextCategoryMeta[] = [
  { id: "all", label: "Tất cả (36)" },
  { id: "favorites", label: "⭐ Yêu thích" },
  { id: "emphasis", label: "Tiêu đề (7)" },
  { id: "lines", label: "Sale & Gạch giá (8)" },
  { id: "enclosed", label: "Khung Nổi bật (6)" },
  { id: "luxury", label: "Sang trọng (4)" },
  { id: "modern", label: "Hiện đại (5)" },
  { id: "creative", label: "Độc lạ (6)" },
];

export interface ZantextStylePreset {
  id: string;
  label: string;
  badge: string;
  category: Exclude<ZantextCategoryId, "all" | "favorites">;
  compatibility: "Universal" | "Modern OS";
  vietnameseMode: "keep-marks" | "strip-accents-auto";
  attrs: RunAttrs;
}

export const ZANTEXT_STYLE_PRESETS: ZantextStylePreset[] = [
  // ── Category 1: emphasis (Tiêu đề & Nhấn mạnh — 7 styles) ──
  {
    id: "sans-bold",
    label: "Sans Đậm (Chuẩn Facebook)",
    badge: "𝗔𝗕𝗖",
    category: "emphasis",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { bold: true },
  },
  {
    id: "sans-italic",
    label: "Sans Nghiêng (Tinh tế)",
    badge: "𝘈𝘉𝘊",
    category: "emphasis",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { italic: true },
  },
  {
    id: "sans-bold-italic",
    label: "Sans Đậm Nghiêng (Nổi bật)",
    badge: "𝘼𝘽𝘾",
    category: "emphasis",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { bold: true, italic: true },
  },
  {
    id: "serif-bold",
    label: "Serif Đậm (Báo chí / Editorial)",
    badge: "𝐀𝐁𝐂",
    category: "emphasis",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: "Georgia, serif", bold: true },
  },
  {
    id: "serif-italic",
    label: "Serif Nghiêng (Classic)",
    badge: "𝐴𝐵𝐶",
    category: "emphasis",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Times New Roman", serif', italic: true },
  },
  {
    id: "serif-bold-italic",
    label: "Serif Đậm Nghiêng (Luxury)",
    badge: "𝑨𝑩𝑪",
    category: "emphasis",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Playfair Display", serif', bold: true, italic: true },
  },
  {
    id: "double-struck",
    label: "Chữ Nét Đôi (Double-Struck)",
    badge: "𝔸𝔹ℂ",
    category: "emphasis",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Double Struck", serif' },
  },

  // ── Category 2: luxury (Sang trọng & Nghệ thuật — 4 styles) ──
  {
    id: "script",
    label: "Chữ Viết Tay (Calligraphy)",
    badge: "𝒜𝒷𝒸",
    category: "luxury",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Brush Script MT", cursive' },
  },
  {
    id: "script-bold",
    label: "Chữ Nghệ Thuật Đậm (Bold Script)",
    badge: "𝓐𝓫𝓬",
    category: "luxury",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: "Pacifico, cursive", bold: true },
  },
  {
    id: "fraktur",
    label: "Fraktur Gothic (Cổ Điển)",
    badge: "𝔉𝔯𝔞",
    category: "luxury",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"UnifrakturMaguntia", "Old English Text MT", serif' },
  },
  {
    id: "bold-fraktur",
    label: "Bold Fraktur (Gothic Đậm)",
    badge: "𝕭𝖔𝖑𝖉",
    category: "luxury",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: {
      font: '"Bold Fraktur", "Old English Text MT", serif',
      bold: true,
    },
  },

  // ── Category 3: modern (Hiện đại & Ghi chú — 5 styles) ──
  {
    id: "monospace",
    label: "Monospace (Code / Tech)",
    badge: "𝙰𝙱𝙲",
    category: "modern",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Courier New", monospace' },
  },
  {
    id: "small-caps",
    label: "Chữ In Hoa Nhỏ (Small Caps)",
    badge: "ꜱᴍᴀʟʟ",
    category: "modern",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Small Caps", sans-serif' },
  },
  {
    id: "fullwidth",
    label: "Chữ Giãn Cách (Vaporwave)",
    badge: "ＡＢＣ",
    category: "modern",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Fullwidth", sans-serif' },
  },
  {
    id: "superscript",
    label: "Chữ Mũ Nhỏ (Superscript / Ghi chú giá)",
    badge: "ˢᵘᵖᵉʳ",
    category: "modern",
    compatibility: "Universal",
    vietnameseMode: "strip-accents-auto",
    attrs: { font: '"Superscript", sans-serif' },
  },
  {
    id: "subscript",
    label: "Chữ Chỉ Số Dưới (Subscript)",
    badge: "ₛᵤ₆",
    category: "modern",
    compatibility: "Modern OS",
    vietnameseMode: "strip-accents-auto",
    attrs: { font: '"Subscript", sans-serif' },
  },

  // ── Category 4: enclosed (Khung Nổi bật & Sale — 6 styles) ──
  {
    id: "circled",
    label: "Khung Tròn Trắng (Circled Bubble)",
    badge: "Ⓐⓑⓒ",
    category: "enclosed",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Circled", sans-serif' },
  },
  {
    id: "black-bubble",
    label: "Khung Tròn Đen (Black Bubble Sale)",
    badge: "🅑🅤🅑",
    category: "enclosed",
    compatibility: "Universal",
    vietnameseMode: "strip-accents-auto",
    attrs: { font: '"Black Bubble", sans-serif' },
  },
  {
    id: "squared",
    label: "Khung Vuông Trắng (Squared)",
    badge: "🄰🄱🄲",
    category: "enclosed",
    compatibility: "Universal",
    vietnameseMode: "strip-accents-auto",
    attrs: { font: '"Squared", sans-serif' },
  },
  {
    id: "black-square",
    label: "Khung Vuông Đen (Black Square Hot)",
    badge: "🅱🅻🅰",
    category: "enclosed",
    compatibility: "Universal",
    vietnameseMode: "strip-accents-auto",
    attrs: { font: '"Black Square", sans-serif' },
  },
  {
    id: "parenthesized",
    label: "Khung Ngoặc Đơn (Parenthesized)",
    badge: "⒫⒜⒭",
    category: "enclosed",
    compatibility: "Universal",
    vietnameseMode: "strip-accents-auto",
    attrs: { font: '"Parenthesized", sans-serif' },
  },
  {
    id: "regional-indicator",
    label: "Chữ Cờ Xanh (Regional Indicator)",
    badge: "🇧 🇷 🇦",
    category: "enclosed",
    compatibility: "Modern OS",
    vietnameseMode: "strip-accents-auto",
    attrs: { font: '"Regional Flag", sans-serif' },
  },

  // ── Category 5: lines (Gạch giá & Hiệu ứng dòng — 8 styles) ──
  {
    id: "underline",
    label: "Gạch Chân Đơn (Underline)",
    badge: "A̲B̲C̲",
    category: "lines",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { underline: true },
  },
  {
    id: "double-underline",
    label: "Gạch Chân Kép (Double Underline)",
    badge: "A̳B̳C̳",
    category: "lines",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Double Underline", sans-serif' },
  },
  {
    id: "strikethrough",
    label: "Gạch Ngang Đơn (Strikethrough)",
    badge: "A̶B̶C̶",
    category: "lines",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { strikethrough: true },
  },
  {
    id: "slashthrough",
    label: "Gạch Chéo Giá Gốc (Slash Price 9̸9̸0̸k̸)",
    badge: "9̸9̸0̸k̸",
    category: "lines",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Slash Price", sans-serif' },
  },
  {
    id: "tilde-strike",
    label: "Gạch Lượn Sóng (Tilde Wave)",
    badge: "A̴B̴C̴",
    category: "lines",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Tilde Wave", sans-serif' },
  },
  {
    id: "overline",
    label: "Gạch Trên Đầu (Overline)",
    badge: "A̅B̅C̅",
    category: "lines",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Overline", sans-serif' },
  },
  {
    id: "under-asterisks",
    label: "Sao Dưới Chân (Under-Asterisks)",
    badge: "A͙B͙C͙",
    category: "lines",
    compatibility: "Modern OS",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Under Asterisks", sans-serif' },
  },
  {
    id: "lightning-above",
    label: "Tia Chớp Trên Đầu (Zigzag Flash)",
    badge: "A͛B͛C͛",
    category: "lines",
    compatibility: "Modern OS",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Lightning Above", sans-serif' },
  },

  // ── Category 6: creative (Độc lạ & Trang trí — 6 styles) ──
  {
    id: "upside-down",
    label: "Chữ Lộn Ngược 180° (Upside-Down Flip)",
    badge: "qnpuɐɹB",
    category: "creative",
    compatibility: "Universal",
    vietnameseMode: "strip-accents-auto",
    attrs: { font: '"Upside Down", sans-serif' },
  },
  {
    id: "air-quotes",
    label: "Khung Ngoặc Nhật (Air Quotes)",
    badge: "『A』『B』",
    category: "creative",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Air Quotes", sans-serif' },
  },
  {
    id: "lenticular-brackets",
    label: "Khung Ngoặc Đen (Bold Brackets)",
    badge: "【A】【B】",
    category: "creative",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Bold Brackets", sans-serif' },
  },
  {
    id: "sparkles-decorator",
    label: "Viền Lấp Lánh (Sparkles Banner)",
    badge: "˜”*°•.",
    category: "creative",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Sparkles Banner", sans-serif' },
  },
  {
    id: "stars-wave-decorator",
    label: "Viền Sóng Sao (Star Wave Banner)",
    badge: "¸,ø¤º°",
    category: "creative",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Star Wave Banner", sans-serif' },
  },
  {
    id: "arrow-pointer-decorator",
    label: "Viền Mũi Tên Tâm Điểm (Pointer)",
    badge: "»»——⍟",
    category: "creative",
    compatibility: "Universal",
    vietnameseMode: "keep-marks",
    attrs: { font: '"Arrow Pointer", sans-serif' },
  },
];

function applyCombiningMarkPerGrapheme(styled: string, mark: string): string {
  if (!mark) return styled;
  const chars = Array.from(styled);
  let decorated = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    decorated += ch;
    const nextCode = i + 1 < chars.length ? chars[i + 1].codePointAt(0)! : 0;
    const isNextCombining = nextCode >= 0x0300 && nextCode <= 0x036f;
    if (!isNextCombining && !/\s/.test(ch)) {
      decorated += mark;
    }
  }
  return decorated;
}

export interface StyleRunOptions {
  /**
   * When `true`, strips Vietnamese diacritics (`Khuyến mãi` -> `Khuyen mai`) before applying Unicode styling.
   * Enclosed shapes (`black-bubble`, `black-square`, `regional-indicator`, `upside-down`) automatically strip
   * diacritics by default unless `stripAccents` is explicitly `false`.
   */
  stripAccents?: boolean;
}

/**
 * Converts a single plain string with `RunAttrs` into its Unicode social-ready string.
 * Supports all 36 YayText / Zantext styles, combining line overlays, character brackets,
 * decorator banners, and Smart Vietnamese Diacritic Handling.
 */
export function styleRunText(
  text: string,
  attrs: RunAttrs = {},
  options?: StyleRunOptions,
): string {
  if (!text) return "";
  const category = classifyFontFamily(attrs.font);
  const set = selectUnicodeSet(attrs);
  const hasUnderline = !!attrs.underline;
  const hasStrike = !!attrs.strikethrough;

  const isSpecialCategory =
    category === "regional-indicator" ||
    category === "double-underline" ||
    category === "slashthrough" ||
    category === "tilde-strike" ||
    category === "overline" ||
    category === "under-asterisks" ||
    category === "lightning-above" ||
    category === "upside-down" ||
    category === "air-quotes" ||
    category === "lenticular-brackets" ||
    category === "sparkles-decorator" ||
    category === "stars-wave-decorator" ||
    category === "arrow-pointer-decorator";

  if (!set && !hasUnderline && !hasStrike && !isSpecialCategory) {
    return options?.stripAccents
      ? stripVietnameseAccents(text)
      : text.normalize("NFC");
  }

  // Determine whether Vietnamese diacritics should be stripped for clean glyph boxes
  const autoStripCategory =
    category === "black-bubble" ||
    category === "black-square" ||
    category === "regional-indicator" ||
    category === "upside-down";
  const shouldStripAccents =
    options?.stripAccents ?? autoStripCategory;

  let cleanBase = stripUnicodeStyling(text);
  if (shouldStripAccents) {
    cleanBase = stripVietnameseAccents(cleanBase);
  }

  // Handle special structural categories first
  if (category === "upside-down") {
    const flipped = cleanBase
      .split("\n")
      .map((line) =>
        Array.from(line)
          .reverse()
          .map((ch) => UPSIDE_DOWN_MAP[ch] ?? ch)
          .join(""),
      )
      .join("\n");
    return flipped;
  }

  if (category === "regional-indicator") {
    return cleanBase
      .split("\n")
      .map((line) => {
        const tokens: string[] = [];
        for (const ch of Array.from(line)) {
          const code = ch.toUpperCase().charCodeAt(0);
          if (code >= 0x41 && code <= 0x5a) {
            tokens.push(String.fromCodePoint(0x1f1e6 + code - 0x41));
          } else if (/\s/.test(ch)) {
            tokens.push(" ");
          } else {
            tokens.push(ch);
          }
        }
        return tokens.join(" ").replace(/\s{3,}/g, "   ");
      })
      .join("\n");
  }

  if (category === "air-quotes") {
    return Array.from(cleanBase.normalize("NFC"))
      .map((ch) => (/\s/.test(ch) ? ch : `『${ch}』`))
      .join("");
  }

  if (category === "lenticular-brackets") {
    return Array.from(cleanBase.normalize("NFC"))
      .map((ch) => (/\s/.test(ch) ? ch : `【${ch}】`))
      .join("");
  }

  let styled = "";
  if (set) {
    const normalizedInput =
      category === "superscript" ||
      category === "subscript" ||
      category === "parenthesized" ||
      category === "squared"
        ? stripVietnameseAccents(cleanBase)
        : cleanBase;
    for (const ch of normalizedInput.normalize("NFD")) {
      styled += mapCharToSet(ch, set);
    }
  } else {
    styled = cleanBase.normalize("NFC");
  }

  // Apply line-banner decorators if selected
  if (category === "sparkles-decorator") {
    styled = styled
      .split("\n")
      .map((l) => (l.trim() ? `˜”*°•.˜”*°• ${l} •°*”˜.•°*”˜` : l))
      .join("\n");
  } else if (category === "stars-wave-decorator") {
    styled = styled
      .split("\n")
      .map((l) => (l.trim() ? `¸,ø¤º°\`°º¤ø,¸ ${l} ¸,ø¤º°°º¤ø,¸` : l))
      .join("\n");
  } else if (category === "arrow-pointer-decorator") {
    styled = styled
      .split("\n")
      .map((l) => (l.trim() ? `»»——⍟ ${l} ⍟——««` : l))
      .join("\n");
  }

  // Determine combining overlay suffix
  let overlayMark = "";
  if (category === "double-underline") overlayMark += "\u0333";
  if (category === "slashthrough") overlayMark += "\u0338";
  if (category === "tilde-strike") overlayMark += "\u0334";
  if (category === "overline") overlayMark += "\u0305";
  if (category === "under-asterisks") overlayMark += "\u0359";
  if (category === "lightning-above") overlayMark += "\u035b";
  if (hasUnderline) overlayMark += "\u0332";
  if (hasStrike) overlayMark += "\u0336";

  if (!overlayMark) {
    return styled;
  }

  return applyCombiningMarkPerGrapheme(styled, overlayMark);
}

/**
 * Convenience helper to convert plain text directly using any of the 36 YayText / Zantext style IDs.
 */
export function convertPlainTextToSocialStyle(
  text: string,
  styleId: string,
  options?: StyleRunOptions,
): string {
  const preset = ZANTEXT_STYLE_PRESETS.find((p) => p.id === styleId);
  if (!preset) return text.normalize("NFC");
  return styleRunText(text, preset.attrs, options);
}

/**
 * Converts the editor's rich-text delta to the plain Unicode string to post.
 * - Always NFC-normalizes plain text (fixes decomposed Vietnamese from mixed input methods).
 * - Bold/italic/font-family runs become Unicode styled letters (Sans-Serif, Serif,
 *   Monospace, Script/Cursive, Double-Struck, Enclosed, Combining Overlays, Decorators).
 * - List prefixes ("• ", "1. ") are already literal text, so they pass through.
 */
export function toPublishText(delta: DeltaOp[]): string {
  let out = "";
  for (const op of delta) {
    if (typeof op.insert !== "string") continue;
    out += styleRunText(op.insert, op.attributes ?? {});
  }
  return out;
}

// ── Creative Content Transformations & Templates ────────────────────────

export type TextCaseMode = "upper" | "lower" | "title" | "sentence";

/**
 * Transforms text casing while preserving Vietnamese diacritics (NFC).
 */
export function transformTextCase(text: string, mode: TextCaseMode): string {
  const normalized = text.normalize("NFC");
  switch (mode) {
    case "upper":
      return normalized.toLocaleUpperCase("vi-VN");
    case "lower":
      return normalized.toLocaleLowerCase("vi-VN");
    case "title":
      return normalized
        .toLocaleLowerCase("vi-VN")
        .replace(/(^|\s|[-/([{“"'])(\p{L})/gu, (_m, sep: string, ch: string) =>
          `${sep}${ch.toLocaleUpperCase("vi-VN")}`,
        );
    case "sentence":
      return normalized
        .toLocaleLowerCase("vi-VN")
        .replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (_m, sep: string, ch: string) =>
          `${sep}${ch.toLocaleUpperCase("vi-VN")}`,
        );
  }
}

export interface CreativeTemplate {
  id: string;
  label: string;
  badge: string;
  description: string;
  ops: DeltaOp[];
}

export const CREATIVE_TEMPLATES: CreativeTemplate[] = [
  {
    id: "aida",
    label: "Công thức AIDA (Thu hút - Quan tâm - Khao khát - Hành động)",
    badge: "AIDA",
    description: "Cấu trúc bài viết bán hàng & ra mắt sản phẩm kinh điển",
    ops: [
      {
        insert: "🔥 [ATTENTION] TIÊU ĐỀ THU HÚT SỰ CHÚ Ý NGAY TỪ 3 GIÂY ĐẦU\n",
        attributes: { bold: true, size: 20, font: "Montserrat, sans-serif" },
      },
      {
        insert:
          "Bạn đã bao giờ gặp tình trạng mất hàng giờ chỉnh sửa bài đăng nhưng tương tác vẫn dậm chân tại chỗ?\n\n",
      },
      {
        insert: "💡 [INTEREST & DESIRE] Điểm khác biệt tạo nên đột phá:\n",
        attributes: { bold: true },
      },
      {
        insert:
          "• Tiết kiệm 70% thời gian biên tập nội dung đa nền tảng\n• Tự động đồng bộ bộ nhận diện thương hiệu chuẩn chỉnh\n• Giữ nguyên định dạng font chữ nổi bật trên Facebook, Instagram, TikTok, Threads\n\n",
      },
      {
        insert: "👉 [ACTION] Đăng ký trải nghiệm ngay hôm nay để nhận ưu đãi giới hạn!\n",
        attributes: { bold: true, italic: true },
      },
    ],
  },
  {
    id: "pas",
    label: "Công thức PAS (Vấn đề - Xoáy sâu - Giải pháp)",
    badge: "PAS",
    description: "Chạm đúng nỗi đau khách hàng và đưa ra giải pháp thuyết phục",
    ops: [
      {
        insert: "⚠️ VẤN ĐỀ BẠN ĐANG GẶP PHẢI?\n",
        attributes: { bold: true, size: 20 },
      },
      {
        insert:
          "Mỗi ngày đội ngũ sáng tạo phải chuyển đổi qua lại giữa hàng chục file rời rạc, khiến thông điệp thương hiệu thiếu nhất quán.\n\n",
      },
      {
        insert: "⚡ HỆ QUẢ KHI KHÔNG TỐI ƯU SỚM:\n",
        attributes: { bold: true },
      },
      {
        insert:
          "Chi phí quảng cáo tăng cao nhưng tỷ lệ chuyển đổi giảm vì nội dung thiếu điểm nhấn thị giác.\n\n",
      },
      {
        insert: "✅ GIẢI PHÁP TỪ BRANDHUB:\n",
        attributes: { bold: true, font: "Georgia, serif" },
      },
      {
        insert:
          "Quy trình soạn thảo cộng tác trực tiếp kèm chuyển đổi font chữ tự động giúp chiến dịch lên sóng chỉ trong 1 cú nhấp chuột!\n",
      },
    ],
  },
  {
    id: "flash-sale",
    label: "Khung chiến dịch Flash Sale / Ưu đãi giới hạn",
    badge: "SALE",
    description: "Tối ưu tỷ lệ chốt đơn với bố cục ưu đãi rõ ràng",
    ops: [
      {
        insert: "⚡ FLASH SALE ĐỘC QUYỀN — GIẢM ĐẾN 50% DUY NHẤT HÔM NAY ⚡\n",
        attributes: {
          bold: true,
          size: 20,
          font: '"Double Struck", serif',
        },
      },
      {
        insert: "━━━━━━━━━━━━━━━━━━━━━━\n",
      },
      {
        insert: "🎁 Ưu đãi đặc biệt dành cho 50 khách hàng đầu tiên:\n",
        attributes: { bold: true },
      },
      {
        insert:
          "1. Giảm trực tiếp 50% gói dịch vụ cao cấp\n2. Tặng kèm bộ 100 mẫu kịch bản nội dung đa kênh\n3. Miễn phí tư vấn chiến lược thương hiệu 1-1\n\n",
      },
      {
        insert: "⏰ Thời gian áp dụng: Chỉ đến 23:59 tối nay!\n",
        attributes: { italic: true },
      },
      {
        insert: "📩 Bình luận hoặc nhắn tin ngay để giữ suất ưu đãi!\n",
        attributes: { bold: true },
      },
    ],
  },
];

// ── Google Docs / File Import Utilities ─────────────────────────────────

export interface GoogleDocSample {
  id: string;
  title: string;
  url: string;
  updatedAt: string;
  author: string;
  markdown: string;
}

export const GOOGLE_DOCS_SAMPLES: GoogleDocSample[] = [
  {
    id: "gdoc-brandhub-launch-2026",
    title: "Brief Chiến dịch Ra mắt Sản phẩm Mùa Hè 2026 - Google Docs",
    url: "https://docs.google.com/document/d/1BrandHubSummerCampaign2026/edit",
    updatedAt: "Vừa cập nhật trên Google Drive",
    author: "Creative Team",
    markdown: `# CHIẾN DỊCH RA MẮT BỘ SƯU TẬP MÙA HÈ 2026

**Thông điệp chủ đạo:** Bứt phá phong cách cá nhân cùng công nghệ sáng tạo nội dung thế hệ mới từ BrandHub Studio.

## Điểm nhấn chiến dịch
- Ra mắt dòng sản phẩm thiết kế tối giản, thân thiện môi trường
- Tích hợp trải nghiệm tương tác đa kênh trên **Facebook**, **Instagram**, **TikTok** và **Threads**
- Ưu đãi **Early Bird 30%** cho khách hàng đăng ký trước ngày mở bán

*Liên hệ ngay đội ngũ BrandHub hoặc nhấn vào liên kết bên dưới để nhận trọn bộ Lookbook chính thức!*`,
  },
  {
    id: "gdoc-storytelling-brand",
    title: "Kịch bản Storytelling Thương hiệu & Case Study - Google Docs",
    url: "https://docs.google.com/document/d/1BrandHubStorytellingCaseStudy/edit",
    updatedAt: "Đồng bộ từ Google Docs",
    author: "Brand Strategist",
    markdown: `# HÀNH TRÌNH TỪ Ý TƯỞNG ĐẾN CHIẾN DỊCH TRIỆU LƯỢT XEM

**Bạn có biết?** 85% bài đăng thành công trên mạng xã hội bắt đầu từ một câu mở đầu chạm đúng cảm xúc người đọc trong **3 giây đầu tiên**.

1. Khởi đầu từ câu chuyện thật của khách hàng
2. Nhấn mạnh giá trị cốt lõi bằng ngôn từ ngắn gọn, súc tích
3. Kết bài bằng lời kêu gọi hành động rõ ràng và dễ thực hiện

*Cùng chia sẻ câu chuyện thương hiệu của bạn ngay dưới phần bình luận!*`,
  },
];

/**
 * Extracts a Google Docs document ID from a full URL or raw ID string.
 */
export function extractGoogleDocId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]{8,})/);
  if (urlMatch) return urlMatch[1];
  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }
  return null;
}

/**
 * Parses inline Markdown (`***bold+italic***`, `**bold**`, `*italic*`, `__underline__`, `~~strike~~`)
 * into styled DeltaOp segments with optional base attributes.
 */
function parseInlineMarkdownToOps(
  line: string,
  baseAttrs: RunAttrs = {},
): DeltaOp[] {
  const ops: DeltaOp[] = [];
  const tokenRegex =
    /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\n]+\*|_[^_\n]+_)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIdx) {
      const plain = line.slice(lastIdx, match.index);
      ops.push(
        Object.keys(baseAttrs).length > 0
          ? { insert: plain, attributes: { ...baseAttrs } }
          : { insert: plain },
      );
    }
    const token = match[0];
    if (token.startsWith("***") && token.endsWith("***")) {
      ops.push({
        insert: token.slice(3, -3),
        attributes: { ...baseAttrs, bold: true, italic: true },
      });
    } else if (token.startsWith("**") && token.endsWith("**")) {
      ops.push({
        insert: token.slice(2, -2),
        attributes: { ...baseAttrs, bold: true },
      });
    } else if (token.startsWith("__") && token.endsWith("__")) {
      ops.push({
        insert: token.slice(2, -2),
        attributes: { ...baseAttrs, underline: true },
      });
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      ops.push({
        insert: token.slice(2, -2),
        attributes: { ...baseAttrs, strikethrough: true },
      });
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      ops.push({
        insert: token.slice(1, -1),
        attributes: { ...baseAttrs, italic: true },
      });
    }
    lastIdx = match.index + token.length;
  }

  if (lastIdx < line.length) {
    const rest = line.slice(lastIdx);
    ops.push(
      Object.keys(baseAttrs).length > 0
        ? { insert: rest, attributes: { ...baseAttrs } }
        : { insert: rest },
    );
  }
  return ops;
}

/**
 * Converts HTML exported or copied from Google Docs / Microsoft Word into clean
 * Markdown-like text before converting to Yjs Delta operations.
 * Preserves Google Docs inline `<span style="font-weight:700;font-style:italic;...">`.
 */
function htmlToStructuredMarkdown(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(
      /<span\b[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/span>/gi,
      (_m, styleStr: string, inner: string) => {
        const s = styleStr.toLowerCase();
        const isBold = /font-weight\s*:\s*(700|800|900|bold|bolder)/.test(s);
        const isItalic = /font-style\s*:\s*italic/.test(s);
        const isUnderline = /text-decoration[^;"]*underline/.test(s);
        const isStrike = /text-decoration[^;"]*line-through/.test(s);
        let out = inner;
        if (isBold && isItalic) out = `***${out}***`;
        else if (isBold) out = `**${out}**`;
        else if (isItalic) out = `*${out}*`;
        if (isUnderline) out = `__${out}__`;
        if (isStrike) out = `~~${out}~~`;
        return out;
      },
    )
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<(strong|b)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<u(?:\s[^>]*)?>([\s\S]*?)<\/u>/gi, "__$1__")
    .replace(/<(s|strike|del)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi, "~~$2~~")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Converts imported document content (`.txt`, `.md`, `.html`, or Google Docs export)
 * into rich `DeltaOp[]` ready to be applied directly into `yDoc.getText("content")`.
 */
export function parseImportedDocumentToDelta(
  rawContent: string,
  format: "txt" | "md" | "html" = "md",
): DeltaOp[] {
  const normalizedRaw = rawContent.replace(/\r\n/g, "\n").trim();
  if (!normalizedRaw) return [];

  if (format === "txt") {
    return [{ insert: normalizedRaw.normalize("NFC") }];
  }

  const markdownSource =
    format === "html" || /<\/?[a-z][\s\S]*>/i.test(normalizedRaw)
      ? htmlToStructuredMarkdown(normalizedRaw)
      : normalizedRaw;

  const lines = markdownSource.split("\n");
  const ops: DeltaOp[] = [];
  let orderedCounter = 0;

  lines.forEach((rawLine, idx) => {
    if (idx > 0) {
      ops.push({ insert: "\n" });
    }
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      orderedCounter = 0;
      return;
    }

    if (line.startsWith("# ")) {
      orderedCounter = 0;
      ops.push(
        ...parseInlineMarkdownToOps(line.slice(2).trim(), {
          bold: true,
          size: 24,
        }),
      );
      return;
    }
    if (line.startsWith("## ")) {
      orderedCounter = 0;
      ops.push(
        ...parseInlineMarkdownToOps(line.slice(3).trim(), {
          bold: true,
          size: 20,
        }),
      );
      return;
    }
    if (line.startsWith("### ")) {
      orderedCounter = 0;
      ops.push(
        ...parseInlineMarkdownToOps(line.slice(4).trim(), {
          bold: true,
          size: 18,
        }),
      );
      return;
    }
    if (/^[-*•]\s+/.test(line)) {
      orderedCounter = 0;
      const itemBody = line.replace(/^[-*•]\s+/, "");
      ops.push({ insert: "• " });
      ops.push(...parseInlineMarkdownToOps(itemBody));
      return;
    }
    if (/^\d+\.\s+/.test(line)) {
      orderedCounter += 1;
      const itemBody = line.replace(/^\d+\.\s+/, "");
      ops.push({ insert: `${orderedCounter}. ` });
      ops.push(...parseInlineMarkdownToOps(itemBody));
      return;
    }

    orderedCounter = 0;
    ops.push(...parseInlineMarkdownToOps(line));
  });

  return ops;
}

/**
 * Extracts text & basic formatting from a `.docx` file ArrayBuffer in the browser.
 * Parses ZIP local file headers to locate `word/document.xml`, decompressing via
 * native `DecompressionStream("deflate-raw")` when needed, or falls back to UTF-8 text/XML.
 */
export async function extractTextFromDocxBuffer(
  buffer: ArrayBuffer,
): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const decoder = new TextDecoder("utf-8");

  const parseWordXml = (xml: string): string => {
    const paragraphs: string[] = [];
    const pRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
    let pMatch: RegExpExecArray | null;
    while ((pMatch = pRegex.exec(xml)) !== null) {
      const pXml = pMatch[1];
      const isHeading1 = /<w:pStyle\s+w:val="(?:Heading1|Title)"/i.test(pXml);
      const isHeading2 = /<w:pStyle\s+w:val="(?:Heading2|Subtitle)"/i.test(pXml);
      const isList = /<w:numPr\b/i.test(pXml);

      let lineText = "";
      const rRegex = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
      let rMatch: RegExpExecArray | null;
      while ((rMatch = rRegex.exec(pXml)) !== null) {
        const rXml = rMatch[1];
        const isBold = /<w:b(?:\s+w:val="(?!false|0)[^"]*")?\s*\/?>/i.test(rXml);
        const isItalic = /<w:i(?:\s+w:val="(?!false|0)[^"]*")?\s*\/?>/i.test(rXml);
        const isUnderline = /<w:u(?:\s+w:val="(?!none|false|0)[^"]*")?\s*\/?>/i.test(rXml);
        const isStrike = /<w:strike(?:\s+w:val="(?!false|0)[^"]*")?\s*\/?>/i.test(rXml);
        let runText = "";
        const tRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
        let tMatch: RegExpExecArray | null;
        while ((tMatch = tRegex.exec(rXml)) !== null) {
          runText += tMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
        }
        if (!runText) continue;
        let formatted = runText;
        if (isBold && isItalic) {
          formatted = `***${formatted}***`;
        } else if (isBold) {
          formatted = `**${formatted}**`;
        } else if (isItalic) {
          formatted = `*${formatted}*`;
        }
        if (isUnderline) {
          formatted = `__${formatted}__`;
        }
        if (isStrike) {
          formatted = `~~${formatted}~~`;
        }
        lineText += formatted;
      }

      if (!lineText.trim()) {
        paragraphs.push("");
        continue;
      }
      if (isHeading1) {
        paragraphs.push(`# ${lineText.replace(/\*\*/g, "")}`);
      } else if (isHeading2) {
        paragraphs.push(`## ${lineText.replace(/\*\*/g, "")}`);
      } else if (isList) {
        paragraphs.push(`- ${lineText}`);
      } else {
        paragraphs.push(lineText);
      }
    }
    return paragraphs.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  // Check if it's a ZIP archive (PK\x03\x04)
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    const view = new DataView(buffer);
    let offset = 0;
    while (offset + 30 <= bytes.length) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) break;
      const compression = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const fileNameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      const fileName = decoder.decode(
        bytes.subarray(offset + 30, offset + 30 + fileNameLen),
      );
      const dataStart = offset + 30 + fileNameLen + extraLen;
      const dataEnd = dataStart + compressedSize;

      if (fileName === "word/document.xml" && dataEnd <= bytes.length) {
        const slice = bytes.subarray(dataStart, dataEnd);
        if (compression === 0) {
          return parseWordXml(decoder.decode(slice));
        }
        if (compression === 8 && typeof DecompressionStream !== "undefined") {
          const ds = new DecompressionStream("deflate-raw");
          const writer = ds.writable.getWriter();
          void writer.write(slice);
          void writer.close();
          const decompressed = await new Response(ds.readable).arrayBuffer();
          return parseWordXml(decoder.decode(decompressed));
        }
      }
      if (compressedSize === 0) break;
      offset = dataEnd;
    }
  }

  // Fallback: direct XML or plain text
  const rawText = decoder.decode(bytes);
  if (rawText.includes("<w:p")) {
    return parseWordXml(rawText);
  }
  return rawText;
}

// ── Google Docs / Word Cursor Word-Boundary & Document Export Utilities ───

const WORD_CHAR_RE = /[^\s.,;!?()[\]{}"'“”‘’<>\\/|•]/;

/**
 * Finds the start index of the previous word from `index` (Google Docs / Word `Ctrl+ArrowLeft` / `Ctrl+Backspace`).
 */
export function findWordBoundaryLeft(text: string, index: number): number {
  let pos = Math.max(0, Math.min(text.length, index));
  if (pos === 0) return 0;
  // Skip whitespace/punctuation immediately to the left
  while (pos > 0 && !WORD_CHAR_RE.test(text[pos - 1])) {
    pos--;
  }
  // Skip word characters to reach the start of the word
  while (pos > 0 && WORD_CHAR_RE.test(text[pos - 1])) {
    pos--;
  }
  return pos;
}

/**
 * Finds the end index of the current/next word from `index` (Google Docs / Word `Ctrl+ArrowRight` / `Ctrl+Delete`).
 */
export function findWordBoundaryRight(text: string, index: number): number {
  let pos = Math.max(0, Math.min(text.length, index));
  if (pos >= text.length) return text.length;
  // Skip whitespace/punctuation immediately to the right
  while (pos < text.length && !WORD_CHAR_RE.test(text[pos])) {
    pos++;
  }
  // Advance to the end of the word
  while (pos < text.length && WORD_CHAR_RE.test(text[pos])) {
    pos++;
  }
  return pos;
}

/**
 * Exports rich `DeltaOp[]` back into structured Markdown (`.md`) preserving headings,
 * bold, italic, underline, strikethrough, and bullet/numbered lists.
 */
export function deltaToMarkdown(delta: DeltaOp[]): string {
  // Split ops into line-by-line segments
  interface Seg {
    text: string;
    attrs: RunAttrs;
  }
  const lines: Seg[][] = [[]];
  for (const op of delta) {
    if (typeof op.insert !== "string") continue;
    const attrs = op.attributes ?? {};
    const parts = op.insert.split("\n");
    parts.forEach((part, idx) => {
      if (idx > 0) lines.push([]);
      if (part.length > 0) {
        lines[lines.length - 1].push({ text: part, attrs });
      }
    });
  }

  return lines
    .map((lineSegs) => {
      if (lineSegs.length === 0) return "";
      const firstSize = lineSegs[0]?.attrs.size ?? 16;
      const isHeading1 = firstSize >= 24;
      const isHeading2 = firstSize >= 20 && firstSize < 24;
      const isHeading3 = firstSize >= 18 && firstSize < 20 && !!lineSegs[0]?.attrs.bold;

      const body = lineSegs
        .map(({ text, attrs }) => {
          if (!text) return "";
          if (isHeading1 || isHeading2 || isHeading3) return text;
          let out = text;
          // Keep leading bullet/number prefix outside inline markers
          const listMatch = out.match(/^(\s*(?:•|\d+\.)\s+)(.*)$/);
          const prefix = listMatch ? listMatch[1] : "";
          out = listMatch ? listMatch[2] : out;
          if (!out) return prefix;

          if (attrs.bold && attrs.italic) out = `***${out}***`;
          else if (attrs.bold) out = `**${out}**`;
          else if (attrs.italic) out = `*${out}*`;
          if (attrs.underline) out = `__${out}__`;
          if (attrs.strikethrough) out = `~~${out}~~`;
          return prefix + out;
        })
        .join("")
        .replace(/^•\s+/, "- ");

      if (isHeading1) return `# ${body}`;
      if (isHeading2) return `## ${body}`;
      if (isHeading3) return `### ${body}`;
      return body;
    })
    .join("\n");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Exports rich `DeltaOp[]` into a valid OpenXML `.docx` ZIP archive (`PK\x03\x04`)
 * containing `word/document.xml` so it can be opened in Microsoft Word or Google Docs
 * AND re-imported losslessly via `extractTextFromDocxBuffer`.
 */
export function deltaToDocxZip(delta: DeltaOp[]): Uint8Array {
  interface Seg {
    text: string;
    attrs: RunAttrs;
  }
  const lines: Seg[][] = [[]];
  for (const op of delta) {
    if (typeof op.insert !== "string") continue;
    const attrs = op.attributes ?? {};
    const parts = op.insert.split("\n");
    parts.forEach((part, idx) => {
      if (idx > 0) lines.push([]);
      if (part.length > 0) {
        lines[lines.length - 1].push({ text: part, attrs });
      }
    });
  }

  const pXmlList = lines.map((lineSegs) => {
    if (lineSegs.length === 0) return "<w:p/>";
    const fullLineText = lineSegs.map((s) => s.text).join("");
    const firstSize = lineSegs[0]?.attrs.size ?? 16;
    const isHeading1 = firstSize >= 24;
    const isHeading2 = firstSize >= 20 && firstSize < 24;
    const isBullet = /^\s*•\s+/.test(fullLineText);

    let pPr = "";
    if (isHeading1) pPr = '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>';
    else if (isHeading2) pPr = '<w:pPr><w:pStyle w:val="Heading2"/></w:pPr>';
    else if (isBullet) pPr = "<w:pPr><w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr></w:pPr>";

    let strippedBullet = false;
    const runsXml = lineSegs
      .map(({ text, attrs }) => {
        let clean = text;
        if (isBullet && !strippedBullet) {
          clean = clean.replace(/^\s*•\s+/, "");
          strippedBullet = true;
        }
        if (!clean) return "";
        const rPrParts: string[] = [];
        if (attrs.bold && !isHeading1 && !isHeading2) rPrParts.push("<w:b/>");
        if (attrs.italic) rPrParts.push("<w:i/>");
        if (attrs.underline) rPrParts.push('<w:u w:val="single"/>');
        if (attrs.strikethrough) rPrParts.push("<w:strike/>");
        const rPr = rPrParts.length > 0 ? `<w:rPr>${rPrParts.join("")}</w:rPr>` : "";
        return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(clean)}</w:t></w:r>`;
      })
      .join("");

    return `<w:p>${pPr}${runsXml}</w:p>`;
  });

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${pXmlList.join("\n    ")}
  </w:body>
</w:document>`;

  const encoder = new TextEncoder();
  const fileNameBytes = encoder.encode("word/document.xml");
  const dataBytes = encoder.encode(documentXml);

  // Build standard ZIP container with stored entry (compression = 0)
  const localHeaderLen = 30 + fileNameBytes.length;
  const centralHeaderLen = 46 + fileNameBytes.length;
  const eocdLen = 22;
  const totalLen = localHeaderLen + dataBytes.length + centralHeaderLen + eocdLen;
  const out = new Uint8Array(totalLen);
  const view = new DataView(out.buffer);

  // Local file header
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(8, 0, true); // stored
  view.setUint32(18, dataBytes.length, true);
  view.setUint32(22, dataBytes.length, true);
  view.setUint16(26, fileNameBytes.length, true);
  out.set(fileNameBytes, 30);
  out.set(dataBytes, localHeaderLen);

  // Central directory header
  const cdOffset = localHeaderLen + dataBytes.length;
  view.setUint32(cdOffset, 0x02014b50, true);
  view.setUint16(cdOffset + 4, 20, true);
  view.setUint16(cdOffset + 6, 20, true);
  view.setUint32(cdOffset + 20, dataBytes.length, true);
  view.setUint32(cdOffset + 24, dataBytes.length, true);
  view.setUint16(cdOffset + 28, fileNameBytes.length, true);
  view.setUint32(cdOffset + 42, 0, true);
  out.set(fileNameBytes, cdOffset + 46);

  // End of central directory
  const eocdOffset = cdOffset + centralHeaderLen;
  view.setUint32(eocdOffset, 0x06054b50, true);
  view.setUint16(eocdOffset + 8, 1, true);
  view.setUint16(eocdOffset + 10, 1, true);
  view.setUint32(eocdOffset + 12, centralHeaderLen, true);
  view.setUint32(eocdOffset + 16, cdOffset, true);

  return out;
}

/**
 * Copies text to clipboard using `navigator.clipboard.writeText` with a
 * synchronous `<textarea>` + `document.execCommand("copy")` fallback so
 * copying works in all browser contexts.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to execCommand fallback
  }
  try {
    if (typeof document === "undefined") return false;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
