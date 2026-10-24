import { useTranslation } from "react-i18next";
import { Mic, MicOff, Phone, PhoneCall, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { useChatCall } from "@/pages/chat/hooks/useChatCall";

interface CallBarProps {
  calls: ReturnType<typeof useChatCall>;
  userId: string;
  name: string;
}

export function ChatCallBar({ calls, userId, name }: CallBarProps) {
  const { t } = useTranslation();
  const call = calls.call;
  if (!call) return null;
  const incoming = call.state === "RINGING" && call.calleeId === userId;
  const ringing = call.state === "RINGING";
  const pulsing = ringing || call.state === "CONNECTING";
  const ownsMedia = calls.ownedId === call.id;
  return (
    <section
      aria-label={t("chat.calls.title")}
      className={cn(
        "bg-card/95 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 shadow-xs backdrop-blur-md transition-all sm:mb-2.5 sm:rounded-xl sm:border",
        incoming
          ? "border-emerald-500/30 bg-emerald-500/5"
          : call.state === "ACTIVE"
            ? "border-emerald-500/25"
            : "border-brand-orange/25",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative flex size-9 shrink-0 items-center justify-center">
          {pulsing && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 animate-ping rounded-full opacity-25",
                incoming ? "bg-emerald-500" : "bg-brand-orange",
              )}
            />
          )}
          <div
            className={cn(
              "relative flex size-9 items-center justify-center rounded-full ring-1",
              incoming || call.state === "ACTIVE"
                ? "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400"
                : "bg-brand-orange-soft text-brand-orange ring-brand-orange/25",
            )}
          >
            {pulsing ? (
              <PhoneCall className="size-4 animate-pulse" aria-hidden="true" />
            ) : (
              <Phone className="size-4" aria-hidden="true" />
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1" role="status" aria-live="polite">
          <p className="text-foreground truncate text-sm font-semibold tracking-tight">
            {name || t("chat.calls.title")}
          </p>
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                call.state === "ACTIVE"
                  ? "bg-emerald-500"
                  : pulsing
                    ? "bg-brand-orange animate-pulse"
                    : "bg-muted-foreground",
              )}
            />
            <span className="truncate">
              {t(
                `chat.calls.${incoming ? "incoming" : call.state.toLowerCase()}`,
              )}
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {incoming && (
          <Button
            variant="default"
            size="sm"
            className="h-9 rounded-full bg-emerald-600 px-4 text-white shadow-2xs hover:bg-emerald-500 focus-visible:ring-emerald-500/40"
            loading={calls.action.isPending}
            onClick={() => calls.action.mutate("accept")}
          >
            <Phone className="size-3.5" aria-hidden="true" />
            {t("chat.calls.accept")}
          </Button>
        )}
        {!ringing && ownsMedia && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 rounded-full px-3.5",
              calls.muted &&
                "border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300",
            )}
            aria-pressed={calls.muted}
            onClick={() => void calls.toggleMute()}
          >
            {calls.muted ? (
              <MicOff className="size-3.5" aria-hidden="true" />
            ) : (
              <Mic className="size-3.5" aria-hidden="true" />
            )}
            {t(calls.muted ? "chat.calls.unmute" : "chat.calls.mute")}
          </Button>
        )}
        {!ringing && ownsMedia && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3.5"
            onClick={calls.resumeAudio}
          >
            <Volume2 className="size-3.5" aria-hidden="true" />
            {t("chat.calls.resumeAudio")}
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="h-9 rounded-full px-4 shadow-2xs"
          loading={calls.action.isPending}
          onClick={() =>
            calls.action.mutate(
              incoming ? "decline" : ringing ? "cancel" : "end",
            )
          }
        >
          <PhoneOff className="size-3.5" aria-hidden="true" />
          {t(incoming ? "chat.calls.decline" : "chat.calls.end")}
        </Button>
      </div>
    </section>
  );
}
