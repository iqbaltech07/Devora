import { create } from "zustand";
import { Message, Invitation } from "./types";
import { getSocket } from "@/lib/socket";

interface ChatState {
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  invitations: Invitation[];
  isSending: boolean;
  isSocketConnected: boolean;
  isStreamConnected: boolean;
  
  setActiveConversation: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, content: string) => void;
  sendInvitation: (invitation: Omit<Invitation, "id" | "createdAt" | "status">) => void;
  respondToInvitation: (
    invitationId: string,
    action: "ACCEPT" | "REJECT" | "COUNTER_PROPOSE",
    counterNote?: string
  ) => void;
  
  fetchMessages: (userId: string) => Promise<void>;
  sendMessageAsync: (receiverId: string, content: string, senderId?: string, senderName?: string) => Promise<void>;
  receiveRealtimeMessage: (msg: Message) => void;
  markAsRead: (otherUserId: string, myUserId?: string) => Promise<void>;
  connectSocket: (currentUser?: { id: string; name?: string }) => () => void;
  connectStream: () => () => void;
}

export const INITIAL_INVITATIONS: Invitation[] = [];
export const INITIAL_MESSAGES: Record<string, Message[]> = {};

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversationId: null,
  messages: INITIAL_MESSAGES,
  invitations: INITIAL_INVITATIONS,
  isSending: false,
  isSocketConnected: false,
  isStreamConnected: false,

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  markAsRead: async (otherUserId: string, myUserId?: string) => {
    if (!otherUserId) return;
    const currentList = get().messages[otherUserId] || [];
    const hasUnread = currentList.some((m) => m.senderId === otherUserId && !m.read);
    if (!hasUnread) return;

    set((state) => {
      const list = state.messages[otherUserId] || [];
      return {
        messages: {
          ...state.messages,
          [otherUserId]: list.map((m) =>
            m.senderId === otherUserId ? { ...m, read: true } : m
          ),
        },
      };
    });

    const socket = getSocket();
    if (socket.connected && myUserId) {
      socket.emit("mark_read", { readerId: myUserId, senderId: otherUserId });
    }

    try {
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: otherUserId }),
      });
    } catch (err) {
      console.warn("markAsRead error:", err);
    }
  },

  receiveRealtimeMessage: (msg: Message) => {
    if (!msg || !msg.id) return;
    const conversationPartnerId = msg.conversationId || msg.senderId;

    set((state) => {
      const currentList = state.messages[conversationPartnerId] || [];
      if (currentList.some((m) => m.id === msg.id)) {
        return state;
      }
      const tempIndex = currentList.findIndex(
        (m) =>
          m.id.startsWith("temp-") &&
          m.content.trim() === msg.content.trim() &&
          (m.senderId === msg.senderId || m.senderId === "me")
      );
      if (tempIndex !== -1) {
        const updated = [...currentList];
        updated[tempIndex] = msg;
        return {
          messages: {
            ...state.messages,
            [conversationPartnerId]: updated,
          },
        };
      }
      return {
        messages: {
          ...state.messages,
          [conversationPartnerId]: [...currentList, msg],
        },
      };
    });
  },

  connectStream: () => {
    if (typeof window === "undefined") return () => {};
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/chat/stream");
      eventSource.addEventListener("message", (e) => {
        try {
          const msg: Message = JSON.parse(e.data);
          if (msg && msg.id) {
            get().receiveRealtimeMessage(msg);
          }
        } catch (err) {
          console.warn("SSE parse error:", err);
        }
      });
      eventSource.onopen = () => {
        set({ isStreamConnected: true });
      };
      eventSource.onerror = () => {
        set({ isStreamConnected: false });
      };
    } catch (err) {
      console.warn("EventSource setup failed:", err);
    }
    return () => {
      if (eventSource) {
        eventSource.close();
        set({ isStreamConnected: false });
      }
    };
  },

  connectSocket: (currentUser?: { id: string; name?: string }) => {
    if (typeof window === "undefined") return () => {};

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      set({ isSocketConnected: true });
      if (currentUser?.id) {
        socket.emit("register", { userId: currentUser.id, userName: currentUser.name });
      }
    };

    const onDisconnect = () => {
      set({ isSocketConnected: false });
    };

    const onNewMessage = (msg: Message) => {
      if (msg && msg.id) {
        get().receiveRealtimeMessage(msg);
      }
    };

    const onMessagesRead = ({ readerId }: { readerId: string }) => {
      set((state) => {
        const list = state.messages[readerId] || [];
        return {
          messages: {
            ...state.messages,
            [readerId]: list.map((m) => ({ ...m, read: true })),
          },
        };
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("messages_read", onMessagesRead);

    if (socket.connected && currentUser?.id) {
      socket.emit("register", { userId: currentUser.id, userName: currentUser.name });
      set({ isSocketConnected: true });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("messages_read", onMessagesRead);
    };
  },

  sendMessage: (conversationId, content) => {
    set((state) => {
      const currentList = state.messages[conversationId] || [];
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: "me",
        senderName: "Me",
        content,
        sentAt: new Date().toISOString(),
      };
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...currentList, newMsg],
        },
      };
    });
  },
  sendInvitation: (inv) =>
    set((state) => ({
      invitations: [
        {
          ...inv,
          id: `inv-${Date.now()}`,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        ...state.invitations,
      ],
    })),
  respondToInvitation: (invitationId, action, counterNote) =>
    set((state) => ({
      invitations: state.invitations.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              status:
                action === "ACCEPT"
                  ? "ACCEPTED"
                  : action === "REJECT"
                  ? "REJECTED"
                  : "COUNTER_PROPOSED",
              counterNote: counterNote || inv.counterNote,
            }
          : inv
      ),
    })),
  fetchMessages: async (otherUserId: string) => {
    if (!otherUserId) return;
    try {
      const res = await fetch(`/api/chat?userId=${encodeURIComponent(otherUserId)}&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: Message[] = await res.json();
        set((state) => {
          const currentList = state.messages[otherUserId] || [];
          const pendingTemps = currentList.filter((m) => m.id.startsWith("temp-"));

          const msgMap = new Map<string, Message>();
          data.forEach((serverMsg) => {
            if (serverMsg && serverMsg.id) {
              msgMap.set(serverMsg.id, serverMsg);
            }
          });

          pendingTemps.forEach((temp) => {
            const alreadyInServer = data.some(
              (s) =>
                s.content.trim() === temp.content.trim() &&
                (s.senderId === temp.senderId || temp.senderId === "me")
            );
            if (!alreadyInServer) {
              msgMap.set(temp.id, temp);
            }
          });

          return {
            messages: {
              ...state.messages,
              [otherUserId]: Array.from(msgMap.values()),
            },
          };
        });
      }
    } catch (err) {
      console.error("fetchMessages error:", err);
    }
  },
  sendMessageAsync: async (receiverId: string, content: string, senderId?: string, senderName?: string) => {
    if (!receiverId || !content.trim()) return;

    const trimmed = content.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const actualSenderId = senderId || "me";
    const actualSenderName = senderName || "Me";

    const tempMsg: Message = {
      id: tempId,
      conversationId: receiverId,
      senderId: actualSenderId,
      senderName: actualSenderName,
      content: trimmed,
      read: false,
      sentAt: new Date().toISOString(),
    };

    // 1. INSTANT OPTIMISTIC UPDATE: 0ms UI latency
    set((state) => {
      const currentList = state.messages[receiverId] || [];
      return {
        messages: {
          ...state.messages,
          [receiverId]: [...currentList, tempMsg],
        },
        isSending: false,
      };
    });

    const socket = getSocket();
    if (socket.connected) {
      socket.emit("send_message", {
        senderId: actualSenderId,
        senderName: actualSenderName,
        receiverId,
        content: trimmed,
      });
    }

    // Always persist to database and Redis inbox stream
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, content: trimmed }),
      });

      if (res.ok) {
        const serverMsg: Message = await res.json();
        set((state) => {
          const currentList = state.messages[receiverId] || [];
          return {
            messages: {
              ...state.messages,
              [receiverId]: currentList.map((m) => (m.id === tempId ? serverMsg : m)),
            },
          };
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("sendMessageAsync error:", err);
      // Keep optimistic message or retry
    }
  },
}));
