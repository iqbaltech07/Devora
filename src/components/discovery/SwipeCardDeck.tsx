"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMatchStore } from "@/store/useMatchStore";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { useChatStore } from "@/store/useChatStore";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Heart,
  RotateCcw,
  Info,
  MapPin,
  Clock,
  CheckCircle2,
  Code2,
  Zap,
  Flame,
  Filter,
  FolderKanban,
  Palette,
  Server,
  Layout,
  Bot,
  Layers,
  Smartphone,
  Cloud,
  Compass,
  Eye,
  Rocket,
  Award,
  FolderGit2,
  Briefcase,
  GraduationCap,
  ExternalLink,
  GitBranch,
} from "lucide-react";
import { SwipeCardSkeleton } from "@/components/ui/SwipeCardSkeleton";
import { cn } from "@/lib/utils";

const PROFESSION_TABS = [
  { label: "Semua", key: "ALL", icon: Compass },
  { label: "UI/UX", key: "UI/UX", icon: Palette },
  { label: "Backend", key: "BACKEND", icon: Server },
  { label: "Frontend", key: "FRONTEND", icon: Layout },
  { label: "AI & ML", key: "AI", icon: Bot },
  { label: "Fullstack", key: "FULLSTACK", icon: Layers },
  { label: "Mobile", key: "MOBILE", icon: Smartphone },
  { label: "DevOps", key: "DEVOPS", icon: Cloud },
];

