"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MagnetButton } from "@/components/ui/MagnetButton";
import { Project } from "@/store/types";
import { Send, Check, X } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { useUiStore } from "@/store/useUiStore";

interface ExpressInterestModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpressInterestModal({
  project,
  isOpen,
  onClose,
}: ExpressInterestModalProps) {
  const { expressInterest } = useProjectStore();
  const { addToast } = useUiStore();

  const [selectedRole, setSelectedRole] = useState(
    project?.roles[0]?.roleTitle || "Co-Builder"
  );
  const [pitchNote, setPitchNote] = useState("");
  const [isSent, setIsSent] = useState(false);

  React.useEffect(() => {
    if (project?.roles[0]?.roleTitle) {
      setSelectedRole(project.roles[0].roleTitle);
    }
    setIsSent(false);
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    expressInterest(project.id, selectedRole, pitchNote.trim() || undefined);

    setIsSent(true);
    addToast({
      title: "Interest Transmitted",
      description: `Pitch sent to ${project.ownerName} for the "${selectedRole}" role on ${project.title}.`,
      type: "success",
    });

    setTimeout(() => {
      onClose();
      setIsSent(false);
      setPitchNote("");
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/40 backdrop-blur-xs animate-in fade-in duration-150">
      <Card
        elevated
        className="w-full max-w-lg bg-devora-surface border-devora-border p-6 space-y-5 shadow-elevated relative animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-devora-border pb-3">
          <div>
            <span className="text-xs font-mono uppercase text-devora-muted font-medium">
              Direct Collaboration Pitch
            </span>
            <h3 className="text-lg font-semibold text-devora-ink mt-0.5">
              Express Interest in {project.title}
            </h3>
            <p className="text-xs text-devora-muted">
              Posted by {project.ownerName} · Stage: {project.stage}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-ink hover:bg-devora-surface-strong transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSent ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-devora-success mx-auto flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-semibold text-devora-ink">
              Interest Expressed Successfully!
            </h4>
            <p className="text-xs text-devora-muted">
              {project.ownerName} has been notified and can review your verified GitHub profile & compatibility match.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-devora-muted">
                Which open role are you pitching for?
              </label>
              <div className="space-y-1.5">
                {project.roles.map((r) => (
                  <label
                    key={r.id}
                    className={`p-3 rounded-button border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                      selectedRole === r.roleTitle
                        ? "bg-devora-brand-soft border-devora-brand text-devora-brand-dark font-medium"
                        : "bg-devora-background border-devora-border text-devora-muted hover:text-devora-ink"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="roleChoice"
                        value={r.roleTitle}
                        checked={selectedRole === r.roleTitle}
                        onChange={() => setSelectedRole(r.roleTitle)}
                        className="text-devora-brand focus:ring-0"
                      />
                      <span className="font-mono">{r.roleTitle}</span>
                      <span className="text-devora-muted">({r.hoursPerWeek}h/wk)</span>
                    </div>

                    <div className="flex gap-1">
                      {r.requiredSkills.slice(0, 2).map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] py-0 px-1 font-mono">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Pitch Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-devora-muted">
                Quick Introductory Pitch (Why you want to build this):
              </label>
              <textarea
                value={pitchNote}
                onChange={(e) => setPitchNote(e.target.value)}
                rows={3}
                placeholder="e.g. I have 4 years building with Next.js & Postgres. I'm excited about this problem space and can commit 8h/wk..."
                className="w-full rounded-input border border-devora-border bg-devora-background p-3 text-xs text-devora-ink placeholder:text-devora-muted focus-visible:outline-none focus-visible:border-devora-brand"
              />
            </div>

            {/* Actions with Magnetic Send Button */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-devora-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs h-9"
              >
                Cancel
              </Button>

              <MagnetButton
                type="submit"
                className="h-9 px-4 text-xs bg-devora-brand text-white hover:bg-devora-brand-dark shadow-subtle gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Pitch</span>
              </MagnetButton>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
