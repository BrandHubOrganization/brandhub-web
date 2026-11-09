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

export const NOTIFICATION_TYPES: NotificationType[] = [
  "APPROVAL_REQUEST",
  "PUBLISH_SUCCESS",
  "PUBLISH_FAILED",
  "MENTION",
  "SYSTEM",
];

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  inApp: true,
  email: true,
  push: false,
  categories: {
    APPROVAL_REQUEST: true,
    PUBLISH_SUCCESS: true,
    PUBLISH_FAILED: true,
    MENTION: true,
    SYSTEM: false,
  },
};
