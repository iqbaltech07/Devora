"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleOverlapMatrixProps {
  candidateName: string;
  userTimezone?: string;
  userActiveRange?: [number, number]; // [19, 23] (7 PM - 11 PM)
  candidateTimezone?: string;
  candidateActiveRange?: [number, number]; // in candidate local time
  candidateOffsetHours?: number; // e.g. +2 for Tokyo vs Jakarta
  className?: string;
}

export function ScheduleOverlapMatrix({
  candidateName,
  userTimezone = "Asia/Jakarta (UTC+7)",
  userActiveRange = [19, 23],
  candidateTimezone = "Asia/Tokyo (UTC+9)",
  candidateActiveRange = [20, 24],
  candidateOffsetHours = 2,
  className,
}: ScheduleOverlapMatrixProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Normalize candidate active hours to User local time
  // If candidate is active [20, 24] in Tokyo (UTC+9), in Jakarta (UTC+7) that is [18, 22]
  const candidateStartInUserTz = (candidateActiveRange[0] - candidateOffsetHours + 24) % 24;
  const candidateEndInUserTz = (candidateActiveRange[1] - candidateOffsetHours + 24) % 24;

  const isCandidateActiveAt = (hour: number) => {
    if (candidateStartInUserTz < candidateEndInUserTz) {
      return hour >= candidateStartInUserTz && hour < candidateEndInUserTz;
    }
    return hour >= candidateStartInUserTz || hour < candidateEndInUserTz;
  };

  const isUserActiveAt = (hour: number) => {
    return hour >= userActiveRange[0] && hour < userActiveRange[1];
  };

  // Calculate overlapping hours count
  const overlapHoursList = Array.from({ length: 24 }, (_, h) => h).filter(
    (h) => isUserActiveAt(h) && isCandidateActiveAt(h)
  );

  const overlapCount = overlapHoursList.length;

  const getCadenceInsight = (count: number) => {
    if (count >= 3) {
      return {
        label: "High Real-Time Pairing Cadence",
        badgeVariant: "brand" as const,
        desc: `You and ${candidateName} share a substantial ${count}-hour simultaneous build window every evening. Ideal for Tuple pairing sessions and rapid live debugging.`,
      };
    }
    if (count >= 1) {
      return {
        label: "Balanced Hybrid Overlap",
        badgeVariant: "success" as const,
        desc: `You have ${count} hour(s) of simultaneous active collaboration daily. Perfect for daily syncs, sprint planning, and async handoffs.`,
      };
    }
    return {
      label: "Pure Async Relay Pipeline",
      badgeVariant: "surface" as const,
      desc: `Timezones enable continuous relay momentum: code written during your evening is reviewed during their morning with zero meeting fatigue.`,
    };
  };

  const cadence = getCadenceInsight(overlapCount);

  return (
    <Card elevated className={cn("p-6 md:p-8 space-y-6 bg-devora-surface", className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-devora-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-devora-ink tracking-tight">
              Schedule & Timezone Overlap Matrix
            </h3>
            <Badge variant={cadence.badgeVariant} className="font-mono text-xs">
              {overlapCount} hrs/day Overlap
            </Badge>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            24-hour horizon comparing your working day against {candidateName}&rsquo;s active schedule normalized to your local time.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-devora-muted">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-devora-brand" />
            <span>Δ {candidateOffsetHours > 0 ? `+${candidateOffsetHours}h` : `${candidateOffsetHours}h`}</span>
          </span>
        </div>
      </div>

      {/* 24-Hour Horizon Visual Ribbons */}
      <div className="space-y-4">
        {/* User Ribbon */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-devora-muted">
            <span className="font-semibold text-devora-ink">
              You ({userTimezone.split(" ")[0]})
            </span>
            <span>
              Active: {userActiveRange[0]}:00 – {userActiveRange[1]}:00
            </span>
          </div>

          <div
            className="gap-1 p-1 bg-devora-surface-strong rounded-button border border-devora-border"
            style={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
          >
            {Array.from({ length: 24 }, (_, h) => {
              const isActive = isUserActiveAt(h);
              const isOverlap = overlapHoursList.includes(h);

              return (
                <div
                  key={h}
                  onMouseEnter={() => setHoveredHour(h)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className={cn(
                    "h-8 rounded-subtle flex items-center justify-center font-mono text-[9px] cursor-pointer transition-all duration-150 select-none",
                    isOverlap
                      ? "bg-devora-brand text-white font-bold shadow-subtle scale-105 z-10"
                      : isActive
                      ? "bg-devora-brand-soft text-devora-brand-dark border border-devora-brand/30"
                      : "bg-devora-background text-devora-muted/60 hover:bg-devora-surface hover:text-devora-ink"
                  )}
                  title={`${h}:00 - ${h + 1}:00 (Local Time)`}
                >
                  {h}
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Ribbon (Normalized to User Perspective) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-devora-muted">
            <span className="font-semibold text-devora-ink">
              {candidateName} ({candidateTimezone.split(" ")[0]})
            </span>
            <span>
              Active: {candidateActiveRange[0]}:00 – {candidateActiveRange[1]}:00 Tokyo
            </span>
          </div>

          <div
            className="gap-1 p-1 bg-devora-surface-strong rounded-button border border-devora-border"
            style={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
          >
            {Array.from({ length: 24 }, (_, h) => {
              const isActive = isCandidateActiveAt(h);
              const isOverlap = overlapHoursList.includes(h);

              return (
                <div
                  key={h}
                  onMouseEnter={() => setHoveredHour(h)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className={cn(
                    "h-8 rounded-subtle flex items-center justify-center font-mono text-[9px] cursor-pointer transition-all duration-150 select-none",
                    isOverlap
                      ? "bg-devora-brand text-white font-bold shadow-subtle scale-105 z-10"
                      : isActive
                      ? "bg-emerald-100 text-devora-success border border-emerald-300"
                      : "bg-devora-background text-devora-muted/60 hover:bg-devora-surface hover:text-devora-ink"
                  )}
                  title={`${h}:00 - ${h + 1}:00 in your local time (${(h + candidateOffsetHours) % 24}:00 ${candidateName}'s time)`}
                >
                  {(h + candidateOffsetHours) % 24}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-devora-muted pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-subtle bg-devora-brand" />
            <span>Synchronized Overlap Window ({overlapCount}h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-subtle bg-devora-brand-soft border border-devora-brand/30" />
            <span>Your Solo Build Hours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-subtle bg-emerald-100 border border-emerald-300" />
            <span>{candidateName}&rsquo;s Active Hours</span>
          </div>
        </div>
      </div>

      {/* Hover Hour Inspector Micro-Feedback */}
      {hoveredHour !== null && (
        <div className="p-3 bg-devora-background rounded-button border border-devora-border font-mono text-xs flex items-center justify-between">
          <span className="text-devora-ink font-semibold">
            Inspecting Slot: {hoveredHour}:00 – {hoveredHour + 1}:00 (Your Local Time)
          </span>
          <span className="text-devora-brand font-medium">
            {candidateName}&rsquo;s Clock: {(hoveredHour + candidateOffsetHours) % 24}:00 ·{" "}
            {overlapHoursList.includes(hoveredHour) ? "✓ Mutual Overlap" : "Asynchronous"}
          </span>
        </div>
      )}

      {/* Cadence Recommendation Box */}
      <div className="p-4 bg-devora-surface-strong rounded-card border border-devora-border space-y-1.5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-devora-brand" />
          <span className="font-semibold text-xs text-devora-ink uppercase font-mono">
            {cadence.label}
          </span>
        </div>
        <p className="text-xs text-devora-muted leading-relaxed">
          {cadence.desc}
        </p>
      </div>
    </Card>
  );
}
