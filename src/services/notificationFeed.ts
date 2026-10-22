import { api } from "@/lib/axios";
import type { AppNotification } from "@/types/notification";

const SYSTEM_PREFIX = "sys:";
interface InboxItem {
  id: string;
  title: string;
  content: string;
  actionUrl: string | null;
  createdAt: string;
  readAt: string | null;
}

export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await api.get<{ data: { items: InboxItem[] } }>(
    "/api/v1/notifications/me",
    { params: { page: 1, size: 20 } },
  );
  if (!Array.isArray(data?.data?.items))
    throw new Error("INVALID_NOTIFICATION_RESPONSE");
  return data.data.items.map((item) => ({
    id: SYSTEM_PREFIX + item.id,
    type: "SYSTEM",
    title: item.title,
    message: item.content,
    isRead: item.readAt !== null,
    createdAt: item.createdAt,
    linkTo: item.actionUrl ?? undefined,
  }));
}

export async function markAsRead(id: string): Promise<void> {
  if (!id.startsWith(SYSTEM_PREFIX)) throw new Error("INVALID_NOTIFICATION_ID");
  await api.post(
    `/api/v1/notifications/me/${encodeURIComponent(id.slice(SYSTEM_PREFIX.length))}/read`,
  );
}

export async function markAllAsRead(): Promise<void> {
  await api.post("/api/v1/notifications/me/read-all");
}
