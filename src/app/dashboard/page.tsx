"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { useUserStore } from "@/store/useUserStore";
import { useMatchStore } from "@/store/useMatchStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Users,
  FolderKanban,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  Zap,
  Code2,
  Heart,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { currentUser, isAuthenticated, fetchProfile } = useUserStore();
  const { matchedCandidates, incomingLikes, candidates, fetchCandidates, fetchMatches, fetchIncomingLikes } = useMatchStore();
  const { projects, fetchProjects } = useProjectStore();
  const { notifications, unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchProfile();
    fetchCandidates();
    fetchMatches();
    fetchIncomingLikes();
    fetchProjects();
    fetchNotifications();
  }, [fetchProfile, fetchCandidates, fetchMatches, fetchIncomingLikes, fetchProjects, fetchNotifications]);

  const topMatches = matchedCandidates.length > 0 ? matchedCandidates.slice(0, 3) : candidates.slice(0, 3);
  const featuredProjects = projects.slice(0, 3);

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* ─── 1. HERO GREETING BANNER ─── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[24px] bg-[#0F172A] text-white p-5 sm:p-8 shadow-sm">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF5733]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <Avatar
                src={
                  currentUser.image ||
                  currentUser.avatarUrl ||
                  (currentUser.githubUsername
                    ? `https://github.com/${currentUser.githubUsername}.png`
                    : undefined)
                }
                fallback={currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : "DV"}
                size="lg"
                className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-white/20 shadow-lg shrink-0 mt-0.5 sm:mt-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5733]" />
                  <span>Sistem Aktif & Terhubung</span>
                </div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate">
                  Halo, {currentUser.name || "Developer"}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                  {currentUser.title || "Siap menemukan partner ngoding dan bangun proyek impianmu hari ini?"}
                </p>
              </div>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link href="/find-partner" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#FF5733] hover:bg-[#D9411E] text-white text-xs font-bold shadow-md shadow-[#FF5733]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Cari Partner Ngoding</span>
                </button>
              </Link>

              <Link href="/projects/new" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Proyek</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 2. STATS OVERVIEW CARDS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Matches */}
          <Link href="/matches">
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 sm:p-5 shadow-xs hover:border-[#FF5733] hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Teman Cocok
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#FFF1EE] text-[#FF5733] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                  {matchedCandidates.length}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">Aktif</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Saling menyukai</p>
            </div>
          </Link>

          {/* Card 2: Likes Received */}
          <Link href="/matches">
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 sm:p-5 shadow-xs hover:border-[#FF5733] hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Peminat Profil
                </span>
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4 fill-pink-600" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                  {incomingLikes.length}
                </span>
                <span className="text-[11px] text-[#FF5733] font-semibold">
                  {incomingLikes.length > 0 ? "Menunggu Respon" : "Terkini"}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Geser balik untuk match</p>
            </div>
          </Link>

          {/* Card 3: Active Projects */}
          <Link href="/projects">
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 sm:p-5 shadow-xs hover:border-[#FF5733] hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Proyek Terbuka
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderKanban className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                  {projects.length}
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">Eksplor</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Buka lowongan kolaborator</p>
            </div>
          </Link>

          {/* Card 4: Unread Messages / Notifications */}
          <Link href="/messages">
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 sm:p-5 shadow-xs hover:border-[#FF5733] hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Obrolan & Notif
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                  {unreadCount}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">Real-time</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Pesan & lamaran proyek</p>
            </div>
          </Link>
        </div>

        {/* ─── 3. TWO-COLUMN MAIN CONTENT (RECOMMENDED PARTNERS & TRENDING PROJECTS) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 Cols): Rekomendasi Partner Hari Ini */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#FF5733] fill-[#FF5733]" />
                  <span>Rekomendasi Partner Cocok</span>
                </h2>
                <p className="text-xs text-[#64748B]">
                  Developer dengan keahlian saling melengkapi stack kamu.
                </p>
              </div>

              <Link href="/find-partner" className="text-xs font-bold text-[#FF5733] hover:underline flex items-center gap-1">
                <span>Swipe Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {topMatches.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <Link href={`/profile/${candidate.id}`}>
                      <Avatar
                        src={candidate.avatarUrl}
                        fallback={candidate.name.slice(0, 2).toUpperCase()}
                        size="lg"
                        className="border border-[#E2E8F0] shrink-0 hover:border-[#FF5733] transition-colors cursor-pointer"
                      />
                    </Link>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${candidate.id}`} className="hover:text-[#FF5733] transition-colors">
                          <h3 className="text-sm font-bold text-[#0F172A]">{candidate.name}</h3>
                        </Link>
                        <span className="px-2 py-0.5 rounded-full bg-[#FFF1EE] text-[#FF5733] text-[10px] font-bold font-mono">
                          {candidate.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#64748B]">{candidate.title}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {candidate.primaryStack.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] text-[10px] font-semibold"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link href={`/profile/${candidate.id}`} className="w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>Lihat Profil</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (5 Cols): Proyek Komunitas Populer */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-blue-600" />
                  <span>Proyek Komunitas</span>
                </h2>
                <p className="text-xs text-[#64748B]">
                  Peluang kolaborasi yang sedang mencari peranmu.
                </p>
              </div>

              <Link href="/projects" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-xs hover:shadow-md transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] line-clamp-1">
                      {project.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold shrink-0">
                      {project.stage || "Ideation"}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                    <span className="text-[10px] text-[#94A3B8]">
                      {project.roles?.length || 1} Peran Dibutuhkan
                    </span>
                    <Link
                      href="/projects"
                      className="text-xs font-bold text-[#FF5733] hover:underline flex items-center gap-1"
                    >
                      Ajukan Diri →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
