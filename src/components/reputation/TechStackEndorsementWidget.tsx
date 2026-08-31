"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/useUiStore";
import { ThumbsUp, Plus, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Endorser {
  id: string;
  name: string;
  avatarFallback: string;
  role: string;
}

export interface TechEndorsementItem {
  id: string;
  techName: string;
  category: string;
  count: number;
  hasEndorsed: boolean;
  endorsers: Endorser[];
}

const DEFAULT_ENDORSEMENTS: TechEndorsementItem[] = [
  {
    id: "end-ts",
    techName: "TypeScript",
    category: "Language",
    count: 14,
    hasEndorsed: true,
    endorsers: [
      { id: "e-1", name: "Alex Rivera", avatarFallback: "AR", role: "Staff Backend Engineer" },
      { id: "e-2", name: "Sarah Chen", avatarFallback: "SC", role: "Audio Engineer" },
      { id: "e-3", name: "Marcus Vance", avatarFallback: "MV", role: "Distributed Systems" },
    ],
  },
  {
    id: "end-next",
    techName: "Next.js 16",
    category: "Framework",
    count: 12,
    hasEndorsed: false,
    endorsers: [
      { id: "e-2", name: "Sarah Chen", avatarFallback: "SC", role: "Audio Engineer" },
      { id: "e-3", name: "Marcus Vance", avatarFallback: "MV", role: "Distributed Systems" },
    ],
  },
  {
    id: "end-pg",
    techName: "PostgreSQL",
    category: "Database",
    count: 9,
    hasEndorsed: false,
    endorsers: [
      { id: "e-1", name: "Alex Rivera", avatarFallback: "AR", role: "Staff Backend Engineer" },
    ],
  },
  {
    id: "end-redis",
    techName: "Redis Streams",
    category: "Queue & Cache",
    count: 8,
    hasEndorsed: true,
    endorsers: [
      { id: "e-1", name: "Alex Rivera", avatarFallback: "AR", role: "Staff Backend Engineer" },
      { id: "e-3", name: "Marcus Vance", avatarFallback: "MV", role: "Distributed Systems" },
    ],
  },
  {
    id: "end-prisma",
    techName: "Prisma ORM",
    category: "Data Layer",
    count: 7,
    hasEndorsed: false,
    endorsers: [
      { id: "e-2", name: "Sarah Chen", avatarFallback: "SC", role: "Audio Engineer" },
    ],
  },
  {
    id: "end-docker",
    techName: "Docker",
    category: "DevOps",
    count: 6,
    hasEndorsed: false,
    endorsers: [
      { id: "e-3", name: "Marcus Vance", avatarFallback: "MV", role: "Distributed Systems" },
    ],
  },
];

interface TechStackEndorsementWidgetProps {
  userName?: string;
  className?: string;
}

export function TechStackEndorsementWidget({
  userName = "M Iqbal Ferdiansyah",
  className,
}: TechStackEndorsementWidgetProps) {
  const [endorsements, setEndorsements] = useState<TechEndorsementItem[]>(DEFAULT_ENDORSEMENTS);
  const [hoveredItem, setHoveredItem] = useState<TechEndorsementItem | null>(null);
  const { addToast } = useUiStore();

  const handleToggleEndorsement = (item: TechEndorsementItem) => {
    const nextHasEndorsed = !item.hasEndorsed;
    const nextCount = nextHasEndorsed ? item.count + 1 : item.count - 1;

    setEndorsements((prev) =>
      prev.map((e) =>
        e.id === item.id
          ? {
              ...e,
              hasEndorsed: nextHasEndorsed,
              count: nextCount,
              endorsers: nextHasEndorsed
                ? [
                    {
                      id: "current-user",
                      name: "You",
                      avatarFallback: "YO",
                      role: "Collaborator",
                    },
                    ...e.endorsers,
                  ]
                : e.endorsers.filter((end) => end.id !== "current-user"),
            }
          : e
      )
    );

    if (nextHasEndorsed) {
      addToast({
        title: `Endorsed ${userName} for ${item.techName}`,
        description: "Your verification has been added to their community reputation ledger.",
        type: "success",
      });
    } else {
      addToast({
        title: `Removed endorsement for ${item.techName}`,
        type: "info",
      });
    }
  };

  return (
    <Card elevated className={cn("p-6 md:p-8 space-y-6 bg-devora-surface border-devora-border", className)}>
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-devora-border">
        <div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-devora-brand" />
            <h3 className="text-base font-semibold text-devora-ink tracking-tight">
              Community Tech Stack Endorsements
            </h3>
            <Badge variant="brand" className="text-[10px] font-mono">
              {endorsements.reduce((sum, e) => sum + e.count, 0)} Total Endorsements
            </Badge>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Click any counter pill to endorse or counter-endorse {userName}&apos;s verified capabilities.
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-devora-muted">
          <Users className="w-3.5 h-3.5 text-devora-brand" />
          <span>Peer Verified</span>
        </div>
      </div>

      {/* Endorsements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {endorsements.map((item) => {
          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "p-3.5 rounded-card border transition-all duration-150 flex items-center justify-between gap-2 relative select-none",
                item.hasEndorsed
                  ? "bg-devora-surface border-devora-brand/60 shadow-subtle"
                  : "bg-devora-surface-strong/60 border-devora-border hover:border-devora-border-strong"
              )}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-devora-ink font-mono truncate">
                    {item.techName}
                  </span>
                  <span className="text-[9px] font-mono text-devora-muted bg-devora-surface px-1.5 py-0.5 rounded-button border border-devora-border">
                    {item.category}
                  </span>
                </div>

                {/* Overlapping Avatars Stack */}
                <div className="flex items-center -space-x-1.5 pt-0.5">
                  {item.endorsers.slice(0, 3).map((endorser, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full bg-devora-surface border border-devora-border flex items-center justify-center text-[9px] font-mono text-devora-muted font-bold"
                      title={endorser.name}
                    >
                      {endorser.avatarFallback}
                    </div>
                  ))}
                  {item.endorsers.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-devora-surface-strong border border-devora-border flex items-center justify-center text-[8px] font-mono text-devora-muted">
                      +{item.endorsers.length - 3}
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-devora-muted ml-2">
                    {item.endorsers.length} peers
                  </span>
                </div>
              </div>

              {/* Instant Counter Action Pill */}
              <button
                type="button"
                onClick={() => handleToggleEndorsement(item)}
                className={cn(
                  "px-3 py-1.5 rounded-pill text-xs font-mono font-semibold border flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-subtle shrink-0",
                  item.hasEndorsed
                    ? "bg-devora-brand text-white border-devora-brand hover:bg-devora-brand-dark"
                    : "bg-devora-surface text-devora-ink border-devora-border hover:border-devora-brand/40 hover:text-devora-brand"
                )}
                title={item.hasEndorsed ? "Click to withdraw endorsement" : "Click to endorse"}
              >
                {item.hasEndorsed ? (
                  <Check className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                <span>{item.count}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Endorser Roster Detail Banner */}
      {hoveredItem && (
        <div className="p-3 bg-devora-background rounded-button border border-devora-border text-xs font-mono text-devora-muted flex items-center justify-between animate-in fade-in duration-150">
          <span>
            {hoveredItem.techName} endorsed by:{" "}
            <strong className="text-devora-ink">
              {hoveredItem.endorsers.map((e) => e.name).join(", ")}
            </strong>
          </span>
          <span className="text-[10px] text-devora-brand font-semibold">
            {hoveredItem.count} Verified Endorsements
          </span>
        </div>
      )}
    </Card>
  );
}
