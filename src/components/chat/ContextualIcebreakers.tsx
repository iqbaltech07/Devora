"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquareCode, Layers, Clock, Milestone, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextualIcebreakersProps {
  partnerName: string;
  sharedStack: string[];
  hoursOverlap?: string;
  projectTitle?: string;
  onSelectPrompt: (promptText: string) => void;
  className?: string;
}

export function ContextualIcebreakers({
  partnerName,
  sharedStack,
  hoursOverlap = "4 hrs/day overlap",
  projectTitle = "Devora",
  onSelectPrompt,
  className,
}: ContextualIcebreakersProps) {
  const primaryStack = sharedStack[0] || "TypeScript";
  const secondaryStack = sharedStack[1] || "PostgreSQL";

  const prompts = [
    {
      id: "stack",
      category: "Stack Synergy",
      icon: Layers,
      text: `Hey ${partnerName}, saw your deep experience with ${primaryStack} and ${secondaryStack}. How are you currently structuring your data layer and schema caching?`,
    },
    {
      id: "architecture",
      category: "Architecture",
      icon: MessageSquareCode,
      text: `Let's compare architectural notes on state synchronization in Next.js 15 vs Zustand. I'd love your thoughts on our distributed worker model.`,
    },
    {
      id: "cadence",
      category: "Cadence & Overlap",
      icon: Clock,
      text: `Noticed we both share an active evening build window (${hoursOverlap}). Would you be open to an async PR review or quick pairing session this week?`,
    },
    {
      id: "roadmap",
      category: "Roadmap Sprint",
      icon: Milestone,
      text: `Excited about building ${projectTitle} together. What milestone on the roadmap would you most like to tackle as our first deliverable?`,
    },
  ];

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between text-xs font-mono text-devora-muted px-1">
        <div className="flex items-center gap-1.5">
          <MessageSquareCode className="w-3.5 h-3.5 text-devora-brand" />
          <span className="font-semibold text-devora-ink uppercase tracking-wide">
            Contextual Icebreaker Prompts
          </span>
        </div>
        <span className="text-[10px]">Click any prompt to populate composer</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {prompts.map((p) => {
          const Icon = p.icon;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPrompt(p.text)}
              className="p-3 text-left rounded-card bg-devora-surface border border-devora-border hover:border-devora-brand/40 hover:bg-devora-surface-strong transition-all duration-150 space-y-1.5 group select-none shadow-subtle"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-devora-muted group-hover:text-devora-brand transition-colors">
                  <Icon className="w-3 h-3" />
                  <span>{p.category}</span>
                </span>
                <ArrowRight className="w-3 h-3 text-devora-muted opacity-0 group-hover:opacity-100 group-hover:text-devora-brand transition-all -translate-x-1 group-hover:translate-x-0" />
              </div>

              <p className="text-xs text-devora-ink line-clamp-2 leading-relaxed font-sans">
                {p.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
