import { useTranslation } from "react-i18next";
import { Columns2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatThreadWidth } from "@/pages/chat/hooks/useChatThreadWidth";

export function ChatThreadWidthMenu({ sizing }: { sizing: ChatThreadWidth }) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-lg"
          aria-label={t("chat.thread.widthMenu")}
          title={t("chat.thread.widthMenu")}
        >
          <Columns2 className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(
          [
            ["compact", sizing.min],
            ["standard", sizing.standard],
            ["expanded", sizing.max],
          ] as const
        ).map(([kind, width]) => (
          <DropdownMenuItem
            key={kind}
            className="min-h-10"
            disabled={sizing.width === width}
            onSelect={() =>
              kind === "standard" ? sizing.reset() : sizing.resize(width)
            }
          >
            {t(`chat.thread.${kind}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
