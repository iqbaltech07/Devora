"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Shield, AlertCircle, Plus, Trash2, CheckCircle2, Flame } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { ProjectRole } from "@/store/types";
import { cn } from "@/lib/utils";

const RESPONSIBILITY_LEVELS: Array<{
  id: NonNullable<ProjectRole["responsibilityLevel"]>;
  label: string;
  desc: string;
}> = [
  { id: "LEAD", label: "Lead / Co-Founder", desc: "Sets architecture, drives sprint cadence, high ownership." },
  { id: "CORE_BUILDER", label: "Core Builder", desc: "Implements major features, frequent commits and PRs." },
  { id: "CONTRIBUTOR", label: "Contributor", desc: "Scoped modules, bugfixes, discrete milestone tasks." },
  { id: "ADVISOR", label: "Technical Advisor", desc: "High-level architecture review and technical sparring." },
];

const URGENCIES: Array<{
  id: NonNullable<ProjectRole["urgency"]>;
  label: string;
  color: string;
}> = [
  { id: "IMMEDIATE", label: "Immediate Need", color: "bg-devora-brand-soft text-devora-brand-dark border-devora-brand/30" },
  { id: "NEXT_SPRINT", label: "Next Milestone", color: "bg-amber-50 text-devora-warning border-amber-200" },
  { id: "FLEXIBLE", label: "Flexible Timeline", color: "bg-devora-surface-strong text-devora-muted border-devora-border" },
];

const HOUR_PRESETS = [5, 8, 12, 16, 25];

