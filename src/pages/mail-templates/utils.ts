import type { Recipient } from "./types";

/** Supplied by the system when sending; never asked from the user. */
export const BUILT_IN_VARIABLES = ["workspaceName", "senderName", "ctaSiteUrl", "ctaCampaignUrl", "ctaClientUrl"];
export const MAX_RECIPIENTS = 200;
const VARIABLE = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export function isEmail(value: string): boolean {
  return value.length <= 255 && EMAIL.test(value.trim());
}

/** Distinct variable names of the given texts, in order of first appearance. */
export function extractVariables(...texts: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  for (const text of texts) {
    if (!text) continue;
    for (const match of text.matchAll(VARIABLE)) seen.add(match[1]);
  }
  return [...seen];
}

/** Variables the user has to provide (everything except the built-ins). */
export function userVariables(...texts: (string | null | undefined)[]): string[] {
  return extractVariables(...texts).filter((v) => !BUILT_IN_VARIABLES.includes(v));
}

function detectDelimiter(firstLine: string): string {
  const counts: [string, number][] = [
    [",", (firstLine.match(/,/g) ?? []).length],
    [";", (firstLine.match(/;/g) ?? []).length],
    ["\t", (firstLine.match(/\t/g) ?? []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

/** Small RFC 4180 style parser: BOM, quoted cells with "" escapes, CRLF, comma/semicolon/tab. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(text.split(/\r?\n/, 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += c;
      }
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === delimiter) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows
    .map((r) => r.map((v) => v.trim()))
    .filter((r) => r.some((v) => v !== ""));
}

export interface ParsedRecipients {
  recipients: Recipient[];
  /** Cells that look like emails but are not valid (kept so the UI can warn). */
  invalid: string[];
}

/**
 * Accepts either a CSV with an "email" header (extra columns become variables, "name" is the display name)
 * or a plain list: one entry per line, either "email, name" or emails separated by commas, semicolons or spaces.
 */
export function parseRecipients(text: string): ParsedRecipients {
  const rows = parseCsv(text);
  if (rows.length === 0) return { recipients: [], invalid: [] };
  const header = rows[0].map((h) => h.toLowerCase());
  const emailIndex = header.indexOf("email");
  const recipients: Recipient[] = [];
  const invalid: string[] = [];
  if (emailIndex >= 0) {
    const nameIndex = header.indexOf("name");
    for (const row of rows.slice(1)) {
      const email = (row[emailIndex] ?? "").trim();
      if (!email) continue;
      if (!isEmail(email)) {
        invalid.push(email);
        continue;
      }
      const variables: Record<string, string> = {};
      rows[0].forEach((column, i) => {
        const key = column.trim();
        if (i === emailIndex || i === nameIndex || key === "") return;
        if (row[i] !== undefined && row[i] !== "") variables[key] = row[i];
      });
      const name = nameIndex >= 0 ? (row[nameIndex] ?? "").trim() : "";
      recipients.push({
        email,
        ...(name ? { name } : {}),
        ...(Object.keys(variables).length ? { variables } : {}),
      });
    }
    return { recipients, invalid };
  }
  // No header row: one entry per line. A line with commas, semicolons or tabs is "email, name" (or several emails);
  // a line without them may list emails separated by spaces.
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (/[,;\t]/.test(line)) {
      let last: Recipient | null = null;
      for (const cell of line.split(/[,;\t]+/)) {
        const value = cell.trim();
        if (!value) continue;
        if (isEmail(value)) {
          last = { email: value };
          recipients.push(last);
        } else if (last && !last.name) {
          last.name = value;
        } else {
          invalid.push(value);
        }
      }
      continue;
    }
    for (const token of line.split(/\s+/)) {
      const email = token.trim();
      if (!email) continue;
      if (isEmail(email)) recipients.push({ email });
      else invalid.push(email);
    }
  }
  return { recipients, invalid };
}

/** Plain-text version of an HTML body (used when copying a template into the plain-text Broadcast form). */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const KNOWN_VARIABLES = ["name", "workspaceName", "senderName", "clientName", "company", "campaign"];
const SAMPLE_VALUES: Record<string, string> = {
  name: "An",
  workspaceName: "Your Workspace",
  senderName: "You",
  ctaSiteUrl: "#",
  ctaCampaignUrl: "#",
  ctaClientUrl: "#",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Local preview of an email body: sample values are HTML-escaped, unknown variables show as a highlighted
 * [name] placeholder. Shown inside a sandboxed iframe only; the server still sanitises on save.
 */
export function renderPreviewHtml(bodyHtml: string, values: Record<string, string> = {}): string {
  const all = { ...SAMPLE_VALUES, ...values };
  const body = bodyHtml.replace(VARIABLE, (_m, name: string) =>
    name in all
      ? escapeHtml(all[name])
      : `<mark style="background:#fde68a;color:#78350f;padding:0 2px;border-radius:2px">[${escapeHtml(name)}]</mark>`,
  );
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1f2937;' +
    "margin:0;padding:16px;word-wrap:break-word}img{max-width:100%;height:auto}a{color:#ea580c}</style>" +
    `</head><body>${body}</body></html>`
  );
}

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

export interface VariableAnalysis {
  used: string[];
  /** Variables that look like a typo of a well-known one (soft hint, never blocks saving). */
  suggestions: { name: string; suggestion: string }[];
  /** Text contains "{{" / "}}" or "{name}" that is not a valid {{variable}}. */
  malformed: boolean;
}

export function analyzeVariables(subject: string, bodyHtml: string): VariableAnalysis {
  const used = extractVariables(subject, bodyHtml);
  const suggestions: { name: string; suggestion: string }[] = [];
  for (const name of used) {
    if (KNOWN_VARIABLES.includes(name)) continue;
    const lower = name.toLowerCase();
    const near = KNOWN_VARIABLES.find(
      (k) => k.toLowerCase() === lower || (name.length >= 3 && levenshtein(lower, k.toLowerCase()) <= 2),
    );
    if (near) suggestions.push({ name, suggestion: near });
  }
  const stripped = `${subject}\n${bodyHtml.replace(/<[^>]+>/g, "")}`.replace(VARIABLE, "");
  const malformed = /\{\{|\}\}/.test(stripped) || /\{[A-Za-z0-9_ ]+\}/.test(stripped);
  return { used, suggestions, malformed };
}

/** Adds recipients that are not yet present (case-insensitive email), keeping the first occurrence. */
export function mergeRecipients(base: Recipient[], extra: Recipient[]): Recipient[] {
  const seen = new Set(base.map((r) => r.email.toLowerCase()));
  const merged = [...base];
  for (const r of extra) {
    const key = r.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }
  return merged;
}
