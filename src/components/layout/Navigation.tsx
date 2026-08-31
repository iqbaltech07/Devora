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
    <nav className={cn("flex items-center gap-1 md:gap-2", className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-button transition-colors duration-150",
              isActive
                ? "bg-devora-surface-strong text-devora-ink border border-devora-border font-semibold shadow-xs"
                : "text-devora-muted hover:text-devora-ink hover:bg-devora-surface"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive && "text-devora-brand")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
