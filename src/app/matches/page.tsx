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
import {
  Users,
  Search,
  Flame,
  MessageSquare,
  Clock,
  MapPin,
  Info,
  ExternalLink,
  CheckCircle2,
  Filter,
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
  const { matchedCandidates, setInspectingCandidate, fetchMatches, fetchCandidates, isLoadingMatches } = useMatchStore();
  const { fetchProfile } = useUserStore();
  
  useEffect(() => {
    fetchProfile();
    fetchCandidates();
    fetchMatches();
  }, [fetchProfile, fetchCandidates, fetchMatches]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  const uniqueMatchedCandidates = Array.from(
    new Map(matchedCandidates.map((c) => [c.id, c])).values()
  );

  // Filtering
  const filteredMatches = uniqueMatchedCandidates.filter((candidate) => {
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
        candidate.skills.some((s) => s.category === "UI/UX" || s.name.toLowerCase().includes("figma") || s.name.toLowerCase().includes("design"))
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
      return candidate.title.toLowerCase().includes("devops") || candidate.title.toLowerCase().includes("cloud") || candidate.tags.includes("DevOps") || candidate.tags.includes("Cloud");

    return true;
  });

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-devora-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-devora-brand" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-devora-muted">
                Daftar Teman Cocok
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-devora-ink tracking-tight mt-1">
              Teman Ngoding yang Cocok ({matchedCandidates.length})
            </h1>
            <p className="text-xs sm:text-sm text-devora-muted mt-0.5">
              Daftar developer yang sefrekuensi sama kamu. Sapa mereka, cek spek skill, atau mulai diskusi proyek!
            </p>
          </div>

          <Link href="/find-partner">
            <Button size="sm" className="gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-semibold">
              <Flame className="w-4 h-4 fill-white" />
              <span>Swipe Partner Lainnya</span>
            </Button>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-devora-surface border border-devora-border p-3.5 rounded-container">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-devora-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari teman cocok berdasarkan nama, skill, atau stack (misal: Postgres, Next.js)..."
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

        {/* Matched Partners List / Grid */}
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
                            {candidate.matchScore}% Match
                          </Badge>
                        </div>
                        <p className="text-xs text-devora-muted">
                          {candidate.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio quote */}
                  <p className="text-xs text-devora-ink leading-relaxed italic bg-devora-background/60 p-2 rounded-button border border-devora-border/60">
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
                <div className="pt-3 border-t border-devora-border flex items-center justify-between gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => setInspectingCandidate(candidate)}
                  >
                    <Info className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Lihat Spec Lengkap</span>
                  </Button>

                  <Link href="/messages">
                    <Button
                      size="sm"
                      className="text-xs gap-1.5 bg-devora-brand text-white hover:bg-devora-brand-dark font-bold shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Sapa & Ajak Ngobrol</span>
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
                Belum Ada Teman Cocok di Kategori Ini
              </h3>
              <p className="text-sm text-devora-muted leading-relaxed">
                Yuk mulai swipe calon partner di arena pencarian biar bisa nemuin teman ngoding impian kamu!
              </p>
            </div>
            <div className="pt-2">
              <Link href="/find-partner">
                <Button size="md" className="gap-2 px-6 py-3 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md hover:shadow-lg transition-all rounded-button text-sm">
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Mulai Swipe Sekarang</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </Shell>
  );
}
