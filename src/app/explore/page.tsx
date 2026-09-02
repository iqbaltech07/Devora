"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Avatar } from "@/components/ui/avatar";
import {
  Search,
  Flame,
  MessageSquare,
  Code2,
  Users,
  Compass,
  Tag,
  Rocket,
  X,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplorePost {
  id: string;
  content: string;
  mediaUrls: string[];
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  tags: string[];
  category: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    title: string;
    primaryStack?: string[];
  };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

interface FeaturedBuilder {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  location?: string;
  primaryStack?: string[];
  experienceLevel?: string;
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [builders, setBuilders] = useState<FeaturedBuilder[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [inspectingPost, setInspectingPost] = useState<ExplorePost | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function loadExploreData() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (selectedTag) params.append("tag", selectedTag);

        const res = await fetch(`/api/explore?${params.toString()}`);
        if (!res.ok) return;

        const data = await res.json();
        setPosts(data.posts || []);
        setBuilders(data.featuredBuilders || []);
        setTags(data.trendingTags || []);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadExploreData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTag]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* ─── 1. EXPLORE HEADER & SEARCH ─── */}
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl sm:rounded-[24px] p-6 sm:p-8 text-white space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5733]/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white">
              <Compass className="w-3.5 h-3.5 text-[#FF5733]" />
              <span>Eksplorasi Karya Komunitas</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Inspirasi & Portofolio Teman Sejawat
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Jelajahi karya UI/UX, arsitektur kode, update build in public, dan temukan builder dengan keahlian yang saling melengkapi.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 mt-1" />
            <input
              type="text"
              placeholder="Cari postingan, UI screenshot, atau tagar (misal: #Nextjs, #AI, #Tailwind)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/10 border border-white/20 rounded-full focus:outline-none focus:border-[#FF5733] text-white placeholder:text-slate-400 backdrop-blur-md"
            />
          </div>
        </div>

        {/* ─── 2. TRENDING TAGS BAR ─── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedTag(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0",
              selectedTag === null
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
            )}
          >
            Semua Trending
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(selectedTag === t ? null : t)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                selectedTag === t
                  ? "bg-[#FF5733] text-white shadow-xs font-bold"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ─── 3. FEATURED BUILDERS STRIP ─── */}
        {builders.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF5733]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Developer Aktif Minggu Ini
                </h2>
              </div>
              <Link href="/find-partner" className="text-xs font-bold text-[#FF5733] hover:underline flex items-center gap-1">
                <span>Cari Match</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {builders.map((b) => (
                <Link
                  key={b.id}
                  href={`/profile/${b.id}`}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#FF5733] transition-all text-center flex flex-col items-center space-y-1.5 group"
                >
                  <Avatar
                    src={b.avatarUrl}
                    fallback={b.name.slice(0, 2).toUpperCase()}
                    size="md"
                    className="w-11 h-11 border border-slate-200 group-hover:border-[#FF5733] transition-colors"
                  />
                  <h3 className="text-xs font-bold text-[#0F172A] group-hover:text-[#FF5733] truncate w-full">
                    {b.name}
                  </h3>
                  <p className="text-[10px] text-[#64748B] truncate w-full">
                    {b.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── 4. EXPLORE POSTS GRID (INSTAGRAM-STYLE GRID) ─── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FF5733]" />
              <span>Showcase Karya</span>
            </h2>
            <span className="text-xs text-[#64748B]">{posts.length} Postingan Ditemukan</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => {
                const hasImage = post.mediaUrls && post.mediaUrls.length > 0;
                const hasCode = Boolean(post.codeSnippet);

                return (
                  <div
                    key={post.id}
                    onClick={() => setInspectingPost(post)}
                    className="group relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-white shadow-xs hover:shadow-md hover:border-[#FF5733] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {/* Visual Media Header or Code Preview */}
                    {hasImage ? (
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                        <img
                          src={post.mediaUrls[0]}
                          alt="Showcase"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                          {post.category}
                        </div>
                      </div>
                    ) : hasCode ? (
                      <div className="p-3 bg-[#0F172A] text-emerald-400 font-mono text-[11px] h-36 overflow-hidden relative">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-2 text-slate-400 text-[10px]">
                          <span>{post.codeLanguage || "code"}</span>
                          <Code2 className="w-3.5 h-3.5 text-[#FF5733]" />
                        </div>
                        <pre className="line-clamp-4 leading-relaxed">{post.codeSnippet}</pre>
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0F172A] to-transparent" />
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 h-32 flex items-center justify-center text-center">
                        <p className="text-xs font-bold text-[#0F172A] line-clamp-3 leading-relaxed">
                          &ldquo;{post.content}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Card Body */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-[#334155] line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            src={post.author.avatarUrl}
                            fallback={post.author.name.slice(0, 2).toUpperCase()}
                            size="sm"
                            className="w-6 h-6 shrink-0"
                          />
                          <span className="text-[11px] font-bold text-[#0F172A] truncate">
                            {post.author.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[11px] text-[#64748B] shrink-0 font-semibold">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-[#FF5733] fill-[#FF5733]" />
                            {post.likeCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3">
              <p className="text-xs font-bold text-[#64748B]">
                Tidak ada karya yang sesuai dengan kriteria pencarian Anda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── 5. INSPECT POST MODAL (INSTAGRAM-STYLE LIGHTBOX) ─── */}
      {inspectingPost && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setInspectingPost(null)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
              <Link
                href={`/profile/${inspectingPost.author.id}`}
                className="flex items-center gap-3 hover:opacity-90"
              >
                <Avatar
                  src={inspectingPost.author.avatarUrl}
                  fallback={inspectingPost.author.name.slice(0, 2).toUpperCase()}
                  size="md"
                  className="w-10 h-10 border border-[#E2E8F0]"
                />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">
                    {inspectingPost.author.name}
                  </h3>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    {inspectingPost.author.title}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setInspectingPost(null)}
                className="p-1.5 text-slate-400 hover:text-[#0F172A] rounded-full hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {inspectingPost.mediaUrls && inspectingPost.mediaUrls.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-900">
                  <img
                    src={inspectingPost.mediaUrls[0]}
                    alt="Showcase"
                    className="w-full max-h-96 object-contain mx-auto"
                  />
                </div>
              )}

              {inspectingPost.codeSnippet && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] text-white font-mono">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
                    <span className="text-[11px] text-slate-300 font-semibold uppercase">
                      {inspectingPost.codeLanguage || "code"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(inspectingPost.codeSnippet!)}
                      className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-200 font-semibold flex items-center gap-1"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? "Tersalin" : "Salin Kode"}</span>
                    </button>
                  </div>
                  <pre className="p-3 text-xs text-emerald-400 overflow-x-auto">
                    <code>{inspectingPost.codeSnippet}</code>
                  </pre>
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed whitespace-pre-line">
                {inspectingPost.content}
              </p>

              {inspectingPost.tags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {inspectingPost.tags.map((t) => (
                    <span key={t} className="text-xs font-bold text-[#FF5733]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs font-bold text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-[#FF5733] fill-[#FF5733]" />
                  {inspectingPost.likeCount} Reaksi
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {inspectingPost.commentCount} Komentar
                </span>
              </div>

              <Link
                href={`/messages?userId=${inspectingPost.author.id}`}
                onClick={() => setInspectingPost(null)}
              >
                <button
                  type="button"
                  className="px-4 py-2 rounded-full bg-[#FF5733] hover:bg-[#D9411E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Ajak Kolaborasi</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
