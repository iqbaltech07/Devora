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
  activePopup: NotificationItem | null;
  seenNotifIds: string[];
  lastFetchedAt: number;
  setIsOpen: (isOpen: boolean) => void;
  setActivePopup: (popup: NotificationItem | null) => void;
  dismissPopup: () => void;
  fetchNotifications: (force?: boolean) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "read" | "createdAt"> & { id?: string; createdAt?: string }) => void;
  clearNotifications: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];
let notifFetchPromise: Promise<void> | null = null;

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      unreadCount: 0,
      isLoading: false,
      isOpen: false,
      activePopup: null,
      seenNotifIds: [],
      lastFetchedAt: 0,

      setIsOpen: (isOpen) => set({ isOpen }),
      setActivePopup: (activePopup) => set({ activePopup }),
      dismissPopup: () => set({ activePopup: null }),

      fetchNotifications: async (force = false) => {
        const now = Date.now();
        if (!force && now - get().lastFetchedAt < 10000 && get().notifications.length > 0) {
          return;
        }

        if (notifFetchPromise) {
          return notifFetchPromise;
        }

        notifFetchPromise = (async () => {
          try {
            set({ isLoading: true });
            const res = await fetch("/api/notifications");
            if (!res.ok) {
              set({ isLoading: false });
              return;
            }
            const data = await res.json();
            if (data.success && Array.isArray(data.notifications)) {
              const currentSeen = new Set(get().seenNotifIds || []);
              const existingReadIds = new Set(
                get().notifications.filter((n) => n.read).map((n) => n.id)
              );

              const merged = data.notifications.map((n: NotificationItem) => ({
                ...n,
                read: existingReadIds.has(n.id) || n.read,
              }));

              // Detect genuinely new incoming unread notifications to show in popup banner
              const brandNewUnread = merged.filter(
                (n: NotificationItem) => !n.read && !currentSeen.has(n.id)
              );

              if (brandNewUnread.length > 0) {
                // Trigger popup for the most recent unread item
                set({ activePopup: brandNewUnread[0] });
              }

              // Update seen list
              const allFetchedIds = merged.map((n: NotificationItem) => n.id);
              const nextSeen = Array.from(new Set([...currentSeen, ...allFetchedIds]));

              set({
                notifications: merged,
                unreadCount: merged.filter((n: NotificationItem) => !n.read).length,
                seenNotifIds: nextSeen,
                lastFetchedAt: Date.now(),
                isLoading: false,
              });
            } else {
              set({ isLoading: false });
            }
          } catch (err) {
            console.error("fetchNotifications error:", err);
            set({ isLoading: false });
          } finally {
            notifFetchPromise = null;
          }
        })();

        return notifFetchPromise;
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

        const filtered = get().notifications.filter((n) => n.id !== newNotif.id);
        const updated = [newNotif, ...filtered];
        const nextSeen = Array.from(new Set([...get().seenNotifIds, newNotif.id]));

        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
          activePopup: newNotif,
          seenNotifIds: nextSeen,
        });
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0, activePopup: null });
      },
    }),
    {
      name: "devora_notifications_v3",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
