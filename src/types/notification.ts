export type NotificationType =
  | "APPROVAL_REQUEST"
  | "PUBLISH_SUCCESS"
  | "PUBLISH_FAILED"
  | "MENTION"
  | "SYSTEM";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  push: boolean;
  categories: Record<NotificationType, boolean>;
}
