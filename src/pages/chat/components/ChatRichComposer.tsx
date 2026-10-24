import { EditorContent } from "@tiptap/react";
import { AtSign, SendHorizontal, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatComposerToolbar } from "@/pages/chat/components/ChatComposerToolbar";
import { ChatComposerEmoji } from "@/pages/chat/components/ChatComposerEmoji";
import { useChatRichEditor } from "@/pages/chat/hooks/useChatRichEditor";
import type { ChatRichComposerProps } from "@/pages/chat/types/chatComposer";
export type { ChatRichComposerProps } from "@/pages/chat/types/chatComposer";

export function ChatRichComposer(props: ChatRichComposerProps) {
  const {
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
  } = useChatRichEditor(props);
  if (!editor) return null;
  return (
    <footer
      ref={box}
      className="border-border bg-card relative shrink-0 border-t p-3 sm:p-4"
    >
      {!props.canPost && (
        <p
          role="status"
          className="text-muted-foreground py-3 text-center text-sm"
        >
          {t("chat.channels.readOnly")}
        </p>
      )}
      <div hidden={!props.canPost}>
        {props.contextType !== "GENERAL" && (
          <p className="text-muted-foreground mb-2 text-xs">
            {t("chat.composer.contextHint", {
              context: t(`chat.context.${props.contextType.toLowerCase()}`),
            })}
          </p>
        )}
        {suggestion && (
          <div
            className="border-border bg-popover text-popover-foreground absolute z-40 w-80 max-w-full rounded-xl border p-2 shadow-md"
            style={{ left: suggestion.left, bottom: suggestion.bottom }}
          >
            <div className="text-muted-foreground mb-1 flex items-center justify-between px-2 text-xs">
              <span>{t("chat.composer.mention")}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={t("chat.actions.close")}
                onClick={closeMention}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div
              id={listId}
              role="listbox"
              aria-label={t("chat.composer.mention")}
              className="max-h-48 overflow-y-auto"
            >
              {matches.map((person, index) => (
                <Button
                  key={person.userId}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  variant={index === active ? "secondary" : "ghost"}
                  className="min-h-10 w-full justify-start gap-2"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => mention(person)}
                >
                  <span
                    className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md"
                    aria-hidden="true"
                  >
                    {person.displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left">
                    {person.displayName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t(`chat.ui.roles.${person.role}`)}
                  </span>
                </Button>
              ))}
              {!matches.length && (
                <p role="status" className="text-muted-foreground p-2 text-sm">
                  {t("chat.composer.noMembers")}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="border-border focus-within:border-brand-orange/50 bg-card overflow-hidden rounded-xl border">
          {formatting && <ChatComposerToolbar editor={editor} />}
          <div className="relative">
            {length === 0 && (
              <span
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute top-3 left-3 text-base sm:text-sm"
              >
                {t(
                  props.threadRootId
                    ? "chat.composer.threadPlaceholder"
                    : "chat.composer.placeholder",
                )}
              </span>
            )}
            <EditorContent editor={editor} />
          </div>
          <div className="border-border flex items-center justify-between gap-2 border-t px-2 py-1">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label={t("chat.rich.formatting")}
                title={t("chat.rich.formatting")}
                aria-pressed={formatting}
                onClick={() => setFormatting(!formatting)}
              >
                <Type className="size-4" aria-hidden="true" />
              </Button>
              <ChatComposerEmoji editor={editor} />
              <Button
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label={t("chat.composer.mention")}
                title={t("chat.composer.mention")}
                onClick={() => {
                  const before =
                    editor.state.selection.$from.parent.textBetween(
                      0,
                      editor.state.selection.$from.parentOffset,
                    );
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: "text",
                      text: before && !/\s$/.test(before) ? " @" : "@",
                    })
                    .run();
                }}
              >
                <AtSign className="size-4" aria-hidden="true" />
              </Button>
              <span
                id={hintId}
                className="text-muted-foreground sr-only text-xs lg:not-sr-only"
              >
                {t(keyboardHintKey)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs tabular-nums",
                  length > 4000 ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {length}/4000
              </span>
              <Button
                variant="orange"
                size="icon"
                className="size-10"
                disabled={!hasText || length > 4000 || !valid}
                aria-label={t("chat.composer.send")}
                onClick={send}
              >
                <SendHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
        {length > 4000 && (
          <p role="alert" className="text-destructive mt-1 text-xs">
            {t("chat.rich.tooLong")}
          </p>
        )}
        {!valid && (
          <p role="alert" className="text-destructive mt-1 text-xs">
            {t("chat.rich.tooComplex")}
          </p>
        )}
      </div>
    </footer>
  );
}
