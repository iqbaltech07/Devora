"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMatchStore } from "@/store/useMatchStore";
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

  const handlePass = useCallback(() => {
    if (!currentCard || swipeExit) return;
    setSwipeExit("left");
    setTimeout(() => {
      swipeLeft(currentCard.id);
      setSwipeExit(null);
      setDragOffset({ x: 0, y: 0 });
    }, 220);
  }, [currentCard, swipeExit, swipeLeft]);

  const handleMatch = useCallback(() => {
    if (!currentCard || swipeExit) return;
    setSwipeExit("right");
    setTimeout(() => {
      swipeRight(currentCard.id);
      setSwipeExit(null);
      setDragOffset({ x: 0, y: 0 });
    }, 220);
  }, [currentCard, swipeExit, swipeRight]);

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
    setDragOffset({ x: 0, y: 0 });
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
      {/* Active Project Filter Banner */}
      {projectRolesFilter.length > 0 && (
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
            {/* ─── Multi-Layer Stack Deck (Exact Match to Gambar 2 Reference) ─── */}
            {/* Left Far Red Layer */}
            <div
              className="absolute inset-x-0 inset-y-2 rounded-[28px] pointer-events-none transition-transform duration-300 shadow-md bg-[#BE123C]"
              style={{
                transform: `translate3d(${-12 + dragOffset.x * 0.04}px, ${-4 + Math.abs(dragOffset.x) * 0.02}px, 0) rotate(${-4.5 + dragOffset.x * 0.02}deg) scale(0.96)`,
                zIndex: 0,
              }}
            />

            {/* Left Mid Cyan / Blue Layer */}
            <div
              className="absolute inset-x-0 inset-y-2 rounded-[28px] pointer-events-none transition-transform duration-300 shadow-md bg-[#0284C7]"
              style={{
                transform: `translate3d(${-8 + dragOffset.x * 0.03}px, ${-2 + Math.abs(dragOffset.x) * 0.015}px, 0) rotate(${-3.0 + dragOffset.x * 0.015}deg) scale(0.975)`,
                zIndex: 0,
              }}
            />

            {/* Left Near Emerald Green Layer */}
            <div
              className="absolute inset-x-0 inset-y-2 rounded-[28px] pointer-events-none transition-transform duration-300 shadow-md bg-[#059669]"
              style={{
                transform: `translate3d(${-4 + dragOffset.x * 0.02}px, 0px, 0) rotate(${-1.5 + dragOffset.x * 0.01}deg) scale(0.99)`,
                zIndex: 0,
              }}
            />

            {/* Right Far Royal Blue Layer */}
            <div
              className="absolute inset-x-0 inset-y-2 rounded-[28px] pointer-events-none transition-transform duration-300 shadow-md bg-[#1D4ED8]"
              style={{
                transform: `translate3d(${12 + dragOffset.x * 0.04}px, ${-4 + Math.abs(dragOffset.x) * 0.02}px, 0) rotate(${4.5 + dragOffset.x * 0.02}deg) scale(0.96)`,
                zIndex: 0,
              }}
            />

            {/* Right Mid Wine / Crimson Layer */}
            <div
              className="absolute inset-x-0 inset-y-2 rounded-[28px] pointer-events-none transition-transform duration-300 shadow-md bg-[#881337]"
              style={{
                transform: `translate3d(${8 + dragOffset.x * 0.03}px, ${-2 + Math.abs(dragOffset.x) * 0.015}px, 0) rotate(${3.0 + dragOffset.x * 0.015}deg) scale(0.975)`,
                zIndex: 0,
              }}
            />

            {/* Right Near Olive / Lime Green Layer */}
            <div
              className="absolute inset-x-0 inset-y-2 rounded-[28px] pointer-events-none transition-transform duration-300 shadow-md bg-[#65A30D]"
              style={{
                transform: `translate3d(${4 + dragOffset.x * 0.02}px, 0px, 0) rotate(${1.5 + dragOffset.x * 0.01}deg) scale(0.99)`,
                zIndex: 0,
              }}
            />

            {/* 3rd Bottom Background Card in Stack */}
            {thirdCard && (
              <div
                className="absolute inset-x-0 inset-y-2 rounded-container overflow-hidden pointer-events-none transition-all duration-300 border-2 border-devora-border/80 bg-devora-surface shadow-md flex flex-col justify-between"
                style={{
                  transform: `translate3d(0, ${-20 + dragProgress * 10}px, 0) scale(${
                    0.88 + dragProgress * 0.05
                  }) rotate(${-1.5 + dragProgress * 0.75}deg)`,
                  opacity: 0.65 + dragProgress * 0.25,
                  zIndex: 1,
                }}
              >
                <div className="relative h-48 xs:h-52 sm:h-56 w-full bg-devora-surface-strong overflow-hidden opacity-60">
                  <img
                    src={thirdCard.avatarUrl}
                    alt={thirdCard.name}
                    className="w-full h-full object-cover blur-[1.5px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-devora-surface via-devora-surface/40 to-transparent" />
                  <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-devora-muted bg-devora-surface/90 px-2 py-0.5 rounded-full border border-devora-border">
                      {thirdCard.name}
                    </span>
                    <span className="text-[10px] font-bold text-devora-brand bg-devora-surface/90 px-2 py-0.5 rounded-full border border-devora-border">
                      {thirdCard.matchScore}% Match
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2nd Middle Background Card in Stack */}
            {nextCard && (
              <div
                className="absolute inset-x-0 inset-y-2 rounded-container overflow-hidden pointer-events-none transition-all duration-300 border-2 border-devora-border bg-devora-surface shadow-xl flex flex-col justify-between"
                style={{
                  transform: `translate3d(0, ${-10 + dragProgress * 10}px, 0) scale(${
                    0.94 + dragProgress * 0.06
                  }) rotate(${1 - dragProgress * 1}deg)`,
                  opacity: 0.88 + dragProgress * 0.12,
                  zIndex: 2,
                }}
              >
                <div className="relative h-48 xs:h-52 sm:h-56 w-full bg-devora-surface-strong overflow-hidden opacity-85">
                  <img
                    src={nextCard.avatarUrl}
                    alt={nextCard.name}
                    className="w-full h-full object-cover blur-[0.5px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-devora-surface via-devora-surface/30 to-devora-ink/30" />
                  
                  {/* Top Status & Match Badges */}
                  <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-devora-surface/90 backdrop-blur-md border border-devora-border text-[10px] font-semibold text-devora-ink shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Berikutnya: {nextCard.name}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-devora-surface/90 backdrop-blur-md border border-devora-brand/40 text-[10px] font-bold text-devora-brand shadow-sm">
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
                <div className="flex-1 p-3.5 flex flex-col justify-between space-y-2 opacity-75">
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
              </div>
            )}

            {/* Active Foreground Drag Card with Glowing Drag Border Physics */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              className={cn(
                "absolute inset-x-0 inset-y-2 bg-devora-surface border-2 rounded-container overflow-hidden shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing will-change-transform transition-colors duration-150",
                !isDragging && !swipeExit && "transition-[transform,opacity] duration-300 ease-out",
                swipeExit === "left" &&
                  "-translate-x-[160%] -rotate-25 opacity-0 pointer-events-none transition-all duration-200 ease-in",
                swipeExit === "right" &&
                  "translate-x-[160%] rotate-25 opacity-0 pointer-events-none transition-all duration-200 ease-in",
                isDraggingRight ? "border-emerald-500/70 ring-2 ring-emerald-500/30" : isDraggingLeft ? "border-red-500/70 ring-2 ring-red-500/30" : "border-devora-border hover:border-devora-brand/40"
              )}
              style={
                !swipeExit
                  ? {
                      transform: `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.35}px, 0) rotate(${currentRotation}deg)`,
                      zIndex: 10,
                    }
                  : { zIndex: 10 }
              }
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
                {/* Location & Availability Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-devora-muted font-medium">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-devora-brand" />
                    {currentCard.location.split("(")[0]}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-devora-surface-strong text-devora-ink font-semibold">
                    <Clock className="w-3.5 h-3.5 text-devora-brand" />
                    {currentCard.availabilityHrs} jam/mgg
                  </span>
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

                {/* MATCH / CONNECT Button */}
                <button
                  onClick={handleMatch}
                  title="Ajak Match (Geser Kanan / Panah Kanan)"
                  className="w-12 h-12 rounded-full bg-devora-brand text-white hover:bg-devora-brand-dark flex items-center justify-center shadow-lg shadow-devora-brand/35 hover:scale-110 active:scale-90 transition-all duration-150"
                >
                  <Heart className="w-6 h-6 fill-white" />
                </button>
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
          <span>Geser Kanan: Match</span>
        </span>
      </div>
    </div>
  );
}
