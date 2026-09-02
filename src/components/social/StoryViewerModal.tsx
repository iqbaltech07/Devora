"use client";

import { useEffect } from "react";
import { useStoryStore } from "@/store/useStoryStore";
import { Avatar } from "@/components/ui/avatar";
import { X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

export function StoryViewerModal() {
  const {
    storyGroups,
    activeGroupIndex,
    activeStoryIndex,
    closeStoryModal,
    nextStory,
    prevStory,
  } = useStoryStore();

  const currentGroup = activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
  const currentStory = currentGroup ? currentGroup.stories[activeStoryIndex] : null;

  // Auto advance timer
  useEffect(() => {
    if (!currentStory) return;
    const timer = setTimeout(() => {
      nextStory();
    }, 5000); // 5s per story

    return () => clearTimeout(timer);
  }, [currentStory, nextStory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStoryModal();
      if (e.key === "ArrowRight") nextStory();
      if (e.key === "ArrowLeft") prevStory();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeStoryModal, nextStory, prevStory]);

  if (!currentGroup || !currentStory) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 select-none"
      onClick={closeStoryModal}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md h-[80vh] max-h-[680px] bg-[#0F172A] rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between"
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

        {/* Top Header Author Info */}
        <div className="relative z-30 p-4 pt-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
          <Link
            href={`/profile/${currentGroup.author.id}`}
            onClick={closeStoryModal}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <Avatar
              src={currentGroup.author.avatarUrl}
              fallback={currentGroup.author.name.slice(0, 2).toUpperCase()}
              size="sm"
              className="border-2 border-[#FF5733]"
            />
            <div className="text-left">
              <h4 className="text-xs font-bold text-white leading-none">
                {currentGroup.author.name}
              </h4>
              <p className="text-[10px] text-slate-300 font-medium">
                {currentGroup.author.title}
              </p>
            </div>
          </Link>

          <button
            onClick={closeStoryModal}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
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

        {/* Bottom Caption & Reply Bar */}
        <div className="relative z-30 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-3">
          {currentStory.mediaUrl && currentStory.caption && (
            <p className="text-xs text-white/95 font-medium line-clamp-3 text-center bg-black/40 p-2 rounded-lg backdrop-blur-xs">
              {currentStory.caption}
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FF5733]" />
              <span>Status 24 Jam</span>
            </span>

            <Link
              href={`/messages?userId=${currentGroup.author.id}`}
              onClick={closeStoryModal}
              className="px-3 py-1.5 rounded-full bg-[#FF5733] text-white font-bold hover:bg-[#D9411E] transition-colors"
            >
              Balas ke DM
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
