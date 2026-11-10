import type { ApprovalQueueItem } from "@/types/portal";
import { api } from "./api";
import type { ApiResponse } from "./authService";

export async function getApprovalQueue(): Promise<ApprovalQueueItem[]> {
  try {
    const res = await api.get<ApiResponse<ApprovalQueueItem[]>>(
      "/api/v1/portal/approvals",
    );
    return res.data?.data ?? [];
  } catch {
    return [];
  }
}

export async function approveQueueItem(
  id: string,
  note?: string,
): Promise<ApprovalQueueItem> {
  const res = await api.post<ApiResponse<ApprovalQueueItem>>(
    `/api/v1/portal/approvals/${id}/approve`,
    { note },
  );
  return res.data?.data;
}

export async function requestQueueItemRevision(
  id: string,
  noteOrStage: string,
  maybeNote?: string,
): Promise<ApprovalQueueItem> {
  const note = maybeNote !== undefined ? maybeNote : noteOrStage;
  const res = await api.post<ApiResponse<ApprovalQueueItem>>(
    `/api/v1/portal/approvals/${id}/reject`,
    { note },
  );
  return res.data?.data;
}

export async function resubmitQueueItem(
  id: string,
): Promise<ApprovalQueueItem> {
  const res = await api.post<ApiResponse<ApprovalQueueItem>>(
    `/api/v1/portal/approvals/${id}/resubmit`,
  );
  return res.data?.data;
}

export const portalService = {
  getApprovalQueue,
  approveQueueItem,
  requestQueueItemRevision,
  resubmitQueueItem,
};
