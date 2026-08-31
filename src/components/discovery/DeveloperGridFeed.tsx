"use client";

import * as React from "react";
import { useState } from "react";
import { DeveloperSpotlightCard } from "./DeveloperSpotlightCard";
import { CompatibilityResult } from "@/store/types";
import { Card } from "@/components/ui/card";
import { LayoutGrid, List } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { cn } from "@/lib/utils";

interface DeveloperGridFeedProps {
  developers: CompatibilityResult[];
  className?: string;
}

export function DeveloperGridFeed({
  developers,
  className,
}: DeveloperGridFeedProps) {
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const { addToast } = useUiStore();

  const handleInvite = (userId: string) => {
    const dev = developers.find((d) => d.targetUserId === userId);
    addToast({
      title: "Collaboration Invite Sent",
      description: `Invited ${dev?.candidateName || "partner"} to join your project opportunity.`,
      type: "success",
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Feed Control Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-devora-muted px-1">
        <span>Showing {developers.length} available builder partners</span>

        <div className="flex items-center gap-1 border border-devora-border rounded-button p-0.5 bg-devora-surface">
          <button
            type="button"
            onClick={() => setViewMode("GRID")}
            className={cn(
              "p-1 rounded-subtle transition-colors",
              viewMode === "GRID"
                ? "bg-devora-ink text-devora-background"
                : "text-devora-muted hover:text-devora-ink"
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("LIST")}
            className={cn(
              "p-1 rounded-subtle transition-colors",
              viewMode === "LIST"
                ? "bg-devora-ink text-devora-background"
                : "text-devora-muted hover:text-devora-ink"
            )}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid or List Feed */}
      <div
        className={cn(
          viewMode === "GRID"
            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
            : "space-y-4"
        )}
      >
        {developers.map((dev) => (
          <DeveloperSpotlightCard
            key={dev.targetUserId}
            match={dev}
            onInvite={handleInvite}
          />
        ))}
      </div>
    </div>
  );
}
