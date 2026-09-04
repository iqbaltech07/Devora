"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { usePostStore } from "@/store/usePostStore";
import { useUserStore } from "@/store/useUserStore";
import { DevStoryBar } from "@/components/social/DevStoryBar";
import { CreatePostBox } from "@/components/social/CreatePostBox";
import { DevPostCard } from "@/components/social/DevPostCard";
import { RightSidebarWidget } from "@/components/social/RightSidebarWidget";
import {
  Rss,
  Layers,
  Terminal,
  Palette,
  Users,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEED_CATEGORIES = [
  { label: "Semua Postingan", key: "ALL", icon: Layers },
  { label: "Build In Public", key: "BUILD_IN_PUBLIC", icon: Terminal },
  { label: "Showcase UI/UX", key: "SHOWCASE", icon: Palette },
  { label: "Cari Partner", key: "NEED_PARTNER", icon: Users },
  { label: "Tips & Insight", key: "TECH_TIPS", icon: Lightbulb },
];

export default function DashboardPage() {
  const { posts, activeCategory, setActiveCategory, fetchPosts, isLoading } = usePostStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* ─── 1. TOP DEV STORY BAR (DAILY SPRINT 24H) ─── */}
        <DevStoryBar />

        {/* ─── 2. MAIN FEED LAYOUT (2-COLUMN: FEED & RIGHT WIDGETS) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column (7-8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Create Post Composer */}
            <CreatePostBox />

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
                        : "bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#FF5733]" : "text-[#64748B]")} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feed Stream */}
            {isLoading && posts.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
                <Loader2 className="w-8 h-8 text-[#FF5733] animate-spin" />
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
                <div className="w-14 h-14 rounded-2xl bg-[#FFF1EE] text-[#FF5733] flex items-center justify-center mx-auto shadow-xs">
                  <Rss className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Belum Ada Postingan di Kategori Ini
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Jadilah developer pertama yang membagikan progres proyek, snippet kode, atau showcase UI di sini!
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
