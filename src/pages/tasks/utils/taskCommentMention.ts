export const MAX_COMMENT_LENGTH = 10000;

export interface MentionQuery {
  start: number;
  end: number;
  search: string;
}

export function getMentionQuery(
  content: string,
  selection: { start: number; end: number },
): MentionQuery | null {
  if (
    selection.start !== selection.end ||
    selection.start < 0 ||
    selection.end > content.length
  )
    return null;
  const match = content
    .slice(0, selection.start)
    .match(/(?:^|\s)@([\p{L}\p{M}\p{N}_.-]*)$/u);
  if (!match) return null;
  const tail =
    content.slice(selection.end).match(/^[\p{L}\p{M}\p{N}_.-]*/u)?.[0] || "";
  return {
    start: selection.start - match[1].length - 1,
    end: selection.end + tail.length,
    search: match[1],
  };
}

export function replaceMention(
  content: string,
  query: MentionQuery,
  displayName: string,
) {
  const suffix = content.slice(query.end);
  const separator = /^[\s,.!?;:)\]}]/u.test(suffix) ? "" : " ";
  const mention = `@${displayName}${separator}`;
  const next = content.slice(0, query.start) + mention + suffix;
  if (next.length > MAX_COMMENT_LENGTH) return null;
  return {
    content: next,
    caret: query.start + mention.length + (suffix.startsWith(" ") ? 1 : 0),
  };
}
