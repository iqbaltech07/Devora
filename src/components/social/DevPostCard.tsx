"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostItem, usePostStore } from "@/store/usePostStore";
import { Avatar } from "@/components/ui/avatar";
import {
  Flame,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Copy,
  Check,
  MoreHorizontal,
  Trash2,
  Rocket,
  Code2,
  FolderKanban,
  Send,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DevPostCardProps {
  post: PostItem;
}

export function DevPostCard({ post }: DevPostCardProps) {
  const router = useRouter();
  const { toggleLike, toggleBookmark, addComment, deletePost } = usePostStore();

  const [isCopied, setIsCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCopyCode = () => {
    if (!post.codeSnippet) return;
    navigator.clipboard.writeText(post.codeSnippet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const success = await addComment(post.id, commentInput.trim());
      if (success) {
        setCommentInput("");
        setShowComments(true);
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShareToDM = () => {
    router.push(`/messages?sharePostId=${post.id}&userId=${post.author.id}`);
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins}m lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    return `${days}h lalu`;
  };

  return (
    <article className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3.5">
      {/* ─── 1. CARD HEADER ─── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.id}`}>
            <Avatar
              src={post.author.avatarUrl}
              fallback={post.author.name.slice(0, 2).toUpperCase()}
              size="md"
              className="w-10 h-10 sm:w-11 sm:h-11 border border-[#E2E8F0] hover:border-[#FF5733] transition-colors shrink-0"
            />
          </Link>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${post.author.id}`}
                className="text-xs sm:text-sm font-bold text-[#0F172A] hover:text-[#FF5733] transition-colors truncate"
              >
                {post.author.name}
              </Link>
              <span className="text-[10px] text-[#94A3B8]">•</span>
              <span className="text-[10px] text-[#64748B] font-medium">{formatTimeAgo(post.createdAt)}</span>
            </div>

            <p className="text-[11px] text-[#64748B] font-medium truncate">
              {post.author.title}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1.5 text-slate-400 hover:text-[#0F172A] rounded-full hover:bg-slate-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-1 text-left animate-in fade-in">
              <Link
                href={`/profile/${post.author.id}`}
                className="w-full text-xs font-semibold text-[#0F172A] px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2"
                onClick={() => setShowDropdown(false)}
              >
                <span>Lihat Profil</span>
              </Link>

              {post.isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    deletePost(post.id);
                  }}
                  className="w-full text-xs font-semibold text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Postingan</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── 2. CAPTION & HASHTAGS ─── */}
      {post.content && (
        <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {post.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[11px] font-bold text-[#FF5733] hover:underline cursor-pointer"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* ─── 3. RICH MEDIA CAROUSEL / LIGHTBOX ─── */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-900 shadow-xs">
          {post.mediaUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Media ${idx + 1}`}
              className="w-full max-h-[480px] object-contain mx-auto bg-slate-950"
            />
          ))}
        </div>
      )}

      {/* ─── 4. FORMATTED CODE SNIPPET ─── */}
      {post.codeSnippet && (
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] text-white shadow-xs font-mono">
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-semibold text-slate-300 ml-1.5 uppercase">
                {post.codeLanguage || "code"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 font-semibold flex items-center gap-1 transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3.5 text-xs text-emerald-400 overflow-x-auto leading-relaxed">
            <code>{post.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Attached Project Badge */}
      {post.project && (
        <Link href="/projects">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:border-[#FF5733] flex items-center justify-between text-xs transition-colors group">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#FF5733]" />
              <span className="font-bold text-[#0F172A] group-hover:text-[#FF5733]">
                Proyek: {post.project.title}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {post.project.stage}
            </span>
          </div>
        </Link>
      )}

      {/* ─── 5. SOCIAL ACTION BAR ─── */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Like / Flame Reaction Button */}
          <button
            type="button"
            onClick={() => toggleLike(post.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-90",
              post.isLiked
                ? "bg-[#FFF1EE] text-[#FF5733]"
                : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
            )}
          >
            <Flame
              className={cn(
                "w-4 h-4 transition-transform",
                post.isLiked ? "fill-[#FF5733] text-[#FF5733] scale-110" : "text-[#64748B]"
              )}
            />
            <span>{post.likeCount}</span>
          </button>

          {/* Comments Toggle Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount}</span>
          </button>

          {/* Share to DM Button */}
          <button
            type="button"
            onClick={handleShareToDM}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] flex items-center gap-1.5 transition-colors"
            title="Bagikan ke Pesan DM"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => toggleBookmark(post.id)}
            className={cn(
              "p-2 rounded-full transition-colors",
              post.isBookmarked
                ? "text-[#FF5733] bg-[#FFF1EE]"
                : "text-slate-400 hover:text-[#0F172A] hover:bg-slate-100"
            )}
            title="Simpan Postingan"
          >
            <Bookmark className={cn("w-4 h-4", post.isBookmarked && "fill-[#FF5733]")} />
          </button>

          {/* Ajak Kolaborasi CTA */}
          {!post.isOwner && (
            <Link href={`/messages?userId=${post.author.id}`}>
              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <Rocket className="w-3 h-3 text-[#FF5733]" />
                <span>Ajak Kolaborasi</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* ─── 6. COMMENTS SECTION ─── */}
      {showComments && (
        <div className="pt-3 border-t border-[#E2E8F0] space-y-3 animate-in fade-in">
          {/* Existing comments */}
          {post.previewComments && post.previewComments.length > 0 ? (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {post.previewComments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Avatar
                    src={c.author.avatarUrl}
                    fallback={c.author.name.slice(0, 2).toUpperCase()}
                    size="sm"
                    className="w-6 h-6 shrink-0 mt-0.5"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A] truncate">{c.author.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-[#334155] leading-relaxed break-words">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2 italic">
              Belum ada komentar. Jadilah yang pertama memberikan masukan!
            </p>
          )}

          {/* Write comment input */}
          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tulis komentar atau diskusi teknis..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#FF5733] text-[#0F172A] placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentInput.trim()}
              className="p-2 rounded-xl bg-[#FF5733] text-white hover:bg-[#D9411E] disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
