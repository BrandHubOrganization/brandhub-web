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

export function mentionTrigger(content: string, caret: number) {
  const match = /(?:^|\s)@([^@\n]{0,60})$/.exec(content.slice(0, caret));
  return match
    ? { start: caret - match[1].length - 1, end: caret, query: match[1] }
    : null;
}
