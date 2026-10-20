import type { Editor, JSONContent } from "@tiptap/react";
import type { CommentMember } from "@/pages/tasks/types/taskComment";
import { getMentionQuery } from "@/pages/tasks/utils/taskCommentMention";

export const COMMENT_MENTION_NODE = "taskCommentMention";
export function commentText(node: JSONContent): string {
  if (node.type === "text") return node.text || "";
  if (node.type === COMMENT_MENTION_NODE)
    return `@${node.attrs?.displayName || ""}`;
  if (node.type === "hardBreak") return "\n";
  return (node.content || [])
    .map(commentText)
    .join(node.type === "doc" ? "\n" : "");
}
export function commentValue(document: JSONContent) {
  const people = new Map<string, CommentMember>();
  function visit(node: JSONContent) {
    if (
      node.type === COMMENT_MENTION_NODE &&
      typeof node.attrs?.userId === "string"
    ) {
      people.set(node.attrs.userId, {
        userId: node.attrs.userId,
        displayName: String(node.attrs.displayName || ""),
        role: String(node.attrs.role || ""),
      });
    }
    node.content?.forEach(visit);
  }
  visit(document);
  return { content: commentText(document), mentions: [...people.values()] };
}
export function plainCommentDocument(value: string): JSONContent {
  return {
    type: "doc",
    content: value.split("\n").map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}
export function richMentionQuery(editor: Editor) {
  const { $from, empty } = editor.state.selection;
  if (!empty || !editor.isFocused || !$from.parent.isTextblock) return null;
  const text = $from.parent.textBetween(
    0,
    $from.parent.content.size,
    "\n",
    (node) => (node.type.name === "hardBreak" ? "\n" : "\ufffc"),
  );
  const query = getMentionQuery(text, {
    start: $from.parentOffset,
    end: $from.parentOffset,
  });
  return query
    ? {
        ...query,
        start: query.start + $from.start(),
        end: query.end + $from.start(),
      }
    : null;
}
