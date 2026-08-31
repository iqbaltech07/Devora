"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Target, Compass, CheckCircle2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";

const COLLABORATION_GOALS = [
  {
    id: "Build SaaS MVP",
    title: "Build SaaS MVP",
    desc: "Targeting early commercialization, monetization, and initial paying customer traction.",
    badge: "Commercial",
  },
  {
    id: "Technical Co-Founder Search",
    title: "Technical Co-Founder Search",
    desc: "Seeking an equal partner with complementary technical or product architecture skills.",
    badge: "Partnership",
  },
  {
    id: "Open Source Utility",
    title: "Open Source Tooling",
    desc: "Developing public developer tools, CLI utilities, libraries, or community SDKs.",
    badge: "Open Source",
  },
  {
    id: "Hackathon & Weekend Sprints",
    title: "Hackathon & Rapid Sprints",
    desc: "Fast-paced 48-hour prototype builds and competitive developer hackathons.",
    badge: "Exploratory",
  },
  {
    id: "Portfolio & Skill Expansion",
    title: "Portfolio & Craft Growth",
    desc: "Hands-on collaboration to gain production experience with unfamiliar frameworks.",
    badge: "Learning",
  },
];

const WORK_STYLES = [
  {
    id: "Async-First & Documentation-Driven",
    title: "Async-First & Documentation-Driven",
    desc: "Autonomous workflow via GitHub PRs, written RFCs, and Linear boards. Zero unnecessary meetings.",
    recommended: true,
  },
  {
    id: "Pair Programming & Live Hacking",
    title: "Pair Programming & Live Hacking",
    desc: "Scheduled co-working sessions via Tuple or LiveShare for real-time architecture and debugging.",
    recommended: false,
  },
  {
    id: "Agile Weekly Demo Cadence",
    title: "Agile Weekly Demo Cadence",
    desc: "Weekly milestone alignment and demos, followed by self-directed asynchronous execution.",
    recommended: false,
  },
  {
    id: "Hybrid Flexible Collaboration",
    title: "Hybrid Flexible Cadence",
    desc: "Fluid mixture of asynchronous Discord/Slack discussions and periodic weekend brainstorm calls.",
    recommended: false,
  },
];

export function CollaborationGoalsEditor() {
  const { currentUser, toggleGoal, setWorkStyle } = useUserStore();

  const currentGoals = currentUser.goals || [];
  const currentWorkStyle = currentUser.workStyle || "Async-First & Documentation-Driven";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-devora-ink tracking-tight">
              Collaboration Goals & Work Style
            </h2>
            <span className="text-xs font-mono text-devora-muted font-medium bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
              {currentGoals.length} goals selected
            </span>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Matching algorithms prioritize pairs with identical project intent and complementary collaboration styles
          </p>
        </div>

        <Badge variant="outline" className="text-xs font-mono">
          Contextual Compatibility Engine (FR-03)
        </Badge>
      </div>

      {/* Collaboration Goals (Multi-Select Choiceboxes) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-devora-brand" />
          <span className="text-sm font-semibold text-devora-ink">
            What are you looking to build? (Select all that apply)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLLABORATION_GOALS.map((goal) => {
            const isSelected = currentGoals.includes(goal.id);

            return (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={cn(
                  "p-4 rounded-card border cursor-pointer transition-all duration-150 flex flex-col justify-between space-y-3 select-none",
                  isSelected
                    ? "bg-devora-surface border-devora-brand shadow-card"
                    : "bg-devora-surface-strong/60 border-devora-border hover:border-devora-border-strong"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-devora-ink">
                      {goal.title}
                    </span>
                    <div
                      className={cn(
                        "w-4 h-4 rounded-subtle border flex items-center justify-center transition-colors shrink-0 mt-0.5",
                        isSelected
                          ? "bg-devora-brand border-devora-brand text-white"
                          : "border-devora-border bg-devora-background"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </div>

                  <p className="text-xs text-devora-muted leading-relaxed">
                    {goal.desc}
                  </p>
                </div>

                <Badge
                  variant={isSelected ? "brand" : "surface"}
                  className="self-start text-[10px]"
                >
                  {goal.badge}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Style Preference (Single-Choice Radio Cards) */}
      <div className="space-y-3 pt-2 border-t border-devora-border">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-devora-brand" />
          <span className="text-sm font-semibold text-devora-ink">
            Preferred Working Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WORK_STYLES.map((style) => {
            const isSelected = currentWorkStyle === style.id;

            return (
              <div
                key={style.id}
                onClick={() => setWorkStyle(style.id)}
                className={cn(
                  "p-4 rounded-card border cursor-pointer transition-all duration-150 flex flex-col justify-between space-y-2 select-none",
                  isSelected
                    ? "bg-devora-surface border-devora-brand shadow-card"
                    : "bg-devora-surface-strong/60 border-devora-border hover:border-devora-border-strong"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-devora-ink">
                      {style.title}
                    </span>
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                        isSelected
                          ? "border-devora-brand"
                          : "border-devora-border bg-devora-background"
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-devora-brand" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-devora-muted leading-relaxed">
                    {style.desc}
                  </p>
                </div>

                {style.recommended && (
                  <span className="text-[10px] font-mono text-devora-brand font-medium">
                    Recommended for async builder matching
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alignment Verification Card */}
      <div className="p-4 bg-devora-surface-strong rounded-card border border-devora-border flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-devora-success shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-semibold text-devora-ink">
            Real-Time Compatibility Signal Active
          </span>
          <p className="text-devora-muted leading-relaxed">
            Your profile highlights <strong className="text-devora-ink">{currentGoals.join(", ")}</strong> with a{" "}
            <strong className="text-devora-ink">{currentWorkStyle}</strong> cadence. Matches with identical goals receive an automatic +15% relevance boost.
          </p>
        </div>
      </div>
    </div>
  );
}
