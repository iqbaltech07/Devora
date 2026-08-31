"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MagnetButton } from "@/components/ui/MagnetButton";
import { Invitation } from "@/store/types";
import { useChatStore } from "@/store/useChatStore";
import { useUiStore } from "@/store/useUiStore";
import { Check, X, Clock, Send, MessageSquareQuote, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollaborationRequestCardProps {
  invitation: Invitation;
  className?: string;
}

export function CollaborationRequestCard({
  invitation,
  className,
}: CollaborationRequestCardProps) {
  const { respondToInvitation } = useChatStore();
  const { addToast } = useUiStore();

  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [counterNote, setCounterNote] = useState("");

  const handleAccept = () => {
    respondToInvitation(invitation.id, "ACCEPT");
    addToast({
      title: "Collaboration Invitation Accepted",
      description: `You are now partnered with ${invitation.senderName} on ${invitation.projectTitle}!`,
      type: "success",
    });
  };

  const handleReject = () => {
    respondToInvitation(invitation.id, "REJECT");
    addToast({
      title: "Invitation Declined",
      description: `Declined collaboration request from ${invitation.senderName}.`,
      type: "info",
    });
  };

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterNote.trim()) return;

    respondToInvitation(invitation.id, "COUNTER_PROPOSE", counterNote.trim());
    setIsCounterOpen(false);
    addToast({
      title: "Counter-Proposal Transmitted",
      description: `Sent proposed modifications to ${invitation.senderName}.`,
      type: "warning",
    });
  };

  const statusBadge = {
    PENDING: { label: "Needs Decision", variant: "surface" as const },
    ACCEPTED: { label: "Accepted · Active Partner", variant: "success" as const },
    REJECTED: { label: "Declined", variant: "outline" as const },
    COUNTER_PROPOSED: { label: "Counter-Proposal Sent", variant: "warning" as const },
  }[invitation.status];

  return (
    <Card
      elevated={invitation.status === "PENDING"}
      className={cn(
        "p-5 space-y-4 bg-devora-surface border-devora-border transition-all duration-150",
        invitation.status === "PENDING"
          ? "hover:border-devora-brand/40 shadow-card"
          : "opacity-90 bg-devora-surface-strong/50",
        className
      )}
    >
      {/* Header: Sender Info & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-devora-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-button bg-devora-surface-strong border border-devora-border flex items-center justify-center font-mono font-semibold text-devora-ink text-sm">
            {invitation.senderName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base text-devora-ink">
                {invitation.senderName}
              </h4>
              <Badge variant="brand" className="text-[10px] font-mono">
                {invitation.projectTitle}
              </Badge>
            </div>
            <p className="text-xs text-devora-muted font-mono">
              {invitation.senderTitle || "Engineering Partner"}
              {invitation.hoursPerWeek && ` · ${invitation.hoursPerWeek}h/wk offered`}
            </p>
          </div>
        </div>

        <Badge variant={statusBadge.variant} className="font-mono text-[10px] self-start sm:self-auto">
          {statusBadge.label}
        </Badge>
      </div>

      {/* Pitch Note */}
      <div className="p-3 bg-devora-background rounded-button border border-devora-border space-y-1">
        <span className="block text-[10px] font-mono uppercase text-devora-muted font-medium">
          Collaboration Pitch Note:
        </span>
        <p className="text-xs text-devora-ink leading-relaxed">
          &ldquo;{invitation.note}&rdquo;
        </p>
      </div>

      {/* Counter Proposal Display if sent */}
      {invitation.counterNote && (
        <div className="p-3 bg-amber-50 rounded-button border border-amber-200 space-y-1 text-xs">
          <span className="block text-[10px] font-mono uppercase text-devora-warning font-semibold">
            Your Counter-Proposal:
          </span>
          <p className="text-devora-ink italic leading-relaxed">
            &ldquo;{invitation.counterNote}&rdquo;
          </p>
        </div>
      )}

      {/* Counter Proposal Composer Drawer */}
      {isCounterOpen && (
        <form onSubmit={handleSendCounter} className="p-3 bg-devora-surface-strong rounded-button border border-devora-border space-y-2">
          <label className="block text-xs font-mono text-devora-muted font-medium">
            Propose adjustments (e.g. adjust weekly hours, suggest pairing window):
          </label>
          <textarea
            value={counterNote}
            onChange={(e) => setCounterNote(e.target.value)}
            rows={2}
            placeholder="e.g. I'd love to collaborate, but can we start with 6 hrs/week on async PR reviews first?"
            className="w-full rounded-input border border-devora-border bg-devora-background p-2.5 text-xs text-devora-ink placeholder:text-devora-muted focus-visible:outline-none focus-visible:border-devora-brand"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCounterOpen(false)}
              className="text-xs h-7"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs h-7 gap-1">
              <Send className="w-3 h-3" />
              <span>Transmit Counter</span>
            </Button>
          </div>
        </form>
      )}

      {/* Action Footer (Only for PENDING status) */}
      {invitation.status === "PENDING" && !isCounterOpen && (
        <div className="flex items-center justify-between pt-2 border-t border-devora-border">
          <span className="text-[11px] font-mono text-devora-muted">
            Received {new Date(invitation.createdAt).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCounterOpen(true)}
              className="text-xs h-8 gap-1 text-devora-muted hover:text-devora-ink"
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Counter</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleReject}
              className="text-xs h-8 gap-1 text-devora-muted hover:text-devora-danger"
            >
              <X className="w-3.5 h-3.5" />
              <span>Decline</span>
            </Button>

            <MagnetButton
              onClick={handleAccept}
              className="text-xs h-8 px-3.5 bg-devora-brand text-white hover:bg-devora-brand-dark shadow-subtle gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Accept & Build</span>
            </MagnetButton>
          </div>
        </div>
      )}
    </Card>
  );
}
