import { MessageCircleMore } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ChatConnectionState } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  workspaceName: string;
  connectionState: ChatConnectionState;
}

export function ChatHeader({ workspaceName, connectionState }: ChatHeaderProps) {
  const { t } = useTranslation();
  const isConnected = connectionState === "CONNECTED";

  return (
    <header className="border-border bg-card flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-5">
      <div className="bg-brand-orange-soft text-brand-orange flex size-10 items-center justify-center rounded-full">
        <MessageCircleMore className="size-5" />
      </div>
      <div className="min-w-0">
        <h1 className="text-foreground truncate text-sm font-semibold sm:text-base">
          {workspaceName}
        </h1>
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "size-2 rounded-full",
              isConnected ? "bg-success" : "bg-warning",
            )}
          />
          {t(`chat.connection.${connectionState.toLowerCase()}`)}
        </p>
      </div>
    </header>
  );
}

