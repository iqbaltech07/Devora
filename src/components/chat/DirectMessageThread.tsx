"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MagnetButton } from "@/components/ui/MagnetButton";
import { MarkdownMessageBubble } from "./MarkdownMessageBubble";
import { CodeSnippetModal } from "./CodeSnippetModal";
import { ContextualIcebreakers } from "./ContextualIcebreakers";
import { useChatStore } from "@/store/useChatStore";
import { useUserStore } from "@/store/useUserStore";
import { Send, Code2, Globe, MessageSquareCode, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DirectMessageThreadProps {
  conversationId: string;
  partnerName: string;
  partnerTitle: string;
  partnerTimezone?: string;
  projectTitle?: string;
  sharedStack?: string[];
  hoursOverlap?: string;
  className?: string;
}

export function DirectMessageThread({
  conversationId,
  partnerName,
  partnerTitle,
  partnerTimezone = "Asia/Tokyo (UTC+9)",
  projectTitle = "Devora",
  sharedStack = ["TypeScript", "PostgreSQL", "Next.js", "Redis"],
  hoursOverlap = "4 hrs/day overlap",
  className,
}: DirectMessageThreadProps) {
  const { messages, sendMessage } = useChatStore();
  const { currentUser } = useUserStore();

  const [inputVal, setInputVal] = useState("");
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = messages[conversationId] || [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    sendMessage(conversationId, inputVal.trim());
    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleInsertCode = (formattedCodeMarkdown: string) => {
    setInputVal((prev) => (prev ? `${prev}\n\n${formattedCodeMarkdown}` : formattedCodeMarkdown));
    textareaRef.current?.focus();
  };

  const handleSelectIcebreaker = (promptText: string) => {
    setInputVal(promptText);
    setShowIcebreakers(false);
    textareaRef.current?.focus();
  };

  return (
    <Card
      elevated
      className={cn(
        "flex flex-col h-[650px] bg-devora-surface border-devora-border overflow-hidden",
        className
      )}
    >
      {/* Thread Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-devora-border bg-devora-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-devora-brand-soft border border-devora-brand/20 flex items-center justify-center font-mono font-semibold text-devora-brand-dark text-sm">
            {partnerName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-devora-ink">
                {partnerName}
              </h3>
              <Badge variant="surface" className="text-[10px] font-mono">
                {projectTitle}
              </Badge>
            </div>
            <p className="text-xs text-devora-muted font-mono">
              {partnerTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-devora-muted">
          <button
            type="button"
            onClick={() => setShowIcebreakers(!showIcebreakers)}
            className="hidden sm:inline-flex items-center gap-1 text-xs text-devora-brand hover:underline font-mono"
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>{showIcebreakers ? "Hide Starters" : "Icebreakers"}</span>
          </button>
          <span className="hidden sm:flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-devora-brand" />
            <span>{partnerTimezone.split(" ")[0]}</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-devora-success" title="Active now" />
        </div>
      </div>

      {/* Optional Top Icebreakers Drawer */}
      {showIcebreakers && (
        <div className="p-4 bg-devora-surface-strong border-b border-devora-border animate-in slide-in-from-top-2 duration-150">
          <ContextualIcebreakers
            partnerName={partnerName}
            sharedStack={sharedStack}
            hoursOverlap={hoursOverlap}
            projectTitle={projectTitle}
            onSelectPrompt={handleSelectIcebreaker}
          />
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-devora-background/50">
        {activeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-devora-ink">
                Start Technical Conversation with {partnerName}
              </p>
              <p className="text-xs text-devora-muted max-w-sm mt-0.5">
                Kickstart collaboration using one of our verified technical icebreakers:
              </p>
            </div>

            <ContextualIcebreakers
              partnerName={partnerName}
              sharedStack={sharedStack}
              hoursOverlap={hoursOverlap}
              projectTitle={projectTitle}
              onSelectPrompt={handleSelectIcebreaker}
              className="max-w-xl text-left"
            />
          </div>
        ) : (
          activeMessages.map((msg) => (
            <MarkdownMessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={msg.senderId === currentUser.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Toolbar & Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-devora-border bg-devora-surface space-y-2">
        {/* Micro-Toolbar */}
        <div className="flex items-center justify-between text-xs font-mono text-devora-muted px-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSnippetModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-button bg-devora-surface-strong border border-devora-border hover:text-devora-ink hover:border-devora-brand/40 transition-colors"
              title="Attach formatted code snippet"
            >
              <Code2 className="w-3.5 h-3.5 text-devora-brand" />
              <span>Attach Code</span>
            </button>
            <button
              type="button"
              onClick={() => setShowIcebreakers(!showIcebreakers)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-button bg-devora-surface-strong border border-devora-border hover:text-devora-ink hover:border-devora-brand/40 transition-colors"
              title="View contextual icebreaker prompts"
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-devora-brand" />
              <span>Prompts</span>
            </button>
            <span className="hidden sm:inline text-[11px] text-devora-muted/70">
              Supports **bold**, `inline code`, and ```code blocks```
            </span>
          </div>

          <span className="text-[10px] text-devora-muted">
            Press Enter to send (Shift+Enter for newline)
          </span>
        </div>

        {/* Textarea + Magnet Send Button */}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={`Message ${partnerName}...`}
            className="flex-1 rounded-input border border-devora-border bg-devora-background p-3 text-xs text-devora-ink placeholder:text-devora-muted focus-visible:outline-none focus-visible:border-devora-brand resize-none leading-relaxed"
          />

          <MagnetButton
            type="submit"
            disabled={!inputVal.trim()}
            className={cn(
              "h-11 px-4 text-xs font-semibold gap-1.5 shadow-subtle",
              inputVal.trim()
                ? "bg-devora-brand text-white hover:bg-devora-brand-dark"
                : "bg-devora-surface-strong text-devora-muted cursor-not-allowed border border-devora-border"
            )}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </MagnetButton>
        </div>
      </form>

      {/* Code Snippet Modal */}
      <CodeSnippetModal
        isOpen={isSnippetModalOpen}
        onClose={() => setIsSnippetModalOpen(false)}
        onInsertCode={handleInsertCode}
      />
    </Card>
  );
}
