import { useTranslation } from "react-i18next";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const ownsMedia = calls.ownedId === call.id;
  return (
    <section
      aria-label={t("chat.calls.title")}
      className="bg-card border-border flex flex-wrap items-center gap-3 border-b p-3"
    >
      <Phone className="text-brand-orange size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1" role="status" aria-live="polite">
        <p className="truncate text-sm font-semibold">
          {name || t("chat.calls.title")}
        </p>
        <p className="text-muted-foreground text-xs">
          {t(`chat.calls.${incoming ? "incoming" : call.state.toLowerCase()}`)}
        </p>
      </div>
      {incoming && (
        <Button
          variant="orange"
          loading={calls.action.isPending}
          onClick={() => calls.action.mutate("accept")}
        >
          {t("chat.calls.accept")}
        </Button>
      )}
      {!ringing && ownsMedia && (
        <Button
          variant="outline"
          className="min-h-11"
          aria-pressed={calls.muted}
          onClick={() => void calls.toggleMute()}
        >
          {calls.muted ? (
            <MicOff aria-hidden="true" />
          ) : (
            <Mic aria-hidden="true" />
          )}
          {t(calls.muted ? "chat.calls.unmute" : "chat.calls.mute")}
        </Button>
      )}
      {!ringing && ownsMedia && (
        <Button
          variant="ghost"
          className="min-h-11"
          onClick={calls.resumeAudio}
        >
          <Volume2 className="size-4" aria-hidden="true" />
          {t("chat.calls.resumeAudio")}
        </Button>
      )}
      <Button
        variant="destructive"
        className="min-h-11"
        loading={calls.action.isPending}
        onClick={() =>
          calls.action.mutate(incoming ? "decline" : ringing ? "cancel" : "end")
        }
      >
        <PhoneOff className="size-4" aria-hidden="true" />
        {t(incoming ? "chat.calls.decline" : "chat.calls.end")}
      </Button>
    </section>
  );
}
