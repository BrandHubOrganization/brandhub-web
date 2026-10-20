import { useEffect } from "react";
import { useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  TaskCommentInputGuard,
  TaskCommentMentionNode,
} from "@/pages/tasks/components/TaskCommentMentionNode";
import {
  commentValue,
  plainCommentDocument,
} from "@/pages/tasks/utils/taskCommentRichText";
import type { CommentMember } from "@/pages/tasks/types/taskComment";

const COMMENT_EXTENSIONS = [
  StarterKit.configure({
    blockquote: false,
    bold: false,
    bulletList: false,
    code: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    italic: false,
    listItem: false,
    listKeymap: false,
    link: false,
    orderedList: false,
    strike: false,
    underline: false,
    trailingNode: false,
    dropcursor: false,
    gapcursor: false,
  }),
  TaskCommentMentionNode,
  TaskCommentInputGuard,
];
interface Options {
  value: string;
  disabled: boolean;
  labelId: string;
  helpId: string;
  expanded: boolean;
  listId: string;
  activeId?: string;
  invalid: boolean;
  onChange: (content: string, mentions: CommentMember[]) => void;
  onContext: (editor: Editor | null, changed: boolean) => void;
  onKeyDown: (event: KeyboardEvent) => boolean;
}
export function useTaskCommentRichEditor(options: Options) {
  const editor = useEditor({
    extensions: COMMENT_EXTENSIONS,
    content: plainCommentDocument(options.value),
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: !options.disabled,
    editorProps: {
      attributes: {
        role: "combobox",
        "aria-multiline": "true",
        "aria-autocomplete": "list",
        "aria-haspopup": "listbox",
        "aria-labelledby": options.labelId,
        "aria-describedby": options.helpId,
        "aria-expanded": String(options.expanded),
        "aria-invalid": String(options.invalid),
        "aria-disabled": String(options.disabled),
        "aria-controls": options.expanded ? options.listId : "",
        "aria-activedescendant": options.activeId || "",
        class:
          "min-h-20 max-h-56 overflow-y-auto px-3 py-2 text-base md:text-sm outline-none whitespace-pre-wrap break-words [&_p]:m-0 [&_p]:min-h-6 [&_p]:leading-6",
      },
      handleKeyDown: (_view, event) => options.onKeyDown(event),
    },
    onUpdate: ({ editor: current }) => {
      const value = commentValue(current.getJSON());
      options.onChange(value.content, value.mentions);
      options.onContext(current, true);
    },
    onSelectionUpdate: ({ editor: current }) =>
      options.onContext(current, false),
    onFocus: ({ editor: current }) => options.onContext(current, false),
    onBlur: () => options.onContext(null, false),
  });
  useEffect(() => {
    if (editor) editor.setEditable(!options.disabled, false);
  }, [editor, options.disabled]);
  useEffect(() => {
    if (!editor || commentValue(editor.getJSON()).content === options.value)
      return;
    editor.commands.setContent(plainCommentDocument(options.value), {
      emitUpdate: false,
    });
  }, [editor, options.value]);
  return editor;
}
