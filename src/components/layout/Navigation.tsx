"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FolderKanban, MessageSquare, Rss, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatchStore } from "@/store/useMatchStore";

export const NAV_ITEMS = [
  { label: "Cari Partner", href: "/findpartner", icon: Users, isHero: true },
  { label: "Proyek", href: "/projects", icon: FolderKanban },
  { label: "Feeds", href: "/dashboard", icon: Rss },
  { label: "Pesan", href: "/messages", icon: MessageSquare },
  { label: "Profil", href: "/profile", icon: User },
];

export function Navigation({ className }: { className?: string }) {
  const pathname = usePathname();
  const { incomingLikes, fetchIncomingLikes } = useMatchStore();

  useEffect(() => {
    fetchIncomingLikes();
  }, [fetchIncomingLikes]);

  return (
    <nav className={cn("flex items-center gap-1.5 md:gap-2", className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const hasBadge = item.href === "/matches" && incomingLikes.length > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl transition-all duration-150 relative",
              item.isHero
                ? isActive
                  ? "bg-[#317B67] text-white shadow-xs font-bold ring-2 ring-[#317B67]/25"
                  : "bg-[#E8F7F0] text-[#317B67] hover:bg-[#317B67] hover:text-white border border-[#317B67]/30 font-bold"
                : isActive
                  ? "bg-white text-[#0F172A] border border-[#CBD5E1] font-bold shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/70 font-semibold"
            )}
          >
            <Icon
              className={cn(
                "w-3.5 h-3.5",
                item.isHero
                  ? isActive
                    ? "text-white"
                    : "text-[#317B67] group-hover:text-white"
                  : isActive
                    ? "text-[#317B67]"
                    : "text-[#64748B]"
              )}
            />
            <span>{item.label}</span>
            {hasBadge && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-[#317B67] text-white rounded-md leading-none shadow-xs">
                {incomingLikes.length}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
