import { useEffect, useId, useRef, useState } from "react";
import { useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { canIndentChatList } from "@/pages/chat/utils/chatListActions";
import { useTranslation } from "react-i18next";
import {
  ChatMentionNode,
  richPlainText,
  richMentionIds,
  safeChatLink,
  isChatRichDocument,
} from "@/pages/chat/utils/chatRichContent";
import type { ChatRichNode } from "@/pages/chat/types/chatRichContent";
import type { ChatDirectoryMember } from "@/types/chatCollaboration";
import type {
  ChatRichComposerProps,
  ChatComposerSuggestion as Suggestion,
} from "@/pages/chat/types/chatComposer";

export function useChatRichEditor(props: ChatRichComposerProps) {
  const { t } = useTranslation();
  const [formatting, setFormatting] = useState(true);
  const [length, setLength] = useState(0);
  const [valid, setValid] = useState(true);
  const [hasText, setHasText] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLElement>(null);
  const listId = useId();
  const hintId = useId();
  const handlers = useRef<{
    send: () => void;
    key: (event: KeyboardEvent) => boolean;
  }>({ send: () => {}, key: () => false });
  const dismissedAt = useRef<number | null>(null);
  const matches = props.people
    .filter((person) =>
      person.displayName
        .toLocaleLowerCase()
        .includes(suggestion?.query.toLocaleLowerCase() ?? ""),
    )
    .slice(0, 20);

  const update = (editor: Editor) => {
    const document = editor.getJSON() as ChatRichNode;
    setLength(richPlainText(document).length);
    setHasText(Boolean(richPlainText(document).trim()));
    setValid(
      isChatRichDocument(document) && richMentionIds(document).length <= 20,
    );
    const { selection } = editor.state;
    if (
      !selection.empty ||
      dismissedAt.current === selection.from ||
      editor.isActive("codeBlock") ||
      editor.isActive("code")
    ) {
      setSuggestion(null);
      return;
    }
    const before = selection.$from.parent.textBetween(
      0,
      selection.$from.parentOffset,
      "\n",
      "\uFFFC",
    );
    const match = /(?:^|\s)@([^@\n\uFFFC]{0,60})$/.exec(before);
    if (!match) {
      setSuggestion(null);
      return;
    }
    const query = match[1];
    if (
      /\s/.test(query) &&
      !props.people.some((person) =>
        person.displayName
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
      )
    ) {
      setSuggestion(null);
      return;
    }
    const bounds = box.current?.getBoundingClientRect();
    const caret = editor.view.coordsAtPos(selection.from);
    setSuggestion({
      from: selection.from - query.length - 1,
      to: selection.from,
      query,
      left: Math.max(
        0,
        Math.min(
          caret.left - (bounds?.left ?? 0),
          (bounds?.width ?? 320) - 320,
        ),
      ),
      bottom: Math.max(0, (bounds?.bottom ?? caret.top) - caret.top + 8),
    });
    setActive(0);
  };
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          protocols: ["http", "https"],
          isAllowedUri: (url) => safeChatLink(url),
        },
      }),
      ChatMentionNode,
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": t("chat.composer.ariaLabel"),
        "aria-multiline": "true",
        "aria-describedby": hintId,
        "data-chat-rich-lists": "true",
        class:
          "min-h-20 max-h-48 overflow-y-auto px-3 py-3 text-base sm:text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-orange/30 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_code]:font-mono [&_a]:text-brand-orange [&_a]:underline [&_p]:min-h-6 [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child]:before:text-muted-foreground [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:pointer-events-none",
      },
      handleKeyDown: (_view, event) => handlers.current.key(event),
    },
    onUpdate: ({ editor: current }) => {
      dismissedAt.current = null;
      update(current);
    },
    onSelectionUpdate: ({ editor: current }) => update(current),
  });
  const keyboardHintKey =
    useEditorState({
      editor,
      selector: ({ editor: current }) =>
        current?.isActive("listItem")
          ? "chat.rich.listKeyboardHint"
          : current?.isActive("codeBlock")
            ? "chat.rich.codeKeyboardHint"
            : "chat.ui.keyboardHint",
    }) ?? "chat.ui.keyboardHint";

  const mention = (person: ChatDirectoryMember) => {
    if (!editor || !suggestion) return;
    const ids = richMentionIds(editor.getJSON() as ChatRichNode);
    if (!ids.includes(person.userId) && ids.length >= 20) return;
    editor
      .chain()
      .focus()
      .insertContentAt({ from: suggestion.from, to: suggestion.to }, [
        {
          type: "mention",
          attrs: { id: person.userId, label: person.displayName },
        },
        { type: "text", text: " " },
      ])
      .run();
    setSuggestion(null);
  };
  const send = () => {
    if (!editor || !props.canPost) return;
    const richContent = editor.getJSON() as ChatRichNode;
    const content = richPlainText(richContent).trim();
    if (
      !content ||
      content.length > 4000 ||
      richMentionIds(richContent).length > 20 ||
      !isChatRichDocument(richContent)
    )
      return;
    if (
      props.onSend({
        clientMessageId: crypto.randomUUID(),
        content,
        richContent,
        contextType: props.contextType,
        contextId: props.contextId,
        threadRootId: props.threadRootId ?? null,
        mentionUserIds: richMentionIds(richContent),
      })
    ) {
      editor.commands.clearContent();
      editor.commands.focus();
      setSuggestion(null);
    }
  };
  useEffect(() => {
    editor?.setEditable(props.canPost);
  }, [editor, props.canPost]);
  useEffect(() => {
    if (!editor) return;
    const input = editor.view.dom;
    input.setAttribute("aria-autocomplete", "list");
    if (suggestion) {
      input.setAttribute("aria-controls", listId);
      input.setAttribute("aria-activedescendant", `${listId}-${active}`);
      document
        .getElementById(`${listId}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-controls");
      input.removeAttribute("aria-activedescendant");
    }
  }, [editor, suggestion, listId, active]);
  useEffect(() => {
    handlers.current = {
      send,
      key: (event) => {
        if (event.isComposing || event.keyCode === 229) return false;
        if (event.key === "Tab" && editor?.isActive("listItem")) {
          event.preventDefault();
          if (event.shiftKey) editor.commands.liftListItem("listItem");
          else if (canIndentChatList(editor))
            editor.commands.sinkListItem("listItem");
          return true;
        }
        if (suggestion && event.key === "Escape") {
          dismissedAt.current = editor?.state.selection.from ?? null;
          setSuggestion(null);
          return true;
        }
        if (
          suggestion &&
          matches.length &&
          ["ArrowDown", "ArrowUp"].includes(event.key)
        ) {
          setActive(
            (index) =>
              (index + (event.key === "ArrowDown" ? 1 : -1) + matches.length) %
              matches.length,
          );
          return true;
        }
        if (suggestion && event.key === "Enter" && !event.shiftKey) {
          if (matches[active]) mention(matches[active]);
          return true;
        }
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          send();
          return true;
        }
        if (event.key === "Enter" && event.shiftKey && editor) {
          if (editor.isActive("listItem")) {
            event.preventDefault();
            editor.commands.first(({ commands }) => [
              () => commands.splitListItem("listItem"),
              () => commands.liftListItem("listItem"),
            ]);
            return true;
          }
          if (editor.isActive("codeBlock")) {
            event.preventDefault();
            editor.commands.newlineInCode();
            return true;
          }
        }
        return false;
      },
    };
  });
  const closeMention = () => {
    dismissedAt.current = editor?.state.selection.from ?? null;
    setSuggestion(null);
    editor?.commands.focus();
  };
  return {
    t,
    editor,
    formatting,
    setFormatting,
    length,
    valid,
    hasText,
    suggestion,
    closeMention,
    active,
    box,
    listId,
    hintId,
    keyboardHintKey,
    matches,
    mention,
    send,
  };
}
