import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  chatReadRetry,
  chatRetryDelay,
} from "@/pages/chat/services/chatTransport";
import { chatCollaborationService as service } from "@/services/chatCollaborationService";
import type {
  ChatChannel,
  CreateChannelRequest,
  UpdateChannelRequest,
} from "@/types/chatCollaboration";

export function useChatChannels(workspaceId: string, channelId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const prefix = ["chat-channels", userId, workspaceId];
  const channels = useInfiniteQuery({
    queryKey: prefix,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      service.channels(workspaceId, pageParam, signal),
    getNextPageParam: (last, pages) =>
      last.length >= 100 ? pages.length : undefined,
    retry: chatReadRetry,
    retryDelay: chatRetryDelay,
    refetchInterval: (query) => (query.state.error ? false : 20_000),
  });
  const directory = useInfiniteQuery({
    queryKey: ["chat-directory", userId, workspaceId],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      service.directory(workspaceId, pageParam, signal),
    getNextPageParam: (last, pages) =>
      last.length === 100 ? pages.length : undefined,
    retry: chatReadRetry,
    retryDelay: chatRetryDelay,
    staleTime: 30_000,
  });
  const selected = useQuery({
    queryKey: [...prefix, channelId],
    queryFn: ({ signal }) => service.channel(workspaceId, channelId, signal),
    retry: chatReadRetry,
    retryDelay: chatRetryDelay,
    refetchInterval: (query) => (query.state.error ? false : 20_000),
  });
  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["chat-channels", userId, workspaceId],
    });
  }, [queryClient, userId, workspaceId]);
  const create = useMutation({
    mutationFn: (request: CreateChannelRequest) =>
      service.create(workspaceId, request),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: (request: UpdateChannelRequest) =>
      service.update(workspaceId, channelId, request),
    onSuccess: refresh,
  });
  const member = useMutation({
    mutationFn: ({ userId: targetId, add }: { userId: string; add: boolean }) =>
      service.member(workspaceId, channelId, targetId, add),
    onSuccess: (channel: ChatChannel) => {
      queryClient.setQueryData([...prefix, channelId], channel);
      refresh();
    },
  });
  return {
    channels,
    directory,
    selected,
    create,
    update,
    member,
    refresh,
    list: [
      ...new Map(
        (channels.data?.pages.flat() ?? []).map((channel) => [
          channel.id,
          channel,
        ]),
      ).values(),
    ],
    people: directory.data?.pages.flat() ?? [],
  };
}
