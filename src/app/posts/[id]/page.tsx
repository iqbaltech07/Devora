"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PostItem, PostComment, usePostStore } from "@/store/usePostStore";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { playNotificationSound } from "@/lib/sound";
import {
  Heart,
  Flame,
  MessageSquare,
  Bookmark,
  Share2,
  ArrowLeft,
  Send,
  CornerDownRight,
  Copy,
  Check,
  MoreHorizontal,
  Trash2,
  Code2,
  Quote,
  Rocket,
  UserPlus,
  UserCheck,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function renderFormattedContent(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9_\.\-]+|#[a-zA-Z0-9_]+)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("@")) {
      return (
        <span
          key={idx}
          className="text-[#FF5733] font-bold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    if (part.startsWith("#")) {
      return (
        <span
          key={idx}
          className="text-[#FF5733] font-semibold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = use(params);
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { addToast } = useUiStore();
  const { toggleLike, toggleBookmark, addComment, toggleCommentLike, deletePost } = usePostStore();

  const [post, setPost] = useState<PostItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const fetchSinglePost = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) {
        setPost(null);
        return;
      }
      const data = await res.json();
      setPost(data);

      // Check author follow status
      if (data.author?.id && currentUser?.id && data.author.id !== currentUser.id) {
        try {
          const fRes = await fetch(`/api/users/${data.author.id}/follow`);
          if (fRes.ok) {
            const fData = await fRes.json();
            setIsFollowingAuthor(fData.isFollowing);
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("fetchSinglePost error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSinglePost();
  }, [postId, currentUser?.id]);

  const handleToggleLike = async () => {
    if (!post) return;
    const nextIsLiked = !post.isLiked;
    const nextCount = nextIsLiked ? post.likeCount + 1 : Math.max(0, post.likeCount - 1);

    setPost({
      ...post,
      isLiked: nextIsLiked,
      likeCount: nextCount,
    });

    await toggleLike(post.id);
  };

  const handleToggleBookmark = async () => {
    if (!post) return;
    const nextIsBookmarked = !post.isBookmarked;
    const nextCount = nextIsBookmarked ? post.bookmarkCount + 1 : Math.max(0, post.bookmarkCount - 1);

    setPost({
      ...post,
      isBookmarked: nextIsBookmarked,
      bookmarkCount: nextCount,
    });

    await toggleBookmark(post.id);
  };

  const handleToggleCommentLikeLocal = async (commentId: string) => {
    if (!post) return;

    const updateLike = (c: PostComment): PostComment => {
      if (c.id === commentId) {
        const next = !c.isLiked;
        return {
          ...c,
          isLiked: next,
          likeCount: next ? c.likeCount + 1 : Math.max(0, c.likeCount - 1),
        };
      }
      if (c.replies?.length) {
        return { ...c, replies: c.replies.map(updateLike) };
      }
      return c;
    };

    setPost({
      ...post,
      previewComments: post.previewComments.map(updateLike),
    });

    await toggleCommentLike(post.id, commentId);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment || !post) return;

    try {
      setIsSubmittingComment(true);
      const success = await addComment(post.id, commentInput.trim(), replyingTo?.id);
      if (success) {
        playNotificationSound();
        setCommentInput("");
        setReplyingTo(null);
        await fetchSinglePost();
        addToast({
          title: "Komentar Terkirim",
          description: "Komentar Anda telah dipublikasikan.",
          type: "success",
        });
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!post || isFollowLoading) return;
    try {
      setIsFollowLoading(true);
      const res = await fetch(`/api/users/${post.author.id}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsFollowingAuthor(data.following);
        addToast({
          title: data.following ? "Berhasil Mengikuti" : "Batal Mengikuti",
          description: data.following
            ? `Anda sekarang mengikuti ${post.author.name}.`
            : `Anda telah berhenti mengikuti ${post.author.name}.`,
          type: "info",
        });
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        title: "Tautan Disalin",
        description: "Tautan postingan telah disalin ke papan klip.",
        type: "success",
      });
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
      const ok = await deletePost(post.id);
      if (ok) {
        addToast({
          title: "Postingan Dihapus",
          description: "Postingan Anda telah berhasil dihapus.",
          type: "info",
        });
        router.push("/dashboard");
      }
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins}m yang lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days}h yang lalu`;
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#FF5733] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Memuat detail karya postingan...</p>
        </div>
      </Shell>
    );
  }

  if (!post) {
    return (
      <Shell>
        <div className="max-w-xl mx-auto py-16 text-center space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-xs">
          <h2 className="text-lg font-bold text-[#0F172A]">Postingan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            Postingan yang Anda cari mungkin telah dihapus atau tautan tidak valid.
          </p>
          <Button onClick={() => router.back()} className="gap-2 bg-[#0F172A] text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Button>
        </div>
      </Shell>
    );
  }

  const hasImage = post.mediaUrls && post.mediaUrls.length > 0;
  const hasCode = Boolean(post.codeSnippet);

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-4 pb-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0F172A] transition-colors p-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF5733]" />
            <span>Kembali</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            Post #{post.id.slice(0, 8)}
          </span>
        </div>

        {/* Instagram-style 2-Column Desktop Post Frame */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Column: Visual Media / Code / Quote */}
          <div className="lg:col-span-7 bg-[#0F172A] flex flex-col items-center justify-center relative min-h-[360px] lg:min-h-[580px] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
            {hasImage ? (
              <div className="w-full h-full flex items-center justify-center bg-black/90 p-2">
                <img
                  src={post.mediaUrls[0]}
                  alt="Post media"
                  className="w-full h-full max-h-[580px] object-contain"
                />
              </div>
            ) : hasCode ? (
              <div className="w-full h-full p-4 sm:p-6 text-emerald-400 font-mono text-xs flex flex-col justify-between overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400">
                  <span className="uppercase text-[11px] font-bold text-slate-300">
                    {post.codeLanguage || "Source Code"}
                  </span>
                  <button
                    onClick={() => handleCopyCode(post.codeSnippet!)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-white font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "Tersalin" : "Salin Kode"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-black/40 rounded-xl leading-relaxed overflow-x-auto">
                  <code>{post.codeSnippet}</code>
                </pre>
                <div className="pt-4 text-right text-[10px] text-slate-500 font-sans">
                  Devora Code Showcase
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-white space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-full bg-[#FF5733]/20 text-[#FF5733] flex items-center justify-center mx-auto">
                  <Quote className="w-6 h-6" />
                </div>
                <p className="text-base sm:text-lg font-medium italic leading-relaxed text-slate-200">
                  &ldquo;{post.content}&rdquo;
                </p>
                <span className="inline-block text-xs font-mono text-slate-400">
                  — {post.author.name}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Author Header, Caption, Comments, Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white h-full">
            {/* 1. Header with Author Info & Follow */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Link href={`/profile/${post.author.id}`}>
                  <Avatar
                    src={post.author.avatarUrl}
                    fallback={post.author.name.slice(0, 2).toUpperCase()}
                    size="md"
                    className="w-10 h-10 border border-[#E2E8F0] hover:border-[#FF5733] transition-colors shrink-0"
                  />
                </Link>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${post.author.id}`}
                      className="text-xs sm:text-sm font-bold text-[#0F172A] hover:text-[#FF5733] transition-colors truncate"
                    >
                      {post.author.name}
                    </Link>
                  </div>
                  <p className="text-[11px] text-[#64748B] truncate">
                    {post.author.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentUser?.id && currentUser.id !== post.author.id && (
                  <Button
                    size="sm"
                    variant={isFollowingAuthor ? "secondary" : "primary"}
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    className={cn(
                      "text-[11px] h-8 px-3 rounded-full font-bold",
                      !isFollowingAuthor && "bg-[#FF5733] hover:bg-[#D9411E] text-white"
                    )}
                  >
                    {isFollowingAuthor ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                        <span>Mengikuti</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        <span>Ikuti</span>
                      </>
                    )}
                  </Button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-1.5 text-slate-400 hover:text-[#0F172A] rounded-full hover:bg-slate-200"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-8 z-30 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-1 text-left animate-in fade-in">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleShareLink();
                        }}
                        className="w-full text-xs font-semibold text-[#0F172A] px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Salin Tautan</span>
                      </button>

                      {post.isOwner && (
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            handleDelete();
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
            </div>

            {/* 2. Scrollable Middle Section: Caption + Comments Thread */}
            <div className="p-4 overflow-y-auto max-h-[380px] lg:max-h-[420px] space-y-4 flex-1">
              {/* Caption Item */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                <Link href={`/profile/${post.author.id}`}>
                  <Avatar
                    src={post.author.avatarUrl}
                    fallback={post.author.name.slice(0, 2).toUpperCase()}
                    size="sm"
                    className="w-8 h-8 shrink-0 mt-0.5"
                  />
                </Link>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-[#0F172A] leading-relaxed">
                    <Link href={`/profile/${post.author.id}`} className="font-bold mr-1.5 hover:underline">
                      {post.author.name}
                    </Link>
                    {renderFormattedContent(post.content)}
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[11px] font-semibold text-[#FF5733] hover:underline cursor-pointer">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 font-medium">
                    {formatTimeAgo(post.createdAt)}
                  </div>
                </div>
              </div>

              {/* Comments Stream */}
              {post.previewComments && post.previewComments.length > 0 ? (
                <div className="space-y-3.5">
                  {post.previewComments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      {/* Root Comment */}
                      <div className="flex items-start justify-between gap-2 group">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Link href={`/profile/${comment.author.id}`}>
                            <Avatar
                              src={comment.author.avatarUrl}
                              fallback={comment.author.name.slice(0, 2).toUpperCase()}
                              size="sm"
                              className="w-7 h-7 shrink-0 mt-0.5"
                            />
                          </Link>
                          <div className="space-y-1 text-xs">
                            <div className="text-[#0F172A] leading-relaxed">
                              <Link href={`/profile/${comment.author.id}`} className="font-bold mr-1 hover:underline">
                                {comment.author.name}
                              </Link>
                              <span className="text-[#334155]">{renderFormattedContent(comment.content)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                              <span>{formatTimeAgo(comment.createdAt)}</span>
                              {comment.likeCount > 0 && <span>{comment.likeCount} suka</span>}
                              <button
                                onClick={() => setReplyingTo({ id: comment.id, name: comment.author.name })}
                                className="text-slate-600 hover:text-[#FF5733]"
                              >
                                Balas
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleCommentLikeLocal(comment.id)}
                          className="text-slate-300 hover:text-rose-500 pt-1 shrink-0"
                        >
                          <Heart className={cn("w-3.5 h-3.5", comment.isLiked && "text-rose-500 fill-rose-500")} />
                        </button>
                      </div>

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-9 space-y-2 border-l-2 border-slate-100 ml-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 min-w-0">
                                <Link href={`/profile/${reply.author.id}`}>
                                  <Avatar
                                    src={reply.author.avatarUrl}
                                    fallback={reply.author.name.slice(0, 2).toUpperCase()}
                                    size="sm"
                                    className="w-6 h-6 shrink-0 mt-0.5"
                                  />
                                </Link>
                                <div className="space-y-0.5 text-xs">
                                  <div className="text-[#0F172A] leading-relaxed">
                                    <Link href={`/profile/${reply.author.id}`} className="font-bold mr-1 hover:underline">
                                      {reply.author.name}
                                    </Link>
                                    <span className="text-[#334155]">{renderFormattedContent(reply.content)}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                                    <span>{formatTimeAgo(reply.createdAt)}</span>
                                    {reply.likeCount > 0 && <span>{reply.likeCount} suka</span>}
                                    <button
                                      onClick={() => setReplyingTo({ id: comment.id, name: reply.author.name })}
                                      className="text-slate-600 hover:text-[#FF5733]"
                                    >
                                      Balas
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleCommentLikeLocal(reply.id)}
                                className="text-slate-300 hover:text-rose-500 pt-1 shrink-0"
                              >
                                <Heart className={cn("w-3 h-3", reply.isLiked && "text-rose-500 fill-rose-500")} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Belum ada komentar. Jadilah yang pertama memberikan masukan atau apresiasi!
                </div>
              )}
            </div>

            {/* 3. Action Bar (Likes, Comments, Bookmark, Share) */}
            <div className="p-3 sm:p-4 border-t border-[#E2E8F0] space-y-2 bg-slate-50/50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleLike}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] hover:text-rose-500 transition-colors"
                  >
                    <Heart className={cn("w-5 h-5", post.isLiked ? "text-rose-500 fill-rose-500" : "text-slate-600")} />
                    <span>{post.likeCount}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                    <span>{post.commentCount}</span>
                  </div>

                  <button
                    onClick={handleShareLink}
                    className="p-1 text-slate-600 hover:text-[#0F172A] transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleToggleBookmark}
                  className="p-1 text-slate-600 hover:text-[#FF5733] transition-colors"
                >
                  <Bookmark className={cn("w-5 h-5", post.isBookmarked ? "text-[#FF5733] fill-[#FF5733]" : "text-slate-600")} />
                </button>
              </div>

              {/* 4. Interactive Comment Input */}
              <form onSubmit={handleSendComment} className="pt-2">
                {replyingTo && (
                  <div className="flex items-center justify-between bg-slate-100 text-[11px] font-semibold text-slate-700 px-3 py-1 rounded-t-lg border border-b-0 border-[#E2E8F0]">
                    <span>Membalas @{replyingTo.name}</span>
                    <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl p-1.5 focus-within:border-[#FF5733]">
                  <input
                    type="text"
                    placeholder={replyingTo ? `Tulis balasan untuk @${replyingTo.name}...` : "Tulis komentar..."}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 text-xs px-2 py-1 bg-transparent focus:outline-none text-[#0F172A] placeholder:text-slate-400"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!commentInput.trim() || isSubmittingComment}
                    className="h-7 px-3 text-xs bg-[#FF5733] hover:bg-[#D9411E] text-white font-bold rounded-lg shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
