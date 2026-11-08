import { useEffect, type FocusEventHandler } from "react";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslation } from "react-i18next";
import { ChatComposerToolbar } from "@/pages/chat/components/ChatComposerToolbar";
import { safeChatLink } from "@/pages/chat/utils/chatRichContent";
import { canIndentChatList } from "@/pages/chat/utils/chatListActions";
import { cn } from "@/lib/utils";

function strategyContent(value: string) {
  if (/^\s*<(p|ul|ol|blockquote|pre)(\s|>)/i.test(value)) return value;
  return {
    type: "doc",
    content: value.split(/\r?\n/).map((text) => ({
      type: "paragraph",
      ...(text ? { content: [{ type: "text", text }] } : {}),
    })),
  };
}

export function CampaignStrategyInput({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: FocusEventHandler<HTMLDivElement>;
  onBlur?: FocusEventHandler<HTMLDivElement>;
}) {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        link: {
          openOnClick: readOnly,
          isAllowedUri: safeChatLink,
        },
      }),
      Extension.create({
        name: "campaignStrategyLists",
        addKeyboardShortcuts() {
          return {
            Tab: () =>
              this.editor.isActive("listItem") &&
              canIndentChatList(this.editor) &&
              this.editor.commands.sinkListItem("listItem"),
            "Shift-Tab": () =>
              this.editor.isActive("listItem") &&
              this.editor.commands.liftListItem("listItem"),
          };
        },
      }),
    ],
    immediatelyRender: false,
    content: strategyContent(value),
    editable: !disabled && !readOnly,
    onUpdate: ({ editor: current }) =>
      onChange?.(current.isEmpty ? "" : current.getHTML()),
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": t("campaign.strategy"),
        "aria-multiline": "true",
        "aria-readonly": String(disabled || readOnly),
        "data-placeholder": readOnly ? "" : t("campaign.timeline.strategyHint"),
        "data-chat-rich-lists": "true",
        class: cn(
          "min-h-28 max-h-64 overflow-y-auto px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-orange/30 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_code]:font-mono [&_a]:text-brand-orange [&_a]:underline [&_p]:min-h-5 [&_p]:whitespace-pre-wrap",
          readOnly && "min-h-0 max-h-none px-0 py-0",
        ),
      },
    },
  });
  useEffect(() => {
    if (editor && value !== (editor.isEmpty ? "" : editor.getHTML())) {
      editor.commands.setContent(strategyContent(value), { emitUpdate: false });
    }
  }, [editor, value]);
  useEffect(() => {
    editor?.setEditable(!disabled && !readOnly, false);
  }, [editor, disabled, readOnly]);
  useEffect(() => {
    editor?.view.dom.setAttribute(
      "data-placeholder",
      readOnly ? "" : t("campaign.timeline.strategyHint"),
    );
    editor?.view.dom.setAttribute("aria-label", t("campaign.strategy"));
  }, [editor, t, readOnly]);
  return (
    <div
      onFocusCapture={onFocus}
      onBlurCapture={onBlur}
      onClickCapture={(event) => {
        const button =
          event.target instanceof Element
            ? event.target.closest("button")
            : null;
        if (button && !button.getAttribute("type")) event.preventDefault();
      }}
      className={cn(
        "ct-strategy-rich",
        !readOnly && "border-border bg-card overflow-hidden rounded-lg border",
      )}
    >
      {editor && !readOnly && (
        <div inert={disabled || undefined}>
          <ChatComposerToolbar editor={editor} />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
