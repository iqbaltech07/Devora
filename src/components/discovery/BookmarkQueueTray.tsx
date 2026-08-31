"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, ArrowRight, Send, X, Layers } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { Project } from "@/store/types";
import { cn } from "@/lib/utils";

interface BookmarkQueueTrayProps {
  onExpressInterest: (project: Project) => void;
  className?: string;
}

export function BookmarkQueueTray({
  onExpressInterest,
  className,
}: BookmarkQueueTrayProps) {
  const { projects, bookmarkedProjectIds, toggleBookmarkProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const bookmarkedProjects = projects.filter((p) =>
    bookmarkedProjectIds.includes(p.id)
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Trigger Pill / Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-button text-xs font-mono border transition-all duration-150 select-none",
          bookmarkedProjects.length > 0
            ? "bg-devora-surface border-devora-border text-devora-ink hover:border-devora-brand/40 shadow-subtle"
            : "bg-devora-surface-strong text-devora-muted border-devora-border"
        )}
      >
        <Bookmark className="w-3.5 h-3.5 text-devora-brand fill-devora-brand/20" />
        <span className="font-semibold">Saved Opportunities Queue</span>
        <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-mono">
          {bookmarkedProjects.length}
        </Badge>
      </button>

      {/* Slide-Down / Dropdown Queue Drawer */}
      {isOpen && (
        <Card elevated className="p-4 bg-devora-surface border-devora-border space-y-3">
          <div className="flex items-center justify-between border-b border-devora-border pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold font-mono text-devora-ink uppercase">
                Bookmarked Builder Opportunities
              </span>
              <span className="text-[11px] font-mono text-devora-muted">
                ({bookmarkedProjects.length} saved)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-devora-muted hover:text-devora-ink text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {bookmarkedProjects.length === 0 ? (
            <p className="text-xs text-devora-muted py-3 text-center">
              No bookmarked opportunities yet. Click the bookmark icon on any project card to queue it for later review.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {bookmarkedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 rounded-button bg-devora-background border border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-devora-ink font-mono">{proj.title}</span>
                      <Badge variant="surface" className="text-[9px] py-0 px-1 font-mono">
                        {proj.stage}
                      </Badge>
                      <span className="text-devora-muted text-[11px]">by {proj.ownerName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {proj.roles.map((r) => (
                        <span key={r.id} className="text-[10px] font-mono text-devora-muted">
                          {r.roleTitle} ({r.hoursPerWeek}h/wk)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      onClick={() => onExpressInterest(proj)}
                      className="text-xs h-7 gap-1 px-2.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Pitch</span>
                    </Button>

                    <button
                      type="button"
                      onClick={() => toggleBookmarkProject(proj.id)}
                      className="w-7 h-7 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-danger hover:bg-devora-surface-strong transition-colors"
                      title="Remove from bookmarks"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
