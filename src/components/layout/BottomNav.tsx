"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, FolderKanban, MessageSquare, Rss, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatchStore } from "@/store/useMatchStore";

const MOBILE_NAV = [
  { label: "Feeds", href: "/dashboard", icon: Rss },
  { label: "Eksplor", href: "/explore", icon: Compass },
  { label: "Proyek", href: "/projects", icon: FolderKanban },
  { label: "Pesan", href: "/messages", icon: MessageSquare },
  { label: "Profil", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { incomingLikes } = useMatchStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-devora-border bg-devora-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-14 items-center justify-around px-2">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const hasBadge = item.href === "/matches" && incomingLikes.length > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-medium transition-colors relative",
                isActive
                  ? "text-devora-brand font-bold"
                  : "text-devora-muted hover:text-devora-ink"
              )}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {hasBadge && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.5 text-[9px] font-bold bg-[#317B67] text-white rounded-md leading-none shadow-xs">
                    {incomingLikes.length}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
