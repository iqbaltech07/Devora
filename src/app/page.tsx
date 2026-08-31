"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useMatchStore } from "@/store/useMatchStore";
import { useUserStore } from "@/store/useUserStore";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Flame,
  Users,
  FolderKanban,
  ArrowRight,
  PlusCircle,
  Code2,
  Clock,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Zap,
  Heart,
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser, fetchProfile } = useUserStore();
  const { matchedCandidates, candidates, swipedIds, setInspectingCandidate, fetchCandidates, fetchMatches } = useMatchStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProfile();
    fetchProjects();
    fetchCandidates();
    fetchMatches();
  }, [fetchProfile, fetchProjects, fetchCandidates, fetchMatches]);

  const unswipedCount = candidates.filter((c) => !swipedIds.includes(c.id)).length;

  return (
    <Shell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Welcome & High Level Metrics Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-devora-border pb-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-devora-brand">
              Ruang Kerja Builder
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-devora-ink tracking-tight">
              Halo, {(currentUser.name || "Builder").split(" ")[0]}! Siap ngoding bareng?
            </h1>
            <p className="text-xs sm:text-sm text-devora-muted">
              {currentUser.title || "Spesialis Builder"} • Ada waktu santai {currentUser.availabilityHrs || 0} jam/minggu
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/find-partner">
              <Button size="md" className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md">
                <Flame className="w-4 h-4 fill-white" />
                <span>Swipe Partner Baru ({unswipedCount})</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4 bg-devora-surface border-devora-border">
            <div className="w-12 h-12 rounded-button bg-devora-brand/10 border border-devora-brand/20 flex items-center justify-center text-devora-brand shrink-0">
              <Heart className="w-6 h-6 fill-devora-brand" />
            </div>
            <div>
              <span className="text-2xl font-bold text-devora-ink block">
                {matchedCandidates.length}
              </span>
              <span className="text-xs text-devora-muted font-medium">
                Teman yang Cocok
              </span>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 bg-devora-surface border-devora-border">
            <div className="w-12 h-12 rounded-button bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-devora-ink block">
                {unswipedCount}
              </span>
              <span className="text-xs text-devora-muted font-medium">
                Calon Partner Baru
              </span>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 bg-devora-surface border-devora-border">
            <div className="w-12 h-12 rounded-button bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-devora-ink block">
                {projects.length}
              </span>
              <span className="text-xs text-devora-muted font-medium">
                Proyek Kolaborasi
              </span>
            </div>
          </Card>
        </div>

        {/* Main Swipe Banner CTA */}
        <Card elevated className="p-6 sm:p-8 bg-gradient-to-br from-devora-surface to-devora-surface-strong border-2 border-devora-border relative overflow-hidden">
          <div className="max-w-xl space-y-3 relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-devora-brand">
              <Flame className="w-4 h-4 fill-devora-brand text-devora-brand" />
              <span>Swipe & Match Arena</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-devora-ink tracking-tight">
              Lagi cari partner buat project baru?
            </h2>

            <p className="text-sm text-devora-muted leading-relaxed">
              Yuk temuin developer yang punya keahlian dan waktu yang pas buat proyek kamu. Cek tech stack, repositori GitHub, dan match fit mereka cuma dengan sekali swipe!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href="/find-partner">
                <Button size="md" className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold">
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Mulai Swipe Sekarang</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/matches">
                <Button variant="secondary" size="md">
                  Lihat Teman yang Cocok ({matchedCandidates.length})
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 items-center gap-3 opacity-90">
            <div className="w-28 h-36 rounded-container bg-devora-surface border-2 border-devora-border shadow-lg -rotate-6 flex flex-col items-center justify-center p-3 text-center space-y-1">
              <Avatar fallback="AL" size="sm" />
              <span className="text-[11px] font-bold text-devora-ink">Alex R.</span>
              <span className="text-[9px] text-devora-brand font-semibold">95% Fit</span>
            </div>
            <div className="w-32 h-40 rounded-container bg-devora-surface border-2 border-devora-brand shadow-xl rotate-3 flex flex-col items-center justify-center p-3 text-center space-y-1.5 z-10">
              <div className="w-6 h-6 rounded-full bg-devora-brand text-white flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 fill-white" />
              </div>
              <Avatar fallback="EL" size="md" />
              <span className="text-xs font-bold text-devora-ink">Elena R.</span>
              <span className="text-[10px] text-devora-brand font-semibold">91% Match</span>
            </div>
          </div>
        </Card>

        {/* Matched Partners Preview Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-devora-ink tracking-tight">
                Teman Ngoding yang Cocok Sama Kamu
              </h2>
              <p className="text-xs text-devora-muted">
                Developer yang punya tech stack sefrekuensi dan siap diajak ngobrol santai
              </p>
            </div>
            <Link href="/matches" className="text-xs text-devora-brand hover:underline font-semibold flex items-center gap-1">
              <span>Lihat Semua Teman Cocok</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {Array.from(new Map(matchedCandidates.map((c) => [c.id, c])).values()).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(new Map(matchedCandidates.map((c) => [c.id, c])).values())
                .slice(0, 2)
                .map((candidate) => (
                  <Card key={candidate.id} className="p-5 bg-devora-surface border-devora-border flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={candidate.avatarUrl}
                          fallback={candidate.name.slice(0, 2).toUpperCase()}
                          size="md"
                          className="border border-devora-border"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-devora-ink">
                              {candidate.name}
                            </h3>
                            <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-bold">
                              {candidate.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-devora-muted line-clamp-1">
                            {candidate.title}
                          </p>
                          <span className="text-[11px] text-devora-muted flex items-center gap-1 pt-0.5">
                            <Clock className="w-3 h-3 text-devora-brand" />
                            {candidate.availabilityHrs} jam/mgg ({candidate.timezone.split(" ")[0]})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {candidate.primaryStack.slice(0, 4).map((tech, idx) => (
                        <Badge key={`${candidate.id}-${tech}-${idx}`} variant="default" className="text-[10px] py-0 px-1.5">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                  <div className="pt-2 border-t border-devora-border flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => setInspectingCandidate(candidate)}
                    >
                      <span>Lihat Spec Lengkap</span>
                    </Button>
                    <Link href="/messages">
                      <Button size="sm" className="text-xs gap-1.5 bg-devora-ink text-white hover:bg-devora-ink-soft">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Sapa & Ajak Ngobrol</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12 px-6 text-center bg-devora-surface border-2 border-dashed border-devora-border rounded-container flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand shadow-xs">
                <Flame className="w-6 h-6 fill-devora-brand" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-devora-ink">
                  Belum ada teman yang cocok nih
                </h3>
                <p className="text-xs text-devora-muted leading-relaxed">
                  Yuk mulai swipe kartu partner di arena pencarian buat nemuin collaborator yang sefrekuensi!
                </p>
              </div>
              <div className="pt-1">
                <Link href="/find-partner">
                  <Button size="md" className="gap-2 px-5 py-2.5 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold text-xs shadow-md rounded-button">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Mulai Swipe Sekarang</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Action Cards: Post Project & Edit Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Card className="p-6 bg-devora-surface border-devora-border space-y-3">
            <div className="w-10 h-10 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-devora-ink">
                Punya Ide Proyek Keren?
              </h3>
              <p className="text-xs text-devora-muted leading-relaxed">
                Posting kebutuhan tim kamu, sebutkan role apa aja yang kamu butuhin (misal: UI/UX, Backend), dan ajak developer lain gabung!
              </p>
            </div>
            <div className="pt-1">
              <Link href="/projects/new">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-semibold">
                  <span>Bikin Listing Proyek</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 bg-devora-surface border-devora-border space-y-3">
            <div className="w-10 h-10 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-devora-ink">
                Lengkapi Profil & Skill Kamu
              </h3>
              <p className="text-xs text-devora-muted leading-relaxed">
                Pasang skill andalan dan waktu santai kamu biar gampang diajak kolaborasi sama developer lain yang butuh keahlian kamu.
              </p>
            </div>
            <div className="pt-1">
              <Link href="/profile">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-semibold">
                  <span>Atur Profil & Skill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
