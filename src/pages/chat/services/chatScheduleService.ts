import { chatTransport as api } from "@/pages/chat/services/chatTransport";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type {
  ChatScheduleRequest,
  ChatRescheduleRequest,
  ScheduledChatMessage,
  ScheduledChatPage,
  UpcomingChatSchedule,
} from "@/pages/chat/types/chatSchedule";

const base = (workspaceId: string) =>
  `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/chat`;
export const chatScheduleService = {
  async upcoming(workspaceId: string, channelId: string, signal?: AbortSignal) {
    return requireApiData<UpcomingChatSchedule>(
      (
        await api.get<ApiResponse<UpcomingChatSchedule>>(
          `${base(workspaceId)}/channels/${encodeURIComponent(channelId)}/scheduled-messages/upcoming`,
          { signal, timeout: 20_000 },
        )
      ).data,
    );
  },
  async create(
    workspaceId: string,
    channelId: string,
    body: ChatScheduleRequest,
  ) {
    return requireApiData<ScheduledChatMessage>(
      (
        await api.post<ApiResponse<ScheduledChatMessage>>(
          `${base(workspaceId)}/channels/${encodeURIComponent(channelId)}/scheduled-messages`,
          body,
          { timeout: 20_000 },
        )
      ).data,
    );
  },
  async list(
    workspaceId: string,
    cursor: string | null,
    includeCompleted: boolean,
    signal?: AbortSignal,
  ) {
    return requireApiData<ScheduledChatPage>(
      (
        await api.get<ApiResponse<ScheduledChatPage>>(
          `${base(workspaceId)}/scheduled-messages`,
          {
            params: {
              cursor: cursor ?? undefined,
              includeCompleted,
              limit: 20,
            },
            signal,
            timeout: 20_000,
          },
        )
      ).data,
    );
  },
  async reschedule(
    workspaceId: string,
    id: string,
    body: ChatRescheduleRequest,
  ) {
    return requireApiData<ScheduledChatMessage>(
      (
        await api.patch<ApiResponse<ScheduledChatMessage>>(
          `${base(workspaceId)}/scheduled-messages/${encodeURIComponent(id)}`,
          body,
          { timeout: 20_000 },
        )
      ).data,
    );
  },
  async cancel(workspaceId: string, id: string, revision: number) {
    return requireApiData<ScheduledChatMessage>(
      (
        await api.delete<ApiResponse<ScheduledChatMessage>>(
          `${base(workspaceId)}/scheduled-messages/${encodeURIComponent(id)}?revision=${revision}`,
          { timeout: 20_000 },
        )
      ).data,
    );
  },
};