export function RoleCommitmentConfig() {
  const {
    draftProject,
    addRoleToDraft,
    removeRoleFromDraft,
    updateRoleCommitment,
    updateRoleResponsibility,
    updateRoleUrgency,
  } = useProjectStore();

  const roles = draftProject.roles || [];

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newHours, setNewHours] = useState(8);
  const [newResp, setNewResp] = useState<ProjectRole["responsibilityLevel"]>("CORE_BUILDER");
  const [newUrgency, setNewUrgency] = useState<ProjectRole["urgency"]>("IMMEDIATE");
  const [newDesc, setNewDesc] = useState("");

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addRoleToDraft({
      roleTitle: newTitle.trim(),
      hoursPerWeek: newHours,
      responsibilityLevel: newResp,
      urgency: newUrgency,
      requiredSkills: ["TypeScript"],
      description: newDesc.trim() || `Core contributor for ${newTitle.trim()}.`,
    });

    setNewTitle("");
    setNewHours(8);
    setNewDesc("");
    setIsAdding(false);
  };

  const totalWeeklyHours = roles.reduce((acc, r) => acc + (r.hoursPerWeek || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-devora-ink tracking-tight">
              Role Requirements & Commitment Level
            </h2>
            <span className="text-xs font-mono text-devora-muted font-medium bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
              {roles.length} roles · {totalWeeklyHours} hrs/wk total
            </span>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Configure expected weekly commitment and ownership tiers to filter compatible developers.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="gap-1.5 self-start sm:self-auto h-9 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Role</span>
        </Button>
      </div>

      {/* Aggregated Roster Capacity Banner */}
      <div className="p-4 bg-devora-surface-strong rounded-card border border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-button bg-devora-surface border border-devora-border flex items-center justify-center text-devora-brand">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-devora-ink">
              Total Roster Weekly Bandwidth: {totalWeeklyHours} hrs/week
            </span>
            <p className="text-xs text-devora-muted">
              Matching engine pairs profiles whose availability aligns with these individual role hours.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="font-mono text-xs self-start sm:self-auto">
          {roles.length} Open Slots
        </Badge>
      </div>

      {/* Add Role Form Card */}
      {isAdding && (
        <Card elevated className="p-5 border-devora-border-strong bg-devora-surface space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-devora-ink">
              Add New Project Role with Commitment Target
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

          <form onSubmit={handleAddRole} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Role Title (e.g. AI Agent Architect, Fullstack Lead)
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Engineer"
                  className="h-9 text-xs"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Weekly Commitment: {newHours} hrs/week
                </label>
                <input
                  type="range"
                  min={4}
                  max={35}
                  step={1}
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value))}
                  className="w-full h-2 bg-devora-surface-strong rounded-pill appearance-none cursor-pointer accent-devora-brand mt-3"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-devora-muted">
                Role Responsibilities & Expectations
              </label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Key deliverables and subsystem ownership..."
                className="h-9 text-xs"
              />
            </div>

            {/* Responsibility & Urgency Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Responsibility Tier
                </label>
                <select
                  value={newResp}
                  onChange={(e) => setNewResp(e.target.value as ProjectRole["responsibilityLevel"])}
                  className="w-full h-9 rounded-input border border-devora-border bg-devora-background px-3 text-xs text-devora-ink focus-visible:outline-none focus-visible:border-devora-brand"
                >
                  {RESPONSIBILITY_LEVELS.map((rl) => (
                    <option key={rl.id} value={rl.id}>
                      {rl.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Recruitment Urgency
                </label>
                <select
                  value={newUrgency}
                  onChange={(e) => setNewUrgency(e.target.value as ProjectRole["urgency"])}
                  className="w-full h-9 rounded-input border border-devora-border bg-devora-background px-3 text-xs text-devora-ink focus-visible:outline-none focus-visible:border-devora-brand"
                >
                  {URGENCIES.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
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
                Add Role to Roster
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Role Cards List with Commitment Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const currentResp = role.responsibilityLevel || "CORE_BUILDER";
          const currentUrgency = role.urgency || "IMMEDIATE";

          return (
            <Card key={role.id} elevated className="p-5 bg-devora-surface space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-devora-ink">
                      {role.roleTitle}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono font-medium px-2 py-0.5 rounded-pill border",
                        URGENCIES.find((u) => u.id === currentUrgency)?.color
                      )}
                    >
                      {URGENCIES.find((u) => u.id === currentUrgency)?.label}
                    </span>
                  </div>
                  <p className="text-xs text-devora-muted leading-relaxed">
                    {role.description || "Core contributor for this technical domain."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeRoleFromDraft(role.id)}
                  className="w-7 h-7 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-danger hover:bg-devora-surface-strong transition-colors shrink-0"
                  title="Remove role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Commitment Hours Slider Control */}
              <div className="space-y-2 pt-2 border-t border-devora-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-devora-muted flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-devora-brand" />
                    Target Commitment:
                  </span>
                  <span className="font-mono font-bold text-devora-brand">
                    {role.hoursPerWeek} <span className="font-normal text-devora-muted">hrs/wk</span>
                  </span>
                </div>

                <input
                  type="range"
                  min={4}
                  max={35}
                  step={1}
                  value={role.hoursPerWeek}
                  onChange={(e) => updateRoleCommitment(role.id, Number(e.target.value))}
                  className="w-full h-2 bg-devora-surface-strong rounded-pill appearance-none cursor-pointer accent-devora-brand"
                />

                {/* Preset Hour Buttons */}
                <div className="flex items-center gap-1 pt-1">
                  <span className="text-[10px] font-mono text-devora-muted mr-1">Presets:</span>
                  {HOUR_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateRoleCommitment(role.id, p)}
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded-button border transition-colors select-none",
                        role.hoursPerWeek === p
                          ? "bg-devora-brand text-white border-devora-brand font-medium"
                          : "bg-devora-surface-strong text-devora-ink border-devora-border hover:border-devora-brand/30"
                      )}
                    >
                      {p}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsibility Tier Selector */}
              <div className="space-y-1.5 pt-2 border-t border-devora-border">
                <span className="block text-xs font-mono text-devora-muted">
                  Responsibility Level:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {RESPONSIBILITY_LEVELS.map((rl) => {
                    const isSelected = currentResp === rl.id;
                    return (
                      <button
                        key={rl.id}
                        type="button"
                        onClick={() => updateRoleResponsibility(role.id, rl.id)}
                        className={cn(
                          "text-left p-2 rounded-button border text-xs transition-colors select-none",
                          isSelected
                            ? "bg-devora-brand-soft border-devora-brand text-devora-brand-dark font-medium"
                            : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink"
                        )}
                      >
                        <span className="block text-[11px] font-semibold">{rl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Urgency Switcher */}
              <div className="space-y-1.5 pt-2 border-t border-devora-border">
                <div className="flex items-center justify-between text-xs font-mono text-devora-muted">
                  <span>Recruitment Priority:</span>
                  <div className="flex items-center gap-1">
                    {URGENCIES.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => updateRoleUrgency(role.id, u.id)}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-button border transition-colors select-none",
                          currentUrgency === u.id
                            ? "bg-devora-ink text-devora-background border-devora-ink font-medium"
                            : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink"
                        )}
                      >
                        {u.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
