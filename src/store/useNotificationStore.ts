"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface NotificationItem {
  id: string;
  type: "LIKE" | "MATCH" | "PROJECT_INVITE" | "SYSTEM";
  title: string;
  message: string;
  actorName?: string;
  actorAvatar?: string;
  actorRole?: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "read" | "createdAt">) => void;
  clearNotifications: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "LIKE",
    title: "Menyukai Profil Kamu!",
    message: "Alex Rivera (Fullstack Lead) tertarik dengan profilmu. Kalian memiliki sinergi stack 98%!",
    actorName: "Alex Rivera",
    actorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    actorRole: "Fullstack Lead",
    linkUrl: "/find-partner",
    read: false,
    createdAt: "5 menit lalu",
  },
  {
    id: "notif-2",
    type: "LIKE",
    title: "Menyukai Profil Kamu!",
    message: "Clara Thorne (Frontend & UI/UX) baru saja menyukai profilmu. Waktu luang kalian sama-sama 10 jam/mgg!",
    actorName: "Clara Thorne",
    actorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    actorRole: "Frontend Specialist",
    linkUrl: "/find-partner",
    read: false,
    createdAt: "25 menit lalu",
  },
  {
    id: "notif-3",
    type: "MATCH",
    title: "Yeay, Kamu Mendapat Match Baru!",
    message: "Kamu dan Sarah Vania saling menyukai! Mulai obrolan untuk bahas rencana proyek bersama.",
    actorName: "Sarah Vania",
    actorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    actorRole: "Backend Architect",
    linkUrl: "/messages",
    read: false,
    createdAt: "2 jam lalu",
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.read).length,
      isOpen: false,

      setIsOpen: (isOpen) => set({ isOpen }),

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
          id: `notif-${Date.now()}`,
          ...item,
          read: false,
          createdAt: "Baru saja",
        };
        const updated = [newNotif, ...get().notifications];
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
      name: "devora_notifications_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
