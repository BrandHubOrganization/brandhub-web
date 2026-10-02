import type { ApiResponse } from "@/services/authService";
import { api } from "@/services/api";
import type { ChatHistory } from "@/types/chat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const CHAT_SOCKET_URL =
  import.meta.env.VITE_WS_BASE_URL ||
  `${API_BASE_URL.replace(/^http/, "ws")}/ws/chat`;

export const chatService = {
  getHistory: (workspaceId: string, before?: string | null, limit = 30) =>
    api.get<ApiResponse<ChatHistory>>(
      `/api/v1/workspaces/${workspaceId}/chat/messages`,
      { params: { before: before || undefined, limit } },
    ),

  markRead: (workspaceId: string, lastReadMessageId: string) =>
    api.put<ApiResponse<void>>(`/api/v1/workspaces/${workspaceId}/chat/read`, {
      lastReadMessageId,
    }),

  getUnreadCount: (workspaceId: string) =>
    api.get<ApiResponse<{ unreadCount: number }>>(
      `/api/v1/workspaces/${workspaceId}/chat/unread-count`,
    ),
};

