"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Star, GitFork, Check, Search, ShieldCheck } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

export function RepoShowcase() {
  const { currentUser, toggleRepoEvidence } = useUserStore();
  const [search, setSearch] = useState("");

  const gitAccounts = currentUser.gitAccounts || [];
  const allRepos = gitAccounts.flatMap((acc) => acc.repositories);

  const filteredRepos = allRepos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.language.toLowerCase().includes(search.toLowerCase()) ||
      repo.description.toLowerCase().includes(search.toLowerCase())
  );

  const evidenceCount = allRepos.filter((r) => r.isEvidence).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-devora-ink tracking-tight">
              Public Repository Evidence
            </h2>
            <span className="text-xs font-mono text-devora-muted font-medium bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
              {evidenceCount} active in match calculation
            </span>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Select which repositories are verified by Devora’s algorithm to evaluate compatibility
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-devora-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, language..."
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {allRepos.length === 0 ? (
        <Card className="p-8 text-center bg-devora-surface space-y-2">
          <p className="text-sm font-semibold text-devora-ink">No Repositories Synced Yet</p>
          <p className="text-xs text-devora-muted max-w-sm mx-auto">
            Connect your GitHub or GitLab account above to import your public repositories.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map((repo) => (
            <Card
              key={repo.id}
              elevated={repo.isEvidence}
              className={cn(
                "p-5 flex flex-col justify-between space-y-4 transition-all duration-150",
                repo.isEvidence
                  ? "border-devora-brand/40 bg-devora-surface shadow-card"
                  : "border-devora-border bg-devora-surface-strong/60"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm font-semibold text-devora-ink hover:text-devora-brand transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{repo.name}</span>
                      <ExternalLink className="w-3 h-3 text-devora-muted" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRepoEvidence(repo.id)}
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-button border transition-colors select-none",
                      repo.isEvidence
                        ? "bg-devora-brand-soft text-devora-brand-dark border-devora-brand/30 font-medium"
                        : "bg-devora-background text-devora-muted border-devora-border hover:text-devora-ink"
                    )}
                  >
                    {repo.isEvidence ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-devora-brand" />
                        <span>Match Evidence</span>
                      </>
                    ) : (
                      <span>+ Use as Proof</span>
                    )}
                  </button>
                </div>

                <p className="text-xs text-devora-muted leading-relaxed line-clamp-2">
                  {repo.description}
                </p>
              </div>

              {/* Repo Metadata & Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-devora-border text-xs text-devora-muted font-mono">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: repo.languageColor }}
                    />
                    <span className="text-devora-ink text-[11px]">{repo.language}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Star className="w-3 h-3 text-devora-muted" />
                    <span>{repo.starsCount}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <GitFork className="w-3 h-3 text-devora-muted" />
                    <span>{repo.forksCount}</span>
                  </span>
                </div>

                <span className="text-[10px] text-devora-muted">
                  Updated {new Date(repo.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
