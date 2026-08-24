import type {
  AppNotification,
  NotificationPreferences,
  NotificationType,
} from "@/types/notification";

const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "APPROVAL_REQUEST",
    title: "Content awaiting your approval",
    message: "New Instagram post from Content Team needs review.",
    isRead: false,
    createdAt: "2026-08-24T08:15:00Z",
    linkTo: "/requests",
  },
  {
    id: "n2",
    type: "PUBLISH_SUCCESS",
    title: "Post published to Facebook",
    message: "Your scheduled post went live successfully.",
    isRead: false,
    createdAt: "2026-08-24T07:40:00Z",
    linkTo: "/publish",
  },
  {
    id: "n3",
    type: "PUBLISH_FAILED",
    title: "Post failed to publish to TikTok",
    message: "Token expired — reconnect the account to retry.",
    isRead: false,
    createdAt: "2026-08-23T22:05:00Z",
    linkTo: "/social-accounts",
  },
  {
    id: "n4",
    type: "MENTION",
    title: "You were mentioned",
    message: 'Lộc mentioned you in a comment on "Summer Sale" post.',
    isRead: true,
    createdAt: "2026-08-23T15:30:00Z",
    linkTo: "/library",
  },
  {
    id: "n5",
    type: "SYSTEM",
    title: "Subscription renewed",
    message: "Your Basic plan was renewed for another month.",
    isRead: true,
    createdAt: "2026-08-22T09:00:00Z",
    linkTo: "/subscription/invoices",
  },
  {
    id: "n6",
    type: "APPROVAL_REQUEST",
    title: "Content awaiting your approval",
    message: "New TikTok video from AI Studio needs review.",
    isRead: true,
    createdAt: "2026-08-21T13:10:00Z",
    linkTo: "/requests",
  },
  {
    id: "n7",
    type: "PUBLISH_SUCCESS",
    title: "Post published to Threads",
    message: "Your post reached 1.2k impressions in the first hour.",
    isRead: true,
    createdAt: "2026-08-20T11:00:00Z",
    linkTo: "/analytics",
  },
  {
    id: "n8",
    type: "SYSTEM",
    title: "New AI ambassador ready",
    message: 'Your trained ambassador "Minh" is ready to generate videos.',
    isRead: true,
    createdAt: "2026-08-19T10:20:00Z",
    linkTo: "/ai-studio/ambassadors",
  },
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
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

let notifications = NOTIFICATIONS.map((n) => ({ ...n }));
let preferences: NotificationPreferences = {
  ...DEFAULT_PREFERENCES,
  categories: { ...DEFAULT_PREFERENCES.categories },
};

const DELAY = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY));
}

export function getNotifications(): Promise<AppNotification[]> {
  return delay(notifications.map((n) => ({ ...n })));
}

export function markAsRead(id: string): Promise<void> {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, isRead: true } : n,
  );
  return delay(undefined);
}

export function markAllAsRead(): Promise<void> {
  notifications = notifications.map((n) => ({ ...n, isRead: true }));
  return delay(undefined);
}

export function getPreferences(): Promise<NotificationPreferences> {
  return delay({ ...preferences, categories: { ...preferences.categories } });
}

export function updatePreferences(
  prefs: NotificationPreferences,
): Promise<NotificationPreferences> {
  preferences = { ...prefs, categories: { ...prefs.categories } };
  return delay({ ...preferences, categories: { ...preferences.categories } });
}

export const NOTIFICATION_TYPES: NotificationType[] = [
  "APPROVAL_REQUEST",
  "PUBLISH_SUCCESS",
  "PUBLISH_FAILED",
  "MENTION",
  "SYSTEM",
];
