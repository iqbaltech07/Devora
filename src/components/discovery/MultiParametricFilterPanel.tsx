"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Filter, Check, Clock, Layers, Target } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { ProjectStage } from "@/store/types";
import { cn } from "@/lib/utils";

const TECH_STACK_OPTIONS = [
  "TypeScript",
  "Next.js",
  "React 19",
  "Node.js",
  "PostgreSQL",
  "Prisma",
  "Redis",
  "Docker",
  "Go",
  "Python",
  "Tailwind CSS",
  "LLM APIs",
];

const STAGE_OPTIONS: Array<{ id: ProjectStage | "ALL"; label: string }> = [
  { id: "ALL", label: "All Stages" },
  { id: "IDEATION", label: "Ideation" },
  { id: "PROTOTYPE", label: "Prototype" },
  { id: "MVP", label: "Early MVP" },
  { id: "PRODUCTION", label: "Production" },
];

const COMMITMENT_TIERS = [
  { hours: null, label: "Any Bandwidth" },
  { hours: 5, label: "5+ hrs/wk (Light)" },
  { hours: 10, label: "10+ hrs/wk (Serious)" },
  { hours: 20, label: "20+ hrs/wk (Substantial)" },
];

const GOAL_OPTIONS = [
  "All Goals",
  "Build SaaS MVP",
  "Technical Co-Founder Search",
  "Open Source Utility",
  "Hackathon & Weekend Sprints",
];

export function MultiParametricFilterPanel() {
  const { filters, setFilters, toggleSkillFilter, clearFilters } = useProjectStore();

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.stage ? 1 : 0) +
    filters.selectedSkills.length +
    (filters.minHoursPerWeek !== null ? 1 : 0) +
    (filters.selectedGoal ? 1 : 0);

  return (
    <Card elevated className="p-5 space-y-5 bg-devora-surface border-devora-border">
      {/* Header with Active Filters Counter & Reset */}
      <div className="flex items-center justify-between border-b border-devora-border pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-devora-brand" />
          <span className="text-sm font-semibold text-devora-ink tracking-tight">
            Filters & Parameters
          </span>
          {activeFilterCount > 0 && (
            <Badge variant="brand" className="text-[10px] py-0 px-1.5 font-mono">
              {activeFilterCount} active
            </Badge>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs font-mono text-devora-muted hover:text-devora-danger transition-colors select-none"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono text-devora-muted">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-devora-muted pointer-events-none" />
          <Input
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            placeholder="Search projects, roles, stack..."
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Development Stage Filter */}
      <div className="space-y-2">
        <span className="block text-xs font-mono text-devora-muted uppercase font-medium">
          Project Stage
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {STAGE_OPTIONS.map((st) => {
            const isSelected =
              st.id === "ALL" ? filters.stage === null : filters.stage === st.id;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  setFilters({ stage: st.id === "ALL" ? null : (st.id as ProjectStage) })
                }
                className={cn(
                  "p-2 rounded-button border text-xs font-mono text-left transition-colors select-none",
                  isSelected
                    ? "bg-devora-brand text-white border-devora-brand font-medium shadow-subtle"
                    : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink"
                )}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tech Stack Chips Filter */}
      <div className="space-y-2 pt-2 border-t border-devora-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-devora-muted uppercase font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-devora-muted" />
            <span>Tech Stack</span>
          </span>
          {filters.selectedSkills.length > 0 && (
            <span className="text-[10px] font-mono text-devora-brand font-medium">
              {filters.selectedSkills.length} selected
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {TECH_STACK_OPTIONS.map((skill) => {
            const isSelected = filters.selectedSkills.includes(skill);

            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkillFilter(skill)}
                className={cn(
                  "px-2.5 py-1 rounded-pill text-xs font-mono border transition-colors select-none flex items-center gap-1",
                  isSelected
                    ? "bg-devora-brand text-white border-devora-brand font-semibold shadow-subtle"
                    : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink hover:border-devora-border-strong"
                )}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                <span>{skill}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Commitment Bandwidth */}
      <div className="space-y-2 pt-2 border-t border-devora-border">
        <span className="text-xs font-mono text-devora-muted uppercase font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-devora-muted" />
          <span>Minimum Hours / Week</span>
        </span>

        <div className="grid grid-cols-2 gap-1.5">
          {COMMITMENT_TIERS.map((tier, idx) => {
            const isSelected = filters.minHoursPerWeek === tier.hours;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setFilters({ minHoursPerWeek: tier.hours })}
                className={cn(
                  "p-2 rounded-button border text-xs font-mono text-left transition-colors select-none",
                  isSelected
                    ? "bg-devora-brand text-white border-devora-brand font-medium"
                    : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink"
                )}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collaboration Goal / Intent */}
      <div className="space-y-2 pt-2 border-t border-devora-border">
        <span className="text-xs font-mono text-devora-muted uppercase font-medium flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-devora-muted" />
          <span>Project Intent</span>
        </span>

        <select
          value={filters.selectedGoal || "All Goals"}
          onChange={(e) =>
            setFilters({
              selectedGoal: e.target.value === "All Goals" ? null : e.target.value,
            })
          }
          className="w-full h-9 rounded-input border border-devora-border bg-devora-background px-3 text-xs text-devora-ink focus-visible:outline-none focus-visible:border-devora-brand"
        >
          {GOAL_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
