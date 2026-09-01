"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Flame, FolderKanban, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Find Partner", href: "/find-partner", icon: Flame },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Matches", href: "/matches", icon: Users },
  { label: "Profile", href: "/profile", icon: User },
];

export function Navigation({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1.5 md:gap-2", className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150",
              isActive
                ? "bg-white text-[#0F172A] border border-[#E2E8F0] font-bold shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/60"
            )}
          >
            <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#FF5733]" : "text-[#64748B]")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
