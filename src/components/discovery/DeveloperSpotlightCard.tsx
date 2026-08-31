"use client";

import * as React from "react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { MagnetButton } from "@/components/ui/MagnetButton";
import { MatchScoreBadge } from "@/components/match/MatchScoreBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompatibilityResult } from "@/store/types";
import { Clock, Send, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeveloperSpotlightCardProps {
  match: CompatibilityResult;
  onInvite?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  className?: string;
}

export function DeveloperSpotlightCard({
  match,
  onInvite,
  onViewProfile,
  className,
}: DeveloperSpotlightCardProps) {
  return (
    <SpotlightCard
      className={cn(
        "space-y-4 shadow-card hover:border-devora-border-strong group",
        className
      )}
    >
      {/* Header with Match Score & Identity */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <MatchScoreBadge score={match.score} size="md" />
          <div>
            <h3 className="text-lg font-semibold text-devora-ink group-hover:text-devora-brand transition-colors">
              {match.candidateName}
            </h3>
            <p className="text-xs text-devora-muted font-mono">
              {match.candidateTitle}
            </p>
          </div>
        </div>

        <Badge variant="brand" className="text-[10px] font-mono">
          {match.score}% Fit
        </Badge>
      </div>

      {/* Bandwidth & Overlap Tag */}
      <div className="flex items-center gap-2 text-xs font-mono text-devora-muted bg-devora-surface-strong p-2.5 rounded-button border border-devora-border">
        <Clock className="w-3.5 h-3.5 text-devora-brand shrink-0" />
        <span>{match.hoursOverlap}</span>
      </div>

      {/* Stack Overlap Roster */}
      <div className="space-y-1.5 pt-1 border-t border-devora-border">
        <span className="text-[11px] font-mono uppercase font-semibold text-devora-muted tracking-wide">
          Direct Stack Overlap:
        </span>
        <div className="flex flex-wrap gap-1">
          {match.stackOverlap.map((s) => (
            <Badge key={s} variant="brand" className="text-[10px] py-0 px-1.5 font-mono">
              {s}
            </Badge>
          ))}
        </div>
      </div>

      {/* Complementary Superpowers */}
      {match.complementarySkills.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono uppercase font-semibold text-devora-muted tracking-wide flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-devora-success" />
            <span>Complementary Superpowers:</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {match.complementarySkills.map((s) => (
              <Badge key={s} variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                + {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-devora-border text-xs">
        <span className="text-devora-muted font-mono text-[11px]">
          Verified GitHub Activity
        </span>

        <div className="flex items-center gap-2">
          {onViewProfile && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewProfile(match.targetUserId)}
              className="text-xs h-8"
            >
              Profile
            </Button>
          )}

          {onInvite && (
            <MagnetButton
              onClick={() => onInvite(match.targetUserId)}
              className="gap-1.5 text-xs h-8 px-3 bg-devora-brand text-white hover:bg-devora-brand-dark shadow-subtle"
            >
              <Send className="w-3 h-3" />
              <span>Invite</span>
            </MagnetButton>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
