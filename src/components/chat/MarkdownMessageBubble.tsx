"use client";

import * as React from "react";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Message } from "@/store/types";
import { cn } from "@/lib/utils";

interface MarkdownMessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MarkdownMessageBubble({
  message,
  isCurrentUser,
}: MarkdownMessageBubbleProps) {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Helper to render basic markdown & fenced code blocks
  const renderFormattedContent = (content: string) => {
    // Check for fenced code block ```lang\ncode\n```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const language = lines[0]?.match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "code";
        const codeBody = language === lines[0] ? lines.slice(1).join("\n") : lines.join("\n");
        const blockId = `code-${message.id}-${index}`;

        return (
          <div
            key={index}
            className="my-2.5 rounded-button bg-devora-background border border-devora-border overflow-hidden text-xs font-mono"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-devora-surface-strong border-b border-devora-border text-devora-muted">
              <span className="text-[10px] uppercase font-semibold text-devora-ink font-mono">
                {language}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(codeBody, blockId)}
                className="inline-flex items-center gap-1 text-[10px] hover:text-devora-ink transition-colors"
                title="Copy code"
              >
                {copiedCodeId === blockId ? (
                  <>
                    <Check className="w-3 h-3 text-devora-success" />
                    <span className="text-devora-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-devora-ink text-[11px] leading-relaxed">
              <code>{codeBody}</code>
            </pre>
          </div>
        );
      }

      // Inline formatting: Bold, backtick code, and linebreaks
      const lineElements = part.split("\n").map((line, lineIdx) => {
        if (!line.trim()) return <br key={lineIdx} />;

        // Simple bold (**text**) and inline code (`code`) parser
        const formattedTokens = line.split(/(\*\*.*?\*\*|`.*?`)/g).map((token, tokenIdx) => {
          if (token.startsWith("**") && token.endsWith("**")) {
            return <strong key={tokenIdx} className="font-semibold">{token.slice(2, -2)}</strong>;
          }
          if (token.startsWith("`") && token.endsWith("`")) {
            return (
              <code
                key={tokenIdx}
                className={cn(
                  "px-1.5 py-0.2 rounded-button text-[11px] font-mono border",
                  isCurrentUser
                    ? "bg-white/15 border-white/20 text-white"
                    : "bg-devora-surface-strong border-devora-border text-devora-ink"
                )}
              >
                {token.slice(1, -1)}
              </code>
            );
          }
          return token;
        });

        return (
          <p key={lineIdx} className="leading-relaxed">
            {formattedTokens}
          </p>
        );
      });

      return <React.Fragment key={index}>{lineElements}</React.Fragment>;
    });
  };

  const formattedTime = new Date(message.sentAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]",
        isCurrentUser ? "self-end items-end" : "self-start items-start"
      )}
    >
      <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-devora-muted">
        <span className="font-semibold text-devora-ink">
          {isCurrentUser ? "You" : message.senderName}
        </span>
        <span>·</span>
        <span>{formattedTime}</span>
      </div>

      <div
        className={cn(
          "p-4 rounded-card border text-sm transition-shadow",
          isCurrentUser
            ? "bg-devora-brand text-white border-devora-brand shadow-subtle rounded-tr-none"
            : "bg-devora-surface text-devora-ink border-devora-border shadow-subtle rounded-tl-none"
        )}
      >
        {renderFormattedContent(message.content)}
      </div>
    </div>
  );
}
