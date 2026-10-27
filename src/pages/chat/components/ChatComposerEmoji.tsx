import { useState } from "react";
import { Popover } from "radix-ui";
import { Smile } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Editor } from "@tiptap/react";

const EMOJI = [
  "😀",
  "😊",
  "😂",
  "😍",
  "🥳",
  "😎",
  "🤔",
  "😢",
  "👍",
  "👏",
  "🙌",
  "🙏",
  "❤️",
  "🎉",
  "🔥",
  "✨",
  "✅",
  "👀",
  "🚀",
  "💡",
  "💪",
  "🤝",
  "📌",
  "💯",
];

export function ChatComposerEmoji({ editor }: { editor: Editor }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={t("chat.rich.emoji")}
          title={t("chat.rich.emoji")}
        >
          <Smile className="size-4" aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          className="bg-popover text-popover-foreground border-border z-50 grid w-72 grid-cols-6 gap-1 rounded-xl border p-2 shadow-md"
          aria-label={t("chat.rich.emoji")}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            editor.commands.focus();
          }}
        >
          {EMOJI.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="size-10 text-xl"
              aria-label={t("chat.rich.insertEmoji", { emoji })}
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .insertContent({ type: "text", text: emoji })
                  .run();
                setOpen(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
