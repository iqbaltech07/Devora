"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PeerReviewModal } from "./PeerReviewModal";
import { useReviewStore } from "@/store/useReviewStore";
import { ShieldCheck, Plus, Code2, Clock, ThumbsUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeerReviewsListProps {
  userId: string;
  userName: string;
  userTitle: string;
  allowAddReview?: boolean;
  className?: string;
}

export function PeerReviewsList({
  userId,
  userName,
  userTitle,
  allowAddReview = true,
  className,
}: PeerReviewsListProps) {
  const { getReviewsForUser, getUserReputationSummary } = useReviewStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reviews = getReviewsForUser(userId);
  const summary = getUserReputationSummary(userId);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-devora-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-devora-brand" />
            <h3 className="text-base font-semibold text-devora-ink tracking-tight">
              Peer Reviews & Synergy Ledger
            </h3>
            <Badge variant="brand" className="text-[10px] font-mono">
              {summary.wouldBuildAgainPercent}% Would Build Again
            </Badge>
          </div>
          <p className="text-xs text-devora-muted mt-0.5">
            Verified technical retrospectives from past collaboration sprints.
          </p>
        </div>

        {allowAddReview && (
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 text-xs h-8 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Peer Review</span>
          </Button>
        )}
      </div>

      {/* 3-Dimensional Score Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-card bg-devora-surface border border-devora-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-brand">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-devora-muted font-medium">
                Code Quality
              </span>
              <span className="block text-xs font-semibold text-devora-ink font-mono">
                {summary.averageCodeQuality} / 5.0
              </span>
            </div>
          </div>
          <Badge variant="brand" className="text-[10px] font-mono">
            Rigor
          </Badge>
        </div>

        <div className="p-3.5 rounded-card bg-devora-surface border border-devora-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-success">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-devora-muted font-medium">
                Communication
              </span>
              <span className="block text-xs font-semibold text-devora-ink font-mono">
                {summary.averageCommunication} / 5.0
              </span>
            </div>
          </div>
          <Badge variant="success" className="text-[10px] font-mono">
            Async
          </Badge>
        </div>

        <div className="p-3.5 rounded-card bg-devora-surface border border-devora-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center text-devora-warning">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-devora-muted font-medium">
                Reliability
              </span>
              <span className="block text-xs font-semibold text-devora-ink font-mono">
                {summary.averageReliability} / 5.0
              </span>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Milestones
          </Badge>
        </div>
      </div>

      {/* Top Endorsement Tags */}
      {summary.topTags.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-mono text-devora-muted">
          <span className="shrink-0 font-medium">Top Praises:</span>
          <div className="flex flex-wrap gap-1.5">
            {summary.topTags.map((tag) => (
              <Badge key={tag} variant="surface" className="text-[10px] font-mono">
                ✓ {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Cards Feed */}
      {reviews.length === 0 ? (
        <Card className="p-6 text-center bg-devora-surface border-devora-border space-y-2">
          <p className="text-sm font-semibold text-devora-ink">
            No Collaboration Reviews Yet
          </p>
          <p className="text-xs text-devora-muted max-w-sm mx-auto">
            Reviews are unlocked after completing an initial sprint or milestone together.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <Card
              key={rev.id}
              elevated
              className="p-5 bg-devora-surface border-devora-border space-y-3 shadow-subtle"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-devora-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-devora-ink font-mono">
                      {rev.reviewerName}
                    </span>
                    <Badge variant="brand" className="text-[9px] py-0 px-1 font-mono">
                      {rev.projectTitle}
                    </Badge>
                  </div>
                  <p className="text-xs text-devora-muted font-mono">
                    {rev.reviewerTitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-devora-muted">
                    Code: <strong>{rev.codeQualityRating}</strong> · Comm: <strong>{rev.communicationRating}</strong> · Rel: <strong>{rev.reliabilityRating}</strong>
                  </span>
                  <Badge variant="success" className="text-[10px] py-0 px-1.5 font-mono">
                    {rev.overallSynergyScore}% Fit
                  </Badge>
                </div>
              </div>

              {/* Written Review Quote */}
              <p className="text-xs text-devora-ink leading-relaxed font-sans">
                &ldquo;{rev.writtenReview}&rdquo;
              </p>

              {/* Endorsement Tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1">
                  {rev.endorsementTags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>

                <span className="text-[10px] font-mono text-devora-muted">
                  Reviewed on {new Date(rev.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Peer Review Submission Modal */}
      <PeerReviewModal
        targetUserId={userId}
        targetUserName={userName}
        targetUserTitle={userTitle}
        projectTitle="Devora"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
