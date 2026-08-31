"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CollaborationRequestCard } from "./CollaborationRequestCard";
import { useChatStore } from "@/store/useChatStore";
import { Inbox, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollaborationRequestInbox() {
  const { invitations } = useChatStore();
  const [filterTab, setFilterTab] = useState<"PENDING" | "ACCEPTED" | "ARCHIVED" | "ALL">("PENDING");

  const pendingCount = invitations.filter((i) => i.status === "PENDING").length;
  const acceptedCount = invitations.filter((i) => i.status === "ACCEPTED").length;

  const filteredInvitations = invitations.filter((inv) => {
    if (filterTab === "PENDING") return inv.status === "PENDING";
    if (filterTab === "ACCEPTED") return inv.status === "ACCEPTED";
    if (filterTab === "ARCHIVED") return inv.status === "REJECTED" || inv.status === "COUNTER_PROPOSED";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-devora-border">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-devora-brand" />
          <h3 className="text-base font-semibold text-devora-ink tracking-tight">
            Collaboration Invitations Inbox
          </h3>
          {pendingCount > 0 && (
            <Badge variant="brand" className="text-[10px] font-mono py-0 px-1.5">
              {pendingCount} Needs Action
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 font-mono text-xs">
          {[
            { id: "PENDING", label: "Pending", count: pendingCount },
            { id: "ACCEPTED", label: "Accepted", count: acceptedCount },
            { id: "ARCHIVED", label: "Archived / Countered" },
            { id: "ALL", label: "All Requests", count: invitations.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as typeof filterTab)}
              className={cn(
                "px-2.5 py-1 rounded-button border text-xs transition-colors select-none",
                filterTab === tab.id
                  ? "bg-devora-ink text-devora-background border-devora-ink font-medium"
                  : "bg-devora-surface text-devora-muted border-devora-border hover:text-devora-ink"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Invitations Feed */}
      {filteredInvitations.length === 0 ? (
        <Card className="p-8 text-center bg-devora-surface space-y-2 border-devora-border">
          <CheckCircle2 className="w-8 h-8 text-devora-brand mx-auto opacity-40" />
          <p className="text-sm font-semibold text-devora-ink">
            No Requests in this View
          </p>
          <p className="text-xs text-devora-muted max-w-sm mx-auto">
            {filterTab === "PENDING"
              ? "All caught up! You have reviewed all inbound builder invitations."
              : "No requests found for this filter tab."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvitations.map((inv) => (
            <CollaborationRequestCard key={inv.id} invitation={inv} />
          ))}
        </div>
      )}
    </div>
  );
}
