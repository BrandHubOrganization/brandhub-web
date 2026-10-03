import { useCallback, useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { chatService, CHAT_SOCKET_URL } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type {
  ChatConnectionState,
  ChatError,
  ChatEvent,
  ChatMessage,
  SendChatMessage,
} from "@/types/chat";

const HISTORY_PAGE_SIZE = 30;

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const canonicalClientIds = new Set(incoming.map((item) => item.clientMessageId));
  const merged = current.filter(
    (item) =>
      !canonicalClientIds.has(item.clientMessageId) ||
      incoming.some((next) => next.id === item.id),
  );
  const byId = new Map(merged.map((item) => [item.id, item]));
  incoming.forEach((item) =>
    byId.set(item.id, {
      ...item,
      deliveryStatus: item.id.startsWith("optimistic:")
        ? item.deliveryStatus
        : "SENT",
    }),
  );
  return [...byId.values()].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export function useWorkspaceChat(workspaceId: string) {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const memberRole = useWorkspaceStore((state) => state.currentMemberRole);
  const clientRef = useRef<Client | null>(null);
  const workspaceIdRef = useRef(workspaceId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] =
    useState<ChatConnectionState>("CONNECTING");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  const markLatestRead = useCallback(
    (message: ChatMessage) => {
      if (message.id.startsWith("optimistic:")) return;
      void chatService.markRead(workspaceId, message.id).catch(() => undefined);
    },
    [workspaceId],
  );

  const receiveMessage = useCallback(
    (frame: IMessage) => {
      const event = JSON.parse(frame.body) as ChatEvent;
      setMessages((current) => mergeMessages(current, [event.message]));
      markLatestRead(event.message);
    },
    [markLatestRead],
  );

  const receiveError = useCallback((frame: IMessage) => {
    const error = JSON.parse(frame.body) as ChatError;
    setMessages((current) =>
      current.map((item) =>
        item.deliveryStatus === "SENDING"
          ? { ...item, deliveryStatus: "FAILED" }
          : item,
      ),
    );
    toast.error(error.message);
  }, []);

  const loadHistory = useCallback(
    async (cursor?: string | null) => {
      const response = await chatService.getHistory(
        workspaceId,
        cursor,
        HISTORY_PAGE_SIZE,
      );
      if (workspaceIdRef.current !== workspaceId) return;
      const history = response.data.data;
      setMessages((current) => mergeMessages(current, history.items));
      setNextCursor(history.nextCursor);
      setHasMore(history.hasMore);
      const newest = history.items[0];
      if (!cursor && newest) markLatestRead(newest);
    },
    [markLatestRead, workspaceId],
  );

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setMessages([]);
      setLoadingHistory(true);
      loadHistory()
        .catch(() => toast.error(t("chat.errors.loadHistory")))
        .finally(() => {
          if (!cancelled) setLoadingHistory(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [loadHistory, t]);

  useEffect(() => {
    if (!token || !workspaceId) return;
    let disposed = false;
    let connectedOnce = false;
    const client = new Client({
      brokerURL: CHAT_SOCKET_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        if (disposed) return;
        setConnectionState("CONNECTED");
        client.subscribe(`/topic/workspaces/${workspaceId}/chat`, receiveMessage);
        client.subscribe("/user/queue/chat-errors", receiveError);
        if (connectedOnce) {
          void loadHistory().catch(() =>
            toast.error(t("chat.errors.loadHistory")),
          );
        }
        connectedOnce = true;
      },
      onWebSocketClose: () => {
        if (!disposed) setConnectionState("RECONNECTING");
      },
      onStompError: () => {
        if (!disposed) setConnectionState("RECONNECTING");
      },
    });
    clientRef.current = client;
    queueMicrotask(() => {
      if (!disposed) setConnectionState("CONNECTING");
    });
    client.activate();
    return () => {
      disposed = true;
      clientRef.current = null;
      setConnectionState("DISCONNECTED");
      void client.deactivate();
    };
  }, [loadHistory, receiveError, receiveMessage, t, token, workspaceId]);

  const sendMessage = useCallback(
    (payload: SendChatMessage) => {
      if (!clientRef.current?.connected || !user) return false;
      const optimistic: ChatMessage = {
        id: `optimistic:${payload.clientMessageId}`,
        workspaceId,
        senderMemberId: "",
        senderUserId: user.id,
        senderRole:
          memberRole === "CLIENT" || memberRole === "MANAGER"
            ? memberRole
            : "CREATOR",
        senderDisplayName: user.name,
        ...payload,
        createdAt: new Date().toISOString(),
        deliveryStatus: "SENDING",
      };
      setMessages((current) => mergeMessages(current, [optimistic]));
      clientRef.current.publish({
        destination: `/app/workspaces/${workspaceId}/chat.send`,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      return true;
    },
    [memberRole, user, workspaceId],
  );

  const loadOlder = useCallback(async () => {
    if (!nextCursor || loadingHistory) return;
    setLoadingHistory(true);
    try {
      await loadHistory(nextCursor);
    } catch {
      toast.error(t("chat.errors.loadHistory"));
    } finally {
      setLoadingHistory(false);
    }
  }, [loadHistory, loadingHistory, nextCursor, t]);

  return {
    messages,
    connectionState,
    hasMore,
    loadingHistory,
    sendMessage,
    loadOlder,
  };
}

