"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Clock, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityWeek {
  week: string;
  intensity: number; // 0 to 100
  hours: number;
  label: string;
}

interface ReliabilityScorecardProps {
  fulfillmentRate?: number;
  hoursCommitted?: number;
  hoursDelivered?: number;
  avgResponseHours?: number;
  completedMilestones?: number;
  totalProjectsJoined?: number;
  className?: string;
}

const DEFAULT_ACTIVITY_HISTORY: ActivityWeek[] = [
  { week: "W1", intensity: 65, hours: 8, label: "Ideation & Architecture RFC" },
  { week: "W2", intensity: 85, hours: 11, label: "Prisma Schema & Migrations" },
  { week: "W3", intensity: 90, hours: 12, label: "Zustand State Refactor" },
  { week: "W4", intensity: 70, hours: 9, label: "UI Shell & Navigation" },
  { week: "W5", intensity: 95, hours: 12, label: "Profile & Git Sync Card" },
  { week: "W6", intensity: 100, hours: 14, label: "Project Wizard & Roadmap" },
  { week: "W7", intensity: 90, hours: 12, label: "Match Engine Radial Badge" },
  { week: "W8", intensity: 85, hours: 11, label: "Schedule Overlap Matrix" },
  { week: "W9", intensity: 80, hours: 10, label: "Spotlight Card & Filter" },
  { week: "W10", intensity: 95, hours: 13, label: "Direct Message Markdown" },
  { week: "W11", intensity: 100, hours: 14, label: "Peer Audit Review Form" },
  { week: "W12", intensity: 90, hours: 12, label: "Reliability & Scorecards" },
];

export function ReliabilityScorecard({
  fulfillmentRate = 96,
  hoursCommitted = 12,
  hoursDelivered = 11.4,
  avgResponseHours = 3.2,
  completedMilestones = 24,
  totalProjectsJoined = 4,
  className,
}: ReliabilityScorecardProps) {
  const [hoveredWeek, setHoveredWeek] = useState<ActivityWeek | null>(null);

  const adherencePercent = Math.min(
    100,
    Math.round((hoursDelivered / hoursCommitted) * 100)
  );

  return (
    <Card
      elevated
      className={cn("p-6 md:p-8 space-y-6 bg-devora-surface border-devora-border", className)}
    >
      {/* Scorecard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-devora-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-devora-brand" />
            <h3 className="text-base font-semibold text-devora-ink tracking-tight">
              Reliability & Sprint Velocity Scorecard
            </h3>
            <Badge variant="brand" className="text-[10px] font-mono">
              Tier 1 Builder
            </Badge>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Objective track record of follow-through, sprint cadence adherence, and async responsiveness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-[10px] font-mono py-1 px-2.5 gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>0 Ghosted Sprints</span>
          </Badge>
        </div>
      </div>

      {/* 4-KPI Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Fulfillment Rate */}
        <div className="p-4 rounded-card bg-devora-surface-strong/70 border border-devora-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-devora-muted font-medium">
              Sprint Fulfillment
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-devora-brand" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-devora-ink">
              {fulfillmentRate}%
            </span>
            <span className="text-[10px] font-mono text-devora-success font-medium">
              High Rigor
            </span>
          </div>
          <p className="text-[11px] text-devora-muted leading-tight">
            {completedMilestones} milestones shipped on schedule.
          </p>
        </div>

        {/* KPI 2: Cadence Adherence */}
        <div className="p-4 rounded-card bg-devora-surface-strong/70 border border-devora-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-devora-muted font-medium">
              Cadence Adherence
            </span>
            <Clock className="w-3.5 h-3.5 text-devora-success" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-devora-ink">
              {hoursDelivered}
            </span>
            <span className="text-xs font-mono text-devora-muted">
              / {hoursCommitted}h/wk
            </span>
          </div>
          <div className="w-full h-1.5 rounded-pill bg-devora-border overflow-hidden">
            <div
              className="h-full bg-devora-brand rounded-pill transition-all duration-300"
              style={{ width: `${adherencePercent}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Async Latency */}
        <div className="p-4 rounded-card bg-devora-surface-strong/70 border border-devora-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-devora-muted font-medium">
              Async Response Window
            </span>
            <Zap className="w-3.5 h-3.5 text-devora-warning" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-devora-ink">
              &lt; {avgResponseHours}h
            </span>
            <span className="text-[10px] font-mono text-devora-muted">
              during window
            </span>
          </div>
          <p className="text-[11px] text-devora-muted leading-tight">
            Zero blocking review bottlenecks across all PRs.
          </p>
        </div>

        {/* KPI 4: Completion Record */}
        <div className="p-4 rounded-card bg-devora-surface-strong/70 border border-devora-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-devora-muted font-medium">
              Projects Delivered
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-devora-ink" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-devora-ink">
              {totalProjectsJoined}
            </span>
            <span className="text-xs font-mono text-devora-muted">
              Projects Active
            </span>
          </div>
          <p className="text-[11px] text-devora-muted leading-tight">
            100% completion rate with positive peer audits.
          </p>
        </div>
      </div>

      {/* 12-Week Activity & Sprint Rhythm Ribbon */}
      <div className="space-y-3 pt-2 border-t border-devora-border">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-devora-ink font-semibold flex items-center gap-1.5 uppercase tracking-wide">
            <span>12-Week Collaboration Rhythm</span>
          </span>
          <span className="text-devora-muted">
            {hoveredWeek
              ? `${hoveredWeek.week}: ${hoveredWeek.hours}h · ${hoveredWeek.label}`
              : "Hover bar to inspect sprint deliverable"}
          </span>
        </div>

        {/* 12 Bars Distribution */}
        <div className="grid grid-cols-12 gap-1.5 items-end h-20 p-3 rounded-card bg-devora-background border border-devora-border">
          {DEFAULT_ACTIVITY_HISTORY.map((item) => (
            <div
              key={item.week}
              onMouseEnter={() => setHoveredWeek(item)}
              onMouseLeave={() => setHoveredWeek(null)}
              className="flex flex-col items-center justify-end h-full group cursor-pointer"
            >
              <div
                className={cn(
                  "w-full rounded-xs transition-all duration-150",
                  hoveredWeek?.week === item.week
                    ? "bg-devora-brand"
                    : "bg-devora-brand/40 group-hover:bg-devora-brand/80"
                )}
                style={{ height: `${item.intensity}%` }}
              />
              <span className="text-[9px] font-mono text-devora-muted mt-1 select-none">
                {item.week}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
