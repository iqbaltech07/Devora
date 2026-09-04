"use client";

import { useState, useEffect } from "react";
import { useStoryStore } from "@/store/useStoryStore";
import { Avatar } from "@/components/ui/avatar";
import { useUiStore } from "@/store/useUiStore";
import { playNotificationSound } from "@/lib/sound";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Send,
  Users,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatStoryTime(dateStr: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export function StoryViewerModal() {
  const router = useRouter();
  const { addToast } = useUiStore();
  const {
    storyGroups,
    activeGroupIndex,
    activeStoryIndex,
    closeStoryModal,
    nextStory,
    prevStory,
    recordView,
    replyStory,
  } = useStoryStore();

  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);

  const currentGroup = activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
  const currentStory = currentGroup ? currentGroup.stories[activeStoryIndex] : null;

  // Auto record view when currentStory changes
  useEffect(() => {
    if (currentStory && currentGroup && !currentGroup.author.isMe) {
      recordView(currentStory.id);
    }
  }, [currentStory, currentGroup, recordView]);

  // Auto advance timer (paused if viewers modal is open or user is typing reply)
  useEffect(() => {
    if (!currentStory || showViewersModal || replyText.length > 0) return;
    const timer = setTimeout(() => {
      nextStory();
    }, 5500); // 5.5s per story

    return () => clearTimeout(timer);
  }, [currentStory, showViewersModal, replyText, nextStory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showViewersModal) {
        if (e.key === "Escape") setShowViewersModal(false);
        return;
      }
      if (e.key === "Escape") closeStoryModal();
      if (e.key === "ArrowRight") nextStory();
      if (e.key === "ArrowLeft") prevStory();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeStoryModal, nextStory, prevStory, showViewersModal]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStory || !replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const res = await replyStory(currentStory.id, replyText.trim());
      if (res.success) {
        playNotificationSound();
        addToast({
          title: "Balasan Terkirim ke Chat",
          description: `Balasan kamu berhasil dikirimkan ke obrolan ${currentGroup?.author.name}.`,
          type: "success",
        });
        setReplyText("");
        if (res.receiverId) {
          closeStoryModal();
          router.push(`/messages?userId=${res.receiverId}`);
        }
      } else {
        addToast({
          title: "Gagal Mengirim Balasan",
          description: "Terjadi kesalahan saat mengirim pesan balasan story.",
          type: "error",
        });
      }
    } finally {
      setIsSendingReply(false);
    }
  };

  if (!currentGroup || !currentStory) return null;

  const isOwner = currentGroup.author.isMe;
  const viewers = currentStory.viewers || [];
  const viewsCount = currentStory.viewsCount ?? viewers.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 select-none"
      onClick={closeStoryModal}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md h-[84vh] max-h-[700px] bg-[#0F172A] rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {currentGroup.stories.map((s, idx) => {
            const isCompleted = idx < activeStoryIndex;
            const isCurrent = idx === activeStoryIndex;
            return (
              <div
                key={s.id}
                className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    isCompleted ? "w-full" : isCurrent ? "w-full animate-pulse" : "w-0"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header Author Info & Timestamp */}
        <div className="relative z-30 p-4 pt-6 bg-gradient-to-b from-black/85 via-black/45 to-transparent flex items-center justify-between">
          <Link
            href={`/profile/${currentGroup.author.id}`}
            onClick={closeStoryModal}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <Avatar
              src={currentGroup.author.avatarUrl}
              fallback={currentGroup.author.name.slice(0, 2).toUpperCase()}
              size="sm"
              className="border-2 border-[#317B67]"
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white leading-none">
                  {currentGroup.author.name}
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  • {formatStoryTime(currentStory.createdAt)}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium truncate max-w-[180px]">
                {currentGroup.author.title}
              </p>
            </div>
          </Link>

          <button
            onClick={closeStoryModal}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Middle Story Content */}
        <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
          {currentStory.mediaUrl ? (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center p-6 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-white/10">
              <p className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
                &ldquo;{currentStory.caption}&rdquo;
              </p>
            </div>
          )}

          {/* Navigation Click Zones */}
          <button
            onClick={prevStory}
            className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-start pl-2 transition-opacity"
          >
            <span className="p-2 rounded-full bg-black/50 text-white">
              <ChevronLeft className="w-5 h-5" />
            </span>
          </button>
          <button
            onClick={nextStory}
            className="absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-end pr-2 transition-opacity"
          >
            <span className="p-2 rounded-full bg-black/50 text-white">
              <ChevronRight className="w-5 h-5" />
            </span>
          </button>
        </div>

        {/* Bottom Bar: Caption, Viewers (if Owner), or Reply Input (if Viewer) */}
        <div className="relative z-30 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent space-y-2.5">
          {currentStory.mediaUrl && currentStory.caption && (
            <p className="text-xs text-white/95 font-medium line-clamp-2 text-center bg-black/40 p-2 rounded-lg backdrop-blur-xs">
              {currentStory.caption}
            </p>
          )}

          {/* If current user is Story Owner -> Show Viewers Button */}
          {isOwner ? (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowViewersModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md transition-all active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-[#317B67]" />
                <span>{viewsCount} Dilihat</span>
              </button>

              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#317B67]" />
                <span>24 Jam</span>
              </span>
            </div>
          ) : (
            /* If other developer is viewing -> Show Direct Reply Input to Chat */
            <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder={`Balas cerita ${currentGroup.author.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-[#317B67] backdrop-blur-md"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isSendingReply}
                className="p-2 rounded-xl bg-[#317B67] hover:bg-[#245E4E] text-white disabled:opacity-40 transition-all active:scale-95 shrink-0"
                title="Kirim ke Chat"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* ─── STORY VIEWERS MODAL (UNTUK PEMILIK STORY) ─── */}
        {showViewersModal && (
          <div
            className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md p-4 flex flex-col justify-end animate-in slide-in-from-bottom duration-200"
            onClick={() => setShowViewersModal(false)}
          >
            <div
              className="bg-[#1E293B] border border-white/15 rounded-2xl p-4 space-y-3 max-h-[60%] flex flex-col text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#317B67]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Dilihat Oleh ({viewers.length})
                  </h4>
                </div>
                <button
                  onClick={() => setShowViewersModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                {viewers.length > 0 ? (
                  viewers.map((viewer) => (
                    <div
                      key={viewer.id}
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Link
                        href={`/profile/${viewer.id}`}
                        onClick={closeStoryModal}
                        className="flex items-center gap-2.5 min-w-0 flex-1"
                      >
                        <Avatar
                          src={viewer.avatarUrl}
                          fallback={viewer.name.slice(0, 2).toUpperCase()}
                          size="sm"
                          className="w-8 h-8 border border-white/20 shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">
                            {viewer.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate">
                            {viewer.title}
                          </p>
                        </div>
                      </Link>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatStoryTime(viewer.viewedAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 italic">
                    Belum ada developer lain yang melihat status ini.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
