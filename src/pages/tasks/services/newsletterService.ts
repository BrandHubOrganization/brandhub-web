import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";

export interface NewsletterSendResult {
  batchId: string;
  status: string;
  accepted: number;
  monthlyRemaining: number;
}

export interface NewsletterReport {
  batchId?: string;
  status?: string;
  total?: number;
  sent?: number;
  failed?: number;
  suppressed?: number;
  unsubscribed?: number;
}

const data = <T>(r: { data: ApiResponse<T> }) => r.data.data;
const base = (workspaceId: string, taskId: string) =>
  `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/newsletter`;

export const newsletterService = {
  send: (
    workspaceId: string,
    taskId: string,
    body: { recipientGroupIds: string[]; scheduledAt?: string },
  ) =>
    api
      .post<ApiResponse<NewsletterSendResult>>(
        `${base(workspaceId, taskId)}/send`,
        body,
      )
      .then(data),
  sendTest: (workspaceId: string, taskId: string) =>
    api.post(`${base(workspaceId, taskId)}/send-test`),
  report: (workspaceId: string, taskId: string) =>
    api
      .get<ApiResponse<NewsletterReport>>(`${base(workspaceId, taskId)}/report`)
      .then(data),
};
