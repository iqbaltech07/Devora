"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number; // 0 - 100
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  showTier?: boolean;
  className?: string;
}

export function MatchScoreBadge({
  score,
  size = "md",
  showLabel = false,
  showTier = false,
  className,
}: MatchScoreBadgeProps) {
  // Clamped score between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));
  const [displayedOffset, setDisplayedOffset] = useState(100);

  const dimensions = {
    sm: { diameter: 36, stroke: 3, fontSize: "text-[11px]", labelSize: "text-[10px]" },
    md: { diameter: 52, stroke: 4, fontSize: "text-sm", labelSize: "text-xs" },
    lg: { diameter: 76, stroke: 5.5, fontSize: "text-lg", labelSize: "text-xs" },
    xl: { diameter: 104, stroke: 7, fontSize: "text-2xl", labelSize: "text-sm" },
  }[size];

  const radius = (dimensions.diameter - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Tactile micro-interaction transition (150ms - 250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedOffset(strokeDashoffset);
    }, 30);
    return () => clearTimeout(timer);
  }, [strokeDashoffset]);

  // Analytical color token selection based on design.md Section 13
  const getScoreTheme = (s: number) => {
    if (s >= 85) {
      return {
        color: "#E85D3F", // Devora Brand Terracotta
        tier: "High Synergy",
        tierVariant: "brand" as const,
      };
    }
    if (s >= 70) {
      return {
        color: "#2E7D32", // Forest Emerald
        tier: "Strong Match",
        tierVariant: "success" as const,
      };
    }
    if (s >= 50) {
      return {
        color: "#B45309", // Warm Amber
        tier: "Moderate Overlap",
        tierVariant: "warning" as const,
      };
    }
    return {
      color: "#6E6A63", // Quiet Muted Ink
      tier: "Exploratory Fit",
      tierVariant: "outline" as const,
    };
  };

  const theme = getScoreTheme(clampedScore);

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Precision Radial Progress Ring */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: dimensions.diameter, height: dimensions.diameter }}
        role="progressbar"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Match compatibility score: ${clampedScore}%`}
      >
        <svg
          width={dimensions.diameter}
          height={dimensions.diameter}
          viewBox={`0 0 ${dimensions.diameter} ${dimensions.diameter}`}
          className="-rotate-90"
        >
          {/* Background Track Ring */}
          <circle
            cx={dimensions.diameter / 2}
            cy={dimensions.diameter / 2}
            r={radius}
            stroke="#D9D5CB"
            strokeWidth={dimensions.stroke}
            fill="transparent"
            className="opacity-40"
          />

          {/* Active Score Arc with 200ms tactile transition */}
          <circle
            cx={dimensions.diameter / 2}
            cy={dimensions.diameter / 2}
            r={radius}
            stroke={theme.color}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={displayedOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-200 ease-out"
          />
        </svg>

        {/* Centered Percentage Typography */}
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-devora-ink">
          <span className={dimensions.fontSize}>
            {clampedScore}
            <span className="text-[9px] font-normal text-devora-muted">%</span>
          </span>
        </div>
      </div>

      {/* Optional Metadata Labels */}
      {(showLabel || showTier) && (
        <div className="space-y-0.5">
          {showLabel && (
            <span className={cn("block font-semibold text-devora-ink font-mono", dimensions.labelSize)}>
              {clampedScore}% Compatibility
            </span>
          )}
          {showTier && (
            <Badge variant={theme.tierVariant} className="text-[10px] py-0 px-2 font-mono">
              {theme.tier}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
