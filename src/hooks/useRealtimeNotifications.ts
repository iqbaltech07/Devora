"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useNotificationStore, NotificationItem } from "@/store/useNotificationStore";
import { useUiStore } from "@/store/useUiStore";
import { getSocket } from "@/lib/socket";
import { playNotificationSound } from "@/lib/sound";

export function useRealtimeNotifications() {
  const { currentUser, isAuthenticated } = useUserStore();
  const { fetchNotifications, addNotification } = useNotificationStore();
  const { addToast } = useUiStore();
  const isRegisteredRef = useRef(false);

  // 1. Initial & periodic polling fallback for 100% reliability
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 12000); // 12 seconds background sync

    const handleFocus = () => {
      fetchNotifications();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, currentUser?.id, fetchNotifications]);

  // 2. Real-time WebSocket event listeners
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;

    const socket = getSocket();

    const connectAndRegister = () => {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("register", {
        userId: currentUser.id,
        userName: currentUser.name || "Developer",
      });
      isRegisteredRef.current = true;
    };

    connectAndRegister();

    // Event: Real-time Notification received
    const handleNewNotification = (payload: NotificationItem) => {
      addNotification(payload);
      playNotificationSound();

      addToast({
        title: payload.title,
        description: payload.message,
        type: payload.type === "LIKE" ? "info" : "success",
      });
    };

    // Event: Someone directly liked current user's profile
    const handleProfileLiked = (payload: {
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      senderRole?: string;
    }) => {
      playNotificationSound();
      addNotification({
        type: "LIKE",
        title: "Menyukai Profil Kamu",
        message: `${payload.senderName || "Seorang Developer"} (${payload.senderRole || "Developer"}) baru saja menyukai profilmu! Geser kanan untuk auto-match.`,
        actorId: payload.senderId,
        actorName: payload.senderName,
        actorAvatar: payload.senderAvatar,
        actorRole: payload.senderRole,
        linkUrl: "/matches",
      });

      addToast({
        title: "Seseorang Menyukai Profilmu",
        description: `${payload.senderName} (${payload.senderRole || "Developer"}) tertarik berkolaborasi denganmu.`,
        type: "info",
      });
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("profile_liked", handleProfileLiked);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("profile_liked", handleProfileLiked);
    };
  }, [isAuthenticated, currentUser?.id, currentUser?.name, addNotification, addToast]);
}
