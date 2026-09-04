"use client";

import { useEffect, useState, useRef } from "react";
import { useStoryStore } from "@/store/useStoryStore";
import { useUserStore } from "@/store/useUserStore";
import { Avatar } from "@/components/ui/avatar";
import { Plus, Clock, Image as ImageIcon, X } from "lucide-react";
import { StoryViewerModal } from "./StoryViewerModal";

export function DevStoryBar() {
  const { storyGroups, fetchStories, openStoryModal, createStory, isSubmitting } = useStoryStore();
  const { currentUser } = useUserStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMediaUrl(data.url);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !mediaUrl) return;

    const success = await createStory(mediaUrl || undefined, caption.trim() || undefined);
    if (success) {
      setCaption("");
      setMediaUrl("");
      setIsCreateModalOpen(false);
    }
  };

  const myAvatar = currentUser?.image || currentUser?.avatarUrl || (currentUser?.githubUsername ? `https://github.com/${currentUser.githubUsername}.png` : undefined);

  return (
    <>
      <div className="w-full bg-white border border-[#CBD5E1] rounded-2xl p-3.5 sm:p-4 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
              Daily Sprint Updates
            </span>
          </div>
          <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline">
            Status &amp; progres coding 24 jam terakhir
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* 1. Add My Sprint Story Card */}
          <div
            className="flex items-center gap-2.5 p-2 pr-3.5 rounded-xl bg-slate-50 hover:bg-[#F2FAF6] border border-[#E2E8F0] hover:border-[#317B67] shrink-0 cursor-pointer group transition-all"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <Avatar
                src={myAvatar}
                fallback={currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "ME"}
                className="w-10 h-10 rounded-xl border border-slate-300 group-hover:border-[#317B67] transition-colors shadow-xs"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-[#317B67] text-white flex items-center justify-center border border-white shadow-xs group-hover:scale-110 transition-transform z-10">
                <Plus className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#317B67] transition-colors">
                + Update Cerita
              </p>
              <span className="text-[10px] text-[#64748B] block font-mono">
                Bagikan sprint
              </span>
            </div>
          </div>

          {/* 2. Community Active Stories */}
          {storyGroups.length > 0 ? (
            storyGroups.map((group, groupIdx) => (
              <div
                key={group.author.id}
                className="flex items-center gap-2.5 p-2 pr-3.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] hover:border-[#317B67] shrink-0 cursor-pointer group transition-all"
                onClick={() => openStoryModal(groupIdx, 0)}
              >
                <div className="w-10 h-10 rounded-xl p-[2px] bg-gradient-to-tr from-[#317B67] to-emerald-400 shrink-0 flex items-center justify-center">
                  <Avatar
                    src={group.author.avatarUrl}
                    fallback={group.author.name.slice(0, 2).toUpperCase()}
                    className="w-full h-full rounded-[10px] border-0 object-cover"
                  />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-[#0F172A] truncate max-w-[100px]">
                    {group.author.name}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    Lihat sprint
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#94A3B8] italic">
              <span>Belum ada update sprint komunitas hari ini. Mulai bagikan cerita pertamamu!</span>
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer Fullscreen Modal */}
      <StoryViewerModal />

      {/* Create Story Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] shadow-2xl p-5 space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#317B67]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Bagikan Daily Sprint (24 Jam)</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishStory} className="space-y-3.5">
              <textarea
                placeholder="Lagi grinding apa hari ini? Ceritain update progres ngodingmu..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#317B67] text-[#0F172A] placeholder:text-slate-400 resize-none"
              />

              {mediaUrl && (
                <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0] max-h-48 bg-slate-100">
                  <img src={mediaUrl} alt="Preview" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-[#317B67] text-xs font-semibold text-[#475569] flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#317B67]" />
                  <span>{isUploading ? "Mengunggah..." : "Foto / Screenshot UI"}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || (!caption.trim() && !mediaUrl)}
                  className="px-4 py-2 rounded-xl bg-[#317B67] hover:bg-[#245E4E] text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSubmitting ? "Membagikan..." : "Posting Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
