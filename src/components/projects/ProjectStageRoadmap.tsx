"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock, Calendar, Plus, Trash2, ArrowRight } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { ProjectStage, ProjectMilestone } from "@/store/types";
import { cn } from "@/lib/utils";

const STAGES: Array<{ id: ProjectStage; label: string; desc: string }> = [
  { id: "IDEATION", label: "Ideation", desc: "Architecture brainstorming, concept specs, and PRD drafting." },
  { id: "PROTOTYPE", label: "Prototype", desc: "First runnable code loop validating technical feasibility." },
  { id: "MVP", label: "Early MVP", desc: "Core feature loop complete, seeking collaborative builders." },
  { id: "PRODUCTION", label: "Production", desc: "Live in production, optimizing infrastructure and scaling." },
];

export function ProjectStageRoadmap() {
  const {
    draftProject,
    updateDraft,
    addMilestoneToDraft,
    removeMilestoneFromDraft,
    cycleMilestoneStatus,
  } = useProjectStore();

  const currentStage = (draftProject.stage as ProjectStage) || "MVP";
  const roadmap = draftProject.roadmap || [];

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newQuarter, setNewQuarter] = useState("Q4 2026");

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addMilestoneToDraft({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      targetQuarter: newQuarter.trim() || "Q4 2026",
      status: "UPCOMING",
    });

    setNewTitle("");
    setNewDesc("");
    setIsAdding(false);
  };

  const completedCount = roadmap.filter((m) => m.status === "COMPLETED").length;
  const inProgressCount = roadmap.filter((m) => m.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-devora-ink tracking-tight">
              Project Stage & Milestone Roadmap
            </h2>
            <span className="text-xs font-mono text-devora-muted font-medium bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
              {roadmap.length} milestones ({completedCount} completed)
            </span>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Transparent milestones give potential developer partners confidence in project direction and pacing
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="gap-1.5 self-start sm:self-auto h-9 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Milestone</span>
        </Button>
      </div>

      {/* 4-Stage Continuum Stepper */}
      <div className="space-y-2">
        <label className="block text-xs font-mono text-devora-muted uppercase font-medium">
          Current Project Lifecycle Stage:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES.map((s, idx) => {
            const isSelected = currentStage === s.id;
            const isPassed =
              STAGES.findIndex((st) => st.id === currentStage) > idx;

            return (
              <div
                key={s.id}
                onClick={() => updateDraft({ stage: s.id })}
                className={cn(
                  "p-4 rounded-card border cursor-pointer transition-all duration-150 flex flex-col justify-between space-y-2 select-none",
                  isSelected
                    ? "bg-devora-surface border-devora-brand shadow-card"
                    : isPassed
                    ? "bg-devora-surface-strong/80 border-devora-border"
                    : "bg-devora-background border-devora-border hover:border-devora-border-strong"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-devora-ink">
                      0{idx + 1}. {s.label}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-devora-brand" />
                    )}
                  </div>
                  <p className="text-xs text-devora-muted leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <Badge
                  variant={isSelected ? "brand" : "surface"}
                  className="self-start text-[10px]"
                >
                  {isSelected ? "Current Stage" : isPassed ? "Past Phase" : "Upcoming"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Milestone Quick Form */}
      {isAdding && (
        <Card elevated className="p-5 border-devora-border-strong bg-devora-surface space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-devora-ink">
              Define Next Roadmap Milestone
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="h-7 w-7 p-0"
            >
              ×
            </Button>
          </div>

          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Milestone Deliverable
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Worker Pool & Redis Queue"
                  className="h-9 text-xs"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Target Quarter / Timeline
                </label>
                <Input
                  value={newQuarter}
                  onChange={(e) => setNewQuarter(e.target.value)}
                  placeholder="e.g. Q4 2026"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-devora-muted">
                Deliverable Scope & Success Metric (Optional)
              </label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Briefly define what makes this milestone complete..."
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-devora-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Add to Roadmap
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Roadmap Timeline Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-devora-muted font-medium">
            Milestones Timeline (Click badge to cycle status):
          </span>
          <span className="text-xs font-mono text-devora-muted">
            {completedCount} Done · {inProgressCount} In Progress · {roadmap.length - completedCount - inProgressCount} Queued
          </span>
        </div>

        <div className="space-y-2.5">
          {roadmap.map((milestone, idx) => {
            const statusConfig = {
              COMPLETED: {
                label: "Completed",
                badgeClass: "bg-devora-success-soft text-devora-success border-devora-success/30",
                icon: CheckCircle2,
              },
              IN_PROGRESS: {
                label: "In Progress",
                badgeClass: "bg-devora-brand-soft text-devora-brand-dark border-devora-brand/30",
                icon: Clock,
              },
              UPCOMING: {
                label: "Upcoming",
                badgeClass: "bg-devora-surface-strong text-devora-muted border-devora-border",
                icon: Calendar,
              },
            }[milestone.status];

            const Icon = statusConfig.icon;

            return (
              <div
                key={milestone.id}
                className="p-4 bg-devora-surface border border-devora-border rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle hover:border-devora-border-strong transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center font-mono text-xs font-semibold text-devora-muted shrink-0 mt-0.5">
                    0{idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-devora-ink">
                        {milestone.title}
                      </span>
                      {milestone.targetQuarter && (
                        <span className="text-[10px] font-mono text-devora-muted bg-devora-surface-strong px-1.5 py-0.2 rounded-button border border-devora-border">
                          {milestone.targetQuarter}
                        </span>
                      )}
                    </div>
                    {milestone.description && (
                      <p className="text-xs text-devora-muted leading-relaxed">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Clickable Status Badge */}
                  <button
                    type="button"
                    onClick={() => cycleMilestoneStatus(milestone.id)}
                    title="Click to cycle status (Upcoming -> In Progress -> Completed)"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-mono border transition-colors select-none",
                      statusConfig.badgeClass
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{statusConfig.label}</span>
                  </button>

                  {/* Delete Milestone Button */}
                  <button
                    type="button"
                    onClick={() => removeMilestoneFromDraft(milestone.id)}
                    className="w-6 h-6 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-danger hover:bg-devora-surface-strong transition-colors"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
