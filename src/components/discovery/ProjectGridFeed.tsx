"use client";

import * as React from "react";
import { useState } from "react";
import { ProjectSpotlightCard } from "./ProjectSpotlightCard";
import { ExpressInterestModal } from "./ExpressInterestModal";
import { BookmarkQueueTray } from "./BookmarkQueueTray";
import { Project } from "@/store/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectGridFeedProps {
  projects: Project[];
  totalCount: number;
  onClearFilters: () => void;
}

export function ProjectGridFeed({
  projects,
  totalCount,
  onClearFilters,
}: ProjectGridFeedProps) {
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [interestTargetProject, setInterestTargetProject] = useState<Project | null>(null);

  const handleOpenInterestModal = (project: Project) => {
    setInterestTargetProject(project);
  };

  const handleCloseInterestModal = () => {
    setInterestTargetProject(null);
  };

  return (
    <div className="space-y-5">
      {/* Saved Opportunities Bookmark Tray */}
      <BookmarkQueueTray onExpressInterest={handleOpenInterestModal} />

      {/* Control Bar: Count & View Switcher */}
      <div className="flex items-center justify-between text-xs font-mono text-devora-muted px-1">
        <span>
          Showing {projects.length} of {totalCount} opportunities
        </span>

        <div className="flex items-center gap-2">
          {projects.length !== totalCount && (
            <button
              type="button"
              onClick={onClearFilters}
              className="hover:text-devora-brand transition-colors mr-2"
            >
              Clear filters
            </button>
          )}

          <div className="flex items-center gap-1 border border-devora-border rounded-button p-0.5 bg-devora-surface">
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={cn(
                "p-1 rounded-subtle transition-colors",
                viewMode === "GRID"
                  ? "bg-devora-ink text-devora-background"
                  : "text-devora-muted hover:text-devora-ink"
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={cn(
                "p-1 rounded-subtle transition-colors",
                viewMode === "LIST"
                  ? "bg-devora-ink text-devora-background"
                  : "text-devora-muted hover:text-devora-ink"
              )}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty Zero-State */}
      {projects.length === 0 ? (
        <Card className="p-8 text-center bg-devora-surface space-y-3 border-devora-border">
          <p className="text-sm font-semibold text-devora-ink">
            No Matching Project Opportunities
          </p>
          <p className="text-xs text-devora-muted max-w-sm mx-auto">
            Try clearing some filter parameters or broaden your tech stack selection.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={onClearFilters}
            className="gap-1.5 text-xs mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </Button>
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === "GRID"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : "space-y-4"
          )}
        >
          {projects.map((project) => (
            <ProjectSpotlightCard
              key={project.id}
              project={project}
              onExpressInterest={handleOpenInterestModal}
            />
          ))}
        </div>
      )}

      {/* Express Interest Modal */}
      <ExpressInterestModal
        project={interestTargetProject}
        isOpen={interestTargetProject !== null}
        onClose={handleCloseInterestModal}
      />
    </div>
  );
}
