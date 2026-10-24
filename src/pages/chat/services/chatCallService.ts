import { chatTransport } from "@/pages/chat/services/chatTransport";
import { requireApiData } from "@/lib/apiData";
import type { ApiResponse } from "@/services/authService";
import type {
  ChatCall,
  ChatCallAction,
  ChatCallToken,
} from "@/pages/chat/types/chatCall";

const base = (workspace: string) =>
  `/api/v1/workspaces/${encodeURIComponent(workspace)}/chat/calls`;

export const chatCallService = {
  async current(workspace: string, signal?: AbortSignal) {
    const response = await chatTransport.get<ApiResponse<ChatCall[]>>(
      `${base(workspace)}/current`,
      { signal },
    );
    return requireApiData<ChatCall[]>(response.data);
  },
  async start(
    workspace: string,
    request: { channelId: string; clientRequestId: string },
  ) {
    const response = await chatTransport.post<ApiResponse<ChatCall>>(
      base(workspace),
      request,
    );
    return requireApiData<ChatCall>(response.data);
  },
  async action(workspace: string, callId: string, action: ChatCallAction) {
    const response = await chatTransport.post<ApiResponse<ChatCall>>(
      `${base(workspace)}/${encodeURIComponent(callId)}/${action}`,
    );
    return requireApiData<ChatCall>(response.data);
  },
  async token(workspace: string, callId: string) {
    const response = await chatTransport.post<ApiResponse<ChatCallToken>>(
      `${base(workspace)}/${encodeURIComponent(callId)}/token`,
    );
    return requireApiData<ChatCallToken>(response.data);
  },
};
