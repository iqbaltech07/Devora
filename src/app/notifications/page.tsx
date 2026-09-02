"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useNotificationStore, NotificationItem } from "@/store/useNotificationStore";
import { useUserStore } from "@/store/useUserStore";
import { playNotificationSound } from "@/lib/sound";
import {
  Bell,
  Heart,
  Flame,
  FolderKanban,
  MessageSquare,
  Users,
  UserPlus,
  UserCheck,
  CheckCheck,
  ArrowRight,
  Radio,
  Clock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotifFilterType = "ALL" | "FOLLOW" | "FEED" | "CHAT_MATCH" | "PROJECT";

export default function NotificationsPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    isLoading,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState<NotifFilterType>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications().then(() => {
      markAllAsRead();
    });
  }, [fetchNotifications, markAllAsRead]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    markAllAsRead();
    playNotificationSound();
    setIsRefreshing(false);
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    if (notif.linkUrl && notif.linkUrl !== "/messages") {
      router.push(notif.linkUrl);
    } else if (
      notif.actorId &&
      (notif.type === "MESSAGE" || notif.type === "MATCH" || notif.type === "SYSTEM")
    ) {
      router.push(`/messages?userId=${notif.actorId}`);
    } else if (notif.linkUrl) {
      router.push(notif.linkUrl);
    } else {
      router.push("/dashboard");
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "FOLLOW") {
      return notif.type === "FOLLOW" || notif.type === "FOLLOW_BACK";
    }
    if (activeFilter === "FEED") {
      return (
        notif.type === "LIKE" ||
        (notif.type === "MESSAGE" &&
          (notif.id.startsWith("post-comment") ||
            notif.id.startsWith("comment-reply") ||
            notif.id.startsWith("comment-like")))
      );
    }
    if (activeFilter === "CHAT_MATCH") {
      return (
        notif.type === "MATCH" ||
        (notif.type === "MESSAGE" && notif.id.startsWith("msg-item"))
      );
    }
    if (activeFilter === "PROJECT") {
      return notif.type === "PROJECT_INVITE" || notif.type === "SYSTEM";
    }
    return true;
  });

  const followCount = notifications.filter(
    (n) => n.type === "FOLLOW" || n.type === "FOLLOW_BACK"
  ).length;
  const feedCount = notifications.filter(
    (n) =>
      n.type === "LIKE" ||
      (n.type === "MESSAGE" &&
        (n.id.startsWith("post-comment") ||
          n.id.startsWith("comment-reply") ||
          n.id.startsWith("comment-like")))
  ).length;
  const chatCount = notifications.filter(
    (n) => n.type === "MATCH" || (n.type === "MESSAGE" && n.id.startsWith("msg-item"))
  ).length;
  const projectCount = notifications.filter(
    (n) => n.type === "PROJECT_INVITE" || n.type === "SYSTEM"
  ).length;

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6 pb-24 sm:pb-16 px-2 sm:px-0">
        {/* ─── 1. PAGE HEADER ─── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1EE] border border-[#FF5733]/20">
                <Radio className="w-3.5 h-3.5 text-[#FF5733] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider text-[#FF5733]">
                  Pusat Notifikasi Komunitas
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Aktivitas & Notifikasi
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Pantau pengikut baru, mention, interaksi postingan, kecocokan rekan pengembang, dan lamaran proyek Anda secara real-time.
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5 text-xs font-bold bg-white border-[#E2E8F0] hover:border-[#FF5733] shadow-xs"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                <span>Segarkan</span>
              </Button>
            </div>
          </div>

          {/* ─── 2. CATEGORY TABS ─── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#E2E8F0] pt-3 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                activeFilter === "ALL"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#0F172A]"
              )}
            >
              Semua ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("FOLLOW")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                activeFilter === "FOLLOW"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#0F172A]"
              )}
            >
              <Users className="w-3.5 h-3.5 text-[#FF5733]" />
              <span>Pengikut ({followCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("FEED")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                activeFilter === "FEED"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#0F172A]"
              )}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Feeds ({feedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("CHAT_MATCH")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                activeFilter === "CHAT_MATCH"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#0F172A]"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pesan & Match ({chatCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("PROJECT")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                activeFilter === "PROJECT"
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#0F172A]"
              )}
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
              <span>Proyek ({projectCount})</span>
            </button>
          </div>
        </div>

        {/* ─── 3. NOTIFICATION ITEMS LIST ─── */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const isFollowType = notif.type === "FOLLOW" || notif.type === "FOLLOW_BACK";
              const isLikeType = notif.type === "LIKE";
              const isProjectType = notif.type === "PROJECT_INVITE";
              const isChatType = notif.type === "MESSAGE" || notif.type === "MATCH";

              return (
                <article
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "bg-white border rounded-2xl sm:rounded-[24px] p-4 sm:p-5 transition-all cursor-pointer relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-xs hover:border-[#CBD5E1] hover:shadow-md",
                    !notif.read
                      ? "border-[#FF5733]/30 bg-[#FFF8F6]/80"
                      : "border-[#E2E8F0]"
                  )}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Actor Avatar with Type Badge */}
                    <div className="relative shrink-0 mt-0.5">
                      {notif.actorAvatar ? (
                        <Avatar
                          src={notif.actorAvatar}
                          fallback={notif.actorName ? notif.actorName.slice(0, 2).toUpperCase() : "DV"}
                          size="md"
                          className="w-11 h-11 border-2 border-white shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#FF5733]/15 text-[#FF5733] flex items-center justify-center font-bold text-sm">
                          {notif.actorName ? notif.actorName.slice(0, 2).toUpperCase() : "DV"}
                        </div>
                      )}

                      {/* Notification Type Icon Pill */}
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs border border-[#E2E8F0] flex items-center justify-center">
                        {isFollowType && <Users className="w-3 h-3 text-[#FF5733]" />}
                        {isLikeType && <Heart className="w-3 h-3 text-[#FF5733] fill-[#FF5733]" />}
                        {isProjectType && <FolderKanban className="w-3 h-3 text-blue-500" />}
                        {isChatType && <MessageSquare className="w-3 h-3 text-emerald-500" />}
                        {!isFollowType && !isLikeType && !isProjectType && !isChatType && (
                          <Bell className="w-3 h-3 text-amber-500" />
                        )}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs sm:text-sm text-[#0F172A] truncate">
                          {notif.actorName || "Developer"}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-semibold bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                          {notif.actorRole || "Developer"}
                        </span>
                        <span className="text-[11px] text-[#94A3B8] font-medium ml-auto sm:ml-0">
                          • {notif.createdAt}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#0F172A]">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-[#475569] leading-relaxed break-words">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {/* Right Action CTA */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0]/60">
                    {!notif.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5733] shrink-0 mr-1 hidden sm:inline-block" />
                    )}

                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notif);
                      }}
                      className={cn(
                        "gap-1.5 text-xs font-bold rounded-full px-4 py-1.5 shadow-xs transition-all active:scale-95",
                        isFollowType
                          ? "bg-[#FF5733] hover:bg-[#D9411E] text-white"
                          : "bg-[#0F172A] hover:bg-[#1E293B] text-white"
                      )}
                    >
                      {isFollowType ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Lihat Profil</span>
                        </>
                      ) : isProjectType ? (
                        <>
                          <FolderKanban className="w-3.5 h-3.5 text-[#FF5733]" />
                          <span>Buka Proyek</span>
                        </>
                      ) : isChatType ? (
                        <>
                          <MessageSquare className="w-3.5 h-3.5 text-[#FF5733]" />
                          <span>Balas Pesan</span>
                        </>
                      ) : (
                        <>
                          <span>Lihat Detail</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </article>
              );
            })
          ) : (
            <Card className="p-12 text-center bg-white border border-[#E2E8F0] rounded-[24px] space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#E2E8F0] text-[#CBD5E1] flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Tidak Ada Notifikasi pada Kategori Ini
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Setiap interaksi baru seperti pengikut profil, like postingan, dan lamaran proyek akan otomatis muncul di sini.
              </p>
              <Link href="/dashboard" className="inline-block pt-2">
                <Button variant="secondary" size="sm" className="gap-1.5 font-bold text-xs">
                  <span>Jelajahi Feeds Komunitas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </Shell>
  );
}
