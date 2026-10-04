import { api } from "@/lib/axios";
import * as sample from "@/services/mock/mockNotificationService";
import type { AppNotification } from "@/types/notification";

// FR 3.10.1 in-app channel: real system notifications from the API, merged with the
// workspace sample notifications that still belong to their own (unbuilt) FRs.
const SYSTEM_PREFIX = "sys:";

interface InboxItem {
  id: string;
  title: string;
  content: string;
  actionUrl: string | null;
  createdAt: string;
  readAt: string | null;
}

async function systemNotifications(): Promise<AppNotification[]> {
  try {
    const { data } = await api.get<{ data: { items: InboxItem[] } }>(
      "/api/v1/notifications/me",
      { params: { page: 1, size: 20 } },
    );
    return data.data.items.map((item) => ({
      id: SYSTEM_PREFIX + item.id,
      type: "SYSTEM",
      title: item.title,
      message: item.content,
      isRead: item.readAt !== null,
      createdAt: item.createdAt,
      linkTo: item.actionUrl ?? undefined,
    }));
  } catch {
    return []; // the bell must keep working when the inbox API is unreachable
  }
}

export async function getNotifications(): Promise<AppNotification[]> {
  const [system, workspace] = await Promise.all([
    systemNotifications(),
    sample.getNotifications(),
  ]);
  return [...system, ...workspace].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function markAsRead(id: string): Promise<void> {
  if (!id.startsWith(SYSTEM_PREFIX)) return sample.markAsRead(id);
  await api.post(
    `/api/v1/notifications/me/${id.slice(SYSTEM_PREFIX.length)}/read`,
  );
}

export async function markAllAsRead(): Promise<void> {
  await Promise.all([
    api.post("/api/v1/notifications/me/read-all").catch(() => undefined),
    sample.markAllAsRead(),
  ]);
}
