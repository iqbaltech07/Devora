"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Check, GitBranch, Sliders, Layers, MapPin, CheckCircle2 } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { RequiredStackMapper } from "./RequiredStackMapper";
import { RoleCommitmentConfig } from "./RoleCommitmentConfig";
import { ProjectStageRoadmap } from "./ProjectStageRoadmap";
import { ProjectStage } from "@/store/types";
import { cn } from "@/lib/utils";

const SUGGESTED_TAGS = ["SaaS", "Developer Tooling", "UI/UX", "AI & LLMs", "Open Source", "Web3", "Productivity", "Mobile"];

export function ProjectCreateWizard() {
  const router = useRouter();
  const { createProjectAsync, draftProject } = useProjectStore();
  const { currentUser } = useUserStore();
  const { addToast } = useUiStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleSubTab, setRoleSubTab] = useState<"COMMITMENT" | "STACKS">("COMMITMENT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Developer Tooling", "SaaS"]);

  const roles = draftProject.roles || [];
  const roadmap = draftProject.roadmap || [];
  const activeStage: ProjectStage = (draftProject.stage as ProjectStage) || "MVP";

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await createProjectAsync({
        ownerId: currentUser.id,
        ownerName: currentUser.name || "Developer",
        title: title.trim(),
        description: description.trim(),
        stage: activeStage,
        repoUrl: repoUrl.trim() || undefined,
        tags,
        roadmap,
        roles:
          roles.length > 0
            ? roles
            : [
                {
                  id: `role-${Date.now()}-1`,
                  roleTitle: "Co-Builder / Core Engineer",
                  requiredSkills: ["TypeScript", "Next.js", "PostgreSQL"],
                  hoursPerWeek: 8,
                  responsibilityLevel: "CORE_BUILDER",
                  urgency: "IMMEDIATE",
                  description: "Help architect core features and participate in weekly async sprints.",
                },
              ],
      });

      addToast({
        title: "Project Opportunity Created",
        description: `"${title}" published at ${activeStage} stage with ${roles.length} roles and ${roadmap.length} milestones.`,
        type: "success",
      });

      router.push("/projects");
    } catch (err: any) {
      addToast({
        title: "Failed to Publish Project",
        description: err.message || "An error occurred while saving the project to database.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    "Project Identity",
    "Roles & Commitment Allocation",
    "Stage & Roadmap Milestones",
    "Review & Publish",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Step Rail */}
      <div className="flex items-center justify-between border-b border-devora-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-ink font-mono font-semibold text-xs">
            0{step}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-devora-ink tracking-tight">
              Post a Project Opportunity
            </h1>
            <p className="text-xs text-devora-muted font-mono">
              Step {step} of 4 · {stepTitles[step - 1]}
            </p>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "w-6 h-1.5 rounded-pill transition-colors",
                s === step
                  ? "bg-devora-brand"
                  : s < step
                  ? "bg-devora-brand/40"
                  : "bg-devora-surface-strong"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Project Identity */}
      {step === 1 && (
        <Card elevated className="p-6 md:p-8 space-y-6 bg-devora-surface">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-devora-ink">
              Project Name & Elevator Pitch
            </h2>
            <p className="text-xs text-devora-muted">
              Give your project a recognizable identity and describe the core problem being solved.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-devora-muted">
                Project Name <span className="text-devora-danger">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Devora, Resensify, HyperTask"
                className="h-11"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-devora-muted">
                Elevator Pitch / Problem Statement <span className="text-devora-danger">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="What problem does this solve and what are you building? Keep it direct (2–3 sentences)."
                className="w-full rounded-input border border-devora-border bg-devora-background p-3 text-sm text-devora-ink placeholder:text-devora-muted focus-visible:outline-none focus-visible:border-devora-brand"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-devora-border">
            <Button
              size="md"
              disabled={!title.trim() || !description.trim()}
              onClick={() => setStep(2)}
              className="gap-2"
            >
              <span>Next: Roles & Commitment</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Roles, Commitment Level & Stack Mapping */}
      {step === 2 && (
        <Card elevated className="p-6 md:p-8 space-y-6 bg-devora-surface">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 border-b border-devora-border pb-3">
            <button
              type="button"
              onClick={() => setRoleSubTab("COMMITMENT")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-button border transition-colors select-none",
                roleSubTab === "COMMITMENT"
                  ? "bg-devora-brand text-white border-devora-brand font-medium"
                  : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1. Commitment & Ownership</span>
            </button>

            <button
              type="button"
              onClick={() => setRoleSubTab("STACKS")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-button border transition-colors select-none",
                roleSubTab === "STACKS"
                  ? "bg-devora-brand text-white border-devora-brand font-medium"
                  : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Required Tech Stacks</span>
            </button>
          </div>

          {roleSubTab === "COMMITMENT" ? (
            <RoleCommitmentConfig />
          ) : (
            <RequiredStackMapper />
          )}

          <div className="flex items-center justify-between pt-4 border-t border-devora-border">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStep(1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              size="md"
              onClick={() => setStep(3)}
              className="gap-2"
            >
              <span>Next: Stage & Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Stage, Roadmap Milestones & Categories */}
      {step === 3 && (
        <Card elevated className="p-6 md:p-8 space-y-6 bg-devora-surface">
          {/* Interactive Project Stage & Roadmap */}
          <ProjectStageRoadmap />

          {/* Repository Evidence & Categories */}
          <div className="space-y-4 pt-4 border-t border-devora-border">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-devora-muted">
                Repository or Architecture Spec URL (Optional)
              </label>
              <Input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="h-11 font-mono text-xs"
              />
            </div>

            {/* Tags & Categories */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-devora-muted">
                Project Category Tags
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Type tag and press Enter"
                  className="h-9 text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddTag(tagInput)}
                  className="h-9 text-xs"
                >
                  Add
                </Button>
              </div>

              {/* Active Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-devora-surface-strong border border-devora-border text-xs text-devora-ink font-mono hover:border-devora-danger hover:text-devora-danger transition-colors select-none"
                    title="Click to remove"
                  >
                    <span>{tag}</span>
                    <span className="text-[10px]">×</span>
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              <div className="pt-2 space-y-1">
                <span className="block text-[11px] font-mono text-devora-muted">Suggested:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleAddTag(st)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-button bg-devora-background border border-devora-border text-devora-muted hover:text-devora-ink hover:border-devora-brand/40 transition-colors"
                    >
                      + {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-devora-border">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStep(2)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              size="md"
              onClick={() => setStep(4)}
              className="gap-2"
            >
              <span>Review Blueprint</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review Opportunity Card & Publish */}
      {step === 4 && (
        <Card elevated className="p-6 md:p-8 space-y-6 bg-devora-surface">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-devora-ink">
              Preview Opportunity Card & Blueprint
            </h2>
            <p className="text-xs text-devora-muted">
              Here is how your project opportunity will appear to developer partners in the Discover feed.
            </p>
          </div>

          {/* Devora Opportunity Card Preview (design.md Section 12) */}
          <div className="p-6 rounded-card border border-devora-border bg-devora-background space-y-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wide text-devora-muted font-medium">
                  Building · Stage: {activeStage}
                </span>
                <h3 className="text-xl font-semibold text-devora-ink mt-0.5">
                  {title}
                </h3>
              </div>
              <Badge variant="brand">{roles.length} Open Roles</Badge>
            </div>

            <p className="text-sm text-devora-muted leading-relaxed">
              {description}
            </p>

            {repoUrl && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-devora-muted">
                <GitBranch className="w-3.5 h-3.5" />
                <span className="truncate">{repoUrl}</span>
              </div>
            )}

            {/* Mapped Roles & Tech Stacks Breakdown with Responsibility */}
            <div className="space-y-2 pt-2 border-t border-devora-border">
              <span className="text-xs font-mono text-devora-muted uppercase font-medium">
                Needed Roles & Required Stacks:
              </span>
              <div className="space-y-2">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-button bg-devora-surface-strong border border-devora-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-devora-ink font-mono">{r.roleTitle}</span>
                        <span className="text-devora-brand font-mono font-medium">({r.hoursPerWeek}h/wk)</span>
                        {r.responsibilityLevel && (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {r.responsibilityLevel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-devora-muted">{r.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {r.requiredSkills.map((s) => (
                        <Badge key={s} variant="brand" className="text-[10px] font-mono">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap Milestones Preview */}
            {roadmap.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-devora-border">
                <span className="text-xs font-mono text-devora-muted uppercase font-medium">
                  Roadmap Milestones:
                </span>
                <div className="space-y-1">
                  {roadmap.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs font-mono text-devora-muted">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-devora-brand" />
                        <span className="text-devora-ink">{m.title}</span>
                      </span>
                      <span>{m.status} ({m.targetQuarter})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-devora-border">
              <span className="text-xs font-mono text-devora-muted uppercase font-medium">
                Categories & Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-devora-border text-xs text-devora-muted font-mono">
              <span>Posted by: {currentUser.name}</span>
              <span>Available for Co-Founders & Engineers</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-devora-border">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStep(3)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              size="md"
              disabled={isSubmitting}
              onClick={handlePublish}
              className="gap-2 bg-devora-brand text-white hover:bg-devora-brand-dark"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Publishing Opportunity..." : "Publish Opportunity"}</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
