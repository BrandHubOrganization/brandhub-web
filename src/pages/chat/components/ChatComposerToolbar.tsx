import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  SquareCode,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
  IndentIncrease,
  IndentDecrease,
} from "lucide-react";
import { useEditorState, type Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover } from "radix-ui";
import { safeChatLink } from "@/pages/chat/utils/chatRichContent";
import { canIndentChatList } from "@/pages/chat/utils/chatListActions";

export function ChatComposerToolbar({ editor }: { editor: Editor }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      underline: current.isActive("underline"),
      strike: current.isActive("strike"),
      code: current.isActive("code"),
      codeBlock: current.isActive("codeBlock"),
      bulletList: current.isActive("bulletList"),
      orderedList: current.isActive("orderedList"),
      blockquote: current.isActive("blockquote"),
      link: current.isActive("link"),
      canIndent: canIndentChatList(current),
      canOutdent: current.can().liftListItem("listItem"),
    }),
  });

  const inlineTools = [
    {
      name: "bold",
      Icon: Bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      name: "italic",
      Icon: Italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      name: "underline",
      Icon: Underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      name: "strike",
      Icon: Strikethrough,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
  ] as const;

  const listTools = [
    {
      name: "bulletList",
      Icon: List,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      name: "orderedList",
      Icon: ListOrdered,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      name: "blockquote",
      Icon: Quote,
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ] as const;

  const codeTools = [
    {
      name: "code",
      Icon: Code,
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      name: "codeBlock",
      Icon: SquareCode,
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ] as const;

  const saveLink = () => {
    if (!safeChatLink(url.trim())) {
      setInvalid(true);
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
    setLinkOpen(false);
  };

  return (
    <div
      role="group"
      aria-label={t("chat.rich.formatting")}
      className="border-border/60 bg-muted/20 flex flex-wrap items-center gap-0.5 border-b px-2 py-1"
    >
      {inlineTools.map(({ name, Icon, run }) => (
        <Button
          key={name}
          type="button"
          variant={state[name] ? "secondary" : "ghost"}
          size="icon"
          className="size-7 rounded-md"
          aria-label={t(`chat.rich.${name}`)}
          title={t(`chat.rich.${name}`)}
          aria-pressed={state[name]}
          onMouseDown={(event) => event.preventDefault()}
          onClick={run}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </Button>
      ))}
      <div className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
      {listTools.map(({ name, Icon, run }) => (
        <Button
          key={name}
          type="button"
          variant={state[name] ? "secondary" : "ghost"}
          size="icon"
          className="size-7 rounded-md"
          aria-label={t(`chat.rich.${name}`)}
          title={t(`chat.rich.${name}`)}
          aria-pressed={state[name]}
          onMouseDown={(event) => event.preventDefault()}
          onClick={run}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </Button>
      ))}
      <div className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
      {codeTools.map(({ name, Icon, run }) => (
        <Button
          key={name}
          type="button"
          variant={state[name] ? "secondary" : "ghost"}
          size="icon"
          className="size-7 rounded-md"
          aria-label={t(`chat.rich.${name}`)}
          title={t(`chat.rich.${name}`)}
          aria-pressed={state[name]}
          onMouseDown={(event) => event.preventDefault()}
          onClick={run}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </Button>
      ))}
      <div className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
      {[
        {
          name: "outdent",
          Icon: IndentDecrease,
          enabled: state.canOutdent,
          run: () => editor.chain().focus().liftListItem("listItem").run(),
        },
        {
          name: "indent",
          Icon: IndentIncrease,
          enabled: state.canIndent,
          run: () => {
            if (canIndentChatList(editor))
              editor.chain().focus().sinkListItem("listItem").run();
          },
        },
      ].map(({ name, Icon, enabled, run }) => (
        <Button
          key={name}
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 rounded-md"
          aria-label={t(`chat.rich.${name}`)}
          title={t(`chat.rich.${name}`)}
          disabled={!enabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={run}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </Button>
      ))}
      <div className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
      <Popover.Root
        open={linkOpen}
        onOpenChange={(open) => {
          setLinkOpen(open);
          setInvalid(false);
          setUrl(String(editor.getAttributes("link").href ?? ""));
        }}
      >
        <Popover.Trigger asChild>
          <Button
            variant={state.link ? "secondary" : "ghost"}
            size="icon"
            className="size-7 rounded-md"
            aria-label={t("chat.rich.link")}
            title={t("chat.rich.link")}
            aria-pressed={state.link}
          >
            <Link2 className="size-3.5" aria-hidden="true" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            className="bg-popover text-popover-foreground border-border z-50 w-72 space-y-3 rounded-xl border p-4 shadow-md"
            align="start"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              editor.commands.focus();
            }}
          >
            <Input
              label={t("chat.rich.linkUrl")}
              type="url"
              value={url}
              placeholder="https://"
              error={invalid ? t("chat.rich.invalidLink") : undefined}
              onChange={(event) => {
                setUrl(event.target.value);
                setInvalid(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  saveLink();
                }
              }}
            />
            <div className="flex gap-2">
              <Button onClick={saveLink}>{t("chat.rich.apply")}</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setLinkOpen(false);
                }}
              >
                {t("chat.rich.removeLink")}
              </Button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <div className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
      <Button
        variant="ghost"
        size="icon"
        className="size-7 rounded-md"
        aria-label={t("chat.rich.undo")}
        title={t("chat.rich.undo")}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="size-3.5" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 rounded-md"
        aria-label={t("chat.rich.redo")}
        title={t("chat.rich.redo")}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