export function SwipeCardDeck() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryRoles = searchParams.get("roles");
  const queryProject = searchParams.get("project");
  const inviteProjectId = searchParams.get("inviteProjectId");
  const inviteProjectTitle = searchParams.get("projectTitle") || queryProject;
  const isInviteMode = Boolean(inviteProjectId);

  const { addToast } = useUiStore();
  const { sendMessageAsync } = useChatStore();

  const [selectedProfession, setSelectedProfession] = useState<string>("ALL");
  const [projectRolesFilter, setProjectRolesFilter] = useState<string[]>([]);

  const {
    candidates,
    swipedIds,
    matchedCandidates,
    swipeLeft,
    swipeRight,
    undoSwipe,
    resetDeck,
    lastAction,
    inspectingCandidate,
    setInspectingCandidate,
    showMatchCelebration,
    latestMatchedCandidate,
    closeMatchCelebration,
    fetchCandidates,
    fetchMatches,
    isLoadingCandidates,
    isResettingDeck,
  } = useMatchStore();

  useEffect(() => {
    fetchCandidates();
    fetchMatches();
  }, [fetchCandidates, fetchMatches]);

  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeExit, setSwipeExit] = useState<"left" | "right" | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Sync query parameters on mount or change
  useEffect(() => {
    if (queryRoles) {
      const parsed = queryRoles.split(",").map((r) => r.trim());
      setProjectRolesFilter(parsed);
    } else {
      setProjectRolesFilter([]);
    }
  }, [queryRoles]);

  const handleInviteCandidate = async (candidate: any) => {
    if (!candidate) return;
    swipeRight(candidate.id);

    const inviteMsg = `Halo ${candidate.name}! Saya ingin mengundang kamu untuk berkolaborasi di proyek "${inviteProjectTitle || "Proyek Kolaborasi"}". Cek detail proyek dan mari kita bangun bersama!`;
    await sendMessageAsync(candidate.id, inviteMsg);

    addToast({
      title: "Undangan Kolaborasi Terkirim! 🚀",
      description: `Undangan proyek "${inviteProjectTitle || "Kolaborasi"}" telah dikirimkan ke chat ${candidate.name}.`,
      type: "success",
    });

    router.push(`/messages?userId=${candidate.id}`);
  };

  const matchedUserIds = matchedCandidates.map((m) => m.id);

  // Filtering candidates by profession / project roles
  const filteredCandidates = candidates.filter((c) => {
    // 1. Swiped & Already Matched filter (prevent redundant likes)
    if (swipedIds.includes(c.id) || matchedUserIds.includes(c.id)) return false;

    // 2. Project roles filter (from project shortcut)
    if (projectRolesFilter.length > 0) {
      const matchesAnyProjectRole = projectRolesFilter.some((pRole) => {
        const pLow = pRole.toLowerCase();
        return (
          c.title.toLowerCase().includes(pLow) ||
          c.tags.some((t) => t.toLowerCase().includes(pLow)) ||
          c.primaryStack.some((s) => s.toLowerCase().includes(pLow)) ||
          c.skills.some((sk) => sk.name.toLowerCase().includes(pLow) || sk.category.toLowerCase().includes(pLow)) ||
          (pLow.includes("ui") && c.tags.includes("UI/UX")) ||
          (pLow.includes("ux") && c.tags.includes("UI/UX")) ||
          (pLow.includes("backend") && c.tags.includes("Backend")) ||
          (pLow.includes("frontend") && c.tags.includes("Frontend")) ||
          (pLow.includes("ai") && c.tags.includes("AI"))
        );
      });
      if (!matchesAnyProjectRole) return false;
    }

    // 3. Tab profession filter (otomatis mapping dari spesialisasi / title & tags)
    if (selectedProfession === "ALL") return true;

    const titleLow = (c.title || "").toLowerCase();
    const tagsLow = (c.tags || []).map((t) => t.toLowerCase());
    const stackLow = (c.primaryStack || []).map((s) => s.toLowerCase());

    if (selectedProfession === "UI/UX") {
      return (
        tagsLow.includes("ui/ux") ||
        tagsLow.includes("design") ||
        titleLow.includes("ui/ux") ||
        titleLow.includes("designer") ||
        titleLow.includes("product design") ||
        titleLow.includes("ui") ||
        titleLow.includes("ux") ||
        stackLow.includes("figma") ||
        (c.skills && c.skills.some((sk) => sk.category === "UI/UX" || sk.name.toLowerCase().includes("figma")))
      );
    }
    if (selectedProfession === "BACKEND") {
      return (
        tagsLow.includes("backend") ||
        titleLow.includes("backend") ||
        titleLow.includes("systems") ||
        titleLow.includes("architect") ||
        titleLow.includes("database") ||
        stackLow.includes("postgresql") ||
        stackLow.includes("node.js") ||
        stackLow.includes("go") ||
        (c.skills && c.skills.some((sk) => sk.category === "Backend" || sk.category === "Database"))
      );
    }
    if (selectedProfession === "FRONTEND") {
      return (
        tagsLow.includes("frontend") ||
        titleLow.includes("frontend") ||
        titleLow.includes("react") ||
        titleLow.includes("web") ||
        (c.skills && c.skills.some((sk) => sk.category === "Frontend"))
      );
    }
    if (selectedProfession === "FULLSTACK") {
      return (
        tagsLow.includes("fullstack") ||
        titleLow.includes("fullstack") ||
        titleLow.includes("software engineer")
      );
    }
    if (selectedProfession === "AI") {
      return (
        tagsLow.includes("ai") ||
        tagsLow.includes("ml") ||
        titleLow.includes("ai") ||
        titleLow.includes("llm") ||
        titleLow.includes("machine learning") ||
        titleLow.includes("agent") ||
        stackLow.includes("python") ||
        stackLow.includes("langchain") ||
        (c.skills && c.skills.some((sk) => sk.category === "AI & Agents"))
      );
    }
    if (selectedProfession === "MOBILE") {
      return (
        tagsLow.includes("mobile") ||
        tagsLow.includes("ios") ||
        tagsLow.includes("android") ||
        titleLow.includes("mobile") ||
        titleLow.includes("ios") ||
        titleLow.includes("android") ||
        stackLow.includes("react native") ||
        stackLow.includes("flutter") ||
        stackLow.includes("expo")
      );
    }
    if (selectedProfession === "DEVOPS") {
      return (
        tagsLow.includes("devops") ||
        tagsLow.includes("cloud") ||
        tagsLow.includes("infrastructure") ||
        titleLow.includes("devops") ||
        titleLow.includes("cloud") ||
        titleLow.includes("infra") ||
        stackLow.includes("docker") ||
        stackLow.includes("kubernetes") ||
        stackLow.includes("aws") ||
        (c.skills && c.skills.some((sk) => sk.category === "DevOps & Cloud"))
      );
    }

    return true;
  });

  const currentCard = filteredCandidates[0];
  const nextCard = filteredCandidates[1];
  const thirdCard = filteredCandidates[2];
  const fourthCard = filteredCandidates[3];

  const handlePass = useCallback(() => {
    if (!currentCard || swipeExit) return;
    setSwipeExit("left");
    const flingX = typeof window !== "undefined" ? -(window.innerWidth || 600) - 150 : -650;
    setDragOffset({ x: flingX, y: 40 });
    setTimeout(() => {
      swipeLeft(currentCard.id);
      setSwipeExit(null);
      setDragOffset({ x: 0, y: 0 });
    }, 280);
  }, [currentCard, swipeExit, swipeLeft]);

  const { currentUser } = useUserStore();

  const handleMatch = useCallback(() => {
    if (!currentCard || swipeExit) return;
    setSwipeExit("right");
    const flingX = typeof window !== "undefined" ? (window.innerWidth || 600) + 150 : 650;
    setDragOffset({ x: flingX, y: 40 });

    // Emit real-time like notification via socket to the target user
    try {
      const socket = getSocket();
      if (socket && currentUser?.id) {
        socket.emit("send_like", {
          senderId: currentUser.id,
          senderName: currentUser.name || "Developer",
          senderAvatar: currentUser.image || currentUser.avatarUrl,
          senderRole: currentUser.title || "Developer",
          receiverId: currentCard.id,
        });
      }
    } catch (socketErr) {
      console.warn("Socket send_like emit failed:", socketErr);
    }

    setTimeout(() => {
      swipeRight(currentCard.id);
      setSwipeExit(null);
      setDragOffset({ x: 0, y: 0 });
    }, 280);
  }, [currentCard, swipeExit, swipeRight, currentUser]);

  // Pointer Drag Handlers (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipeExit) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || swipeExit) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || swipeExit) return;
    setIsDragging(false);

    const SWIPE_THRESHOLD = 75;
    if (dragOffset.x > SWIPE_THRESHOLD) {
      handleMatch();
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      handlePass();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    dragStartRef.current = null;
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    if (!swipeExit) {
      setDragOffset({ x: 0, y: 0 });
    }
    dragStartRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentCard || swipeExit) return;
      if (e.key === "ArrowLeft") {
        handlePass();
      } else if (e.key === "ArrowRight") {
        handleMatch();
      } else if (e.key === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        setInspectingCandidate(currentCard);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard, handleMatch, handlePass, setInspectingCandidate, swipeExit]);

  // Visual calculation for manual drag
  const currentRotation = isDragging ? dragOffset.x * 0.07 : 0;
  const matchOpacity = Math.min(1, Math.max(0, (dragOffset.x - 15) / 55));
  const passOpacity = Math.min(1, Math.max(0, (-dragOffset.x - 15) / 55));
  const dragProgress = Math.min(1, Math.abs(dragOffset.x) / 110);

  const isDraggingRight = dragOffset.x > 20;
  const isDraggingLeft = dragOffset.x < -20;

  const handleClearProjectFilter = () => {
    setProjectRolesFilter([]);
    router.replace("/find-partner");
  };

  return (
    <div className="relative w-full mx-auto flex flex-col items-center select-none space-y-4">
      {/* Mode Undang ke Proyek Banner */}
      {isInviteMode && (
        <div className="w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[420px] p-3 bg-devora-brand/10 border-2 border-devora-brand rounded-container flex items-center justify-between gap-3 text-left shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-5 h-5 text-devora-brand shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-bold text-devora-brand-dark truncate block">
                Mode Undang ke Proyek: &ldquo;{inviteProjectTitle || "Proyek Anda"}&rdquo;
              </span>
              <p className="text-[10px] text-devora-muted leading-tight">
                Pilih calon partner dan klik tombol &quot;Undang ke Proyek 🚀&quot; untuk mengirimkan undangan langsung ke chat mereka!
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/find-partner")}
            className="text-[10px] bg-devora-surface px-2.5 py-1.5 rounded-button text-devora-muted hover:text-devora-ink font-bold border border-devora-border shrink-0 hover:bg-devora-surface-strong transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      {/* Active Project Filter Banner */}
      {projectRolesFilter.length > 0 && !isInviteMode && (
        <div className="w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[420px] p-2.5 bg-devora-surface border border-devora-border rounded-container flex items-center justify-between gap-2 text-left shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase font-bold text-devora-brand flex items-center gap-1">
              <Flame className="w-3 h-3 text-devora-brand fill-devora-brand" />
              Target Proyek: {queryProject || "Proyek Anda"}
            </span>
            <p className="text-[11px] text-devora-ink font-medium">
              Mencari: {projectRolesFilter.join(" & ")}
            </p>
          </div>
          <button
            onClick={handleClearProjectFilter}
            className="text-[10px] bg-devora-surface-strong px-2.5 py-1 rounded-button text-devora-muted hover:text-devora-ink font-bold shadow-xs hover:bg-devora-border transition-colors"
          >
            Tampilkan Semua
          </button>
        </div>
      )}

      {/* Profession / Role Filter Pills Bar */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-2">
        {PROFESSION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedProfession === tab.key && projectRolesFilter.length === 0;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedProfession(tab.key);
                if (projectRolesFilter.length > 0) setProjectRolesFilter([]);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-devora-ink text-white shadow-sm ring-1 ring-devora-ink"
                  : "bg-devora-surface border border-devora-border text-devora-muted hover:text-devora-ink hover:bg-devora-surface-strong hover:border-devora-border-strong"
              }`}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-devora-brand" : "text-devora-muted")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Match Celebration Dialog */}
      {showMatchCelebration && latestMatchedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/75 backdrop-blur-md">
          <div className="w-full max-w-sm bg-devora-surface border-2 border-devora-brand rounded-container p-6 text-center space-y-4 shadow-2xl">
            {/* Standalone Flame icon with NO background, container, or border */}
            <Flame className="w-9 h-9 text-devora-brand fill-devora-brand mx-auto" />

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-devora-brand font-bold">
                Yeay, Kalian Cocok Banget!
              </span>
              <h3 className="text-xl font-bold text-devora-ink">
                Kamu & {latestMatchedCandidate.name}
              </h3>
              <p className="text-xs text-devora-muted">
                Stack dan waktu luang kalian sefrekuensi. Yuk langsung sapa dan mulai diskusi ide seru bareng!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 py-1">
              <div className="w-14 h-14 rounded-full border-2 border-devora-brand bg-devora-surface-strong text-devora-brand font-bold text-base flex items-center justify-center shadow-lg">
                IQ
              </div>
              <div className="w-7 h-7 rounded-full bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand shadow-xs">
                <Heart className="w-3.5 h-3.5 fill-devora-brand" />
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-devora-brand overflow-hidden shadow-lg">
                <img
                  src={latestMatchedCandidate.avatarUrl}
                  alt={latestMatchedCandidate.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                size="md"
                className="w-full bg-devora-brand text-white hover:bg-devora-brand-dark font-bold shadow-md text-xs"
                onClick={() => {
                  closeMatchCelebration();
                  window.location.href = "/matches";
                }}
              >
                Kirim Pesan & Mulai Ngobrol
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full font-semibold text-xs"
                onClick={closeMatchCelebration}
              >
                Lanjut Swipe yang Lain
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Card Stack Arena (3D Layered Stacking Deck) */}
      <div className="relative w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[420px] h-[510px] xs:h-[530px] sm:h-[560px] touch-none pt-7 pb-2">
        {isLoadingCandidates && candidates.length === 0 ? (
          <SwipeCardSkeleton />
        ) : currentCard ? (
          <>
            {/* ─── Realistic Card Stack Deck (Visual Matches Front Card Exactly) ─── */}
            
            {/* 3rd Bottom Background Card (Deepest Stack Layer) */}
            {(fourthCard || thirdCard) && (
              <div
                className="absolute inset-x-0 inset-y-2 rounded-[28px] overflow-hidden pointer-events-none transition-all duration-300 border-2 border-devora-border bg-devora-surface shadow-md flex flex-col justify-between"
                style={{
                  transform: `translate3d(${-8 + dragOffset.x * 0.02}px, ${-6 + Math.abs(dragOffset.x) * 0.01}px, 0) rotate(${-3.2 + dragOffset.x * 0.015}deg) scale(0.93)`,
                  zIndex: 1,
                  opacity: 0.75,
                }}
              >
                {/* Header Image with Gradient */}
                <div className="relative h-48 xs:h-52 sm:h-56 w-full bg-devora-surface-strong overflow-hidden">
                  <img
                    src={(fourthCard || thirdCard).avatarUrl}
                    alt={(fourthCard || thirdCard).name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-devora-surface via-devora-surface/30 to-black/30" />
                  <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-devora-ink bg-white/90 px-2.5 py-0.5 rounded-full border border-devora-border shadow-xs">
                      {(fourthCard || thirdCard).name}
                    </span>
                    <span className="text-[10px] font-bold text-devora-brand bg-white/90 px-2.5 py-0.5 rounded-full border border-devora-border shadow-xs">
                      {(fourthCard || thirdCard).matchScore}% Match
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-4 right-4">
                    <h3 className="text-base font-bold text-devora-ink drop-shadow-sm">
                      {(fourthCard || thirdCard).name}
                    </h3>
                    <p className="text-xs font-semibold text-devora-brand-dark">
                      {(fourthCard || thirdCard).title}
                    </p>
                  </div>
                </div>

                {/* Body Peek */}
                <div className="flex-1 p-3.5 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-2 text-xs text-devora-muted font-medium">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold text-[11px]">
                      <MapPin className="w-3 h-3 text-devora-brand" />
                      {(fourthCard || thirdCard).location.split("(")[0]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(fourthCard || thirdCard).primaryStack.slice(0, 3).map((tech, idx) => (
                      <Badge key={idx} variant="default" className="text-[10px] py-0.5 px-2 bg-devora-surface-strong text-devora-ink font-semibold">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Footer Action Bar Placeholder */}
                <div className="p-3 border-t border-devora-border bg-devora-surface-strong/40 flex items-center justify-around">
                  <div className="w-10 h-10 rounded-full bg-devora-surface border border-devora-border" />
                  <div className="px-4 py-2 rounded-full bg-devora-surface border border-devora-border" />
                  <div className="w-10 h-10 rounded-full bg-devora-brand/80" />
                </div>
              </div>
            )}

            {/* 2nd Background Card (Middle Stack Layer) */}
            {thirdCard && (
              <div
                className="absolute inset-x-0 inset-y-2 rounded-[28px] overflow-hidden pointer-events-none transition-all duration-300 border-2 border-devora-border bg-devora-surface shadow-lg flex flex-col justify-between"
                style={{
                  transform: `translate3d(${6 + dragOffset.x * 0.03}px, ${-3 + Math.abs(dragOffset.x) * 0.015}px, 0) rotate(${2.2 + dragOffset.x * 0.02}deg) scale(0.96)`,
                  zIndex: 2,
                  opacity: 0.88,
                }}
              >
                {/* Header Image with Gradient */}
                <div className="relative h-48 xs:h-52 sm:h-56 w-full bg-devora-surface-strong overflow-hidden">
                  <img
                    src={thirdCard.avatarUrl}
                    alt={thirdCard.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-devora-surface via-devora-surface/30 to-black/30" />
                  <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-devora-ink bg-white/90 px-2.5 py-0.5 rounded-full border border-devora-border shadow-xs">
                      {thirdCard.name}
                    </span>
                    <span className="text-[10px] font-bold text-devora-brand bg-white/90 px-2.5 py-0.5 rounded-full border border-devora-border shadow-xs">
                      {thirdCard.matchScore}% Match
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-4 right-4">
                    <h3 className="text-base font-bold text-devora-ink drop-shadow-sm">
                      {thirdCard.name}
                    </h3>
                    <p className="text-xs font-semibold text-devora-brand-dark">
                      {thirdCard.title}
                    </p>
                  </div>
                </div>

                {/* Body Peek */}
                <div className="flex-1 p-3.5 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-2 text-xs text-devora-muted font-medium">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold text-[11px]">
                      <MapPin className="w-3 h-3 text-devora-brand" />
                      {thirdCard.location.split("(")[0]}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold text-[11px]">
                      <Clock className="w-3 h-3 text-devora-brand" />
                      {thirdCard.availabilityHrs} jam/mgg
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {thirdCard.primaryStack.slice(0, 3).map((tech, idx) => (
                      <Badge key={idx} variant="default" className="text-[10px] py-0.5 px-2 bg-devora-surface-strong text-devora-ink font-semibold">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Footer Action Bar Placeholder */}
                <div className="p-3 border-t border-devora-border bg-devora-surface-strong/40 flex items-center justify-around">
                  <div className="w-10 h-10 rounded-full bg-devora-surface border border-devora-border" />
                  <div className="px-4 py-2 rounded-full bg-devora-surface border border-devora-border" />
                  <div className="w-10 h-10 rounded-full bg-devora-brand/80" />
                </div>
              </div>
            )}

            {/* 1st Background Card (Directly Underneath Top Card) */}
            {nextCard && (
              <div
                className="absolute inset-x-0 inset-y-2 rounded-[28px] overflow-hidden pointer-events-none transition-all duration-300 border-2 border-devora-border bg-devora-surface shadow-xl flex flex-col justify-between"
                style={{
                  transform: `translate3d(${-2 + dragOffset.x * 0.04}px, 0px, 0) rotate(${-1.0 + dragOffset.x * 0.02}deg) scale(0.985)`,
                  zIndex: 3,
                  opacity: 0.96,
                }}
              >
                {/* Header Image with Badges */}
                <div className="relative h-48 xs:h-52 sm:h-56 w-full bg-devora-surface-strong overflow-hidden">
                  <img
                    src={nextCard.avatarUrl}
                    alt={nextCard.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-devora-surface via-devora-surface/30 to-black/30" />
                  
                  {/* Top Status & Match Badges */}
                  <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-devora-border text-[10px] font-semibold text-devora-ink shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Berikutnya: {nextCard.name}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-devora-brand/40 text-[10px] font-bold text-devora-brand shadow-sm">
                      <Flame className="w-3 h-3 fill-devora-brand" />
                      <span>{nextCard.matchScore}% Match</span>
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-4 right-4 space-y-0.5">
                    <h3 className="text-base sm:text-lg font-bold text-devora-ink tracking-tight drop-shadow-sm">
                      {nextCard.name}
                    </h3>
                    <p className="text-xs font-semibold text-devora-brand-dark line-clamp-1">
                      {nextCard.title}
                    </p>
                  </div>
                </div>

                {/* Body Peek Preview */}
                <div className="flex-1 p-3.5 flex flex-col justify-between space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-devora-muted font-medium">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold text-[11px]">
                      <MapPin className="w-3 h-3 text-devora-brand" />
                      {nextCard.location.split("(")[0]}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold text-[11px]">
                      <Clock className="w-3 h-3 text-devora-brand" />
                      {nextCard.availabilityHrs} jam/mgg
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {nextCard.primaryStack.slice(0, 4).map((tech, idx) => (
                      <Badge
                        key={idx}
                        variant="default"
                        className="text-[10px] py-0.5 px-2 bg-devora-surface-strong text-devora-ink font-semibold"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-3 border-t border-devora-border bg-devora-surface-strong/70 flex items-center justify-around gap-2">
                  <div className="w-12 h-12 rounded-full bg-devora-surface border border-devora-border flex items-center justify-center text-devora-muted">
                    <X className="w-6 h-6" />
                  </div>
                  <div className="px-4 py-2.5 rounded-full bg-devora-surface border border-devora-border text-xs font-bold text-devora-ink flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-devora-brand" />
                    <span>Spec</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-devora-brand text-white flex items-center justify-center">
                    <Heart className="w-6 h-6 fill-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Active Foreground Drag Card with Glowing Drag Border Physics */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              className={cn(
                "absolute inset-x-0 inset-y-2 bg-devora-surface border-2 rounded-container overflow-hidden shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing will-change-transform select-none",
                isDraggingRight ? "border-emerald-500/70 ring-2 ring-emerald-500/30" : isDraggingLeft ? "border-red-500/70 ring-2 ring-red-500/30" : "border-devora-border hover:border-devora-brand/40"
              )}
              style={{
                transform: `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.35}px, 0) rotate(${
                  swipeExit === "right"
                    ? 28
                    : swipeExit === "left"
                    ? -28
                    : currentRotation
                }deg)`,
                opacity: swipeExit ? 0 : 1,
                zIndex: 10,
                transition: isDragging
                  ? "none"
                  : "transform 280ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 240ms ease-out",
              }}
            >
              {/* Dynamic Luminous Drag Stamps */}
              <div
                className="absolute top-5 left-5 z-30 pointer-events-none border-3 border-emerald-500 text-emerald-500 font-extrabold uppercase text-base sm:text-lg tracking-wider px-3.5 py-1 rounded-md -rotate-12 shadow-xl bg-emerald-500/20 backdrop-blur-sm"
                style={{ opacity: matchOpacity }}
              >
                CONNECT
              </div>

              <div
                className="absolute top-5 right-5 z-30 pointer-events-none border-3 border-red-500 text-red-500 font-extrabold uppercase text-base sm:text-lg tracking-wider px-3.5 py-1 rounded-md rotate-12 shadow-xl bg-red-500/20 backdrop-blur-sm"
                style={{ opacity: passOpacity }}
              >
                PASS
              </div>

              {/* Card Hero Image with Depth Vignette & Info Overlays */}
              <div className="relative h-48 xs:h-52 sm:h-56 w-full bg-devora-surface-strong overflow-hidden shrink-0 pointer-events-none">
                <img
                  src={currentCard.avatarUrl}
                  alt={currentCard.name}
                  className="w-full h-full object-cover scale-102 transition-transform duration-500"
                />
                
                {/* Cinematic Vignette Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-devora-surface via-devora-surface/20 to-devora-ink/40" />

                {/* Top Status & Match Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-devora-surface/90 backdrop-blur-md border border-devora-border text-[10px] font-semibold text-devora-ink shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Aktif Minggu Ini</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-devora-surface/90 backdrop-blur-md border border-devora-brand/40 text-[11px] font-bold text-devora-brand shadow-md">
                    <Flame className="w-3.5 h-3.5 fill-devora-brand" />
                    <span>{currentCard.matchScore}% Match</span>
                  </div>
                </div>

                {/* Name & Role Headline */}
                <div className="absolute bottom-2.5 left-4 right-4 space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-devora-ink tracking-tight drop-shadow-md">
                    {currentCard.name}
                  </h2>
                  <p className="text-xs font-semibold text-devora-brand-dark line-clamp-1 drop-shadow-xs">
                    {currentCard.title}
                  </p>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5 overflow-y-auto">
                {/* Location & Developer Highlights Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-devora-muted font-medium">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold text-[11px]">
                    <MapPin className="w-3 h-3 text-devora-brand" />
                    {currentCard.location.split("(")[0]}
                  </span>

                  {currentCard.experienceYears !== undefined && currentCard.experienceYears !== null && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 font-bold text-[11px] border border-amber-500/20">
                      <Briefcase className="w-3 h-3 text-amber-600" />
                      {currentCard.experienceYears} Thn Exp
                    </span>
                  )}

                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold text-[11px]">
                    <Clock className="w-3 h-3 text-devora-brand" />
                    {currentCard.availabilityHrs} jam/mgg
                  </span>

                  {currentCard.certificates && currentCard.certificates.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 font-bold text-[11px] border border-emerald-500/20">
                      <Award className="w-3 h-3 text-emerald-600" />
                      {currentCard.certificates.length} Sertifikat
                    </span>
                  )}

                  {currentCard.portfolios && currentCard.portfolios.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 font-bold text-[11px] border border-blue-500/20">
                      <FolderGit2 className="w-3 h-3 text-blue-600" />
                      {currentCard.portfolios.length} Proyek Live
                    </span>
                  )}
                </div>

                {/* Bio Quote with Accent Left Border */}
                <p className="text-xs text-devora-ink leading-relaxed border-l-2 border-devora-brand pl-2.5 italic line-clamp-2">
                  &ldquo;{currentCard.bio}&rdquo;
                </p>

                {/* Match Reason Highlight */}
                {currentCard.matchReasons?.[0] && (
                  <div className="p-2.5 bg-devora-surface-strong/90 rounded-container flex items-start gap-2 shadow-2xs">
                    <Zap className="w-3.5 h-3.5 text-devora-brand shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-devora-ink block leading-tight">
                        {currentCard.matchReasons[0].title}
                      </span>
                      <p className="text-[10px] text-devora-muted line-clamp-1">
                        {currentCard.matchReasons[0].description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stack Chips */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-devora-muted">
                    <span className="flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-devora-brand" />
                      Tech Stack Andalan
                    </span>
                    {currentCard.buildingProject && (
                      <span className="text-devora-brand truncate max-w-[150px]">
                        Lagi Bikin: {currentCard.buildingProject.title}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentCard.primaryStack.slice(0, 4).map((tech, idx) => (
                      <Badge
                        key={idx}
                        variant="default"
                        className="text-[10px] py-0.5 px-2 bg-devora-surface-strong text-devora-ink font-semibold hover:bg-devora-border transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {currentCard.primaryStack.length > 4 && (
                      <span className="text-[10px] text-devora-muted self-center font-mono font-bold px-1">
                        +{currentCard.primaryStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar (Tactile & Radiant) */}
              <div
                className="p-3 border-t border-devora-border bg-devora-surface-strong/70 flex items-center justify-around gap-2 shrink-0"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {/* PASS Button */}
                <button
                  onClick={handlePass}
                  title="Pass (Geser Kiri / Panah Kiri)"
                  className="w-12 h-12 rounded-full bg-devora-surface hover:bg-red-500/10 text-devora-muted hover:text-red-500 flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all duration-150"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>

                {/* SPEC Button */}
                <button
                  onClick={() => setInspectingCandidate(currentCard)}
                  title="Buka Spec Lengkap (Space / Panah Atas)"
                  className="px-4 py-2.5 rounded-button bg-devora-surface hover:bg-devora-surface-strong text-xs font-bold text-devora-ink hover:text-devora-brand flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-all duration-150"
                >
                  <Eye className="w-4 h-4 text-devora-brand" />
                  <span>Spec</span>
                </button>

                {/* UNDO Button */}
                {lastAction && (
                  <button
                    onClick={undoSwipe}
                    title="Batalkan Swipe Terakhir"
                    className="w-9 h-9 rounded-full bg-devora-surface hover:bg-amber-500/10 text-devora-muted hover:text-amber-600 flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all duration-150"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                {/* MATCH / INVITE Button */}
                {isInviteMode ? (
                  <button
                    onClick={() => handleInviteCandidate(currentCard)}
                    title="Undang ke Proyek Ini (Kirim undangan langsung ke chat)"
                    className="px-5 py-2.5 rounded-full bg-devora-brand text-white hover:bg-devora-brand-dark flex items-center gap-1.5 font-bold text-xs shadow-lg shadow-devora-brand/35 hover:scale-105 active:scale-95 transition-all duration-150"
                  >
                    <Rocket className="w-4 h-4 fill-white" />
                    <span>Undang ke Proyek 🚀</span>
                  </button>
                ) : (
                  <button
                    onClick={handleMatch}
                    title="Ajak Match (Geser Kanan / Panah Kanan)"
                    className="w-12 h-12 rounded-full bg-devora-brand text-white hover:bg-devora-brand-dark flex items-center justify-center shadow-lg shadow-devora-brand/35 hover:scale-110 active:scale-90 transition-all duration-150"
                  >
                    <Heart className="w-6 h-6 fill-white" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty Deck State */
          <div className="absolute inset-x-0 inset-y-2 bg-devora-surface rounded-container flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-sm border-2 border-dashed border-devora-border">
            <div className="w-13 h-13 rounded-full bg-devora-surface-strong flex items-center justify-center text-devora-brand shadow-xs">
              <CheckCircle2 className="w-7 h-7 text-devora-brand" />
            </div>

            <div className="space-y-1 max-w-xs">
              <h3 className="text-base font-bold text-devora-ink">
                Kartu Calon Partner Udah Habis
              </h3>
              <p className="text-xs text-devora-muted">
                {selectedProfession !== "ALL" || projectRolesFilter.length > 0
                  ? "Belum ada partner lain di kategori ini. Coba cek kategori profesi lain atau reset deck yuk!"
                  : "Kamu udah liat semua calon partner yang tersedia saat ini. Keren!"}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1 w-full max-w-xs">
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs font-bold rounded-full"
                disabled={isResettingDeck || isLoadingCandidates}
                onClick={() => {
                  setSelectedProfession("ALL");
                  setProjectRolesFilter([]);
                  resetDeck();
                }}
              >
                <RotateCcw className={cn("w-3.5 h-3.5", isResettingDeck && "animate-spin text-devora-brand")} />
                <span>{isResettingDeck ? "Mengocok Ulang Deck..." : "Kocok Ulang Deck"}</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 font-bold text-xs shadow-md rounded-full"
                onClick={() => (window.location.href = "/matches")}
              >
                <span>Cek Teman yang Cocok ({useMatchStore.getState().matchedCandidates.length})</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-devora-muted font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span>Geser Kiri: Pass</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{isInviteMode ? "Undang: Kirim ke Chat" : "Geser Kanan: Match"}</span>
        </span>
      </div>

      {/* ================================================================
          MODAL: CANDIDATE SPEC MODAL (Showcase Sertifikat & Portofolio)
          ================================================================ */}
      {inspectingCandidate && (
        <div
          className="fixed inset-0 z-50 bg-devora-ink/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setInspectingCandidate(null)}
        >
          <div
            className="w-full max-w-xl bg-devora-surface border-2 border-devora-border rounded-container shadow-2xl p-5 sm:p-6 space-y-5 my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-devora-border pb-4">
              <div className="flex items-start gap-3.5">
                <img
                  src={inspectingCandidate.avatarUrl}
                  alt={inspectingCandidate.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-devora-brand shadow-xs shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-devora-ink">
                      {inspectingCandidate.name}
                    </h3>
                    <Badge variant="brand" className="text-[10px] font-bold py-0.5 px-2">
                      {inspectingCandidate.matchScore}% Match
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-devora-brand-dark">
                    {inspectingCandidate.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-devora-muted font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-devora-brand" />
                      {inspectingCandidate.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-devora-brand" />
                      {inspectingCandidate.availabilityHrs} jam/minggu
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingCandidate(null)}
                className="p-1.5 text-devora-muted hover:text-devora-ink rounded-button hover:bg-devora-surface-strong"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Jam Terbang & Ritme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-devora-background rounded-button border border-devora-border space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-devora-muted flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-devora-brand" />
                    <span>Jam Terbang / Pengalaman:</span>
                  </span>
                  <p className="text-xs font-bold text-devora-ink">
                    {inspectingCandidate.experienceYears !== undefined && inspectingCandidate.experienceYears !== null
                      ? `${inspectingCandidate.experienceYears} Tahun Pengalaman (${inspectingCandidate.experienceLevel || "Developer"})`
                      : "Pengalaman Praktis / Project-Based"}
                  </p>
                </div>

                <div className="p-3 bg-devora-background rounded-button border border-devora-border space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-devora-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-devora-brand" />
                    <span>Jadwal & Komitmen:</span>
                  </span>
                  <p className="text-xs font-bold text-devora-ink">
                    {inspectingCandidate.availabilityHrs} jam/mgg ({inspectingCandidate.flexibleHours !== false ? "Fleksibel" : "Tetap"})
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-devora-muted block">
                  Bio / Tentang Developer:
                </span>
                <p className="text-xs text-devora-ink leading-relaxed bg-devora-background p-2.5 rounded-button border border-devora-border">
                  {inspectingCandidate.bio}
                </p>
              </div>

              {/* Tech Stack */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-devora-muted block">
                  Tech Stack Lengkap:
                </span>
                <div className="flex flex-wrap gap-1">
                  {inspectingCandidate.primaryStack.map((tech, i) => (
                    <Badge
                      key={i}
                      variant="default"
                      className="text-xs py-0.5 px-2 bg-devora-surface-strong text-devora-ink font-semibold"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sertifikasi */}
              {inspectingCandidate.certificates && inspectingCandidate.certificates.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-devora-border">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-mono uppercase font-bold text-devora-ink">
                      Sertifikasi Terverifikasi ({inspectingCandidate.certificates.length}):
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inspectingCandidate.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-2.5 bg-devora-background border border-devora-border rounded-button flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-devora-ink truncate">{cert.title}</p>
                          <p className="text-[10px] text-devora-muted">
                            {cert.issuer} {cert.issueDate && `• ${cert.issueDate}`}
                          </p>
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-devora-brand hover:underline shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portofolio Proyek */}
              {inspectingCandidate.portfolios && inspectingCandidate.portfolios.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-devora-border">
                  <div className="flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-devora-brand" />
                    <span className="text-[10px] font-mono uppercase font-bold text-devora-ink">
                      Portofolio Proyek Live ({inspectingCandidate.portfolios.length}):
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {inspectingCandidate.portfolios.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3 bg-devora-background border border-devora-border rounded-container space-y-1.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-devora-ink">{proj.title}</p>
                          {proj.description && (
                            <p className="text-[11px] text-devora-muted line-clamp-2 leading-relaxed">
                              {proj.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-devora-border/50 text-[11px]">
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-devora-brand font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>Live Demo</span>
                            </a>
                          )}
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-devora-ink font-bold hover:text-devora-brand inline-flex items-center gap-1"
                            >
                              <GitBranch className="w-2.5 h-2.5" />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-devora-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setInspectingCandidate(null)}
              >
                Tutup
              </Button>
              {isInviteMode ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const cand = inspectingCandidate;
                    setInspectingCandidate(null);
                    handleInviteCandidate(cand);
                  }}
                  className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold text-xs"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Undang ke Proyek 🚀</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const cand = inspectingCandidate;
                    setInspectingCandidate(null);
                    swipeRight(cand.id);
                    router.push(`/messages?userId=${cand.id}`);
                  }}
                  className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold text-xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Match & Kirim Pesan</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
