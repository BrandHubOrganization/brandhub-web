import { Extension, Node } from "@tiptap/react";
import { Plugin } from "@tiptap/pm/state";
import { closeHistory } from "@tiptap/pm/history";
import {
  COMMENT_MENTION_NODE,
  commentValue,
} from "@/pages/tasks/utils/taskCommentRichText";
import { MAX_COMMENT_LENGTH } from "@/pages/tasks/utils/taskCommentMention";

export const TaskCommentMentionNode = Node.create({
  name: COMMENT_MENTION_NODE,
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      userId: { default: "" },
      displayName: { default: "" },
      role: { default: "" },
    };
  },
  parseHTML() {
    return [];
  },
  renderHTML({ node }) {
    return [
      "span",
      {
        "data-task-mention": node.attrs.userId,
        contenteditable: "false",
        class:
          "bg-accent text-accent-foreground rounded-md px-1 py-0.5 font-medium box-decoration-clone",
      },
      `@${node.attrs.displayName}`,
    ];
  },
  renderText({ node }) {
    return `@${node.attrs.displayName}`;
  },
  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { empty, $from, from } = this.editor.state.selection;
        if (!empty || $from.nodeBefore?.type.name !== COMMENT_MENTION_NODE)
          return false;
        this.editor.view.dispatch(
          closeHistory(this.editor.state.tr).delete(from - 1, from),
        );
        return true;
      },
      Delete: () => {
        const { empty, $from, from } = this.editor.state.selection;
        if (!empty || $from.nodeAfter?.type.name !== COMMENT_MENTION_NODE)
          return false;
        this.editor.view.dispatch(
          closeHistory(this.editor.state.tr).delete(from, from + 1),
        );
        return true;
      },
    };
  },
});
export const TaskCommentInputGuard = Extension.create({
  name: "taskCommentInputGuard",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction(transaction) {
          if (!transaction.docChanged) return true;
          const value = commentValue(transaction.doc.toJSON());
          return (
            value.content.length <= MAX_COMMENT_LENGTH &&
            value.mentions.length <= 100
          );
        },
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain");
            if (text === undefined) return false;
            event.preventDefault();
            view.dispatch(view.state.tr.insertText(text));
            return true;
          },
          handleDrop: () => true,
        },
      }),
    ];
  },
});
