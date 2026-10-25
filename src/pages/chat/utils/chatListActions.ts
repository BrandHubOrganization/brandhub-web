import type { Editor } from "@tiptap/react";

export function canIndentChatList(editor: Editor): boolean {
  const { $from } = editor.state.selection;
  let levels = 0;
  for (let depth = 1; depth <= $from.depth; depth++) {
    if ($from.node(depth).type.name === "listItem") levels++;
  }
  return levels < 5 && editor.can().sinkListItem("listItem");
}
