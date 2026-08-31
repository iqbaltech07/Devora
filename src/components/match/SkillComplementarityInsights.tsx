"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Zap, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillComplementarityInsightsProps {
  candidateName: string;
  projectStacks: string[];
  candidateSkills: string[];
  overlapSkills: string[];
  complementarySkills: string[];
  className?: string;
}

export function SkillComplementarityInsights({
  candidateName,
  projectStacks,
  candidateSkills,
  overlapSkills,
  complementarySkills,
  className,
}: SkillComplementarityInsightsProps) {
  const [filter, setFilter] = useState<"ALL" | "OVERLAP" | "COMPLEMENTARY">("ALL");

  // Calculate coverage index
  const totalRelevant = Array.from(
    new Set([...overlapSkills, ...complementarySkills])
  ).length;
  const coveragePercent = Math.min(
    100,
    Math.round((totalRelevant / Math.max(1, projectStacks.length)) * 100)
  );

  return (
    <Card elevated className={cn("p-6 md:p-8 space-y-6 bg-devora-surface", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-devora-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-devora-ink tracking-tight">
              Skill Complementarity & Synergy Matrix
            </h3>
            <Badge variant="brand" className="font-mono text-xs">
              {coveragePercent}% Stack Coverage
            </Badge>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Compares your project requirements against {candidateName}&rsquo;s verified capabilities to isolate direct overlap and complementary superpowers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 font-mono text-xs">
          {(["ALL", "OVERLAP", "COMPLEMENTARY"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={cn(
                "px-2.5 py-1 rounded-button border text-xs transition-colors select-none",
                filter === mode
                  ? "bg-devora-ink text-devora-background border-devora-ink font-medium"
                  : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink"
              )}
            >
              {mode === "ALL" ? "Full Matrix" : mode === "OVERLAP" ? "Shared Ground" : "Superpowers"}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Architectural Bridge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Project Tech Stack */}
        {(filter === "ALL" || filter === "OVERLAP") && (
          <div className="p-4 rounded-card bg-devora-background border border-devora-border space-y-3">
            <div className="flex items-center justify-between border-b border-devora-border pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-devora-muted" />
                <span className="font-semibold text-xs text-devora-ink uppercase font-mono">
                  Project Stack
                </span>
              </div>
              <span className="text-[11px] font-mono text-devora-muted">
                {projectStacks.length} needs
              </span>
            </div>

            <p className="text-xs text-devora-muted leading-relaxed">
              Mandatory technologies required across open project roles.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {projectStacks.map((s) => {
                const isOverlapped = overlapSkills.includes(s);
                return (
                  <span
                    key={s}
                    className={cn(
                      "px-2 py-0.5 rounded-pill text-xs font-mono border transition-colors",
                      isOverlapped
                        ? "bg-devora-surface-strong text-devora-ink border-devora-border font-medium"
                        : "bg-transparent text-devora-muted border-devora-border"
                    )}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Column 2: Direct Shared Overlap */}
        {(filter === "ALL" || filter === "OVERLAP") && (
          <div className="p-4 rounded-card bg-devora-brand-soft/40 border border-devora-brand/30 space-y-3">
            <div className="flex items-center justify-between border-b border-devora-brand/20 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-devora-brand" />
                <span className="font-semibold text-xs text-devora-brand-dark uppercase font-mono">
                  Shared Ground
                </span>
              </div>
              <Badge variant="brand" className="text-[10px] font-mono">
                {overlapSkills.length} Overlapping
              </Badge>
            </div>

            <p className="text-xs text-devora-muted leading-relaxed">
              Zero-onboarding common frameworks. Both parties write, review, and debug seamlessly.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {overlapSkills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 rounded-pill text-xs font-mono font-semibold bg-devora-brand text-white shadow-subtle"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Column 3: Candidate Superpowers */}
        {(filter === "ALL" || filter === "COMPLEMENTARY") && (
          <div className="p-4 rounded-card bg-devora-background border border-devora-border space-y-3">
            <div className="flex items-center justify-between border-b border-devora-border pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-devora-success" />
                <span className="font-semibold text-xs text-devora-ink uppercase font-mono">
                  Complementary
                </span>
              </div>
              <Badge variant="success" className="text-[10px] font-mono">
                +{complementarySkills.length} Superpowers
              </Badge>
            </div>

            <p className="text-xs text-devora-muted leading-relaxed">
              Unique proficiencies {candidateName} contributes that fill your technical blind spots.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {complementarySkills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 rounded-pill text-xs font-mono font-medium bg-emerald-50 text-devora-success border border-emerald-200"
                >
                  + {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coverage Rationale Card */}
      <div className="p-4 bg-devora-surface-strong rounded-button border border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-devora-brand shrink-0" />
          <span className="text-devora-muted">
            <strong className="text-devora-ink font-semibold">Synergy Breakdown:</strong> Pairing with {candidateName} resolves {coveragePercent}% of project technical scope while introducing {complementarySkills.join(", ")} as modular extensions.
          </span>
        </div>

        <span className="font-mono text-devora-ink font-semibold shrink-0 bg-devora-surface px-2.5 py-1 rounded-button border border-devora-border">
          Coverage Index: {coveragePercent}/100
        </span>
      </div>
    </Card>
  );
}
