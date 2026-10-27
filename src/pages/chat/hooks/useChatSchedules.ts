import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
  chatReadRetry,
  chatRetryDelay,
} from "@/pages/chat/services/chatTransport";
import { chatScheduleService as service } from "@/pages/chat/services/chatScheduleService";
import {
  formatScheduleTime,
  scheduleErrorKey,
} from "@/pages/chat/utils/chatSchedule";
import type { ChannelMessageRequest } from "@/types/chatCollaboration";
import type {
  ChatRescheduleRequest,
  ScheduledChatMessage,
} from "@/pages/chat/types/chatSchedule";

export function useScheduleMessage(workspaceId: string, channelId: string) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const mutation = useMutation({
    mutationFn: async (body: {
      message: ChannelMessageRequest;
      scheduledAt: string;
      timeZone: string;
    }) => {
      const result = await service.create(workspaceId, channelId, body);
      if (result.status === "CANCELLED" || result.status === "FAILED")
        throw new Error("CHAT_SCHEDULE_CLOSED");
      return result;
    },
    retry: false,
    onSuccess: (message) => {
      void client.invalidateQueries({
        queryKey: ["chat-scheduled", userId, workspaceId],
      });
      toast.success(
        message.status === "SENT"
          ? t("chat.schedule.alreadySent")
          : message.status === "SENDING"
            ? t("chat.schedule.status.SENDING")
            : t("chat.schedule.created", {
                at: formatScheduleTime(
                  message.scheduledAt,
                  message.timeZone,
                  i18n.language,
                ),
              }),
      );
    },
    onError: (error) => {
      void client.invalidateQueries({
        queryKey: ["chat-scheduled", userId, workspaceId],
      });
      toast.error(t(scheduleErrorKey(error)));
    },
  });
  return async (
    message: ChannelMessageRequest,
    scheduledAt: string,
    timeZone: string,
  ) => {
    await mutation.mutateAsync({ message, scheduledAt, timeZone });
  };
}

export function useChannelSchedule(workspaceId: string, channelId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["chat-scheduled", userId, workspaceId, "upcoming", channelId],
    enabled: Boolean(userId && workspaceId && channelId),
    queryFn: ({ signal }) => service.upcoming(workspaceId, channelId, signal),
    refetchInterval: 10_000,
    retry: chatReadRetry,
    retryDelay: chatRetryDelay,
  });
}

export function useChatSchedules(workspaceId: string) {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const prefix = ["chat-scheduled", userId, workspaceId];
  const history = useInfiniteQuery({
    queryKey: [...prefix, includeCompleted],
    enabled: Boolean(userId && workspaceId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      service.list(workspaceId, pageParam, includeCompleted, signal),
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
    refetchInterval: 10_000,
    retry: chatReadRetry,
    retryDelay: chatRetryDelay,
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: prefix });
  };
  const onError = (error: unknown) => {
    toast.error(t(scheduleErrorKey(error)));
    refresh();
  };
  const change = useMutation({
    mutationFn: ({
      row,
      body,
    }: {
      row: ScheduledChatMessage;
      body: ChatRescheduleRequest;
    }) => service.reschedule(workspaceId, row.id, body),
    onSuccess: () => {
      toast.success(t("chat.schedule.updated"));
      refresh();
    },
    onError,
    retry: false,
  });
  const cancel = useMutation({
    mutationFn: (row: ScheduledChatMessage) =>
      service.cancel(workspaceId, row.id, row.revision),
    onSuccess: () => {
      toast.success(t("chat.schedule.cancelled"));
      refresh();
    },
    onError,
    retry: false,
  });
  const items = Array.from(
    new Map(
      (history.data?.pages.flatMap((page) => page.items) ?? []).map((row) => [
        row.id,
        row,
      ]),
    ).values(),
  );
  return {
    history,
    items,
    includeCompleted,
    setIncludeCompleted,
    change,
    cancel,
  };
}
