"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, GitBranch, GitCommit, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommitProof {
  sha: string;
  message: string;
  repo: string;
  date: string;
  url?: string;
}

interface VerifiedSkillBadgeProps {
  skillName: string;
  isVerified?: boolean;
  proficiency?: "Junior" | "Mid" | "Senior";
  commitCount?: number;
  repoCount?: number;
  languagePercent?: number;
  proofs?: CommitProof[];
  className?: string;
}

const DEFAULT_PROOFS: Record<string, CommitProof[]> = {
  TypeScript: [
    {
      sha: "a8f3b12",
      message: "feat(engine): implement AST anti-slop rule verification pipeline",
      repo: "devora/devora",
      date: "2 days ago",
      url: "https://github.com/devora/devora/commit/a8f3b12",
    },
    {
      sha: "4b92c01",
      message: "refactor(store): modularize Zustand 5-store architecture suite",
      repo: "devora/devora",
      date: "3 days ago",
      url: "https://github.com/devora/devora/commit/4b92c01",
    },
  ],
  "Next.js": [
    {
      sha: "e7c1109",
      message: "feat(routes): configure App Router dynamic server actions & static SSG",
      repo: "devora/devora",
      date: "4 days ago",
      url: "https://github.com/devora/devora/commit/e7c1109",
    },
  ],
  PostgreSQL: [
    {
      sha: "90fd241",
      message: "perf(db): add compound index on user_id and skill_id for fast matching",
      repo: "piardify/piardify-core",
      date: "1 week ago",
      url: "https://github.com/piardify/piardify-core/commit/90fd241",
    },
  ],
};

export function VerifiedSkillBadge({
  skillName,
  isVerified = true,
  proficiency = "Senior",
  commitCount = 38,
  repoCount = 2,
  languagePercent = 84,
  proofs,
  className,
}: VerifiedSkillBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const activeProofs = proofs || DEFAULT_PROOFS[skillName] || [
    {
      sha: "71e05a3",
      message: `chore: production architecture and integration updates for ${skillName}`,
      repo: "devora/devora",
      date: "5 days ago",
      url: "https://github.com/devora/devora",
    },
  ];

  const handleCopySha = (sha: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  // Close popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={badgeRef} className={cn("relative inline-block select-none", className)}>
      {/* Interactive Badge Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-mono border transition-all duration-150 cursor-pointer",
          isVerified
            ? "bg-emerald-50/80 text-devora-ink border-emerald-300/80 hover:border-emerald-400 shadow-subtle"
            : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink"
        )}
        title="Click to inspect verified commit proof"
      >
        {isVerified ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-devora-success shrink-0" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-devora-muted/60 shrink-0" />
        )}
        <span className="font-semibold">{skillName}</span>
        {proficiency && (
          <span className="text-[10px] text-devora-muted">· {proficiency}</span>
        )}
        {isVerified && (
          <span className="text-[10px] text-devora-success font-medium bg-white/80 px-1 rounded-button border border-emerald-200">
            {commitCount}c
          </span>
        )}
      </button>

      {/* Commit Proof Provenance Popover (design.md Section 25) */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80 p-4 rounded-card bg-devora-surface border border-devora-border shadow-elevated animate-in fade-in zoom-in-95 duration-150 space-y-3">
          <div className="flex items-center justify-between border-b border-devora-border pb-2">
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-devora-brand" />
              <span className="text-xs font-semibold text-devora-ink font-mono">
                Git Provenance Evidence
              </span>
            </div>
            <Badge variant="success" className="text-[9px] font-mono py-0 px-1">
              Verified
            </Badge>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between font-mono text-[11px] text-devora-muted">
              <span>Repository Coverage:</span>
              <strong className="text-devora-ink">{repoCount} repositories ({languagePercent}%)</strong>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-devora-muted">
              <span>Verified Commits:</span>
              <strong className="text-devora-ink">{commitCount} commits analyzed</strong>
            </div>
          </div>

          {/* Recent Commits Log */}
          <div className="space-y-1.5 pt-1 border-t border-devora-border">
            <span className="block text-[10px] font-mono uppercase text-devora-muted font-medium">
              Recent Evidence Commits:
            </span>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {activeProofs.map((proof) => (
                <div
                  key={proof.sha}
                  className="p-2 rounded-button bg-devora-background border border-devora-border space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-devora-muted truncate max-w-[150px]">
                      {proof.repo}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopySha(proof.sha, e)}
                      className="inline-flex items-center gap-0.5 text-devora-brand hover:underline"
                      title="Copy SHA"
                    >
                      <GitCommit className="w-2.5 h-2.5" />
                      <span>{proof.sha}</span>
                      {copiedSha === proof.sha ? (
                        <Check className="w-2.5 h-2.5 text-devora-success ml-0.5" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-devora-ink leading-relaxed line-clamp-2">
                    {proof.message}
                  </p>

                  <div className="flex items-center justify-between text-[9px] font-mono text-devora-muted pt-0.5">
                    <span>{proof.date}</span>
                    {proof.url && (
                      <a
                        href={proof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-devora-brand hover:underline"
                      >
                        <span>View Diff</span>
                        <ExternalLink className="w-2 h-2" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
