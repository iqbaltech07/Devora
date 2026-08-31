"use client";

import * as React from "react";
import { Layers, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type DiscoverySearchMode = "PROJECTS" | "DEVELOPERS";

interface SearchModeSwitcherProps {
  mode: DiscoverySearchMode;
  onChange: (mode: DiscoverySearchMode) => void;
  projectCount?: number;
  developerCount?: number;
  className?: string;
}

export function SearchModeSwitcher({
  mode,
  onChange,
  projectCount,
  developerCount,
  className,
}: SearchModeSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex p-1 rounded-button bg-devora-surface-strong border border-devora-border select-none",
        className
      )}
      role="tablist"
      aria-label="Discovery search mode"
    >
      {/* Tab: Projects */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === "PROJECTS"}
        onClick={() => onChange("PROJECTS")}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-subtle text-xs font-mono transition-all duration-200",
          mode === "PROJECTS"
            ? "bg-devora-surface text-devora-ink font-semibold shadow-card border border-devora-border"
            : "text-devora-muted hover:text-devora-ink"
        )}
      >
        <Layers className={cn("w-3.5 h-3.5", mode === "PROJECTS" ? "text-devora-brand" : "text-devora-muted")} />
        <span>Cari Proyek Kolaborasi</span>
        {projectCount !== undefined && (
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-button text-[10px] font-mono",
              mode === "PROJECTS"
                ? "bg-devora-brand-soft text-devora-brand-dark font-bold"
                : "bg-devora-surface text-devora-muted"
            )}
          >
            {projectCount}
          </span>
        )}
      </button>

      {/* Tab: Developers */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === "DEVELOPERS"}
        onClick={() => onChange("DEVELOPERS")}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-subtle text-xs font-mono transition-all duration-200",
          mode === "DEVELOPERS"
            ? "bg-devora-surface text-devora-ink font-semibold shadow-card border border-devora-border"
            : "text-devora-muted hover:text-devora-ink"
        )}
      >
        <Users className={cn("w-3.5 h-3.5", mode === "DEVELOPERS" ? "text-devora-brand" : "text-devora-muted")} />
        <span>Cari Partner Developer</span>
        {developerCount !== undefined && (
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-button text-[10px] font-mono",
              mode === "DEVELOPERS"
                ? "bg-devora-brand-soft text-devora-brand-dark font-bold"
                : "bg-devora-surface text-devora-muted"
            )}
          >
            {developerCount}
          </span>
        )}
      </button>
    </div>
  );
}
