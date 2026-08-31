"use client";

import * as React from "react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { MagnetButton } from "@/components/ui/MagnetButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@/store/types";
import { useProjectStore } from "@/store/useProjectStore";
import { useUiStore } from "@/store/useUiStore";
import { GitBranch, Bookmark, Send, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectSpotlightCardProps {
  project: Project;
  onExpressInterest?: (project: Project) => void;
  className?: string;
}

export function ProjectSpotlightCard({
  project,
  onExpressInterest,
  className,
}: ProjectSpotlightCardProps) {
  const { bookmarkedProjectIds, toggleBookmarkProject } = useProjectStore();
  const { addToast } = useUiStore();

  const isBookmarked = bookmarkedProjectIds.includes(project.id);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmarkProject(project.id);
    addToast({
      title: isBookmarked ? "Removed from Bookmarks" : "Saved to Queue",
      description: isBookmarked
        ? `Removed "${project.title}" from saved opportunities.`
        : `Queued "${project.title}" for later review.`,
      type: "info",
    });
  };

  const stageVariant = {
    IDEATION: "surface",
    PROTOTYPE: "warning",
    MVP: "brand",
    PRODUCTION: "success",
  }[project.stage] as "surface" | "warning" | "brand" | "success";

  return (
    <SpotlightCard
      className={cn(
        "space-y-4 shadow-card hover:border-devora-border-strong group",
        className
      )}
    >
      {/* Header: Stage + Roles Count */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={stageVariant} className="text-[10px] font-mono uppercase">
              Stage: {project.stage}
            </Badge>
            <span className="text-xs font-mono text-devora-muted">
              by {project.ownerName}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-devora-ink mt-1 tracking-tight group-hover:text-devora-brand transition-colors">
            {project.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-xs font-mono">
            {project.roles.length} Open {project.roles.length === 1 ? "Role" : "Roles"}
          </Badge>

          {/* Magnetic Bookmark Action */}
          <MagnetButton
            onClick={handleBookmarkClick}
            className={cn(
              "w-8 h-8 rounded-button flex items-center justify-center border transition-colors",
              isBookmarked
                ? "bg-devora-brand text-white border-devora-brand"
                : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink hover:border-devora-border-strong"
            )}
            title={isBookmarked ? "Remove from bookmarks" : "Bookmark opportunity"}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </MagnetButton>
        </div>
      </div>

      {/* Elevator Pitch */}
      <p className="text-sm text-devora-muted leading-relaxed line-clamp-3">
        {project.description}
      </p>

      {/* Repository / Spec Evidence */}
      {project.repoUrl && (
        <div className="flex items-center gap-1.5 text-xs font-mono text-devora-muted">
          <GitBranch className="w-3.5 h-3.5 text-devora-muted shrink-0" />
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:text-devora-brand hover:underline"
          >
            {project.repoUrl}
          </a>
        </div>
      )}

      {/* Needed Roles Roster */}
      <div className="space-y-2 pt-2 border-t border-devora-border">
        <span className="text-[11px] font-mono uppercase font-semibold text-devora-muted tracking-wide flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-devora-muted" />
          <span>Needed Roles & Stack:</span>
        </span>

        <div className="space-y-1.5">
          {project.roles.map((role) => (
            <div
              key={role.id}
              className="p-2.5 rounded-button bg-devora-surface-strong/80 border border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-devora-ink font-mono">{role.roleTitle}</span>
                <span className="text-devora-brand font-mono text-[11px] font-medium">
                  {role.hoursPerWeek}h/wk
                </span>
                {role.responsibilityLevel && (
                  <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                    {role.responsibilityLevel}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {role.requiredSkills.map((s) => (
                  <Badge key={s} variant="brand" className="text-[10px] py-0 px-1.5 font-mono">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Tags & Express Interest CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-devora-border text-xs">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onExpressInterest && (
            <MagnetButton
              onClick={() => onExpressInterest(project)}
              className="gap-1.5 text-xs h-8 px-3 bg-devora-brand text-white hover:bg-devora-brand-dark shadow-subtle"
            >
              <Send className="w-3 h-3" />
              <span>Express Interest</span>
            </MagnetButton>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
