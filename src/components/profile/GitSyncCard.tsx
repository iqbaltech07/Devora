"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, ExternalLink, CheckCircle2, GitBranch, Unlink } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

export function GitSyncCard() {
  const { currentUser, isSyncing, connectGitAccount, disconnectGitAccount, syncGitAccount } =
    useUserStore();

  const [gitlabInput, setGitlabInput] = useState("");
  const [showGitlabInput, setShowGitlabInput] = useState(false);

  const gitAccounts = currentUser.gitAccounts || [];
  const github = gitAccounts.find((a) => a.provider === "github");
  const gitlab = gitAccounts.find((a) => a.provider === "gitlab");

  const handleConnectGitlab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitlabInput.trim()) return;
    connectGitAccount("gitlab", gitlabInput.trim());
    setGitlabInput("");
    setShowGitlabInput(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-devora-border pb-3">
        <div>
          <h2 className="text-lg font-semibold text-devora-ink tracking-tight">
            Code & Repository Verification
          </h2>
          <p className="text-xs text-devora-muted mt-0.5">
            Sync public repositories as verified proof of skills for compatibility matching
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          Claim vs Evidence (design.md §25)
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub Integration Card */}
        <Card
          elevated={github?.connected}
          className={cn(
            "p-5 space-y-4 transition-colors",
            github?.connected ? "border-devora-border-strong" : "border-devora-border bg-devora-background"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-ink font-mono font-bold text-sm">
                GH
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-devora-ink">GitHub</span>
                  {github?.connected ? (
                    <Badge variant="success" className="text-[10px] py-0 px-2 gap-1">
                      <CheckCircle2 className="w-3 h-3 text-devora-success" />
                      <span>Verified</span>
                    </Badge>
                  ) : (
                    <Badge variant="surface" className="text-[10px] py-0 px-2">
                      Not Linked
                    </Badge>
                  )}
                </div>
                {github?.connected && github.username ? (
                  <a
                    href={github.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-devora-muted hover:text-devora-brand transition-colors font-mono mt-0.5"
                  >
                    <span>@{github.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-devora-muted">Link to sync public repos</span>
                )}
              </div>
            </div>

            {github?.connected && (
              <span className="text-xs font-mono text-devora-muted bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
                {github.repositories.length} repos
              </span>
            )}
          </div>

          {github?.connected ? (
            <div className="pt-2 border-t border-devora-border space-y-3">
              <div className="flex items-center justify-between text-xs text-devora-muted font-mono">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  Last synced:
                </span>
                <span>
                  {github.lastSyncedAt
                    ? new Date(github.lastSyncedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isSyncing}
                  onClick={() => syncGitAccount("github")}
                  className="flex-1 gap-1.5 text-xs h-9"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin text-devora-brand")} />
                  <span>{isSyncing ? "Syncing..." : "Sync Repos"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => disconnectGitAccount("github")}
                  className="text-xs h-9 px-2.5 text-devora-muted hover:text-devora-danger"
                  title="Disconnect GitHub"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-devora-border">
              <Button
                size="sm"
                onClick={() => connectGitAccount("github", currentUser.githubUsername || "github-user")}
                className="w-full text-xs h-9"
              >
                Connect GitHub Profile
              </Button>
            </div>
          )}
        </Card>

        {/* GitLab Integration Card */}
        <Card
          elevated={gitlab?.connected}
          className={cn(
            "p-5 space-y-4 transition-colors",
            gitlab?.connected ? "border-devora-border-strong" : "border-devora-border bg-devora-background"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-ink font-mono font-bold text-sm">
                GL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-devora-ink">GitLab</span>
                  {gitlab?.connected ? (
                    <Badge variant="success" className="text-[10px] py-0 px-2 gap-1">
                      <CheckCircle2 className="w-3 h-3 text-devora-success" />
                      <span>Verified</span>
                    </Badge>
                  ) : (
                    <Badge variant="surface" className="text-[10px] py-0 px-2">
                      Not Linked
                    </Badge>
                  )}
                </div>
                {gitlab?.connected && gitlab.username ? (
                  <span className="text-xs text-devora-muted font-mono mt-0.5 block">
                    @{gitlab.username}
                  </span>
                ) : (
                  <span className="text-xs text-devora-muted">Connect self-hosted or cloud</span>
                )}
              </div>
            </div>

            {gitlab?.connected && (
              <span className="text-xs font-mono text-devora-muted bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
                {gitlab.repositories.length} repos
              </span>
            )}
          </div>

          {gitlab?.connected ? (
            <div className="pt-2 border-t border-devora-border space-y-3">
              <div className="flex items-center justify-between text-xs text-devora-muted font-mono">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  Last synced:
                </span>
                <span>
                  {gitlab.lastSyncedAt
                    ? new Date(gitlab.lastSyncedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isSyncing}
                  onClick={() => syncGitAccount("gitlab")}
                  className="flex-1 gap-1.5 text-xs h-9"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin text-devora-brand")} />
                  <span>{isSyncing ? "Syncing..." : "Sync Repos"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => disconnectGitAccount("gitlab")}
                  className="text-xs h-9 px-2.5 text-devora-muted hover:text-devora-danger"
                  title="Disconnect GitLab"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-devora-border">
              {showGitlabInput ? (
                <form onSubmit={handleConnectGitlab} className="space-y-2">
                  <Input
                    placeholder="GitLab username (e.g. iqbal-dev)"
                    value={gitlabInput}
                    onChange={(e) => setGitlabInput(e.target.value)}
                    className="h-9 text-xs"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button type="submit" size="sm" className="h-8 text-xs flex-1">
                      Save & Sync
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGitlabInput(false)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowGitlabInput(true)}
                  className="w-full text-xs h-9"
                >
                  Connect GitLab Account
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
