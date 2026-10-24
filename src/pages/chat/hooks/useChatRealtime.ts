import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CHAT_SOCKET_URL } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";
import { parseChatEvent } from "@/pages/chat/utils/chatMessages";
import type { ChatConnectionState } from "@/types/chat";

interface RealtimeOptions {
  workspaceId: string;
  channelId: string;
  onState: (state: ChatConnectionState) => void;
}

export function useChatRealtime({
  workspaceId,
  channelId,
  onState,
}: RealtimeOptions) {
  const token = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  useEffect(() => {
    if (!token) return;
    let disposed = false;
    const invalidateChannels = () =>
      void queryClient.invalidateQueries({
        queryKey: ["chat-channels", userId, workspaceId],
      });
    const invalidateMessages = () => {
      void queryClient.invalidateQueries({
        queryKey: ["chat-messages", userId, workspaceId, channelId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["chat-root", userId, workspaceId, channelId],
      });
    };
    const client = new Client({
      brokerURL: CHAT_SOCKET_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        if (disposed) return;
        onState("CONNECTED");
        const receive = (body: string) => {
          if (disposed) return;
          const message = parseChatEvent(body);
          if (
            !message ||
            message.workspaceId !== workspaceId ||
            message.channelId !== channelId
          ) {
            toast.error(t("chat.errors.invalidEvent"));
            return;
          }
          invalidateMessages();
          invalidateChannels();
        };
        client.subscribe(
          `/topic/workspaces/${workspaceId}/chat/channels/${channelId}`,
          (frame) => receive(frame.body),
        );
        if (channelId === "general")
          client.subscribe(`/topic/workspaces/${workspaceId}/chat`, (frame) =>
            receive(frame.body),
          );
        client.subscribe("/user/queue/chat-channels", () => {
          if (!disposed) invalidateChannels();
        });
        client.subscribe("/user/queue/chat-calls", () => {
          if (!disposed)
            void queryClient.invalidateQueries({
              queryKey: ["chat-calls", userId, workspaceId],
            });
        });
        invalidateChannels();
        invalidateMessages();
      },
      onWebSocketClose: () => {
        if (!disposed) onState("RECONNECTING");
      },
      onStompError: () => {
        if (!disposed) {
          onState("RECONNECTING");
          invalidateChannels();
        }
      },
    });
    client.activate();
    return () => {
      disposed = true;
      void client.deactivate();
    };
  }, [channelId, onState, queryClient, t, token, userId, workspaceId]);
}
