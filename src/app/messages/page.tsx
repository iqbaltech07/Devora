"use client";

import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMatchStore } from "@/store/useMatchStore";
import { useChatStore } from "@/store/useChatStore";
import { useUserStore } from "@/store/useUserStore";
import { usePresenceStore } from "@/store/usePresenceStore";
import { useUiStore } from "@/store/useUiStore";
import { Message } from "@/store/types";
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Paperclip,
  Code2,
  Info,
  MoreVertical,
  FolderKanban,
  CheckCheck,
  Rocket,
  Flame,
  Zap,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { ChatPageSkeleton } from "@/components/ui/ChatSkeleton";
import { cn } from "@/lib/utils";

function formatLastSeen(lastSeenIso?: string): string {
  if (!lastSeenIso) return "Offline";
  const date = new Date(lastSeenIso);
  if (isNaN(date.getTime())) return "Offline";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "Online";
  if (diffMins < 60) return `Terakhir online ${diffMins} menit lalu`;

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) {
    return `Terakhir online hari ini ${timeStr}`;
  }

  return `Terakhir online ${date.toLocaleDateString([], { day: "numeric", month: "short" })}`;
}

interface ConversationItem {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  location: string;
  matchScore: number;
  projectTitle: string;
  time: string;
  snippet: string;
  unreadCount: number;
  hasInvitation: boolean;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId") || searchParams.get("targetId");

  const { matchedCandidates, fetchMatches, isLoadingMatches } = useMatchStore();
  const { currentUser, fetchProfile } = useUserStore();
  const { addToast } = useUiStore();
  const {
    messages,
    sendMessageAsync,
    activeConversationId,
    setActiveConversation,
    fetchMessages,
    markAsRead,
    connectSocket,
    connectStream,
  } = useChatStore();

  const {
    presenceMap,
    fetchPresence,
    sendHeartbeat,
    setTyping,
    initSocketListeners,
  } = usePresenceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"CHATS" | "INVITATIONS">("CHATS");
  const [inputText, setInputText] = useState("");
  const [directPartner, setDirectPartner] = useState<ConversationItem | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastReadMsgIdRef = useRef<string | null>(null);

  // 1. Initial Load: Profile, Matches, and Dual Realtime Engine (SSE + Socket.IO)
  useEffect(() => {
    fetchProfile();
    fetchMatches();
    const disconnectSSE = connectStream();
    initSocketListeners();
    const disconnectSocket = connectSocket(currentUser);

    return () => {
      disconnectSSE();
      disconnectSocket();
    };
  }, [fetchProfile, fetchMatches, connectStream, initSocketListeners, connectSocket, currentUser]);

