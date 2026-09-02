"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface NotificationItem {
  id: string;
  type: "LIKE" | "MATCH" | "PROJECT_INVITE" | "MESSAGE" | "SYSTEM" | "FOLLOW" | "FOLLOW_BACK";
  title: string;
  message: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  actorRole?: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
  timestamp?: number;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "read" | "createdAt"> & { id?: string; createdAt?: string }) => void;
  clearNotifications: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      unreadCount: 0,
      isLoading: false,
      isOpen: false,

      setIsOpen: (isOpen) => set({ isOpen }),

      fetchNotifications: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch("/api/notifications");
          if (!res.ok) {
            set({ isLoading: false });
            return;
          }
          const data = await res.json();
          if (data.success && Array.isArray(data.notifications)) {
            // Merge with local read states
            const existingReadIds = new Set(
              get().notifications.filter((n) => n.read).map((n) => n.id)
            );

            const merged = data.notifications.map((n: NotificationItem) => ({
              ...n,
              read: existingReadIds.has(n.id) || n.read,
            }));

            set({
              notifications: merged,
              unreadCount: merged.filter((n: NotificationItem) => !n.read).length,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("fetchNotifications error:", error);
          set({ isLoading: false });
        }
      },

      markAsRead: (id) => {
        const updated = get().notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        });
      },

      markAllAsRead: () => {
        const updated = get().notifications.map((n) => ({ ...n, read: true }));
        set({
          notifications: updated,
          unreadCount: 0,
        });
      },

      addNotification: (item) => {
        const newNotif: NotificationItem = {
          id: item.id || `notif-${Date.now()}`,
          ...item,
          read: false,
          createdAt: item.createdAt || "Baru saja",
          timestamp: Date.now(),
        };

        // Filter out duplicate IDs
        const filtered = get().notifications.filter((n) => n.id !== newNotif.id);
        const updated = [newNotif, ...filtered];

        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        });
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: "devora_notifications_v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
