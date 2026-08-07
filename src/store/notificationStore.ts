import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Notification } from "@/types/notification";

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "read" | "createdAt"> & { read?: boolean; createdAt?: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  immer((set) => ({
    notifications: [],
    unreadCount: 0,

    addNotification: (notification) =>
      set((state) => {
        const newNotif: Notification = {
          read: false,
          createdAt: new Date().toISOString(),
          ...notification,
        };
        state.notifications.unshift(newNotif);
        if (!newNotif.read) {
          state.unreadCount += 1;
        }
      }),

    markRead: (id) =>
      set((state) => {
        const notif = state.notifications.find((n) => n.id === id);
        if (notif && !notif.read) {
          notif.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }),

    markAllRead: () =>
      set((state) => {
        state.notifications.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      }),

    reset: () =>
      set((state) => {
        state.notifications = [];
        state.unreadCount = 0;
      }),
  }))
);
