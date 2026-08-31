"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { SkillItem } from "@/store/types";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<SkillItem["category"] | "All"> = [
  "All",
  "UI/UX",
  "Frontend",
  "Backend",
  "Database",
  "DevOps & Cloud",
  "AI & Agents",
];

const SUGGESTIONS = [
  { name: "Figma", category: "UI/UX" as const },
  { name: "Design Systems", category: "UI/UX" as const },
  { name: "Rust", category: "Backend" as const },
  { name: "GraphQL", category: "Backend" as const },
  { name: "Kubernetes", category: "DevOps & Cloud" as const },
  { name: "LangChain", category: "AI & Agents" as const },
  { name: "Tailwind CSS", category: "Frontend" as const },
  { name: "ClickHouse", category: "Database" as const },
];

export function SkillMatrixEditor() {
  const { currentUser, addSkillItem, removeSkillItem, updateSkillProficiency } =
    useUserStore();

  const [activeCategory, setActiveCategory] = useState<SkillItem["category"] | "All">("All");
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillItem["category"]>("Frontend");
  const [selectedProficiency, setSelectedProficiency] = useState<SkillItem["proficiency"]>("Senior");
  const [isAdding, setIsAdding] = useState(false);

  const matrix = currentUser.skillMatrix || [];

  const filteredSkills =
    activeCategory === "All"
      ? matrix
      : matrix.filter((s) => s.category === activeCategory);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addSkillItem(newSkillName.trim(), selectedCategory, selectedProficiency);
    setNewSkillName("");
    setIsAdding(false);
  };

  const handleCycleProficiency = (id: string, current: SkillItem["proficiency"]) => {
    const cycleMap: Record<SkillItem["proficiency"], SkillItem["proficiency"]> = {
      Junior: "Mid",
      Mid: "Senior",
      Senior: "Junior",
    };
    updateSkillProficiency(id, cycleMap[current]);
  };

  const seniorCount = matrix.filter((s) => s.proficiency === "Senior").length;
  const midCount = matrix.filter((s) => s.proficiency === "Mid").length;
  const juniorCount = matrix.filter((s) => s.proficiency === "Junior").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-devora-ink tracking-tight">
              Tech Stack & Skill Matrix
            </h2>
            <span className="text-xs font-mono text-devora-muted font-medium bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
              {matrix.length} skills total
            </span>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Click proficiency tags to cycle Junior / Mid / Senior. Categorized by system domain.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="gap-1.5 self-start sm:self-auto h-9 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Skill</span>
        </Button>
      </div>

      {/* Proficiency Distribution Overview */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-devora-surface-strong rounded-card border border-devora-border text-center">
        <div>
          <span className="block text-xs font-mono text-devora-muted uppercase font-medium">
            Senior / Core
          </span>
          <span className="text-base font-semibold text-devora-ink font-mono">
            {seniorCount}
          </span>
        </div>
        <div>
          <span className="block text-xs font-mono text-devora-muted uppercase font-medium">
            Mid / Proficient
          </span>
          <span className="text-base font-semibold text-devora-ink font-mono">
            {midCount}
          </span>
        </div>
        <div>
          <span className="block text-xs font-mono text-devora-muted uppercase font-medium">
            Junior / Emerging
          </span>
          <span className="text-base font-semibold text-devora-ink font-mono">
            {juniorCount}
          </span>
        </div>
      </div>

      {/* Interactive Add Skill Panel */}
      {isAdding && (
        <Card elevated className="p-5 border-devora-border-strong space-y-4 bg-devora-surface">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-devora-ink">
              Add New Technical Capability
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="h-7 w-7 p-0"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Skill Name */}
              <div className="sm:col-span-1 space-y-1">
                <label className="block text-xs font-mono text-devora-muted">Skill Name</label>
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Bun, GraphQL"
                  className="h-9 text-xs"
                  autoFocus
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as SkillItem["category"])}
                  className="w-full h-9 rounded-input border border-devora-border bg-devora-background px-3 text-xs text-devora-ink focus-visible:outline-none focus-visible:border-devora-brand"
                >
                  <option value="UI/UX">UI/UX & Product Design</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="AI & Agents">AI & Agents</option>
                </select>
              </div>

              {/* Proficiency Select */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">Proficiency</label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value as SkillItem["proficiency"])}
                  className="w-full h-9 rounded-input border border-devora-border bg-devora-background px-3 text-xs text-devora-ink focus-visible:outline-none focus-visible:border-devora-brand"
                >
                  <option value="Senior">Senior / Deep Expertise</option>
                  <option value="Mid">Mid / Proficient</option>
                  <option value="Junior">Junior / Emerging</option>
                </select>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1.5 pt-1">
              <span className="block text-[11px] font-mono text-devora-muted">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => {
                      setNewSkillName(sug.name);
                      setSelectedCategory(sug.category);
                    }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-button bg-devora-surface-strong border border-devora-border text-devora-ink hover:border-devora-brand/40 transition-colors"
                  >
                    + {sug.name}
                  </button>
                ))}
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
                Save to Matrix
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((cat) => {
          const count =
            cat === "All"
              ? matrix.length
              : matrix.filter((s) => s.category === cat).length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-button border transition-colors select-none",
                isActive
                  ? "bg-devora-brand text-white border-devora-brand font-medium"
                  : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink hover:border-devora-border-strong"
              )}
            >
              <span>{cat}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-pill font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-devora-surface-strong text-devora-muted"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skill Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSkills.map((skill) => {
          const proficiencyColor = {
            Senior: "bg-devora-brand-soft text-devora-brand-dark border-devora-brand/30",
            Mid: "bg-amber-50 text-devora-warning border-amber-200",
            Junior: "bg-devora-surface-strong text-devora-muted border-devora-border",
          }[skill.proficiency];

          return (
            <div
              key={skill.id}
              className="p-3.5 bg-devora-surface border border-devora-border rounded-card flex items-center justify-between gap-2 shadow-subtle hover:border-devora-border-strong transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-devora-ink truncate">
                    {skill.name}
                  </span>
                  {skill.isPrimary && (
                    <span className="w-1.5 h-1.5 rounded-full bg-devora-brand" title="Primary Capability" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-devora-muted block">
                  {skill.category}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Clickable Cycling Proficiency Pill */}
                <button
                  type="button"
                  onClick={() => handleCycleProficiency(skill.id, skill.proficiency)}
                  title="Click to cycle proficiency (Junior -> Mid -> Senior)"
                  className={cn(
                    "px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-pill border transition-colors select-none",
                    proficiencyColor
                  )}
                >
                  {skill.proficiency}
                </button>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeSkillItem(skill.id)}
                  title="Remove from matrix"
                  className="w-6 h-6 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-danger hover:bg-devora-surface-strong transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
