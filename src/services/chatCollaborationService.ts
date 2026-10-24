import { chatTransport as api } from "@/pages/chat/services/chatTransport";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type {
  ChatChannel,
  ChatNotificationPreference,
  ChatDirectoryMember,
  ChatReaction,
  ChannelHistory,
  ChannelFilters,
  CollaborationMessage,
  ChannelMessageRequest,
  CreateChannelRequest,
  UpdateChannelRequest,
} from "@/types/chatCollaboration";

const base = (workspaceId: string) =>
  `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/chat/channels`;
const channelPath = (workspaceId: string, channelId: string) =>
  `${base(workspaceId)}/${encodeURIComponent(channelId)}`;

export const chatCollaborationService = {
  async preferences(
    workspaceId: string,
    channelId: string,
    signal?: AbortSignal,
  ) {
    const response = await api.get<ApiResponse<ChatNotificationPreference>>(
      `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/chat/preferences/channels/${encodeURIComponent(channelId)}`,
      { signal },
    );
    return requireApiData<ChatNotificationPreference>(response.data);
  },
  async preference(
    workspaceId: string,
    channelId: string,
    kind: "dnd" | "mute",
    enabled: boolean,
  ) {
    const suffix =
      kind === "dnd" ? "dnd" : `channels/${encodeURIComponent(channelId)}`;
    const response = await api.put<ApiResponse<ChatNotificationPreference>>(
      `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/chat/preferences/${suffix}`,
      { enabled },
    );
    return requireApiData<ChatNotificationPreference>(response.data);
  },
  async channels(workspaceId: string, page = 0, signal?: AbortSignal) {
    const response = await api.get<ApiResponse<ChatChannel[]>>(
      base(workspaceId),
      { params: { page }, signal },
    );
    return requireApiData<ChatChannel[]>(response.data);
  },
  async directory(workspaceId: string, page = 0, signal?: AbortSignal) {
    const response = await api.get<ApiResponse<ChatDirectoryMember[]>>(
      `${base(workspaceId)}/directory`,
      { params: { page }, signal },
    );
    return requireApiData<ChatDirectoryMember[]>(response.data);
  },
  async channel(workspaceId: string, channelId: string, signal?: AbortSignal) {
    const response = await api.get<ApiResponse<ChatChannel>>(
      channelPath(workspaceId, channelId),
      { signal },
    );
    return requireApiData<ChatChannel>(response.data);
  },
  async create(workspaceId: string, request: CreateChannelRequest) {
    const response = await api.post<ApiResponse<ChatChannel>>(
      base(workspaceId),
      request,
    );
    return requireApiData<ChatChannel>(response.data);
  },
  async update(
    workspaceId: string,
    channelId: string,
    request: UpdateChannelRequest,
  ) {
    const response = await api.patch<ApiResponse<ChatChannel>>(
      channelPath(workspaceId, channelId),
      request,
    );
    return requireApiData<ChatChannel>(response.data);
  },
  async member(
    workspaceId: string,
    channelId: string,
    userId: string,
    add: boolean,
  ) {
    const path = `${channelPath(workspaceId, channelId)}/members/${encodeURIComponent(userId)}`;
    const response = add
      ? await api.put<ApiResponse<ChatChannel>>(path)
      : await api.delete<ApiResponse<ChatChannel>>(path);
    return requireApiData<ChatChannel>(response.data);
  },
  async history(
    workspaceId: string,
    channelId: string,
    filters: ChannelFilters,
    before: string | null,
    signal?: AbortSignal,
  ) {
    const response = await api.get<ApiResponse<ChannelHistory>>(
      `${channelPath(workspaceId, channelId)}/messages`,
      {
        params: { ...filters, before: before || undefined, limit: 30 },
        signal,
      },
    );
    return requireApiData<ChannelHistory>(response.data);
  },
  async message(
    workspaceId: string,
    channelId: string,
    messageId: string,
    signal?: AbortSignal,
  ) {
    const response = await api.get<ApiResponse<CollaborationMessage>>(
      `${channelPath(workspaceId, channelId)}/messages/${encodeURIComponent(messageId)}`,
      { signal },
    );
    return requireApiData<CollaborationMessage>(response.data);
  },
  async send(
    workspaceId: string,
    channelId: string,
    request: ChannelMessageRequest,
  ) {
    const response = await api.post<ApiResponse<CollaborationMessage>>(
      `${channelPath(workspaceId, channelId)}/messages`,
      request,
    );
    return requireApiData<CollaborationMessage>(response.data);
  },
  async reaction(
    workspaceId: string,
    message: CollaborationMessage,
    code: ChatReaction,
    add: boolean,
  ) {
    const path = `${channelPath(workspaceId, message.channelId)}/messages/${message.id}/reactions/${code}`;
    const response = add
      ? await api.put<ApiResponse<CollaborationMessage>>(path)
      : await api.delete<ApiResponse<CollaborationMessage>>(path);
    return requireApiData<CollaborationMessage>(response.data);
  },
  async pin(workspaceId: string, message: CollaborationMessage) {
    const path = `${channelPath(workspaceId, message.channelId)}/messages/${message.id}/pin`;
    const response = message.pinned
      ? await api.delete<ApiResponse<CollaborationMessage>>(path)
      : await api.put<ApiResponse<CollaborationMessage>>(path);
    return requireApiData<CollaborationMessage>(response.data);
  },
  async read(workspaceId: string, channelId: string, messageId: string) {
    await api.put(`${channelPath(workspaceId, channelId)}/read`, {
      lastReadMessageId: messageId,
    });
  },
};
