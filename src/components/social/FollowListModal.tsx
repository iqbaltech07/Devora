"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { X, Users, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUser {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  isFollowing: boolean;
  isMe: boolean;
}

interface FollowListModalProps {
  userId: string;
  userName: string;
  type: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
  onFollowToggle?: () => void;
}

export function FollowListModal({
  userId,
  userName,
  type,
  isOpen,
  onClose,
  onFollowToggle,
}: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/users/${userId}/${type}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data || []);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isOpen, userId, type]);

  const handleToggleFollow = async (targetId: string) => {
    setTogglingId(targetId);
    try {
      const res = await fetch(`/api/users/${targetId}/follow`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetId ? { ...u, isFollowing: data.isFollowing } : u
          )
        );
        if (onFollowToggle) onFollowToggle();
      }
    } finally {
      setTogglingId(null);
    }
  };

  if (!isOpen) return null;

  const title = type === "followers" ? `Pengikut (${users.length})` : `Mengikuti (${users.length})`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] shadow-2xl p-5 space-y-4 text-left flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF5733]" />
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
              <p className="text-[11px] text-[#64748B]">@{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF5733]" />
              <span className="text-xs font-medium">Memuat data...</span>
            </div>
          ) : users.length > 0 ? (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
              >
                <Link
                  href={`/profile/${u.id}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  <Avatar
                    src={u.avatarUrl}
                    fallback={u.name.slice(0, 2).toUpperCase()}
                    size="sm"
                    className="w-9 h-9 border border-[#E2E8F0] group-hover:border-[#FF5733] transition-colors shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#FF5733] transition-colors truncate">
                      {u.name}
                    </h4>
                    <p className="text-[10px] text-[#64748B] truncate">
                      {u.title}
                    </p>
                  </div>
                </Link>

                {!u.isMe && (
                  <button
                    type="button"
                    disabled={togglingId === u.id}
                    onClick={() => handleToggleFollow(u.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0",
                      u.isFollowing
                        ? "bg-slate-200 text-[#0F172A] hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent"
                        : "bg-[#FF5733] text-white hover:bg-[#D9411E] shadow-xs"
                    )}
                  >
                    {u.isFollowing ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        <span>Mengikuti</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Ikuti</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-8 italic">
              {type === "followers"
                ? "Belum ada developer yang mengikuti profil ini."
                : "Belum mengikuti developer manapun."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
