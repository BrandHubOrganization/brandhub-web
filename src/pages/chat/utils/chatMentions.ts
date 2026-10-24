export interface ChatMentionRange {
  start: number;
  end: number;
  userId: string;
}

export function editMentionRanges(
  previous: string,
  next: string,
  ranges: ChatMentionRange[],
) {
  let start = 0;
  while (
    start < previous.length &&
    start < next.length &&
    previous[start] === next[start]
  )
    start++;
  let oldEnd = previous.length;
  let newEnd = next.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    previous[oldEnd - 1] === next[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }
  const delta = newEnd - oldEnd;
  return ranges.flatMap((range) => {
    if (range.end <= start) return [range];
    if (range.start >= oldEnd)
      return [{ ...range, start: range.start + delta, end: range.end + delta }];
    return [];
  });
}

export function mentionTrigger(
  content: string,
  caret: number,
  ranges: ChatMentionRange[] = [],
) {
  const slice = content.slice(0, caret);
  for (let i = slice.length - 1; i >= 0; i--) {
    const ch = slice[i];
    if (ch === "\n" || slice.length - 1 - i > 60) return null;
    if (ch === "@") {
      if (i > 0 && !/\s/.test(slice[i - 1])) return null;
      const locked = ranges.some(
        (r) => (i >= r.start && i < r.end) || (r.start >= i && r.end <= caret),
      );
      if (locked) return null;
      return { start: i, end: caret, query: slice.slice(i + 1) };
    }
  }
  return null;
}

export function removeUserMentions(
  content: string,
  ranges: ChatMentionRange[],
  userId: string,
): { content: string; ranges: ChatMentionRange[] } {
  const toRemove = ranges
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.start - a.start);
  let nextContent = content;
  let nextRanges = ranges.filter((r) => r.userId !== userId);
  for (const target of toRemove) {
    const cutStart = Math.max(0, Math.min(target.start, nextContent.length));
    const baseEnd = Math.max(
      cutStart,
      Math.min(target.end, nextContent.length),
    );
    const cutEnd = nextContent[baseEnd] === " " ? baseEnd + 1 : baseEnd;
    const removedLen = cutEnd - cutStart;
    if (removedLen > 0) {
      nextContent = nextContent.slice(0, cutStart) + nextContent.slice(cutEnd);
      nextRanges = nextRanges.map((r) =>
        r.start >= cutEnd
          ? { ...r, start: r.start - removedLen, end: r.end - removedLen }
          : r,
      );
    }
  }
  return { content: nextContent, ranges: nextRanges };
}
