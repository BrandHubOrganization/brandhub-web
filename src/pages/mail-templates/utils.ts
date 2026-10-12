import type { Recipient } from "./types";

/** Supplied by the system when sending; never asked from the user. */
export const BUILT_IN_VARIABLES = ["workspaceName", "senderName"];
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
 * or a plain list of emails separated by new lines, commas, semicolons or spaces.
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
  for (const token of text.split(/[\s,;]+/)) {
    const email = token.trim();
    if (!email) continue;
    if (isEmail(email)) recipients.push({ email });
    else invalid.push(email);
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
