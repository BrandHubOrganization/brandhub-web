import { api } from "@/lib/axios";

export type NotificationType =
  "SYSTEM" | "MAINTENANCE" | "UPDATE" | "PROMOTION";
export type TargetType = "ALL" | "BY_PLAN" | "BY_ROLE";
export type NotificationStatus =
  "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED" | "CANCELLED";
export interface AdminNotification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  targetType: TargetType;
  targetValues: string[];
  actionUrl: string | null;
  status: NotificationStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number | null;
  delivered: number;
  failed: number;
  pending: number;
  createdAt: string;
  createdByName: string;
  rowVersion: number;
}
export interface NotificationRequest {
  title: string;
  content: string;
  type: NotificationType;
  targetType: TargetType;
  targetValues: string[];
  actionUrl: string | null;
  scheduledAt: string | null;
  action: "DRAFT" | "SCHEDULE" | "SEND_NOW";
  rowVersion?: number;
}

export const adminNotificationService = {
  async list(page: number) {
    return (
      await api.get<{
        data: {
          items: AdminNotification[];
          page: number;
          size: number;
          total: number;
        };
      }>("/api/v1/admin/notifications", { params: { page, size: 10 } })
    ).data.data;
  },
  async plans() {
    return (
      await api.get<{ data: { name: string; displayName: string }[] }>(
        "/api/v1/admin/notifications/plans",
      )
    ).data.data;
  },
  async estimate(targetType: TargetType, targetValues: string[]) {
    return (
      await api.get<{ data: { count: number } }>(
        "/api/v1/admin/notifications/audience-count",
        {
          params: { targetType, targetValues },
          paramsSerializer: { indexes: null },
        },
      )
    ).data.data.count;
  },
  save: (request: NotificationRequest, id?: string) =>
    id
      ? api.put(`/api/v1/admin/notifications/${id}`, request)
      : api.post("/api/v1/admin/notifications", request),
  cancel: (id: string, rowVersion: number) =>
    api.post(`/api/v1/admin/notifications/${id}/cancel`, null, {
      params: { rowVersion },
    }),
};
