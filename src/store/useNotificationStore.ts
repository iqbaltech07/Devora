"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface NotificationItem {
  id: string;
  type: "LIKE" | "MATCH" | "PROJECT_INVITE" | "MESSAGE" | "SYSTEM";
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

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-seed-1",
    type: "LIKE",
    title: "Menyukai Profil Kamu!",
    message: "Alex Rivera (Fullstack Lead) tertarik dengan profilmu. Kalian memiliki sinergi stack 98%!",
    actorName: "Alex Rivera",
    actorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    actorRole: "Fullstack Lead",
    linkUrl: "/find-partner",
    read: false,
    createdAt: "5 menit lalu",
    timestamp: Date.now() - 300000,
  },
  {
    id: "notif-seed-2",
    type: "LIKE",
    title: "Menyukai Profil Kamu!",
    message: "Clara Thorne (Frontend & UI/UX) baru saja menyukai profilmu. Waktu luang kalian sama-sama 10 jam/mgg!",
    actorName: "Clara Thorne",
    actorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    actorRole: "Frontend Specialist",
    linkUrl: "/find-partner",
    read: false,
    createdAt: "25 menit lalu",
    timestamp: Date.now() - 1500000,
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      unreadCount: DEFAULT_NOTIFICATIONS.filter((n) => !n.read).length,
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

            // If empty from DB, keep seeded demo notifications for rich experience
            const finalNotifications = merged.length > 0 ? merged : get().notifications;

            set({
              notifications: finalNotifications,
              unreadCount: finalNotifications.filter((n: NotificationItem) => !n.read).length,
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
