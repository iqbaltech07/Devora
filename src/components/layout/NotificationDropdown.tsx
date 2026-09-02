"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotificationStore, NotificationItem } from "@/store/useNotificationStore";
import {
  Bell,
  Heart,
  Flame,
  FolderKanban,
  MessageSquare,
  Check,
  CheckCheck,
  X,
  ArrowRight,
  Sparkles,
  Radio,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "LIKE" | "MATCH" | "PROJECT_INVITE">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.linkUrl && notif.linkUrl !== "/messages") {
      router.push(notif.linkUrl);
    } else if (notif.actorId && (notif.type === "MESSAGE" || notif.type === "MATCH" || notif.type === "SYSTEM")) {
      router.push(`/messages?userId=${notif.actorId}`);
    } else if (notif.linkUrl) {
      router.push(notif.linkUrl);
    } else {
      router.push("/dashboard");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    return n.type === activeTab;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-full border transition-all duration-150 flex items-center justify-center",
          isOpen
            ? "bg-white border-[#FF5733] text-[#FF5733] shadow-sm"
            : "border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1]"
        )}
        title="Notifikasi Real-time"
        aria-label="Lihat Notifikasi"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-[#FF5733] text-white text-[10px] font-bold font-mono rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-[24px] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-[#E2E8F0] bg-[#FAF9F5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FF5733]/15 text-[#FF5733] flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-[#0F172A]">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF1EE] text-[#FF5733] text-[10px] font-bold font-mono">
                    {unreadCount} baru
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Live Realtime Status Pill */}
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#E2E8F0] text-[9px] font-bold text-[#0F172A]">
                  <Radio className="w-3 h-3 text-[#FF5733]" />
                  <span>Realtime</span>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#64748B] hover:text-[#FF5733] flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Tandai dibaca</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#E2E8F0] text-[10px] font-bold text-[#64748B]">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={cn(
                  "flex-1 py-1 rounded-full transition-all text-center",
                  activeTab === "ALL" ? "bg-[#0F172A] text-white shadow-xs" : "hover:text-[#0F172A]"
                )}
              >
                Semua ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PROJECT_INVITE")}
                className={cn(
                  "flex-1 py-1 rounded-full transition-all text-center",
                  activeTab === "PROJECT_INVITE" ? "bg-[#0F172A] text-white shadow-xs" : "hover:text-[#0F172A]"
                )}
              >
                Proyek ({notifications.filter((n) => n.type === "PROJECT_INVITE").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("LIKE")}
                className={cn(
                  "flex-1 py-1 rounded-full transition-all text-center",
                  activeTab === "LIKE" ? "bg-[#0F172A] text-white shadow-xs" : "hover:text-[#0F172A]"
                )}
              >
                Disukai ({notifications.filter((n) => n.type === "LIKE").length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("MATCH")}
                className={cn(
                  "flex-1 py-1 rounded-full transition-all text-center",
                  activeTab === "MATCH" ? "bg-[#0F172A] text-white shadow-xs" : "hover:text-[#0F172A]"
                )}
              >
                Match ({notifications.filter((n) => n.type === "MATCH").length})
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E2E8F0]">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-slate-50 text-left relative",
                    !notif.read && "bg-[#FFF8F6]/70"
                  )}
                >
                  {/* Actor Avatar or Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    {notif.actorAvatar ? (
                      <Avatar
                        src={notif.actorAvatar}
                        fallback={notif.actorName ? notif.actorName.slice(0, 2).toUpperCase() : "DV"}
                        size="md"
                        className="border border-[#E2E8F0]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FF5733]/10 text-[#FF5733] flex items-center justify-center">
                        <Flame className="w-5 h-5" />
                      </div>
                    )}

                    {/* Floating Type Badge */}
                    <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-white shadow-xs border border-[#E2E8F0] flex items-center justify-center">
                      {notif.type === "LIKE" && <Heart className="w-2.5 h-2.5 text-[#FF5733] fill-[#FF5733]" />}
                      {notif.type === "MATCH" && <Flame className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />}
                      {notif.type === "PROJECT_INVITE" && <FolderKanban className="w-2.5 h-2.5 text-blue-500" />}
                      {notif.type === "MESSAGE" && <MessageSquare className="w-2.5 h-2.5 text-violet-500" />}
                      {notif.type === "SYSTEM" && <Sparkles className="w-2.5 h-2.5 text-amber-500" />}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#0F172A] truncate">
                        {notif.actorName ? `${notif.actorName} ` : ""}
                        <span className="font-semibold text-[#64748B]">{notif.title}</span>
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#FF5733] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#94A3B8]">
                      <span>{notif.createdAt}</span>
                      <span className="text-[#FF5733] font-bold flex items-center gap-0.5 hover:underline">
                        Lihat <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2 text-[#64748B]">
                <Bell className="w-8 h-8 mx-auto text-[#CBD5E1]" />
                <p className="text-xs font-semibold">Belum ada notifikasi baru.</p>
                <p className="text-[11px] text-[#94A3B8]">
                  Notifikasi ketika ada yang menyukai profilmu akan muncul di sini.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#E2E8F0] bg-[#FAF9F5] text-center">
            <Link
              href="/find-partner"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#0F172A] hover:text-[#FF5733] transition-colors"
            >
              Cari & Swipe Partner Lainnya →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
