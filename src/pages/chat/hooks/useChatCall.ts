import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { chatCallService } from "@/pages/chat/services/chatCallService";
import { createAgoraAudioSession } from "@/pages/chat/services/agoraAudioSession";
import type { ChatCallAction } from "@/pages/chat/types/chatCall";

export function useChatCall(workspaceId: string, userId: string) {
  const { t } = useTranslation();
  const cache = useQueryClient();
  const queryKey = ["chat-calls", userId, workspaceId];
  const [ownedId, setOwnedId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const session = useRef<ReturnType<typeof createAgoraAudioSession> | null>(
    null,
  );
  const current = useQuery({
    queryKey,
    queryFn: ({ signal }) => chatCallService.current(workspaceId, signal),
    retry: false,
    refetchInterval: (query) => (query.state.error ? false : 5000),
  });
  const call = current.data?.[0];
  const callRef = useRef(call);
  useEffect(() => {
    callRef.current = call;
  }, [call]);
  const refresh = () => cache.invalidateQueries({ queryKey });
  const failed = () => toast.error(t("chat.calls.error"), { duration: 6000 });
  const start = useMutation({
    mutationFn: (channelId: string) =>
      chatCallService.start(workspaceId, {
        channelId,
        clientRequestId: crypto.randomUUID(),
      }),
    onSuccess: (created) => {
      setMuted(false);
      setOwnedId(created.id);
      cache.setQueryData(queryKey, [created]);
    },
    onError: () => {
      failed();
      void refresh();
    },
  });
  const action = useMutation({
    mutationFn: async (kind: ChatCallAction) => {
      if (!call) throw new Error("No active call");
      return chatCallService.action(workspaceId, call.id, kind);
    },
    onSuccess: (updated, kind) => {
      if (kind === "accept") {
        setMuted(false);
        setOwnedId(updated.id);
      }
      if (["end", "cancel", "decline"].includes(kind)) {
        session.current?.stop();
        setOwnedId(null);
      }
      void refresh();
    },
    onError: () => {
      failed();
      void refresh();
    },
  });
  const mediaCallId =
    ownedId &&
    call?.id === ownedId &&
    ["CONNECTING", "ACTIVE"].includes(call.state)
      ? ownedId
      : null;

  useEffect(() => {
    if (!mediaCallId) return;
    let disposed = false;
    let ending = false;
    let heartbeatPending = false;
    const invalidate = () =>
      cache.invalidateQueries({
        queryKey: ["chat-calls", userId, workspaceId],
      });
    const mediaError = () => {
      if (disposed || ending) return;
      ending = true;
      setOwnedId(null);
      toast.error(t("chat.calls.mediaError"), { duration: 6000 });
      void chatCallService
        .action(workspaceId, mediaCallId, "end")
        .then(invalidate, invalidate);
    };
    const audio = createAgoraAudioSession({
      userId,
      onBusy: () => {
        if (disposed) return;
        setOwnedId(null);
        toast.info(t("chat.calls.otherTab"));
      },
      workspaceId,
      callId: mediaCallId,
      onError: mediaError,
      onConnected: async () => {
        await chatCallService.action(workspaceId, mediaCallId, "connected");
        await invalidate();
      },
    });
    session.current = audio;
    void audio.start();
    const heartbeat = setInterval(async () => {
      if (heartbeatPending) return;
      heartbeatPending = true;
      try {
        await chatCallService.action(workspaceId, mediaCallId, "heartbeat");
        if (!disposed) await invalidate();
      } catch {
        if (!disposed) {
          audio.stop();
          mediaError();
        }
      } finally {
        heartbeatPending = false;
      }
    }, 15_000);
    const lease = setInterval(() => {
      const expires = callRef.current?.expiresAt;
      if (!expires || Date.parse(expires) <= Date.now()) {
        audio.stop();
        mediaError();
      }
    }, 1000);
    return () => {
      disposed = true;
      clearInterval(heartbeat);
      clearInterval(lease);
      audio.stop();
      session.current = null;
    };
  }, [mediaCallId, cache, userId, workspaceId, t]);

  const toggleMute = async () => {
    try {
      await session.current?.mute(!muted);
      setMuted(!muted);
    } catch {
      failed();
    }
  };
  return {
    call,
    muted,
    ownedId,
    start,
    action,
    current,
    toggleMute,
    resumeAudio: () => session.current?.resumeAudio(),
  };
}
