import { useCallback, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import {
  chatReadRetry,
  chatRetryDelay,
} from "@/pages/chat/services/chatTransport";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { chatCollaborationService as service } from "@/services/chatCollaborationService";
import { mergeChatMessages } from "@/pages/chat/utils/chatMessages";
import type {
  ChannelFilters,
  ChannelHistory,
  ChannelMessageRequest,
  CollaborationMessage,
  ChatReaction,
} from "@/types/chatCollaboration";

export function useChannelMessages(
  workspaceId: string,
  channelId: string,
  filters: ChannelFilters,
) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const queryClient = useQueryClient();
  const prefix = ["chat-messages", user?.id, workspaceId, channelId];
  const key = [...prefix, filters];
  const [pending, setPending] = useState<CollaborationMessage[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const inFlight = useRef(new Set<string>());
  const history = useInfiniteQuery({
    queryKey: key,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      try {
        return await service.history(
          workspaceId,
          channelId,
          filters,
          pageParam,
          signal,
        );
      } catch (error) {
        if (
          isAxiosError(error) &&
          [403, 404].includes(error.response?.status ?? 0)
        ) {
          void queryClient.invalidateQueries({
            queryKey: ["chat-channels", user?.id, workspaceId],
          });
        }
        throw error;
      }
    },
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
    retry: chatReadRetry,
    retryDelay: chatRetryDelay,
    refetchOnWindowFocus: true,
  });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: prefix });
    void queryClient.invalidateQueries({
      queryKey: ["chat-root", user?.id, workspaceId, channelId],
    });
  };
  const accept = (message: CollaborationMessage) => {
    queryClient.setQueryData<InfiniteData<ChannelHistory, string | null>>(
      key,
      (previous) => {
        if (!previous)
          return {
            pages: [{ items: [message], hasMore: false, nextCursor: null }],
            pageParams: [null],
          };
        return {
          ...previous,
          pages: previous.pages.map((page, index) => ({
            ...page,
            items:
              index === 0
                ? [
                    ...page.items.filter((item) => item.id !== message.id),
                    message,
                  ]
                : page.items,
          })),
        };
      },
    );
    setPending((current) =>
      current.filter(
        (item) => item.clientMessageId !== message.clientMessageId,
      ),
    );
    refresh();
    void queryClient.invalidateQueries({
      queryKey: ["chat-channels", user?.id, workspaceId],
    });
  };
  const send = (request: ChannelMessageRequest): boolean => {
    if (!user || inFlight.current.has(request.clientMessageId)) return false;
    inFlight.current.add(request.clientMessageId);
    const optimistic: CollaborationMessage = {
      id: `optimistic:${request.clientMessageId}`,
      channelId,
      workspaceId,
      senderMemberId: "",
      senderUserId: user.id,
      senderDisplayName: user.name,
      senderRole: role === "CLIENT" || role === "MANAGER" ? role : "CREATOR",
      ...request,
      createdAt: new Date().toISOString(),
      deliveryStatus: "SENDING",
      reactions: {},
      pinned: false,
      replyCount: 0,
    };
    setPending((current) => [
      ...current.filter(
        (item) => item.clientMessageId !== request.clientMessageId,
      ),
      optimistic,
    ]);
    void (async () => {
      try {
        accept(await service.send(workspaceId, channelId, request));
      } catch {
        setPending((current) =>
          current.map((item) =>
            item.clientMessageId === request.clientMessageId
              ? { ...item, deliveryStatus: "FAILED" }
              : item,
          ),
        );
        toast.error(t("chat.errors.send"));
        void queryClient.invalidateQueries({
          queryKey: ["chat-channels", user.id, workspaceId],
        });
      } finally {
        inFlight.current.delete(request.clientMessageId);
      }
    })();
    return true;
  };
  const retry = (message: CollaborationMessage) =>
    send({
      clientMessageId: message.clientMessageId,
      content: message.content,
      richContent: message.richContent,
      contextType: message.contextType,
      contextId: message.contextId,
      threadRootId: message.threadRootId,
      mentionUserIds: message.mentionUserIds ?? [],
    });
  const mutate = async (message: CollaborationMessage, code?: ChatReaction) => {
    if (busyId) return;
    setBusyId(message.id);
    try {
      const changed = code
        ? await service.reaction(
            workspaceId,
            message,
            code,
            !message.reactions[code]?.includes(user?.id ?? ""),
          )
        : await service.pin(workspaceId, message);
      queryClient.setQueriesData<InfiniteData<ChannelHistory>>(
        { queryKey: prefix },
        (previous) =>
          previous && {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === changed.id
                  ? { ...changed, replyCount: item.replyCount }
                  : item,
              ),
            })),
          },
      );
      refresh();
    } catch {
      toast.error(t("chat.errors.action"));
    } finally {
      setBusyId(null);
    }
  };
  const markRead = useCallback(
    async (messageId: string) => {
      try {
        await service.read(workspaceId, channelId, messageId);
        await queryClient.invalidateQueries({
          queryKey: ["chat-channels", user?.id, workspaceId],
        });
        return true;
      } catch (error) {
        console.warn("Chat read acknowledgement failed", error);
        return false;
      }
    },
    [channelId, queryClient, user, workspaceId],
  );
  const visiblePending =
    !filters.q && !filters.pinned
      ? pending.filter(
          (message) =>
            (!filters.contextType ||
              message.contextType === filters.contextType) &&
            (!filters.contextId || message.contextId === filters.contextId) &&
            (!filters.root || message.threadRootId === filters.root),
        )
      : [];
  return {
    history,
    busyId,
    send,
    retry,
    mutate,
    markRead,
    messages: mergeChatMessages([
      ...(history.data?.pages.flatMap((page) => page.items) ?? []),
      ...visiblePending,
    ]),
  };
}
