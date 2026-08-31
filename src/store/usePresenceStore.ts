import { create } from "zustand";
import { getSocket } from "@/lib/socket";

export interface UserPresence {
  isOnline: boolean;
  isTyping?: boolean;
  lastSeen: string;
}

interface PresenceState {
  presenceMap: Record<string, UserPresence>;
  isHeartbeatActive: boolean;
  
  // Actions
  fetchPresence: (userIds: string[], activePartnerId?: string) => Promise<void>;
  sendHeartbeat: (typingFor?: string | null) => Promise<void>;
  setTyping: (partnerId: string, isTyping: boolean, myUserId?: string) => void;
  isUserOnline: (userId: string) => boolean;
  getUserPresence: (userId: string) => UserPresence;
  initSocketListeners: () => void;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  presenceMap: {},
  isHeartbeatActive: false,

  initSocketListeners: () => {
    if (typeof window === "undefined") return;
    const socket = getSocket();

    socket.on("presence_update", ({ onlineUserIds }: { onlineUserIds: string[] }) => {
      if (!Array.isArray(onlineUserIds)) return;
      const onlineSet = new Set(onlineUserIds);

      set((state) => {
        const updated = { ...state.presenceMap };
        onlineUserIds.forEach((uid) => {
          updated[uid] = {
            isOnline: true,
            isTyping: updated[uid]?.isTyping || false,
            lastSeen: new Date().toISOString(),
          };
        });

        // Set missing ones to offline if needed
        Object.keys(updated).forEach((uid) => {
          if (!onlineSet.has(uid)) {
            updated[uid] = {
              ...updated[uid],
              isOnline: false,
            };
          }
        });

        return { presenceMap: updated };
      });
    });

    socket.on("user_typing", ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
      if (!senderId) return;
      set((state) => ({
        presenceMap: {
          ...state.presenceMap,
          [senderId]: {
            ...(state.presenceMap[senderId] || { isOnline: true, lastSeen: new Date().toISOString() }),
            isTyping: Boolean(isTyping),
          },
        },
      }));
    });
  },

  fetchPresence: async (userIds: string[], activePartnerId?: string) => {
    if (!userIds || userIds.length === 0) return;

    try {
      const idsQuery = encodeURIComponent(userIds.join(","));
      const partnerQuery = activePartnerId ? `&activePartnerId=${encodeURIComponent(activePartnerId)}` : "";
      const res = await fetch(`/api/presence?userIds=${idsQuery}${partnerQuery}&t=${Date.now()}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          presenceMap: {
            ...state.presenceMap,
            ...(data.presence || {}),
          },
        }));
      }
    } catch (err) {
      console.error("fetchPresence error:", err);
    }
  },

  sendHeartbeat: async (typingFor?: string | null) => {
    try {
      await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typingFor: typingFor || null }),
      });
    } catch (err) {
      console.warn("sendHeartbeat warning:", err);
    }
  },

  setTyping: (partnerId: string, isTyping: boolean, myUserId?: string) => {
    const socket = getSocket();
    if (socket.connected && myUserId) {
      socket.emit("typing", {
        senderId: myUserId,
        receiverId: partnerId,
        isTyping,
      });
    }

    // Also fallback via API
    if (isTyping) {
      get().sendHeartbeat(partnerId);
    } else {
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stoppedTypingFor: partnerId }),
      }).catch(console.warn);
    }
  },

  isUserOnline: (userId: string) => {
    const p = get().presenceMap[userId];
    return Boolean(p?.isOnline);
  },

  getUserPresence: (userId: string) => {
    return (
      get().presenceMap[userId] || {
        isOnline: false,
        isTyping: false,
        lastSeen: new Date().toISOString(),
      }
    );
  },
}));
