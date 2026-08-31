"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useMatchStore } from "@/store/useMatchStore";
import { useChatStore } from "@/store/useChatStore";
import { useUserStore } from "@/store/useUserStore";
import { usePresenceStore } from "@/store/usePresenceStore";
import { Message } from "@/store/types";
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Flame,
  Clock,
  MapPin,
  Check,
  CheckCheck,
  Radio,
  Sparkles,
  Zap,
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

  if (diffMins < 1) return "Terakhir online baru saja";
  if (diffMins < 60) return `Terakhir online ${diffMins} menit lalu`;

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) {
    return `Terakhir online hari ini pukul ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Terakhir online kemarin pukul ${timeStr}`;
  }

  return `Terakhir online ${date.toLocaleDateString([], { day: "numeric", month: "short" })} pukul ${timeStr}`;
}

export default function MessagesPage() {
  const { matchedCandidates, fetchMatches, isLoadingMatches } = useMatchStore();
  const { currentUser, fetchProfile, isLoadingProfile } = useUserStore();
  const {
    messages,
    sendMessageAsync,
    activeConversationId,
    setActiveConversation,
    fetchMessages,
    markAsRead,
    connectSocket,
    connectStream,
    isSocketConnected,
    isStreamConnected,
  } = useChatStore();

  const {
    presenceMap,
    fetchPresence,
    sendHeartbeat,
    setTyping,
    initSocketListeners,
  } = usePresenceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // 2. Heartbeat presence
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

  // 3. Memoized Conversations Roster (prevents re-allocation on every render)
  const conversations = useMemo(() => {
    const map = new Map<string, any>();
    matchedCandidates.forEach((candidate) => {
      if (candidate.id && !map.has(candidate.id)) {
        map.set(candidate.id, {
          id: candidate.id,
          name: candidate.name,
          title: candidate.title,
          avatarUrl: candidate.avatarUrl,
          location: candidate.location,
          matchScore: candidate.matchScore,
          projectTitle: candidate.buildingProject?.title || "Proyek Kolaborasi",
        });
      }
    });
    return Array.from(map.values());
  }, [matchedCandidates]);

  // 4. Memoized Active Partner
  const activePartner = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConversationId) ||
      conversations[0] || {
        id: "candidate-alex-1",
        name: "Alex Rivera",
        title: "Staff Backend Engineer",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        location: "Tokyo, Japan",
        matchScore: 95,
        projectTitle: "Devora",
      }
    );
  }, [conversations, activeConversationId]);

  const currentConvId = activePartner.id;
  const activePartnerId = activePartner.id;

  // 5. Memoized Current Messages (Deduplicated with rock-solid reference stability)
  const currentMessages = useMemo(() => {
    const raw = messages[currentConvId] || [];
    const map = new Map<string, Message>();
    raw.forEach((m, idx) => {
      const key = m.id || `msg-${idx}`;
      map.set(key, m);
    });
    return Array.from(map.values());
  }, [messages, currentConvId]);

  // 6. Memoized Active Partner Presence Status
  const activePartnerPresence = useMemo(() => {
    return (
      presenceMap[activePartner.id] || {
        isOnline: false,
        isTyping: false,
        lastSeen: new Date().toISOString(),
      }
    );
  }, [presenceMap, activePartner.id]);

  const isPartnerOnline = Boolean(activePartnerPresence.isOnline);

  // 7. Memoized Filtered Conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // 8. Memoized Partner IDs Key (Primitive string to prevent array reference re-triggers)
  const partnerIdsKey = useMemo(
    () => conversations.map((c) => c.id).filter(Boolean).join(","),
    [conversations]
  );

  // 9. Fetch Active Messages & Realtime Poll Sync
  useEffect(() => {
    if (!activePartnerId) return;
    fetchMessages(activePartnerId);

    // Calm 4s background sync for ultra-reliable message arrival
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchMessages(activePartnerId);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [activePartnerId, fetchMessages]);

  // 10. Fetch Presence for partners list
  useEffect(() => {
    if (!partnerIdsKey) return;
    fetchPresence(partnerIdsKey.split(","), activePartnerId);

    const presenceInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchPresence(partnerIdsKey.split(","), activePartnerId);
      }
    }, 10000);

    return () => clearInterval(presenceInterval);
  }, [partnerIdsKey, activePartnerId, fetchPresence]);

  // 11. Mark Unread Messages as Read (Guarded with Ref to execute at most ONCE per unread message)
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

  // 12. ISOLATED INTERNAL SCROLL: Scroll to bottom strictly inside messages container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages.length, activePartnerPresence.isTyping]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      if (!inputText.trim()) return;

      const text = inputText.trim();
      setInputText("");
      if (activePartner?.id && currentUser?.id) {
        setTyping(activePartner.id, false, currentUser.id);
      }
      sendMessageAsync(currentConvId, text, currentUser?.id, currentUser?.name);
      textareaRef.current?.focus();
    },
    [inputText, activePartner?.id, currentUser?.id, currentUser?.name, setTyping, sendMessageAsync, currentConvId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    },
    [handleSendMessage]
  );

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-devora-border pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-devora-ink tracking-tight flex items-center gap-2">
              <span>Pesan & Obrolan Realtime</span>
              {isSocketConnected ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-xs">
                  <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500 animate-pulse" />
                  <span>Socket.IO Active</span>
                </span>
              ) : isStreamConnected ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-xs">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>Realtime Stream Active</span>
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Realtime Connected</span>
                </span>
              )}
            </h1>
            <p className="text-xs text-devora-muted mt-0.5">
              Ruang diskusi langsung dengan teman ngoding yang sudah cocok sama kamu.
            </p>
          </div>

          <Link href="/matches">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Daftar Teman Cocok</span>
            </Button>
          </Link>
        </div>

        {/* 2-Column Chat Interface or Loading Skeleton */}
        {isLoadingMatches && conversations.length === 0 ? (
          <ChatPageSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-[620px] sm:h-[680px] bg-devora-surface border-2 border-devora-border rounded-container overflow-hidden shadow-sm animate-in fade-in duration-200">
          {/* Left Sidebar: Contact / Conversation Roster */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-devora-border flex flex-col bg-devora-surface-strong/30 h-full overflow-hidden min-h-0">
            {/* Search Input (Fixed Header in Sidebar) */}
            <div className="p-3 border-b border-devora-border bg-devora-surface shrink-0 z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-devora-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari obrolan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-devora-background border border-devora-border rounded-button text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand"
                />
              </div>
            </div>

            {/* Conversation List (Scrollable only here) */}
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-devora-border/60 overscroll-contain">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activePartner.id;
                  const candidateMsgs = messages[conv.id] || (conv.id === "candidate-alex-1" ? messages["conv-alex-1"] : []);
                  const lastMsg = candidateMsgs[candidateMsgs.length - 1];
                  const partnerPresence = presenceMap[conv.id];
                  const isOnline = Boolean(partnerPresence?.isOnline);

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversation(conv.id)}
                      className={cn(
                        "p-3 flex items-start gap-3 cursor-pointer transition-colors text-left relative",
                        isActive
                          ? "bg-devora-surface border-l-4 border-devora-brand shadow-xs"
                          : "hover:bg-devora-surface/80"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar
                          src={conv.avatarUrl}
                          fallback={conv.name.slice(0, 2).toUpperCase()}
                          size="md"
                          className="border border-devora-border"
                        />
                        {isOnline ? (
                          <span
                            title="Online Sekarang"
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-devora-surface rounded-full shadow-xs"
                          />
                        ) : (
                          <span
                            title="Offline"
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-devora-muted/60 border-2 border-devora-surface rounded-full"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h2 className="text-xs font-bold text-devora-ink truncate">
                            {conv.name}
                          </h2>
                          <span className="text-[10px] text-devora-brand font-bold shrink-0">
                            {conv.matchScore}% Fit
                          </span>
                        </div>
                        <p className="text-[11px] text-devora-muted truncate">
                          {conv.title}
                        </p>
                        <p className="text-[11px] text-devora-ink-soft truncate font-normal">
                          {lastMsg ? lastMsg.content : "Klik untuk mulai obrolan..."}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-devora-muted space-y-2">
                  <p>Belum ada obrolan lain.</p>
                  <Link href="/find-partner">
                    <Button size="sm" className="text-[11px] gap-1 bg-devora-brand text-white">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>Swipe Partner</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Main Column: Direct Active Chat (WhatsApp Style) */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full bg-devora-background/95 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden min-h-0 relative">
            {/* Active Chat Header (Permanently Sticky / Pinned at Top) */}
            <div className="p-3 sm:p-4 border-b border-devora-border bg-devora-surface/95 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0 shadow-2xs z-10">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <Avatar
                    src={activePartner.avatarUrl}
                    fallback={activePartner.name.slice(0, 2).toUpperCase()}
                    size="md"
                    className="border border-devora-border"
                  />
                  {isPartnerOnline ? (
                    <span
                      title="Online Sekarang"
                      className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-devora-surface rounded-full shadow-xs"
                    />
                  ) : (
                    <span
                      title="Offline"
                      className="absolute bottom-0 right-0 w-3 h-3 bg-devora-muted/60 border-2 border-devora-surface rounded-full"
                    />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-devora-ink">
                      {activePartner.name}
                    </h2>
                    <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-bold">
                      {activePartner.matchScore}% Match
                    </Badge>
                  </div>

                  {/* WhatsApp Status Subtitle (Online / Typing / Last Seen) */}
                  <div className="flex items-center gap-2 text-[11px]">
                    {activePartnerPresence.isTyping ? (
                      <span className="text-devora-brand font-bold animate-pulse">
                        sedang mengetik...
                      </span>
                    ) : isPartnerOnline ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>Online</span>
                      </span>
                    ) : (
                      <span className="text-devora-muted font-normal">
                        {formatLastSeen(activePartnerPresence.lastSeen)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Extra Header Info */}
              <div className="flex items-center gap-2 text-xs text-devora-muted font-mono">
                <span className="hidden sm:inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-devora-brand" />
                  {activePartner.location.split("(")[0]}
                </span>
              </div>
            </div>

            {/* Messages Stream Container (ONLY this inner area scrolls) */}
            <div
              ref={messagesContainerRef}
              className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-0 space-y-3 overscroll-contain"
            >
              {/* Date Notice Pill */}
              <div className="flex justify-center my-1">
                <span className="text-[10px] font-mono font-medium px-3 py-1 bg-devora-surface-strong/80 text-devora-muted border border-devora-border/60 rounded-full shadow-2xs backdrop-blur-xs">
                  Percakapan Terenkripsi & Realtime
                </span>
              </div>

              {currentMessages.length > 0 ? (
                currentMessages.map((msg) => {
                  // DEFINITIVE LEFT/RIGHT POSITIONING:
                  // If msg.senderId === activePartner.id -> Lawan Bicara (KIRI)
                  // If msg.senderId !== activePartner.id -> Saya Sendiri (KANAN)
                  const isMe = msg.senderId !== activePartner.id;
                  const timeFormatted = new Date(msg.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%] sm:max-w-[70%] space-y-0.5 animate-in fade-in-50 duration-150",
                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      {/* Message Bubble Container */}
                      <div
                        className={cn(
                          "px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-sm transition-all",
                          isMe
                            ? "bg-devora-brand text-white rounded-2xl rounded-tr-xs font-medium"
                            : "bg-devora-surface text-devora-ink border border-devora-border rounded-2xl rounded-tl-xs font-normal"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* WhatsApp-Style Bottom Status Info */}
                        <div
                          className={cn(
                            "flex items-center justify-end gap-1.5 mt-1 text-[10px] font-mono select-none pt-0.5",
                            isMe ? "text-white/80" : "text-devora-muted"
                          )}
                        >
                          <span>{timeFormatted}</span>

                          {/* CENTANG SYSTEM UNTUK PESAN SAYA (KANAN) */}
                          {isMe && (
                            <span title={msg.read ? "Sudah dibaca" : isPartnerOnline ? "Terkirim (User Online)" : "Terkirim (User Offline)"}>
                              {msg.read ? (
                                // Centang 2 ORANGE (Sudah Dibaca)
                                <CheckCheck className="w-3.5 h-3.5 text-amber-300 stroke-[2.5]" />
                              ) : isPartnerOnline ? (
                                // Centang 2 ABU-ABU / WHITE (User Online tapi belum baca)
                                <CheckCheck className="w-3.5 h-3.5 text-white/70 stroke-[2]" />
                              ) : (
                                // Centang 1 (User Offline)
                                <Check className="w-3.5 h-3.5 text-white/60 stroke-[2]" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-devora-surface border border-devora-border flex items-center justify-center text-devora-brand shadow-xs">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h3 className="text-sm font-bold text-devora-ink">
                      Mulai Obrolan dengan {activePartner.name}
                    </h3>
                    <p className="text-xs text-devora-muted leading-relaxed">
                      Sapa mereka, tanyakan stack proyek, atau diskusikan jadwal sesi ngoding bareng!
                    </p>
                  </div>
                </div>
              )}

              {/* Minimal Compact Typing Indicator (Tanpa Profile, Sleek WhatsApp Style) */}
              {activePartnerPresence.isTyping && (
                <div className="mr-auto flex items-center gap-1.5 px-3 py-2 bg-devora-surface border border-devora-border rounded-2xl rounded-tl-xs shadow-xs w-fit animate-in fade-in slide-in-from-bottom-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-devora-brand animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-devora-brand animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-devora-brand animate-bounce"></span>
                </div>
              )}
            </div>

            {/* Chat Input Bar (Permanently Sticky / Pinned at Bottom) */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-devora-border bg-devora-surface flex items-center gap-2 shrink-0 shadow-2xs z-10"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Ketik pesan ke ${activePartner.name}... (Enter untuk kirim)`}
                className="flex-1 px-4 py-2 text-xs bg-devora-background border border-devora-border rounded-button text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand resize-none leading-relaxed min-h-[38px] max-h-[100px]"
              />

              <Button
                type="submit"
                size="md"
                disabled={!inputText.trim()}
                className="bg-devora-brand text-white hover:bg-devora-brand-dark font-bold px-4 py-2 shrink-0 gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs font-semibold">Kirim</span>
              </Button>
            </form>
          </div>
        </div>
        )}
      </div>
    </Shell>
  );
}