  // 2. Direct partner fetch when query param ?userId= is supplied
  useEffect(() => {
    if (!queryUserId) return;
    setActiveConversation(queryUserId);

    const exists = matchedCandidates.find((c) => c.id === queryUserId);
    if (exists) {
      setDirectPartner({
        id: exists.id,
        name: exists.name,
        title: exists.title,
        avatarUrl: exists.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        location: exists.location || "Indonesia",
        matchScore: exists.matchScore || 95,
        projectTitle: exists.buildingProject?.title || "Proyek Kolaborasi",
        time: "Baru saja",
        snippet: "Mulai obrolan sekarang...",
        unreadCount: 0,
        hasInvitation: false,
      });
    } else {
      fetch(`/api/users/${queryUserId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((userData) => {
          if (userData && userData.id) {
            setDirectPartner({
              id: userData.id,
              name: userData.name || "Developer",
              title: userData.title || "Web Developer",
              avatarUrl: userData.image || userData.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
              location: userData.location || "Indonesia",
              matchScore: 95,
              projectTitle: "Proyek Kolaborasi",
              time: "Baru saja",
              snippet: "Mulai percakapan...",
              unreadCount: 0,
              hasInvitation: false,
            });
          }
        })
        .catch((err) => console.error("Failed to load direct user:", err));
    }
  }, [queryUserId, matchedCandidates, setActiveConversation]);

  // 3. Heartbeat presence
  useEffect(() => {
    if (!currentUser?.id) return;
    sendHeartbeat();
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 20000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [currentUser?.id, sendHeartbeat]);

  // 4. Memoized Conversations Roster (Built 100% dynamically from real database matches)
  const conversations = useMemo(() => {
    const list: ConversationItem[] = [];

    if (directPartner && !matchedCandidates.some((c) => c.id === directPartner.id)) {
      list.push(directPartner);
    }

    matchedCandidates.forEach((candidate) => {
      if (candidate.id && !list.some((c) => c.id === candidate.id)) {
        const partnerMsgs = messages[candidate.id] || [];
        const lastMsg = partnerMsgs[partnerMsgs.length - 1];
        const unread = partnerMsgs.filter((m) => m.senderId === candidate.id && !m.read).length;

        list.push({
          id: candidate.id,
          name: candidate.name,
          title: candidate.title,
          avatarUrl: candidate.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          location: candidate.location || "Indonesia",
          matchScore: candidate.matchScore || 90,
          projectTitle: candidate.buildingProject?.title || "Proyek Kolaborasi",
          time: lastMsg ? new Date(lastMsg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Baru saja",
          snippet: lastMsg ? lastMsg.content : "Mulai percakapan...",
          unreadCount: unread,
          hasInvitation: lastMsg ? lastMsg.content.includes("mengundang") : false,
        });
      }
    });

    return list;
  }, [matchedCandidates, directPartner, messages]);

  // 5. Memoized Active Partner
  const activePartner = useMemo(() => {
    if (activeConversationId) {
      const found = conversations.find((c) => c.id === activeConversationId);
      if (found) return found;
    }
    return conversations[0] || null;
  }, [conversations, activeConversationId]);

  const currentConvId = activePartner?.id || "";
  const activePartnerId = activePartner?.id || "";

  // 6. Memoized Current Messages for Active Conversation
  const currentMessages = useMemo(() => {
    if (!currentConvId) return [];
    const raw = messages[currentConvId] || [];
    const map = new Map<string, Message>();
    raw.forEach((m, idx) => {
      const key = m.id || `msg-${idx}`;
      map.set(key, m);
    });
    return Array.from(map.values());
  }, [messages, currentConvId]);

  // 7. Active Partner Presence Status
  const activePartnerPresence = useMemo(() => {
    if (!activePartner?.id) {
      return { isOnline: false, isTyping: false, lastSeen: "" };
    }
    return (
      presenceMap[activePartner.id] || {
        isOnline: true,
        isTyping: false,
        lastSeen: new Date().toISOString(),
      }
    );
  }, [presenceMap, activePartner?.id]);

  const isPartnerOnline = Boolean(activePartnerPresence.isOnline);

  // 8. Filtered Conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.projectTitle.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const partnerIdsKey = useMemo(
    () => conversations.map((c) => c.id).filter(Boolean).join(","),
    [conversations]
  );

  // 9. Realtime Message Fetching for Selected Partner
  useEffect(() => {
    if (!activePartnerId) return;
    fetchMessages(activePartnerId);
  }, [activePartnerId, fetchMessages]);

  // 10. Fetch Presence for Roster
  useEffect(() => {
    if (!partnerIdsKey) return;
    fetchPresence(partnerIdsKey.split(","), activePartnerId);
  }, [partnerIdsKey, activePartnerId, fetchPresence]);

  // 11. Mark Unread Messages as Read
  useEffect(() => {
    if (!activePartnerId || !currentUser?.id) return;
    const unreadPartnerMsg = currentMessages.find(
      (m) => m.senderId === activePartnerId && !m.read
    );
    if (unreadPartnerMsg && lastReadMsgIdRef.current !== unreadPartnerMsg.id) {
      lastReadMsgIdRef.current = unreadPartnerMsg.id;
      markAsRead(activePartnerId, currentUser.id);
    }
  }, [currentMessages, activePartnerId, currentUser?.id, markAsRead]);

  // 12. Scroll to bottom of message container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages.length, activePartnerPresence.isTyping]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputText(val);

      if (activePartner?.id && currentUser?.id) {
        setTyping(activePartner.id, true, currentUser.id);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setTyping(activePartner.id, false, currentUser.id);
        }, 2000);
      }
    },
    [activePartner?.id, currentUser?.id, setTyping]
  );

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputText.trim() || !activePartnerId) return;

      const text = inputText.trim();
      setInputText("");
      if (activePartner?.id && currentUser?.id) {
        setTyping(activePartner.id, false, currentUser.id);
      }
      sendMessageAsync(activePartnerId, text, currentUser?.id, currentUser?.name);
      inputRef.current?.focus();
    },
    [inputText, activePartnerId, activePartner?.id, currentUser?.id, currentUser?.name, setTyping, sendMessageAsync]
  );

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        {isLoadingMatches && conversations.length === 0 ? (
          <ChatPageSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-sm h-[740px]">
            {/* ─── LEFT SIDEBAR (CHATS & INVITATIONS ROSTER) ─── */}
            <div className="md:col-span-5 lg:col-span-4 border-r border-[#E2E8F0] flex flex-col bg-[#FAF9F5]/40 h-full overflow-hidden">
              {/* Search Bar Header */}
              <div className="p-4 pb-2 space-y-3 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari pesan atau partner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#FF5733] transition-colors"
                  />
                </div>

                {/* Sub-Tabs: Chats */}
                <div className="flex items-center gap-6 border-b border-[#E2E8F0] text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("CHATS")}
                    className={cn(
                      "pb-2 font-bold transition-all relative",
                      activeTab === "CHATS"
                        ? "text-[#0F172A] border-b-2 border-[#FF5733]"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    )}
                  >
                    Chats ({conversations.length})
                  </button>
                </div>
              </div>

              {/* Roster List Stream */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => {
                    const isSelected = activePartner?.id === conv.id;
                    const presence = presenceMap[conv.id];
                    const isOnline = presence ? presence.isOnline : true;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversation(conv.id)}
                        className={cn(
                          "p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-3 text-left relative",
                          isSelected
                            ? "bg-[#FFF1EE] border border-[#FF5733]/30 shadow-xs"
                            : "hover:bg-[#F8FAFC] border border-transparent"
                        )}
                      >
                        {/* Avatar with Online Indicator Dot */}
                        <div className="relative shrink-0 mt-0.5">
                          <Avatar
                            src={conv.avatarUrl}
                            fallback={conv.name.slice(0, 2).toUpperCase()}
                            size="md"
                            className="border border-[#E2E8F0]"
                          />
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                          )}
                        </div>

                        {/* Partner & Message Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-[#0F172A] truncate">
                              {conv.name}
                            </h4>
                            <span className="text-[10px] text-[#94A3B8] font-mono shrink-0">
                              {conv.time}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#64748B] line-clamp-1">
                            {conv.snippet}
                          </p>

                          {/* Project Tag Pill */}
                          <div className="flex items-center justify-between pt-0.5">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-[10px] font-medium max-w-[170px] truncate">
                              <FolderKanban className="w-2.5 h-2.5 text-[#64748B] shrink-0" />
                              <span className="truncate">{conv.projectTitle}</span>
                            </div>

                            {conv.unreadCount > 0 && (
                              <span className="w-4 h-4 rounded-full bg-[#FF5733] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-[#64748B] space-y-3">
                    <p>Belum ada obrolan aktif.</p>
                    <Link href="/find-partner">
                      <Button size="sm" className="text-xs bg-[#FF5733] text-white font-bold rounded-full">
                        Cari Partner Sekarang
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ─── RIGHT MAIN CHAT AREA ─── */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full bg-white overflow-hidden">
              {activePartner ? (
                <>
                  {/* Active Header */}
                  <div className="p-3.5 sm:p-4 border-b border-[#E2E8F0] bg-white flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <Avatar
                          src={activePartner.avatarUrl}
                          fallback={activePartner.name.slice(0, 2).toUpperCase()}
                          size="md"
                          className="border border-[#E2E8F0]"
                        />
                        {isPartnerOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">
                          {activePartner.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {activePartnerPresence.isTyping ? (
                            <span className="font-semibold text-[#FF5733] animate-pulse">Sedang mengetik...</span>
                          ) : isPartnerOnline ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="font-semibold text-emerald-600">Online</span>
                            </>
                          ) : (
                            <span className="text-[#64748B]">{formatLastSeen(activePartnerPresence.lastSeen)}</span>
                          )}
                          <span className="text-[#94A3B8]">•</span>
                          <span className="text-[#64748B]">{activePartner.title}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Top Header Actions */}
                    <div className="flex items-center gap-1 text-[#64748B]">
                      <Link href={`/find-partner?roles=${encodeURIComponent(activePartner.title)}`}>
                        <button
                          type="button"
                          title="Cari Partner Serupa"
                          className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-white"
                  >
                    {currentMessages.length > 0 ? (
                      currentMessages.map((msg) => {
                        const isMe = msg.senderId === currentUser?.id || msg.senderId === "me";
                        const timeFormatted = msg.sentAt
                          ? new Date(msg.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "";

                        const isInvitationMsg =
                          msg.content.includes("mengundang") ||
                          msg.content.includes("UNDANGAN KOLABORASI PROYEK") ||
                          msg.content.includes("berkolaborasi di proyek");

                        if (isInvitationMsg) {
                          return (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%]",
                                isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                              )}
                            >
                              {!isMe && (
                                <Avatar
                                  src={activePartner.avatarUrl}
                                  fallback={activePartner.name.slice(0, 2).toUpperCase()}
                                  size="sm"
                                  className="shrink-0 mt-1"
                                />
                              )}
                              <div className="space-y-1 w-full">
                                <div className="bg-white border-2 border-[#FF5733]/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden text-left">
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5733]" />
                                  <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#FFF1EE] text-[#FF5733] flex items-center justify-center shrink-0">
                                      <Rocket className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                                        UNDANGAN KOLABORASI PROYEK 🚀
                                      </span>
                                      <p className="text-xs sm:text-sm font-extrabold text-[#FF5733]">
                                        {msg.content}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-1 border-t border-[#E2E8F0]">
                                    <Link href="/projects">
                                      <Button
                                        size="sm"
                                        className="text-xs bg-[#FF5733] hover:bg-[#D9411E] text-white font-bold gap-1 rounded-xl"
                                      >
                                        <FolderKanban className="w-3.5 h-3.5" />
                                        <span>Buka Halaman Proyek</span>
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                                <div
                                  className={cn(
                                    "text-[10px] text-[#94A3B8] font-mono",
                                    isMe ? "text-right pr-1" : "pl-1"
                                  )}
                                >
                                  {timeFormatted}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%]",
                              isMe ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "p-3.5 text-xs leading-relaxed shadow-xs text-left",
                                isMe
                                  ? "bg-[#FF5733] text-white rounded-2xl rounded-tr-xs"
                                  : "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-2xl rounded-tl-xs"
                              )}
                            >
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] font-mono px-1">
                              <span>{timeFormatted}</span>
                              {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#94A3B8]" />}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-16 text-center space-y-2 text-xs text-[#64748B]">
                        <div className="w-12 h-12 rounded-full bg-[#FFF1EE] text-[#FF5733] flex items-center justify-center mx-auto shadow-xs">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-[#0F172A] text-sm">
                          Mulai Obrolan dengan {activePartner.name}
                        </h4>
                        <p className="max-w-xs mx-auto text-[#64748B]">
                          Sapa sekarang untuk mendiskusikan ide proyek, kecocokan stack, atau jadwal ngoding bareng!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Chat Input Bar */}
                  <div className="p-3 border-t border-[#E2E8F0] bg-white space-y-1.5">
                    <form
                      onSubmit={handleSendMessage}
                      className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 sm:p-2 flex items-center gap-2 shadow-xs"
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder={`Tulis pesan untuk ${activePartner.name}...`}
                        className="flex-1 bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none px-3"
                      />

                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="w-8 h-8 rounded-xl bg-[#FF5733] hover:bg-[#D9411E] text-white flex items-center justify-center shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>

                    <p className="text-[10px] text-[#94A3B8] text-center">
                      Tekan Enter untuk mengirim pesan real-time
                    </p>
                  </div>
                </>
              ) : (
                /* No conversation selected / Empty State */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFF1EE] text-[#FF5733] flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-bold text-[#0F172A]">
                      Belum Ada Percakapan yang Dipilih
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Pilih salah satu teman yang cocok di daftar samping, atau cari partner baru di halaman Cari Partner!
                    </p>
                  </div>
                  <Link href="/find-partner">
                    <Button size="sm" className="bg-[#FF5733] hover:bg-[#D9411E] text-white font-bold text-xs rounded-full gap-1.5">
                      <Flame className="w-3.5 h-3.5 fill-white" />
                      <span>Cari Partner Baru</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<ChatPageSkeleton />}>
      <MessagesContent />
    </Suspense>
  );
}
