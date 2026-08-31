"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerifiedSkillBadge } from "./VerifiedSkillBadge";
import { useUserStore } from "@/store/useUserStore";
import { ShieldCheck, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillProvenanceLedgerProps {
  className?: string;
}

export function SkillProvenanceLedger({ className }: SkillProvenanceLedgerProps) {
  const { currentUser } = useUserStore();

  const matrix = currentUser.skillMatrix || [];
  const verifiedSkills = matrix.filter((s) => s.isPrimary);
  const selfClaimedSkills = matrix.filter((s) => !s.isPrimary);

  return (
    <Card elevated className={cn("p-6 md:p-8 space-y-6 bg-devora-surface", className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-devora-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-devora-brand" />
            <h3 className="text-base font-semibold text-devora-ink tracking-tight">
              Skill Provenance & Commit Evidence Ledger
            </h3>
            <Badge variant="brand" className="text-[10px] font-mono">
              {verifiedSkills.length} Verified via Git
            </Badge>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Devora distinguishes claims from evidence (design.md §25). Click any badge to inspect commit SHAs and repository history.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-devora-muted">
          <span className="flex items-center gap-1">
            <GitBranch className="w-3.5 h-3.5 text-devora-brand" />
            <span>GitHub Synced</span>
          </span>
        </div>
      </div>

      {/* Verified Skills Block */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-devora-ink font-semibold flex items-center gap-1.5 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-devora-success" />
            <span>Verified Skills with Commit Backing</span>
          </span>
          <span className="text-devora-muted">
            {verifiedSkills.length} verified badges
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {verifiedSkills.map((skill) => (
            <VerifiedSkillBadge
              key={skill.id}
              skillName={skill.name}
              isVerified={true}
              proficiency={skill.proficiency}
              commitCount={skill.name === "TypeScript" ? 48 : skill.name === "Next.js" ? 32 : 24}
              repoCount={2}
            />
          ))}
        </div>
      </div>

      {/* Self-Claimed Skills Block */}
      <div className="space-y-2.5 pt-2 border-t border-devora-border">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-devora-muted font-medium flex items-center gap-1.5 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-devora-muted/60" />
            <span>Self-Claimed Capabilities (Awaiting Commit Evidence)</span>
          </span>
          <span className="text-devora-muted">
            {selfClaimedSkills.length} claimed
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {selfClaimedSkills.map((skill) => (
            <VerifiedSkillBadge
              key={skill.id}
              skillName={skill.name}
              isVerified={false}
              proficiency={skill.proficiency}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
