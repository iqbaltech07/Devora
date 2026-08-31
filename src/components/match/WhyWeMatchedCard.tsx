"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { DecryptedText } from "@/components/ui/DecryptedText";
import { CompatibilityResult } from "@/store/types";
import { Code2, Clock, Target, Layers, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhyWeMatchedCardProps {
  match: CompatibilityResult;
  onInvite?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  className?: string;
}

export function WhyWeMatchedCard({
  match,
  onInvite,
  onViewProfile,
  className,
}: WhyWeMatchedCardProps) {
  return (
    <Card elevated className={cn("p-6 md:p-8 space-y-6 bg-devora-surface", className)}>
      {/* Header with Precision Score Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-devora-border">
        <div className="flex items-center gap-4">
          <MatchScoreBadge score={match.score} size="lg" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wide text-devora-muted font-medium">
                Forensic Match Rationale
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                Formula v2.4
              </Badge>
            </div>
            <h3 className="text-xl font-semibold text-devora-ink">
              {match.candidateName}
            </h3>
            <p className="text-xs text-devora-muted font-mono">
              {match.candidateTitle} · {match.hoursOverlap}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onViewProfile && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewProfile(match.targetUserId)}
              className="text-xs h-9"
            >
              Profile Proof
            </Button>
          )}
          {onInvite && (
            <Button
              size="sm"
              onClick={() => onInvite(match.targetUserId)}
              className="text-xs h-9 gap-1.5"
            >
              <span>Invite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Algorithmic Weight Distribution Bar (design.md Section 25) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-devora-muted">
          <span>Formula Weights (Analytical, Zero-Slop):</span>
          <span>40% Stack + 30% Schedule + 30% Intent</span>
        </div>
        <div className="w-full h-2 rounded-pill bg-devora-surface-strong border border-devora-border overflow-hidden flex">
          <div className="h-full bg-devora-brand" style={{ width: "40%" }} title="Stack Synergy: 40%" />
          <div className="h-full bg-devora-success" style={{ width: "30%" }} title="Schedule Overlap: 30%" />
          <div className="h-full bg-devora-warning" style={{ width: "30%" }} title="Goal Alignment: 30%" />
        </div>
      </div>

      {/* The 3 Credible Rationales with Decrypted Text Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rationale 1: Stack Synergy */}
        <div className="p-4 rounded-card bg-devora-background border border-devora-border space-y-2.5 transition-all duration-150 hover:border-devora-border-strong group">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase text-devora-muted font-medium">
                Pillar 01 (40%)
              </span>
              <h4 className="text-xs font-semibold text-devora-ink font-mono">
                <DecryptedText text="Stack Overlap & Synergy" animateOnHover />
              </h4>
            </div>
          </div>

          <p className="text-xs text-devora-muted leading-relaxed">
            Direct production experience in key project technologies with zero framework friction.
          </p>

          <div className="pt-1 space-y-1 border-t border-devora-border">
            <span className="block text-[10px] font-mono text-devora-muted">Direct Overlap:</span>
            <div className="flex flex-wrap gap-1">
              {match.stackOverlap.map((s) => (
                <Badge key={s} variant="brand" className="text-[10px] py-0 px-1.5 font-mono">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Rationale 2: Schedule & Availability Overlap */}
        <div className="p-4 rounded-card bg-devora-background border border-devora-border space-y-2.5 transition-all duration-150 hover:border-devora-border-strong group">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-success">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase text-devora-muted font-medium">
                Pillar 02 (30%)
              </span>
              <h4 className="text-xs font-semibold text-devora-ink font-mono">
                <DecryptedText text="Bandwidth & Overlap" animateOnHover />
              </h4>
            </div>
          </div>

          <p className="text-xs text-devora-muted leading-relaxed">
            Synchronized working cadence prevents bottlenecking and aligns sprint review cycles.
          </p>

          <div className="pt-1 space-y-1 border-t border-devora-border">
            <span className="block text-[10px] font-mono text-devora-muted">Working Window:</span>
            <span className="text-[11px] font-mono text-devora-ink block font-medium">
              {match.hoursOverlap}
            </span>
          </div>
        </div>

        {/* Rationale 3: Goal & Work Style Alignment */}
        <div className="p-4 rounded-card bg-devora-background border border-devora-border space-y-2.5 transition-all duration-150 hover:border-devora-border-strong group">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-warning">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase text-devora-muted font-medium">
                Pillar 03 (30%)
              </span>
              <h4 className="text-xs font-semibold text-devora-ink font-mono">
                <DecryptedText text="Intent & Protocol Alignment" animateOnHover />
              </h4>
            </div>
          </div>

          <p className="text-xs text-devora-muted leading-relaxed">
            Mutual commitment to building an async-first MVP. Both prefer GitHub PRs and minimal meetings.
          </p>

          <div className="pt-1 space-y-1 border-t border-devora-border">
            <span className="block text-[10px] font-mono text-devora-muted">Primary Goal:</span>
            <span className="text-[11px] font-mono text-devora-ink block font-medium">
              SaaS MVP Launch (Async-first)
            </span>
          </div>
        </div>
      </div>

      {/* Complementary Superpowers Footer */}
      {match.complementarySkills.length > 0 && (
        <div className="p-3.5 rounded-button bg-devora-surface-strong border border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-devora-brand shrink-0" />
            <span className="text-devora-muted">
              <strong className="text-devora-ink font-semibold">Complementary Superpowers:</strong> Skills they bring that round out your technical gaps:
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {match.complementarySkills.map((s) => (
              <Badge key={s} variant="outline" className="text-[10px] font-mono">
                + {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
