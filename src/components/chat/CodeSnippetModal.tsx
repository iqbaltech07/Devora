"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, X } from "lucide-react";

interface CodeSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode: (formattedCodeMarkdown: string) => void;
}

const LANGUAGES = [
  "typescript",
  "sql",
  "python",
  "go",
  "rust",
  "json",
  "bash",
];

export function CodeSnippetModal({
  isOpen,
  onClose,
  onInsertCode,
}: CodeSnippetModalProps) {
  const [language, setLanguage] = useState("typescript");
  const [filename, setFilename] = useState("");
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const header = filename.trim() ? `// ${filename.trim()}\n` : "";
    const markdownBlock = `\`\`\`${language}\n${header}${code.trim()}\n\`\`\``;
    onInsertCode(markdownBlock);

    setCode("");
    setFilename("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-devora-ink/40 backdrop-blur-xs animate-in fade-in duration-150">
      <Card
        elevated
        className="w-full max-w-lg bg-devora-surface border-devora-border p-6 space-y-4 shadow-elevated relative animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-devora-border pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-devora-brand" />
            <h3 className="text-base font-semibold text-devora-ink">
              Attach Code Snippet
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-button flex items-center justify-center text-devora-muted hover:text-devora-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleInsert} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-devora-muted">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-9 rounded-input border border-devora-border bg-devora-background px-3 text-xs text-devora-ink uppercase font-mono"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-devora-muted">
                File Name / Context (Optional)
              </label>
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. matching.ts or schema.sql"
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-devora-muted">
              Source Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              placeholder="Paste or write code here..."
              className="w-full rounded-input border border-devora-border bg-devora-background p-3 text-xs font-mono text-devora-ink leading-relaxed focus-visible:outline-none focus-visible:border-devora-brand"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-devora-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!code.trim()}
              className="text-xs h-8"
            >
              Attach Snippet
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
