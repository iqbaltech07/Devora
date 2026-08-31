"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Layers, Clock, Check, Trash2 } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { ProjectRole } from "@/store/types";
import { cn } from "@/lib/utils";

const STACK_PRESETS = {
  "UI/UX": ["Figma", "Design Systems", "Tailwind CSS", "Prototyping", "Wireframing", "Framer"],
  Frontend: ["React 19", "Next.js 16", "TypeScript", "Tailwind CSS", "Zustand"],
  Backend: ["Node.js", "PostgreSQL", "Prisma ORM", "Redis", "Docker", "Go"],
  "AI & Agents": ["LLM Workflows", "Vector DB", "LangChain", "Python", "RAG Pipeline"],
  "DevOps / Cloud": ["Docker", "Cloudflare Workers", "Kubernetes", "GitHub Actions"],
};

export function RequiredStackMapper() {
  const {
    draftProject,
    addRoleToDraft,
    removeRoleFromDraft,
    addStackToDraftRole,
    removeStackFromDraftRole,
  } = useProjectStore();

  const roles = draftProject.roles || [];

  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleHours, setNewRoleHours] = useState(8);
  const [newRoleStackInput, setNewRoleStackInput] = useState("");
  const [newRoleStacks, setNewRoleStacks] = useState<string[]>(["TypeScript", "Node.js"]);

  // Per-role inline stack inputs
  const [roleInputs, setRoleInputs] = useState<Record<string, string>>({});

  const handleAddNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;

    addRoleToDraft({
      roleTitle: newRoleTitle.trim(),
      hoursPerWeek: newRoleHours,
      requiredSkills: newRoleStacks,
      description: `Core contributor for ${newRoleTitle.trim()} responsible for architecture & execution.`,
    });

    setNewRoleTitle("");
    setNewRoleHours(8);
    setNewRoleStacks(["TypeScript"]);
    setIsAddingRole(false);
  };

  const handleAddInlineStack = (roleId: string) => {
    const text = (roleInputs[roleId] || "").trim();
    if (!text) return;
    addStackToDraftRole(roleId, text);
    setRoleInputs({ ...roleInputs, [roleId]: "" });
  };

  // Collect all unique stacks across all roles
  const allUniqueStacks = Array.from(
    new Set(roles.flatMap((r) => r.requiredSkills))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-devora-ink tracking-tight">
              Required Tech Stack Mapping per Role
            </h2>
            <span className="text-xs font-mono text-devora-muted font-medium bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
              {roles.length} roles · {allUniqueStacks.length} unique stacks
            </span>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Define open engineering roles and map mandatory frameworks. The match engine evaluates candidates against these stacks.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddingRole(!isAddingRole)}
          className="gap-1.5 self-start sm:self-auto h-9 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Open Role</span>
        </Button>
      </div>

      {/* Unique Project Stack Blueprint Banner */}
      {allUniqueStacks.length > 0 && (
        <div className="p-3.5 bg-devora-surface-strong rounded-card border border-devora-border space-y-1.5">
          <span className="block text-xs font-mono text-devora-muted uppercase font-medium">
            Aggregated Tech Stack Roster:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {allUniqueStacks.map((s) => (
              <Badge key={s} variant="outline" className="font-mono text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add New Role Form Card */}
      {isAddingRole && (
        <Card elevated className="p-5 border-devora-border-strong bg-devora-surface space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-devora-ink">
              Define New Project Role & Stack Requirements
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingRole(false)}
              className="h-7 w-7 p-0"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <form onSubmit={handleAddNewRole} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Role Title (e.g. AI Engineer, Frontend Lead)
                </label>
                <Input
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Backend Architect"
                  className="h-9 text-xs"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Expected Commitment: {newRoleHours} hrs/week
                </label>
                <input
                  type="range"
                  min={4}
                  max={35}
                  step={1}
                  value={newRoleHours}
                  onChange={(e) => setNewRoleHours(Number(e.target.value))}
                  className="w-full h-2 bg-devora-surface-strong rounded-pill appearance-none cursor-pointer accent-devora-brand mt-3"
                />
              </div>
            </div>

            {/* Quick Stack Adder for New Role */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-devora-muted">
                Initial Required Tech Stack:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={newRoleStackInput}
                  onChange={(e) => setNewRoleStackInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const t = newRoleStackInput.trim();
                      if (t && !newRoleStacks.includes(t)) {
                        setNewRoleStacks([...newRoleStacks, t]);
                        setNewRoleStackInput("");
                      }
                    }
                  }}
                  placeholder="Type technology & press Enter (e.g. PostgreSQL)"
                  className="h-9 text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const t = newRoleStackInput.trim();
                    if (t && !newRoleStacks.includes(t)) {
                      setNewRoleStacks([...newRoleStacks, t]);
                      setNewRoleStackInput("");
                    }
                  }}
                  className="h-9 text-xs"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {newRoleStacks.map((st) => (
                  <span
                    key={st}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-devora-surface-strong border border-devora-border text-xs font-mono text-devora-ink"
                  >
                    <span>{st}</span>
                    <button
                      type="button"
                      onClick={() => setNewRoleStacks(newRoleStacks.filter((s) => s !== st))}
                      className="text-devora-muted hover:text-devora-danger text-[11px]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-devora-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingRole(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                Create Role
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Role Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role.id} elevated className="p-5 bg-devora-surface space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-devora-muted uppercase font-medium">
                  Open Role
                </span>
                <h3 className="text-base font-semibold text-devora-ink mt-0.5">
                  {role.roleTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-mono text-devora-muted bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
                  <Clock className="w-3 h-3 text-devora-brand" />
                  <span>{role.hoursPerWeek} hrs/wk</span>
                </span>

                <button
                  type="button"
                  onClick={() => removeRoleFromDraft(role.id)}
                  className="w-7 h-7 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-danger hover:bg-devora-surface-strong transition-colors"
                  title="Delete role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mapped Tech Stack Tags */}
            <div className="space-y-2 pt-2 border-t border-devora-border">
              <span className="block text-xs font-mono text-devora-muted">
                Required Frameworks & Technologies:
              </span>

              <div className="flex flex-wrap gap-1.5">
                {role.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-devora-brand-soft text-devora-brand-dark border border-devora-brand/20 text-xs font-mono font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeStackFromDraftRole(role.id, skill)}
                      className="text-devora-brand-dark/70 hover:text-devora-danger text-[11px] font-bold"
                      title="Remove technology"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Inline Add Stack Input */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={roleInputs[role.id] || ""}
                  onChange={(e) =>
                    setRoleInputs({ ...roleInputs, [role.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInlineStack(role.id);
                    }
                  }}
                  placeholder="Add required stack (e.g. Redis, Docker)..."
                  className="h-8 text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddInlineStack(role.id)}
                  className="h-8 text-xs px-3"
                >
                  + Add
                </Button>
              </div>

              {/* Quick Preset Injectors */}
              <div className="pt-2 space-y-1">
                <span className="block text-[10px] font-mono text-devora-muted">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(STACK_PRESETS).map(([domain, presets]) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => {
                        presets.forEach((p) => addStackToDraftRole(role.id, p));
                      }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-button bg-devora-surface-strong border border-devora-border text-devora-muted hover:text-devora-ink hover:border-devora-brand/30 transition-colors"
                    >
                      + {domain}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
