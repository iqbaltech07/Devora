"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MagnetButton } from "@/components/ui/MagnetButton";
import { useReviewStore } from "@/store/useReviewStore";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { ShieldCheck, Check, X, Code2, Clock, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeerReviewModalProps {
  targetUserId: string;
  targetUserName: string;
  targetUserTitle: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ENDORSEMENTS = [
  "Clean Architecture",
  "Async Master",
  "Deep TypeScript Guru",
  "Fast Turnaround",
  "High Code Coverage",
  "Pragmatic Decision Maker",
  "Zero Ego in Code Reviews",
];

export function PeerReviewModal({
  targetUserId,
  targetUserName,
  targetUserTitle,
  projectTitle,
  isOpen,
  onClose,
}: PeerReviewModalProps) {
  const { addReview } = useReviewStore();
  const { currentUser } = useUserStore();
  const { addToast } = useUiStore();

  const [codeQuality, setCodeQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [reliability, setReliability] = useState(5);
  const [wouldBuildAgain, setWouldBuildAgain] = useState<"DEFINITELY" | "CONDITIONAL" | "NO">("DEFINITELY");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Clean Architecture",
    "Async Master",
  ]);
  const [writtenReview, setWrittenReview] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Calculate overall synergy percentage: (avg / 5) * 100
  const overallScore = Math.round(
    ((codeQuality + communication + reliability) / 15) * 100
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writtenReview.trim()) return;

    addReview({
      projectId: "proj-active",
      projectTitle,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerTitle: currentUser.title,
      revieweeId: targetUserId,
      revieweeName: targetUserName,
      codeQualityRating: codeQuality,
      communicationRating: communication,
      reliabilityRating: reliability,
      overallSynergyScore: overallScore,
      wouldBuildAgain,
      endorsementTags: selectedTags,
      writtenReview: writtenReview.trim(),
    });

    setIsSubmitted(true);
    addToast({
      title: "Peer Review Published",
      description: `Your verified review for ${targetUserName} on ${projectTitle} has been recorded to their reputation ledger.`,
      type: "success",
    });

    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setWrittenReview("");
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/40 backdrop-blur-xs animate-in fade-in duration-150">
      <Card
        elevated
        className="w-full max-w-xl bg-devora-surface border-devora-border p-6 space-y-5 shadow-elevated relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-devora-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-devora-brand" />
              <span className="text-xs font-mono uppercase text-devora-muted font-medium">
                Post-Collaboration Peer Audit
              </span>
              <Badge variant="brand" className="text-[10px] font-mono">
                {overallScore}% Synergy
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-devora-ink mt-0.5">
              Review {targetUserName}
            </h3>
            <p className="text-xs text-devora-muted">
              Project: <strong className="text-devora-ink">{projectTitle}</strong> · {targetUserTitle}
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

        {isSubmitted ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-devora-success mx-auto flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-semibold text-devora-ink">
              Peer Review Recorded
            </h4>
            <p className="text-xs text-devora-muted max-w-sm mx-auto">
              Thank you for contributing transparent feedback to the Devora verified reputation ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Attribute 1: Code Quality & Architecture */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-devora-ink font-semibold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Code Quality & Architecture</span>
                </span>
                <span className="text-devora-brand font-bold">{codeQuality}/5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setCodeQuality(score)}
                    className={cn(
                      "py-2 text-center text-xs font-mono rounded-button border transition-colors select-none",
                      codeQuality === score
                        ? "bg-devora-brand text-white border-devora-brand font-semibold"
                        : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink"
                    )}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <span className="block text-[11px] text-devora-muted font-mono">
                {codeQuality === 5
                  ? "Exemplary architecture, clean PRs, zero technical debt."
                  : codeQuality >= 3
                  ? "Solid code contributions, acceptable test coverage."
                  : "Frequent regressions or difficult to review PRs."}
              </span>
            </div>

            {/* Attribute 2: Communication & Async Cadence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-devora-ink font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-devora-success" />
                  <span>Communication & Async Cadence</span>
                </span>
                <span className="text-devora-brand font-bold">{communication}/5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setCommunication(score)}
                    className={cn(
                      "py-2 text-center text-xs font-mono rounded-button border transition-colors select-none",
                      communication === score
                        ? "bg-devora-brand text-white border-devora-brand font-semibold"
                        : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink"
                    )}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <span className="block text-[11px] text-devora-muted font-mono">
                {communication === 5
                  ? "Flawless async RFC discipline, clear commit notes, zero meeting bloat."
                  : communication >= 3
                  ? "Responsive within agreed working windows."
                  : "Silent blocker or erratic communication."}
              </span>
            </div>

            {/* Attribute 3: Reliability & Sprint Commitment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-devora-ink font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-devora-warning" />
                  <span>Reliability & Commitment</span>
                </span>
                <span className="text-devora-brand font-bold">{reliability}/5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setReliability(score)}
                    className={cn(
                      "py-2 text-center text-xs font-mono rounded-button border transition-colors select-none",
                      reliability === score
                        ? "bg-devora-brand text-white border-devora-brand font-semibold"
                        : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink"
                    )}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <span className="block text-[11px] text-devora-muted font-mono">
                {reliability === 5
                  ? "Honored all agreed hours, delivered milestones on or ahead of sprint schedule."
                  : reliability >= 3
                  ? "Reasonable follow-through with minimal delays."
                  : "Missed core milestone commitments."}
              </span>
            </div>

            {/* Would You Build Again? */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-devora-muted uppercase font-medium">
                Would you build with {targetUserName} again?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "DEFINITELY", label: "Definitely Build Again" },
                  { id: "CONDITIONAL", label: "Conditional on Scope" },
                  { id: "NO", label: "Prefer Other Cadence" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setWouldBuildAgain(opt.id as typeof wouldBuildAgain)}
                    className={cn(
                      "p-2.5 rounded-button border text-xs font-mono text-center transition-colors select-none",
                      wouldBuildAgain === opt.id
                        ? "bg-devora-ink text-devora-background border-devora-ink font-semibold"
                        : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Endorsement Tags */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-devora-muted uppercase font-medium">
                Key Technical Strengths:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_ENDORSEMENTS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-2.5 py-1 rounded-pill text-xs font-mono border transition-colors select-none",
                        isSelected
                          ? "bg-devora-brand text-white border-devora-brand font-medium"
                          : "bg-devora-surface-strong text-devora-muted border-devora-border hover:text-devora-ink"
                      )}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Technical Testimonial */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-devora-muted uppercase font-medium">
                Written Technical Testimonial <span className="text-devora-danger">*</span>
              </label>
              <textarea
                value={writtenReview}
                onChange={(e) => setWrittenReview(e.target.value)}
                rows={3}
                placeholder="Detail technical strengths, code review culture, and sprint reliability (2–3 sentences)..."
                className="w-full rounded-input border border-devora-border bg-devora-background p-3 text-xs text-devora-ink placeholder:text-devora-muted focus-visible:outline-none focus-visible:border-devora-brand leading-relaxed"
                required
              />
            </div>

            {/* Actions */}
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
                disabled={!writtenReview.trim()}
                className="h-9 px-4 text-xs bg-devora-brand text-white hover:bg-devora-brand-dark shadow-subtle gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Publish Peer Review</span>
              </MagnetButton>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
