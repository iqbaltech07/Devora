"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { usePostStore } from "@/store/usePostStore";
import { useUserStore } from "@/store/useUserStore";
import { useMatchStore } from "@/store/useMatchStore";
import { DevStoryBar } from "@/components/social/DevStoryBar";
import { CreatePostBox } from "@/components/social/CreatePostBox";
import { DevPostCard } from "@/components/social/DevPostCard";
import { RightSidebarWidget } from "@/components/social/RightSidebarWidget";
import { Avatar } from "@/components/ui/avatar";
import {
  Rss,
  Layers,
  Terminal,
  Palette,
  Users,
  Lightbulb,
  Loader2,
  Sparkles,
  Flame,
  ArrowRight,
  FolderKanban,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEED_CATEGORIES = [
  { label: "Cari Partner", key: "NEED_PARTNER", icon: Users, isHighlight: true },
  { label: "Build In Public", key: "BUILD_IN_PUBLIC", icon: Terminal },
  { label: "Showcase UI/UX", key: "SHOWCASE", icon: Palette },
  { label: "Semua Postingan", key: "ALL", icon: Layers },
  { label: "Tips & Insight", key: "TECH_TIPS", icon: Lightbulb },
];

const QUICK_ROLES = [
  { label: "Frontend", role: "FRONTEND" },
  { label: "Backend", role: "BACKEND" },
  { label: "UI/UX", role: "UI/UX" },
  { label: "Fullstack", role: "FULLSTACK" },
  { label: "AI & ML", role: "AI" },
  { label: "Mobile", role: "MOBILE" },
];

export default function DashboardPage() {
  const { posts, activeCategory, setActiveCategory, fetchPosts, isLoading } = usePostStore();
  const { currentUser, fetchProfile } = useUserStore();
  const { candidates, fetchCandidates } = useMatchStore();

  useEffect(() => {
    fetchPosts();
    fetchProfile();
    fetchCandidates();
  }, [fetchPosts, fetchProfile, fetchCandidates]);

  // Check whether user has zero connections/following
  const isZeroConnection =
    currentUser.id &&
    (currentUser.followingCount ?? 0) === 0 &&
    (currentUser.connectionsCount ?? 0) === 0;

  const topCandidates = candidates.slice(0, 3);

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* ─── 1. HERO PARTNER MATCHMAKING SPOTLIGHT (ELEVATING PROJECT PARTNERSHIP) ─── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[24px] border border-[#317B67]/25 bg-gradient-to-br from-[#E8F7F0]/90 via-white to-[#E8F7F0]/40 p-5 sm:p-7 shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#317B67] text-white text-[11px] font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Developer Matchmaking & Co-founder Hub</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
                Temukan Rekan Ngoding & Partner Proyek Impian
              </h2>

              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Devora memprioritaskan pencarian partner kolaboratif berdasarkan tech stack, ritme kerja, dan visi proyek. Temukan rekan yang siap membangun bersama!
              </p>

              {/* Quick Role Selectors */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#317B67] mr-1">Cari Peran:</span>
                {QUICK_ROLES.map((r) => (
                  <Link
                    key={r.role}
                    href={`/findpartner?roles=${r.role}`}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#CBD5E1] hover:border-[#317B67] hover:text-[#317B67] text-[#0F172A] rounded-md transition-colors shadow-xs"
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <a
                href="https://devora-find-git-dev-iqblfrdsyhs-projects.vercel.app/find-partner"
                className="px-5 py-3 rounded-xl bg-[#317B67] hover:bg-[#245E4E] text-white text-xs font-bold shadow-md shadow-[#317B67]/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>Mulai Matchmaking Partner</span>
              </a>

              <Link
                href="/projects"
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <FolderKanban className="w-4 h-4 text-[#317B67]" />
                <span>Lihat Proyek Terbuka</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 2. TOP DEV STORY BAR (DAILY SPRINT 24H) ─── */}
        <DevStoryBar />

        {/* ─── 3. MAIN FEED LAYOUT (2-COLUMN: FEED & RIGHT WIDGETS) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column (7-8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Create Post Composer */}
            <CreatePostBox />

            {/* ─── 4. NEW USER / ZERO CONNECTIONS EMPTY STATE ─── */}
            {isZeroConnection && (
              <div className="bg-white border-2 border-[#317B67]/30 rounded-2xl sm:rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-[#E8F7F0] text-[#317B67] flex items-center justify-center mx-auto shadow-xs">
                  <UserPlus className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                    Anda Belum Mempunyai Teman / Rekan Proyek
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    Devora dirancang untuk membantu Anda menemukan rekan ngoding dan co-founder untuk berkolaborasi membangun produk. Mulai cari teman sekarang agar linimasa karya Anda lebih hidup!
                  </p>
                </div>

                {/* Direct Required Action Button */}
                <div>
                  <a
                    href="https://devora-find-git-dev-iqblfrdsyhs-projects.vercel.app/find-partner"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#317B67] hover:bg-[#245E4E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#317B67]/30 transition-all active:scale-95"
                  >
                    <Users className="w-4 h-4" />
                    <span>Cari Teman Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Quick Recommendations Preview */}
                {topCandidates.length > 0 && (
                  <div className="pt-4 border-t border-[#E2E8F0] space-y-3 text-left">
                    <p className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#317B67]" />
                      <span>Rekomendasi Partner Proyek untuk Anda:</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {topCandidates.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={c.avatarUrl}
                              fallback={c.name.slice(0, 2).toUpperCase()}
                              size="sm"
                              className="border border-[#E2E8F0]"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-[#0F172A] truncate">
                                {c.name}
                              </h4>
                              <p className="text-[10px] text-[#64748B] truncate">
                                {c.title || "Developer"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                            <span className="font-bold text-[#317B67] bg-[#E8F7F0] px-1.5 py-0.5 rounded">
                              {c.matchScore ? `${c.matchScore}% Match` : "92% Match"}
                            </span>
                            <Link
                              href={`/profile/${c.id}`}
                              className="text-[10px] font-bold text-[#317B67] hover:underline"
                            >
                              Lihat Profil
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category Filter Tabs Bar (Modern Rectangular Segmented Tabs) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {FEED_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0",
                      isActive
                        ? "bg-[#0F172A] text-white shadow-xs font-bold"
                        : cat.isHighlight
                        ? "bg-[#E8F7F0] text-[#317B67] border border-[#317B67]/30 hover:bg-[#317B67] hover:text-white font-bold"
                        : "bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#317B67]" : cat.isHighlight ? "text-[#317B67]" : "text-[#64748B]")} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feed Stream */}
            {isLoading && posts.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
                <Loader2 className="w-8 h-8 text-[#317B67] animate-spin" />
                <p className="text-xs font-bold text-[#64748B]">
                  Memuat timeline karya komunitas...
                </p>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <DevPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-2xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F7F0] text-[#317B67] flex items-center justify-center mx-auto shadow-xs">
                  <Rss className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Belum Ada Postingan di Kategori Ini
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Jadilah developer pertama yang membagikan progres proyek, snippet kode, atau mencari rekan kolaborasi di sini!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Widget (4 cols) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-5">
            <RightSidebarWidget />
          </div>
        </div>
      </div>
    </Shell>
  );
}
