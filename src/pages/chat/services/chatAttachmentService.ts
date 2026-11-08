import { chatTransport } from "@/pages/chat/services/chatTransport";
import { requireApiData } from "@/lib/apiData";
import type { ChatAttachment } from "@/pages/chat/types/chatAttachment";
import type { ApiResponse } from "@/services/authService";

const base = (workspace: string, channel: string) =>
  `/api/v1/workspaces/${encodeURIComponent(workspace)}/chat/channels/${encodeURIComponent(channel)}/attachments`;

export const chatAttachmentService = {
  async upload(
    workspace: string,
    channel: string,
    file: File,
    signal?: AbortSignal,
  ) {
    const body = new FormData();
    body.append("file", file);
    return requireApiData<ChatAttachment>(
      (
        await chatTransport.post<ApiResponse<ChatAttachment>>(
          base(workspace, channel),
          body,
          { signal },
        )
      ).data,
    );
  },
  async repository(
    workspace: string,
    channel: string,
    materialId: string,
    versionNumber: number,
    signal?: AbortSignal,
  ) {
    return requireApiData<ChatAttachment>(
      (
        await chatTransport.post<ApiResponse<ChatAttachment>>(
          `${base(workspace, channel)}/repository`,
          { materialId, versionNumber },
          { signal },
        )
      ).data,
    );
  },
  async inspect(
    workspace: string,
    channel: string,
    id: string,
    signal?: AbortSignal,
  ) {
    return requireApiData<ChatAttachment>(
      (
        await chatTransport.get<ApiResponse<ChatAttachment>>(
          `${base(workspace, channel)}/${encodeURIComponent(id)}`,
          { signal },
        )
      ).data,
    );
  },
  async content(
    workspace: string,
    channel: string,
    id: string,
    signal?: AbortSignal,
  ) {
    return (
      await chatTransport.get<Blob>(
        `${base(workspace, channel)}/${encodeURIComponent(id)}/content`,
        { signal, responseType: "blob" },
      )
    ).data;
  },
};
