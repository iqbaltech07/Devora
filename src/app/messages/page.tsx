"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Avatar } from "@/components/ui/avatar";
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
  Check,
  Rocket,
  Flame,
  Zap,
  Radio,
  Clock,
  Sparkles,
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

interface InvitationItem {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  projectTitle: string;
  roleTitle: string;
  hoursPerWeek: number;
  requiredSkills: string[];
  sentAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

const DEFAULT_INVITATIONS: InvitationItem[] = [
  {
    id: "inv-1",
    partnerId: "candidate-rifqi-1",
    partnerName: "Muhammad Rifqi",
    partnerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    projectTitle: "SaaS Inventory Platform",
    roleTitle: "Backend Developer",
    hoursPerWeek: 10,
    requiredSkills: ["Node.js", "PostgreSQL", "Docker"],
    sentAt: "10:42 AM",
    status: "PENDING",
  },
  {
    id: "inv-2",
    partnerId: "candidate-sarah-2",
    partnerName: "Sarah Wijaya",
    partnerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    projectTitle: "Fintech Dashboard App",
    roleTitle: "Frontend & UI/UX Specialist",
    hoursPerWeek: 8,
    requiredSkills: ["Next.js", "Tailwind CSS", "TypeScript"],
    sentAt: "Kemarin",
    status: "PENDING",
  },
];

export default function MessagesPage() {
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
  const [activeTab, setActiveTab] = useState<"CHATS" | "INVITATIONS">("CHATS");
  const [inputText, setInputText] = useState("");
  const [invitations, setInvitations] = useState<InvitationItem[]>(DEFAULT_INVITATIONS);
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

  // 3. Memoized Conversations Roster (Built from real matches + realistic seeds)
  const conversations = useMemo(() => {
    const list = [
      {
        id: "candidate-rifqi-1",
        name: "Muhammad Rifqi",
        title: "Fullstack Architect",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        location: "Jakarta, Indonesia",
        matchScore: 98,
        projectTitle: "SaaS Inventory Platform",
        time: "10:42 AM",
        snippet: "Saya sudah kirim undangan proyeknya ya...",
        unreadCount: 0,
        hasInvitation: true,
      },
      {
        id: "candidate-sarah-2",
        name: "Sarah Wijaya",
        title: "UI/UX & Frontend Specialist",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        location: "Bandung, Indonesia",
        matchScore: 94,
        projectTitle: "Fintech Dashboard App",
        time: "Kemarin",
        snippet: "Bisa kita discuss untuk frontend...",
        unreadCount: 1,
        hasInvitation: true,
      },
      {
        id: "candidate-budi-3",
        name: "Budi Santoso",
        title: "DevOps & Cloud Engineer",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        location: "Surabaya, Indonesia",
        matchScore: 90,
        projectTitle: "Cloud Scaling Platform",
        time: "Senin",
        snippet: "Terima kasih atas kontribusinya!",
        unreadCount: 0,
        hasInvitation: false,
      },
    ];

    // Merge in matched candidates from store
    matchedCandidates.forEach((candidate) => {
      if (candidate.id && !list.some((c) => c.id === candidate.id)) {
        list.push({
          id: candidate.id,
          name: candidate.name,
          title: candidate.title,
          avatarUrl: candidate.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          location: candidate.location || "Indonesia",
          matchScore: candidate.matchScore,
          projectTitle: candidate.buildingProject?.title || "Proyek Kolaborasi",
          time: "Baru saja",
          snippet: "Mulai obrolan sekarang...",
          unreadCount: 0,
          hasInvitation: false,
        });
      }
    });

    return list;
  }, [matchedCandidates]);

  // 4. Memoized Active Partner
  const activePartner = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConversationId) ||
      conversations[0]
    );
  }, [conversations, activeConversationId]);

  const currentConvId = activePartner.id;
  const activePartnerId = activePartner.id;

  // 5. Memoized Current Messages
  const currentMessages = useMemo(() => {
    const raw = messages[currentConvId] || [];
    
    // Seed realistic conversation for Muhammad Rifqi if empty
    if (raw.length === 0 && currentConvId === "candidate-rifqi-1") {
      return [
        {
          id: "seed-msg-1",
          conversationId: "candidate-rifqi-1",
          senderId: currentUser?.id || "me",
          senderName: currentUser?.name || "Saya",
          content: "Halo Rifqi! Terima kasih. Boleh ceritakan sedikit tentang proyek yang sedang kamu kerjakan?",
          read: true,
          sentAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "seed-msg-2",
          conversationId: "candidate-rifqi-1",
          senderId: "candidate-rifqi-1",
          senderName: "Muhammad Rifqi",
          content: "Tentu, ini adalah platform manajemen inventori berbasis SaaS. Kami butuh bantuan untuk setup API dan database. Saya sudah kirim undangan proyeknya ya.",
          read: true,
          sentAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
    }

    const map = new Map<string, Message>();
    raw.forEach((m, idx) => {
      const key = m.id || `msg-${idx}`;
      map.set(key, m);
    });
    return Array.from(map.values());
  }, [messages, currentConvId, currentUser?.id, currentUser?.name]);

  // 6. Active Partner Presence Status
  const activePartnerPresence = useMemo(() => {
    return (
      presenceMap[activePartner.id] || {
        isOnline: true,
        isTyping: false,
        lastSeen: new Date().toISOString(),
      }
    );
  }, [presenceMap, activePartner.id]);

  const isPartnerOnline = Boolean(activePartnerPresence.isOnline);

  // 7. Filtered Conversations
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

  // 8. Realtime Message Fetching
  useEffect(() => {
    if (!activePartnerId) return;
    fetchMessages(activePartnerId);
  }, [activePartnerId, fetchMessages]);

  // 9. Fetch Presence
  useEffect(() => {
    if (!partnerIdsKey) return;
    fetchPresence(partnerIdsKey.split(","), activePartnerId);
  }, [partnerIdsKey, activePartnerId, fetchPresence]);

  // 10. Mark Unread Messages as Read
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

  // 11. Scroll to bottom of message container
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
      if (!inputText.trim()) return;

      const text = inputText.trim();
      setInputText("");
      if (activePartner?.id && currentUser?.id) {
        setTyping(activePartner.id, false, currentUser.id);
      }
      sendMessageAsync(currentConvId, text, currentUser?.id, currentUser?.name);
      inputRef.current?.focus();
    },
    [inputText, activePartner?.id, currentUser?.id, currentUser?.name, setTyping, sendMessageAsync, currentConvId]
  );

  const handleAcceptInvitation = (partnerId: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.partnerId === partnerId ? { ...inv, status: "ACCEPTED" } : inv
      )
    );
    addToast({
      title: "Undangan Diterima! 🎉",
      description: `Kamu telah bergabung dengan proyek ${activePartner.projectTitle}.`,
      type: "success",
    });
  };

  const handleRejectInvitation = (partnerId: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.partnerId === partnerId ? { ...inv, status: "REJECTED" } : inv
      )
    );
    addToast({
      title: "Undangan Ditolak",
      description: "Undangan kolaborasi proyek telah dibatalkan.",
      type: "info",
    });
  };

  const pendingInvitationsCount = invitations.filter((inv) => inv.status === "PENDING").length;

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        {isLoadingMatches && conversations.length === 0 ? (
          <ChatPageSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-sm h-[720px]">
            {/* ─── LEFT SIDEBAR (CHATS & INVITATIONS ROSTER) ─── */}
            <div className="md:col-span-5 lg:col-span-4 border-r border-[#E2E8F0] flex flex-col bg-[#FAF9F5]/40 h-full overflow-hidden">
              {/* Search Bar Header */}
              <div className="p-4 pb-2 space-y-3 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari pesan atau proyek..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#FF5733] transition-colors"
                  />
                </div>

                {/* Sub-Tabs: Chats & Invitations (Exact Gambar 2 Style) */}
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
                    Chats
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("INVITATIONS")}
                    className={cn(
                      "pb-2 font-semibold transition-all flex items-center gap-1.5 relative",
                      activeTab === "INVITATIONS"
                        ? "text-[#0F172A] font-bold border-b-2 border-[#FF5733]"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    )}
                  >
                    <span>Invitations</span>
                    {pendingInvitationsCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#FF5733] text-white text-[10px] font-bold flex items-center justify-center">
                        {pendingInvitationsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Roster List Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain">
                {activeTab === "CHATS" ? (
                  filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => {
                      const isActive = conv.id === activePartner.id;
                      const partnerPresence = presenceMap[conv.id];
                      const isOnline = partnerPresence?.isOnline ?? true;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => setActiveConversation(conv.id)}
                          className={cn(
                            "p-3 rounded-2xl transition-all cursor-pointer text-left flex items-start gap-3 relative",
                            isActive
                              ? "bg-white border border-[#E2E8F0] shadow-xs"
                              : "hover:bg-white/80"
                          )}
                        >
                          {/* Avatar with Online Dot */}
                          <div className="relative shrink-0 mt-0.5">
                            <Avatar
                              src={conv.avatarUrl}
                              fallback={conv.name.slice(0, 2).toUpperCase()}
                              size="md"
                              className="border border-[#E2E8F0]"
                            />
                            <span
                              className={cn(
                                "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                                isOnline ? "bg-emerald-500" : "bg-slate-400"
                              )}
                            />
                          </div>

                          {/* Info Column */}
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
                    <div className="p-6 text-center text-xs text-[#64748B] space-y-2">
                      <p>Tidak ada percakapan yang cocok.</p>
                    </div>
                  )
                ) : (
                  /* INVITATIONS LIST TAB */
                  <div className="space-y-2.5">
                    {invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-2 text-left"
                      >
                        <div className="flex items-start gap-2.5">
                          <Avatar
                            src={inv.partnerAvatar}
                            fallback={inv.partnerName.slice(0, 2).toUpperCase()}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#0F172A] truncate">
                              {inv.partnerName}
                            </h4>
                            <p className="text-[11px] text-[#FF5733] font-bold truncate">
                              {inv.projectTitle}
                            </p>
                            <span className="text-[10px] text-[#64748B]">
                              Peran: {inv.roleTitle}
                            </span>
                          </div>
                        </div>

                        {inv.status === "PENDING" ? (
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAcceptInvitation(inv.partnerId)}
                              className="flex-1 py-1 rounded-xl bg-[#FF5733] hover:bg-[#D9411E] text-white text-[10px] font-bold transition-all shadow-xs"
                            >
                              Terima
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectInvitation(inv.partnerId)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-[#64748B] text-[10px] font-semibold transition-colors"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-center">
                            {inv.status === "ACCEPTED" ? "✓ Telah Diterima" : "✕ Ditolak"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─── RIGHT MAIN CHAT AREA (WhatsApp + Editorial Style) ─── */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full bg-white overflow-hidden">
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
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">
                      {activePartner.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-emerald-600">Online</span>
                    </div>
                  </div>
                </div>

                {/* Right Top Header Actions */}
                <div className="flex items-center gap-1 text-[#64748B]">
                  <button
                    type="button"
                    title="Informasi Partner"
                    className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Opsi Lanjutan"
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-white"
              >
                {/* 1. Sent Message (From Me - Vibrant Coral Pill) */}
                <div className="flex flex-col items-end space-y-1 max-w-[85%] sm:max-w-[75%] ml-auto">
                  <div className="bg-[#FF5733] text-white rounded-2xl rounded-tr-xs p-3.5 text-xs leading-relaxed shadow-sm">
                    Halo Rifqi! Terima kasih. Boleh ceritakan sedikit tentang proyek yang sedang kamu kerjakan?
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] font-mono pr-1">
                    <span>10:35 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#94A3B8]" />
                  </div>
                </div>

                {/* 2. Received Message (From Partner - Clean White Box) */}
                <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] mr-auto">
                  <Avatar
                    src={activePartner.avatarUrl}
                    fallback={activePartner.name.slice(0, 2).toUpperCase()}
                    size="sm"
                    className="shrink-0 mt-1"
                  />
                  <div className="space-y-1">
                    <div className="bg-white border border-[#E2E8F0] text-[#0F172A] rounded-2xl rounded-tl-xs p-3.5 text-xs leading-relaxed shadow-xs">
                      Tentu, ini adalah platform manajemen inventori berbasis SaaS. Kami butuh bantuan untuk setup API dan database. Saya sudah kirim undangan proyeknya ya.
                    </div>
                    <div className="text-[10px] text-[#94A3B8] font-mono pl-1">
                      10:42 AM
                    </div>
                  </div>
                </div>

                {/* 3. Rich Collaboration Invitation Card (Undangan Kolaborasi Proyek) */}
                <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%] mr-auto">
                  <Avatar
                    src={activePartner.avatarUrl}
                    fallback={activePartner.name.slice(0, 2).toUpperCase()}
                    size="sm"
                    className="shrink-0 mt-1"
                  />
                  <div className="space-y-1 w-full">
                    <div className="bg-white border-2 border-[#FF5733]/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden">
                      {/* Top Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF5733]" />

                      {/* Header with Rocket Icon */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FFF1EE] text-[#FF5733] flex items-center justify-center shrink-0">
                          <Rocket className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                            UNDANGAN KOLABORASI PROYEK
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">
                            {activePartner.name} mengundang kamu ke:
                          </h4>
                          <p className="text-xs sm:text-sm font-extrabold text-[#FF5733]">
                            "{activePartner.projectTitle || "SaaS Inventory Platform"}"
                          </p>
                        </div>
                      </div>

                      {/* Role & Time Commitment Grid Box */}
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-[#64748B] block font-medium">Peran</span>
                          <span className="font-bold text-[#0F172A]">{activePartner.title || "Backend Developer"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B] block font-medium">Komitmen Waktu</span>
                          <span className="font-bold text-[#0F172A]">10 jam/minggu</span>
                        </div>
                      </div>

                      {/* Required Skills Chips */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-[#64748B] font-medium block">
                          Skill yang Dibutuhkan:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {["Node.js", "PostgreSQL"].map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-semibold text-[#0F172A] shadow-xs"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAcceptInvitation(activePartner.id)}
                          className="px-4 py-2 rounded-xl bg-[#FF5733] hover:bg-[#D9411E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          <span>Terima Undangan</span>
                        </button>
                        <Link href="/projects">
                          <button
                            type="button"
                            className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] text-xs font-bold transition-colors"
                          >
                            Lihat Proyek
                          </button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRejectInvitation(activePartner.id)}
                          className="px-3 py-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#94A3B8] font-mono pl-1">
                      10:42 AM
                    </div>
                  </div>
                </div>

                {/* Extra dynamic messages if any */}
                {currentMessages.slice(2).map((msg) => {
                  const isMe = msg.senderId !== activePartner.id;
                  const timeFormatted = new Date(msg.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

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
                          "p-3.5 text-xs leading-relaxed shadow-sm",
                          isMe
                            ? "bg-[#FF5733] text-white rounded-2xl rounded-tr-xs"
                            : "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-2xl rounded-tl-xs"
                        )}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] font-mono pr-1">
                        <span>{timeFormatted}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#94A3B8]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar & Subtext */}
              <div className="p-3 border-t border-[#E2E8F0] bg-white space-y-1.5">
                <form
                  onSubmit={handleSendMessage}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 sm:p-2 flex items-center gap-2 shadow-xs"
                >
                  {/* Left Tool Icons */}
                  <div className="flex items-center gap-1 text-[#64748B] pl-1">
                    <button
                      type="button"
                      title="Lampirkan File"
                      className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Kirim Kode (Code Snippet)"
                      className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                    >
                      <Code2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Tulis pesan..."
                    className="flex-1 bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none px-2"
                  />

                  {/* Send Button (Orange Square with Send icon) */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-8 h-8 rounded-xl bg-[#FF5733] hover:bg-[#D9411E] text-white flex items-center justify-center shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Subtext info */}
                <p className="text-[10px] text-[#94A3B8] text-center">
                  Tekan Enter untuk mengirim, Shift + Enter untuk baris baru
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
