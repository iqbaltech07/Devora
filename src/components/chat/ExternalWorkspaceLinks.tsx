"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Plus,
  CheckCircle2,
  GitBranch,
  MessageSquare,
  Palette,
  Kanban,
  Edit2,
  X,
} from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { cn } from "@/lib/utils";

export interface WorkspaceLinkItem {
  id: string;
  platform: "GITHUB" | "DISCORD" | "FIGMA" | "LINEAR";
  title: string;
  url?: string;
  description: string;
}

const DEFAULT_WORKSPACE_LINKS: WorkspaceLinkItem[] = [
  {
    id: "ws-github",
    platform: "GITHUB",
    title: "GitHub Repository",
    url: "https://github.com/devora/devora",
    description: "Main codebase, PR reviews, and architecture issue discussions.",
  },
  {
    id: "ws-discord",
    platform: "DISCORD",
    title: "Discord Builder Voice",
    url: "https://discord.gg/devora-builders",
    description: "Async voice channels, Tuple pairing rooms, and sprint standups.",
  },
  {
    id: "ws-figma",
    platform: "FIGMA",
    title: "Figma Design System",
    url: "https://figma.com/@devora/system-blueprint",
    description: "Warm editorial token specs, UI mockups, and component library.",
  },
  {
    id: "ws-linear",
    platform: "LINEAR",
    title: "Linear Sprint Board",
    url: "https://linear.app/devora/team/DEV",
    description: "Active sprint cycle, milestone backlogs, and deliverable tickets.",
  },
];

interface ExternalWorkspaceLinksProps {
  projectTitle?: string;
  className?: string;
}

export function ExternalWorkspaceLinks({
  projectTitle = "Devora",
  className,
}: ExternalWorkspaceLinksProps) {
  const [links, setLinks] = useState<WorkspaceLinkItem[]>(DEFAULT_WORKSPACE_LINKS);
  const [editingItem, setEditingItem] = useState<WorkspaceLinkItem | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const { addToast } = useUiStore();

  const platformIcons = {
    GITHUB: GitBranch,
    DISCORD: MessageSquare,
    FIGMA: Palette,
    LINEAR: Kanban,
  };

  const handleOpenEdit = (item: WorkspaceLinkItem) => {
    setEditingItem(item);
    setEditUrl(item.url || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setLinks((prev) =>
      prev.map((item) =>
        item.id === editingItem.id ? { ...item, url: editUrl.trim() || undefined } : item
      )
    );

    addToast({
      title: "Workspace Link Updated",
      description: `Updated ${editingItem.title} link for ${projectTitle}.`,
      type: "success",
    });

    setEditingItem(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-devora-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-devora-ink tracking-tight">
              External Workspace Integrations
            </h3>
            <Badge variant="surface" className="text-[10px] font-mono">
              {links.filter((l) => Boolean(l.url)).length}/4 Connected
            </Badge>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Direct launchpad to collaborative external tools for {projectTitle}.
          </p>
        </div>
      </div>

      {/* 4-Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {links.map((link) => {
          const Icon = platformIcons[link.platform];
          const isConnected = Boolean(link.url);

          return (
            <Card
              key={link.id}
              elevated={isConnected}
              className={cn(
                "p-4 flex flex-col justify-between space-y-3 bg-devora-surface border transition-all duration-150 relative group",
                isConnected
                  ? "border-devora-border hover:border-devora-brand/40 shadow-subtle"
                  : "border-devora-border bg-devora-surface-strong/60"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-ink">
                    <Icon className="w-4 h-4 text-devora-brand" />
                  </div>

                  <div className="flex items-center gap-1">
                    {isConnected ? (
                      <Badge variant="success" className="text-[9px] py-0 px-1.5 font-mono gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Live</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-mono">
                        Not Set
                      </Badge>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(link)}
                      className="w-6 h-6 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-ink transition-colors"
                      title="Edit link URL"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-devora-ink font-mono">
                    {link.title}
                  </h4>
                  <p className="text-[11px] text-devora-muted leading-relaxed mt-0.5">
                    {link.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-devora-border">
                {isConnected ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between w-full px-2.5 py-1 rounded-button bg-devora-surface-strong border border-devora-border text-xs font-mono text-devora-ink hover:text-devora-brand hover:border-devora-brand/40 transition-colors"
                  >
                    <span className="truncate max-w-[120px] text-[10px] text-devora-muted">
                      {link.url?.replace(/^https?:\/\//, "")}
                    </span>
                    <ExternalLink className="w-3 h-3 ml-1 shrink-0 text-devora-brand" />
                  </a>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(link)}
                    className="w-full text-xs h-7 gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Connect URL</span>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Link Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/40 backdrop-blur-xs animate-in fade-in duration-150">
          <Card
            elevated
            className="w-full max-w-md bg-devora-surface border-devora-border p-5 space-y-4 shadow-elevated relative animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-devora-border pb-3">
              <h4 className="font-semibold text-sm text-devora-ink">
                Configure {editingItem.title}
              </h4>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-6 h-6 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-devora-muted">
                  Workspace URL
                </label>
                <Input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-9 text-xs font-mono"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-devora-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs h-8">
                  Save Link
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
