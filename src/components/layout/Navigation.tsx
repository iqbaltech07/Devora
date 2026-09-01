"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Flame, FolderKanban, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatchStore } from "@/store/useMatchStore";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Find Partner", href: "/find-partner", icon: Flame },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Matches", href: "/matches", icon: Users },
  { label: "Profile", href: "/profile", icon: User },
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
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 relative",
              isActive
                ? "bg-white text-[#0F172A] border border-[#E2E8F0] font-bold shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/60"
            )}
          >
            <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#FF5733]" : "text-[#64748B]")} />
            <span>{item.label}</span>
            {hasBadge && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full leading-none animate-pulse">
                {incomingLikes.length}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
