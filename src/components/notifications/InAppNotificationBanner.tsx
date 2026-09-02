"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore, NotificationItem } from "@/store/useNotificationStore";
import { Avatar } from "@/components/ui/avatar";
import { playNotificationSound } from "@/lib/sound";
import {
  Heart,
  Flame,
  Users,
  MessageSquare,
  FolderKanban,
  Bell,
  X,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function InAppNotificationBanner() {
  const router = useRouter();
  const { activePopup, dismissPopup, markAsRead } = useNotificationStore();

  const [isVisible, setIsVisible] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activePopup) {
      setIsVisible(true);
      setOffsetY(0);

      // Play chime sound when popup appears
      playNotificationSound();

      // Auto dismiss after 5 seconds
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, 5000);
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activePopup]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      dismissPopup();
      setOffsetY(0);
    }, 250);
  };

  const handleClick = () => {
    if (!activePopup) return;
    markAsRead(activePopup.id);
    handleDismiss();

    if (activePopup.linkUrl) {
      router.push(activePopup.linkUrl);
    } else if (activePopup.actorId) {
      if (activePopup.type === "FOLLOW" || activePopup.type === "FOLLOW_BACK") {
        router.push(`/profile/${activePopup.actorId}`);
      } else {
        router.push(`/messages?userId=${activePopup.actorId}`);
      }
    } else {
      router.push("/dashboard");
    }
  };

  // Swipe Up Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    // Only allow pulling upwards
    if (diff < 0) {
      setOffsetY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (offsetY < -30) {
      // Swiped up sufficiently -> dismiss
      handleDismiss();
    } else {
      // Reset position
      setOffsetY(0);
    }
    setTouchStartY(null);
  };

  if (!activePopup || !isVisible) return null;

  return (
    <div
      role="alert"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate(-50%, ${offsetY}px)`,
        transition: offsetY === 0 ? "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s" : "none",
      }}
      className={cn(
        "fixed top-3 sm:top-5 left-1/2 z-[100] max-w-md w-[calc(100%-1.5rem)] sm:w-full",
        "bg-[#0F172A]/95 text-white backdrop-blur-xl border border-white/15 shadow-2xl rounded-2xl p-3 sm:p-3.5",
        "cursor-pointer select-none animate-in fade-in slide-in-from-top-4 duration-200"
      )}
    >
      {/* Mini Swipe-Up Handle Bar */}
      <div className="flex justify-center -mt-1 mb-1.5 opacity-40 hover:opacity-100 transition-opacity">
        <div className="w-8 h-1 rounded-full bg-white/50" />
      </div>

      <div className="flex items-start gap-3">
        {/* Left: Avatar with badge */}
        <div onClick={handleClick} className="relative shrink-0 mt-0.5">
          <Avatar
            src={activePopup.actorAvatar}
            fallback={activePopup.actorName ? activePopup.actorName.slice(0, 2).toUpperCase() : "DV"}
            size="md"
            className="w-10 h-10 border border-white/20 shadow-xs"
          />

          {/* Type Badge Icon */}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0F172A] border border-white/30 flex items-center justify-center">
            {(activePopup.type === "FOLLOW" || activePopup.type === "FOLLOW_BACK") && (
              <Users className="w-2.5 h-2.5 text-[#FF5733]" />
            )}
            {activePopup.type === "LIKE" && (
              <Heart className="w-2.5 h-2.5 text-[#FF5733] fill-[#FF5733]" />
            )}
            {activePopup.type === "MATCH" && (
              <Flame className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
            )}
            {activePopup.type === "PROJECT_INVITE" && (
              <FolderKanban className="w-2.5 h-2.5 text-blue-400" />
            )}
            {activePopup.type === "MESSAGE" && (
              <MessageSquare className="w-2.5 h-2.5 text-violet-400" />
            )}
            {activePopup.type === "SYSTEM" && (
              <Bell className="w-2.5 h-2.5 text-amber-400" />
            )}
          </span>
        </div>

        {/* Center: Content text */}
        <div onClick={handleClick} className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-extrabold text-white truncate">
              {activePopup.actorName || "Developer"}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              Baru saja
            </span>
          </div>

          <p className="text-xs font-medium text-[#FF5733]">
            {activePopup.title}
          </p>

          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
            {activePopup.message}
          </p>
        </div>

        {/* Right: Dismiss Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 -mr-1"
          title="Tutup Notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Swipe up hint */}
      <div className="flex items-center justify-center gap-1 pt-1.5 text-[9px] font-mono text-slate-400">
        <ChevronUp className="w-2.5 h-2.5 animate-bounce" />
        <span>Geser ke atas untuk menutup</span>
      </div>
    </div>
  );
}
