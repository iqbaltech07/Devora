"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useMatchStore } from "@/store/useMatchStore";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import {
  Users,
  Search,
  Flame,
  MessageSquare,
  Clock,
  MapPin,
  Info,
  Heart,
  X,
  HeartHandshake,
  Palette,
  Server,
  Layout,
  Layers,
  Bot,
  Smartphone,
  Cloud,
} from "lucide-react";
import { PartnerGridSkeletonList } from "@/components/ui/PartnerCardSkeleton";
import { cn } from "@/lib/utils";

export default function MatchesPage() {
  const {
    matchedCandidates,
    incomingLikes,
    setInspectingCandidate,
    fetchMatches,
    fetchCandidates,
    fetchIncomingLikes,
    acceptIncomingLike,
    passIncomingLike,
    isLoadingMatches,
    isLoadingIncomingLikes,
  } = useMatchStore();
  const { fetchProfile } = useUserStore();
  const { addToast } = useUiStore();

  const [activeMainTab, setActiveMainTab] = useState<"MATCHES" | "LIKES_RECEIVED">("MATCHES");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchCandidates();
    fetchMatches();
    fetchIncomingLikes();
  }, [fetchProfile, fetchCandidates, fetchMatches, fetchIncomingLikes]);

  const uniqueMatchedCandidates = Array.from(
    new Map(matchedCandidates.map((c) => [c.id, c])).values()
  );

  const uniqueIncomingLikes = Array.from(
    new Map(incomingLikes.map((c) => [c.id, c])).values()
  );

  // Filter helper
  const filterCandidateList = (list: typeof uniqueMatchedCandidates) => {
    return list.filter((candidate) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        candidate.name.toLowerCase().includes(q) ||
        candidate.title.toLowerCase().includes(q) ||
        candidate.primaryStack.some((s) => s.toLowerCase().includes(q)) ||
        candidate.skills.some((sk) => sk.name.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedRoleFilter === "ALL") return true;
      if (selectedRoleFilter === "UI/UX")
        return (
          candidate.tags.includes("UI/UX") ||
          candidate.title.toLowerCase().includes("designer") ||
          candidate.title.toLowerCase().includes("ui/ux") ||
          candidate.primaryStack.includes("Figma") ||
          candidate.skills.some(
            (s) =>
              s.category === "UI/UX" ||
              s.name.toLowerCase().includes("figma") ||
              s.name.toLowerCase().includes("design")
          )
        );
      if (selectedRoleFilter === "BACKEND")
        return candidate.title.toLowerCase().includes("backend") || candidate.tags.includes("Backend");
      if (selectedRoleFilter === "FRONTEND")
        return candidate.title.toLowerCase().includes("frontend") || candidate.tags.includes("Frontend");
      if (selectedRoleFilter === "FULLSTACK")
        return candidate.title.toLowerCase().includes("fullstack") || candidate.tags.includes("Fullstack");
      if (selectedRoleFilter === "AI")
        return candidate.title.toLowerCase().includes("ai") || candidate.tags.includes("AI");
      if (selectedRoleFilter === "MOBILE")
        return candidate.title.toLowerCase().includes("mobile") || candidate.tags.includes("Mobile");
      if (selectedRoleFilter === "DEVOPS")
        return (
          candidate.title.toLowerCase().includes("devops") ||
          candidate.title.toLowerCase().includes("cloud") ||
          candidate.tags.includes("DevOps") ||
          candidate.tags.includes("Cloud")
        );

      return true;
    });
  };

  const filteredMatches = filterCandidateList(uniqueMatchedCandidates);
  const filteredIncomingLikes = filterCandidateList(uniqueIncomingLikes);

  const handleAcceptLike = async (candidateId: string, name: string) => {
    setProcessingId(candidateId);
    try {
      await acceptIncomingLike(candidateId);
      addToast({
        title: "Kecocokan Berhasil",
        description: `Anda dan ${name} kini telah saling terhubung. Silakan mulai percakapan di menu Pesan.`,
        type: "success",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handlePassLike = async (candidateId: string, name: string) => {
    setProcessingId(candidateId);
    try {
      await passIncomingLike(candidateId);
      addToast({
        title: "Permintaan Dilewati",
        description: `${name} telah dihapus dari daftar apresiasi profil Anda.`,
        type: "info",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-devora-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-devora-brand" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-devora-muted">
                Koneksi & Rekan Kolaborasi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-devora-ink tracking-tight mt-1">
              Rekan Pengembang ({uniqueMatchedCandidates.length + uniqueIncomingLikes.length})
            </h1>
            <p className="text-xs sm:text-sm text-devora-muted mt-0.5">
              Kelola rekan yang telah cocok dan sambut pengembang yang tertarik berkolaborasi dengan Anda.
            </p>
          </div>

          <Link href="/find-partner">
            <Button size="sm" className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-semibold shadow-xs">
              <Flame className="w-4 h-4 fill-white" />
              <span>Eksplorasi Rekan Pengembang</span>
            </Button>
          </Link>
        </div>

        {/* Dual Main Navigation Tabs: Rekan Cocok vs Apresiasi Masuk */}
        <div className="flex items-center gap-2 border-b border-devora-border pb-1">
          <button
            onClick={() => setActiveMainTab("MATCHES")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-t-container text-xs sm:text-sm font-bold transition-all relative",
              activeMainTab === "MATCHES"
                ? "bg-devora-surface text-devora-ink border-t-2 border-x-2 border-devora-brand -mb-[1px] shadow-xs"
                : "text-devora-muted hover:text-devora-ink hover:bg-devora-surface-strong/50"
            )}
          >
            <Users className={cn("w-4 h-4", activeMainTab === "MATCHES" ? "text-devora-brand" : "text-devora-muted")} />
            <span>Rekan Cocok</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-mono",
              activeMainTab === "MATCHES" ? "bg-devora-brand/15 text-devora-brand font-bold" : "bg-devora-surface-strong text-devora-muted"
            )}>
              {uniqueMatchedCandidates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab("LIKES_RECEIVED")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-t-container text-xs sm:text-sm font-bold transition-all relative",
              activeMainTab === "LIKES_RECEIVED"
                ? "bg-devora-surface text-devora-ink border-t-2 border-x-2 border-rose-500 -mb-[1px] shadow-xs"
                : "text-devora-muted hover:text-devora-ink hover:bg-devora-surface-strong/50"
            )}
          >
            <Heart className={cn("w-4 h-4", activeMainTab === "LIKES_RECEIVED" ? "text-rose-500 fill-rose-500" : "text-rose-400")} />
            <span>Apresiasi Masuk</span>
            {uniqueIncomingLikes.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#317B67] text-white font-bold shadow-xs">
                {uniqueIncomingLikes.length}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-devora-surface-strong text-devora-muted">
                0
              </span>
            )}
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-devora-surface border border-devora-border p-3.5 rounded-container">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-devora-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeMainTab === "MATCHES"
                  ? "Cari rekan cocok berdasarkan nama, keahlian, atau teknologi (misal: Postgres, Next.js)..."
                  : "Cari pengembang yang menyukai profil Anda berdasarkan nama atau keahlian..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-devora-background border border-devora-border rounded-button focus:outline-none focus:border-devora-brand text-devora-ink placeholder:text-devora-muted"
            />
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: "Semua", key: "ALL", icon: Users },
              { label: "UI/UX", key: "UI/UX", icon: Palette },
              { label: "Backend", key: "BACKEND", icon: Server },
              { label: "Frontend", key: "FRONTEND", icon: Layout },
              { label: "Fullstack", key: "FULLSTACK", icon: Layers },
              { label: "AI", key: "AI", icon: Bot },
              { label: "Mobile", key: "MOBILE", icon: Smartphone },
              { label: "DevOps", key: "DEVOPS", icon: Cloud },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedRoleFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedRoleFilter(tab.key)}
                  className={`px-2.5 py-1.5 rounded-button text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-devora-ink text-white"
                      : "bg-devora-surface-strong text-devora-muted hover:text-devora-ink hover:bg-devora-border"
                  }`}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-devora-brand" : "text-devora-muted")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: PARTNER COCOK (MUTUAL MATCHES) */}
        {activeMainTab === "MATCHES" && (
          <>
            {isLoadingMatches && uniqueMatchedCandidates.length === 0 ? (
              <PartnerGridSkeletonList count={4} />
            ) : filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                {filteredMatches.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="p-5 bg-devora-surface border-2 border-devora-border hover:border-devora-border-strong transition-all flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    {/* Header info */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={candidate.avatarUrl}
                            fallback={candidate.name.slice(0, 2).toUpperCase()}
                            size="md"
                            className="border border-devora-border shrink-0"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-devora-ink">
                                {candidate.name}
                              </h3>
                              <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-bold">
                                {candidate.matchScore}% Cocok
                              </Badge>
                            </div>
                            <p className="text-xs text-devora-muted">
                              {candidate.title}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bio quote */}
                      <p className="text-xs text-devora-ink leading-relaxed italic bg-devora-background/60 p-2.5 rounded-button border border-devora-border/60">
                        &ldquo;{candidate.bio}&rdquo;
                      </p>

                      {/* Badges and metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-devora-muted font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-devora-brand" />
                          {candidate.location.split("(")[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-devora-brand" />
                          {candidate.availabilityHrs} jam/mgg
                        </span>
                      </div>

                      {/* Skills preview */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono font-semibold text-devora-muted">
                          Tech Stack Utama:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {candidate.primaryStack.map((tech, idx) => (
                            <Badge
                              key={`${candidate.id}-${tech}-${idx}`}
                              variant="default"
                              className="text-[10px] py-0 px-1.5 bg-devora-surface-strong text-devora-ink"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="pt-3 border-t border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto text-xs gap-1.5 justify-center"
                        onClick={() => setInspectingCandidate(candidate)}
                      >
                        <Info className="w-3.5 h-3.5 text-devora-brand" />
                        <span>Lihat Profil Lengkap</span>
                      </Button>

                      <Link href={`/messages?userId=${candidate.id}`} className="w-full sm:w-auto">
                        <Button
                          size="sm"
                          className="w-full sm:w-auto text-xs gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold shadow-xs justify-center"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Mulai Percakapan</span>
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-16 px-6 sm:py-24 sm:px-10 text-center bg-devora-surface border-2 border-dashed border-devora-border rounded-container flex flex-col items-center justify-center space-y-6 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand shadow-xs">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-2.5 max-w-md mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-devora-ink tracking-tight">
                    Belum Ada Rekan Cocok di Kategori Ini
                  </h3>
                  <p className="text-sm text-devora-muted leading-relaxed">
                    Mulai eksplorasi kandidat rekan pengembang di menu pencarian untuk menemukan mitra kolaborasi ideal Anda.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/find-partner">
                    <Button size="md" className="gap-2 px-6 py-3 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md hover:shadow-lg transition-all rounded-button text-sm">
                      <Flame className="w-4 h-4 fill-white" />
                      <span>Eksplorasi Rekan Pengembang</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </>
        )}

        {/* TAB 2: MENYUKAI ANDA (INCOMING LIKES) */}
        {activeMainTab === "LIKES_RECEIVED" && (
          <>
            {isLoadingIncomingLikes && uniqueIncomingLikes.length === 0 ? (
              <PartnerGridSkeletonList count={4} />
            ) : filteredIncomingLikes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                {filteredIncomingLikes.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="p-5 bg-devora-surface border-2 border-rose-200 dark:border-rose-950/60 hover:border-rose-400 transition-all flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden"
                  >
                    {/* Top heart banner tag */}
                    <div className="absolute top-0 right-0 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-bl-button flex items-center gap-1 border-b border-l border-rose-200/50">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      <span>Menyukai Anda</span>
                    </div>

                    {/* Header info */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={candidate.avatarUrl}
                            fallback={candidate.name.slice(0, 2).toUpperCase()}
                            size="md"
                            className="border-2 border-rose-200 shrink-0"
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-devora-ink">
                                {candidate.name}
                              </h3>
                              <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-bold">
                                {candidate.matchScore}% Cocok
                              </Badge>
                            </div>
                            <p className="text-xs text-devora-muted">
                              {candidate.title}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bio quote */}
                      <p className="text-xs text-devora-ink leading-relaxed italic bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-button border border-rose-200/50">
                        &ldquo;{candidate.bio}&rdquo;
                      </p>

                      {/* Badges and metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-devora-muted font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {candidate.location.split("(")[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-500" />
                          {candidate.availabilityHrs} jam/mgg
                        </span>
                      </div>

                      {/* Skills preview */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono font-semibold text-devora-muted">
                          Tech Stack Utama:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {candidate.primaryStack.map((tech, idx) => (
                            <Badge
                              key={`${candidate.id}-${tech}-${idx}`}
                              variant="default"
                              className="text-[10px] py-0 px-1.5 bg-devora-surface-strong text-devora-ink"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action buttons: Instant Match & Pass */}
                    <div className="pt-3 border-t border-devora-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 text-devora-muted hover:text-devora-ink"
                        onClick={() => setInspectingCandidate(candidate)}
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={processingId === candidate.id}
                          className="text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => handlePassLike(candidate.id, candidate.name)}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Lewati</span>
                        </Button>

                        <Button
                          size="sm"
                          disabled={processingId === candidate.id}
                          className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs transition-transform active:scale-95"
                          onClick={() => handleAcceptLike(candidate.id, candidate.name)}
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          <span>Cocokkan Profil</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-16 px-6 sm:py-24 sm:px-10 text-center bg-devora-surface border-2 border-dashed border-devora-border rounded-container flex flex-col items-center justify-center space-y-6 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 shadow-xs">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <div className="space-y-2.5 max-w-md mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-devora-ink tracking-tight">
                    Belum Ada Apresiasi Profil Baru
                  </h3>
                  <p className="text-sm text-devora-muted leading-relaxed">
                    Pengembang yang menyukai profil Anda akan ditampilkan di sini. Lengkapi portofolio dan riwayat proyek di profil Anda agar semakin diminati calon rekan kolaborasi.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Link href="/profile">
                    <Button variant="secondary" size="md" className="gap-2 px-5 py-2.5 text-xs font-semibold">
                      <span>Perbarui Profil & Portofolio</span>
                    </Button>
                  </Link>
                  <Link href="/find-partner">
                    <Button size="md" className="gap-2 px-5 py-2.5 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md text-xs">
                      <Flame className="w-4 h-4 fill-white" />
                      <span>Eksplorasi Rekan Pengembang</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
