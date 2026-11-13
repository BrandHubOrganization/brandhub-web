export interface DiffLine {
  type: "same" | "add" | "del";
  text: string;
}

/**
 * Line diff by longest common subsequence.
 * ponytail: O(n·m) table, fine for section text; switch to Myers if sections reach thousands of lines.
 */
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before ? before.split("\n") : [];
  const b = after ? after.split("\n") : [];
  const lcs = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) out.push({ type: "del", text: a[i++] });
    else out.push({ type: "add", text: b[j++] });
  }
  while (i < a.length) out.push({ type: "del", text: a[i++] });
  while (j < b.length) out.push({ type: "add", text: b[j++] });
  return out;
}

/** One field value as diffable text: list items one per line, objects as "a · b · c". */
export function fieldText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(fieldText).join("\n");
  if (typeof value === "object")
    return Object.values(value as Record<string, unknown>)
      .filter((v) => v != null && v !== "")
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join(" · ");
  return String(value);
}
