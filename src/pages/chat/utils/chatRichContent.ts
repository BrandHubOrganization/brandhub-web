import { Node } from "@tiptap/react";
import type { ChatRichNode } from "@/pages/chat/types/chatRichContent";

const BLOCKS = new Set([
  "doc",
  "blockquote",
  "bulletList",
  "orderedList",
  "listItem",
]);

export function isChatRichDocument(value: unknown): value is ChatRichNode {
  let count = 0;
  const walk = (item: unknown, depth: number): boolean => {
    if (!item || typeof item !== "object" || depth > 12 || ++count > 500)
      return false;
    const node = item as Record<string, unknown>;
    if (
      typeof node.type !== "string" ||
      ![
        ...BLOCKS,
        "paragraph",
        "codeBlock",
        "text",
        "hardBreak",
        "mention",
      ].includes(node.type)
    )
      return false;
    if (node.text !== undefined && typeof node.text !== "string") return false;
    if (
      node.attrs !== undefined &&
      (!node.attrs ||
        typeof node.attrs !== "object" ||
        Array.isArray(node.attrs))
    )
      return false;
    if (
      node.marks !== undefined &&
      (!Array.isArray(node.marks) ||
        node.marks.length > 6 ||
        !node.marks.every((mark: unknown) => {
          if (
            !mark ||
            typeof mark !== "object" ||
            !("type" in mark) ||
            typeof mark.type !== "string"
          )
            return false;
          return [
            "bold",
            "italic",
            "underline",
            "strike",
            "code",
            "link",
          ].includes(mark.type);
        }))
    )
      return false;
    return (
      node.content === undefined ||
      (Array.isArray(node.content) &&
        node.content.every((child) => walk(child, depth + 1)))
    );
  };
  return (
    walk(value, 0) &&
    (value as ChatRichNode).type === "doc" &&
    new TextEncoder().encode(JSON.stringify(value)).length <= 32768
  );
}

export function richPlainText(node: ChatRichNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  if (node.type === "mention") return `@${String(node.attrs?.label ?? "")}`;
  return (node.content ?? [])
    .map(richPlainText)
    .join(BLOCKS.has(node.type) ? "\n" : "");
}

export function richMentionIds(node: ChatRichNode): string[] {
  if (node.type === "mention") return [String(node.attrs?.id ?? "")];
  return [...new Set((node.content ?? []).flatMap(richMentionIds))];
}

export function safeChatLink(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      value.length <= 2048 &&
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export const ChatMentionNode = Node.create({
  name: "mention",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return { id: { default: null }, label: { default: "" } };
  },
  // External pasted HTML must not forge recipient identities.
  parseHTML() {
    return [];
  },
  renderHTML({ node }) {
    return [
      "span",
      {
        "data-chat-mention": "true",
        class: "rounded bg-brand-orange-soft px-1 text-brand-orange",
      },
      `@${node.attrs.label}`,
    ];
  },
  renderText({ node }) {
    return `@${node.attrs.label}`;
  },
});
