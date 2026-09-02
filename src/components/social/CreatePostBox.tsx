"use client";

import { useState, useRef } from "react";
import { usePostStore } from "@/store/usePostStore";
import { useUserStore } from "@/store/useUserStore";
import { Avatar } from "@/components/ui/avatar";
import {
  Code2,
  Image as ImageIcon,
  Sparkles,
  Flame,
  Tag,
  Rocket,
  X,
  Plus,
} from "lucide-react";

const CODE_LANGUAGES = [
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "SQL", value: "sql" },
  { label: "Tailwind / CSS", value: "css" },
  { label: "HTML", value: "html" },
];

const POST_CATEGORIES = [
  { label: "Build In Public", value: "BUILD_IN_PUBLIC", icon: Sparkles },
  { label: "Showcase UI/UX", value: "SHOWCASE", icon: Flame },
  { label: "Cari Partner", value: "NEED_PARTNER", icon: Rocket },
  { label: "Tips & Insight", value: "TECH_TIPS", icon: Code2 },
];

export function CreatePostBox() {
  const { createPost, isSubmitting } = usePostStore();
  const { currentUser } = useUserStore();

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("BUILD_IN_PUBLIC");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["#BuildInPublic"]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      for (let i = 0; i < Math.min(files.length, 4); i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setMediaUrls((prev) => [...prev, data.url]);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = () => {
    const cleanTag = customTagInput.trim().replace(/^#/, "");
    if (cleanTag && !tags.includes(`#${cleanTag}`)) {
      setTags([...tags, `#${cleanTag}`]);
      setCustomTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleRemoveMedia = (urlToRemove: string) => {
    setMediaUrls(mediaUrls.filter((u) => u !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0 && !codeSnippet.trim()) return;

    const success = await createPost({
      content,
      mediaUrls,
      codeSnippet: showCodeInput ? codeSnippet : undefined,
      codeLanguage: showCodeInput ? codeLanguage : undefined,
      tags,
      category,
    });

    if (success) {
      setContent("");
      setCodeSnippet("");
      setShowCodeInput(false);
      setMediaUrls([]);
      setTags(["#BuildInPublic"]);
    }
  };

  const myAvatar =
    currentUser?.image ||
    currentUser?.avatarUrl ||
    (currentUser?.githubUsername
      ? `https://github.com/${currentUser.githubUsername}.png`
      : undefined);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header Author info */}
      <div className="flex items-start gap-3">
        <Avatar
          src={myAvatar}
          fallback={currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "ME"}
          size="md"
          className="w-10 h-10 sm:w-11 sm:h-11 border border-[#E2E8F0] shrink-0 mt-1"
        />
        <div className="flex-1 min-w-0">
          <textarea
            placeholder="Bagikan progres ngoding, showcase UI, arsitektur kode, atau ide proyek..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full text-xs sm:text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-[#0F172A] placeholder:text-slate-400 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Code Snippet Input Box (Expandable) */}
      {showCodeInput && (
        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-3 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#FF5733]" />
              <span className="text-[11px] font-mono uppercase font-bold text-slate-200">
                Cuplikan Kode
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="px-2 py-1 text-[11px] font-mono bg-slate-800 text-slate-200 border border-slate-700 rounded-md focus:outline-none"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setShowCodeInput(false);
                  setCodeSnippet("");
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            placeholder="// Paste atau tulis kode kamu di sini..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            rows={4}
            className="w-full p-2 text-xs font-mono bg-slate-900/80 text-emerald-400 border border-slate-800 rounded-lg focus:outline-none focus:border-[#FF5733] resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Media Upload Previews */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {mediaUrls.map((url, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden border border-[#E2E8F0] group aspect-video bg-slate-100">
              <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveMedia(url)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black opacity-90 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Categories & Tags Bar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E2E8F0]">
        {POST_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setCategory(cat.value);
                if (!tags.includes(`#${cat.label.replace(/\s+/g, "")}`)) {
                  setTags([...tags, `#${cat.label.replace(/\s+/g, "")}`]);
                }
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                isActive
                  ? "bg-[#0F172A] text-white shadow-xs"
                  : "bg-slate-100 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200"
              }`}
            >
              <Icon className="w-3 h-3 text-[#FF5733]" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tags List */}
      <div className="flex flex-wrap items-center gap-1 text-[11px]">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF1EE] text-[#FF5733] font-bold"
          >
            <span>{t}</span>
            <button type="button" onClick={() => handleRemoveTag(t)}>
              <X className="w-3 h-3 hover:text-red-700" />
            </button>
          </span>
        ))}

        <div className="inline-flex items-center gap-1 bg-slate-50 border border-[#E2E8F0] rounded-md px-2 py-0.5">
          <Tag className="w-3 h-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tambah #tag..."
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="w-20 text-[11px] bg-transparent border-0 focus:outline-none text-[#0F172A] placeholder:text-slate-400"
          />
          <button type="button" onClick={handleAddTag} className="text-slate-400 hover:text-[#FF5733]">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Actions Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          {/* Screenshot UI Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-[#FF5733] text-xs font-semibold text-[#475569] hover:text-[#0F172A] flex items-center gap-1.5 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#FF5733]" />
            <span className="hidden sm:inline">
              {isUploading ? "Mengunggah..." : "Gambar / Screenshot"}
            </span>
          </button>

          {/* Add Code Block Button */}
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showCodeInput
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "border-[#E2E8F0] text-[#475569] hover:border-[#FF5733] hover:text-[#0F172A]"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#FF5733]" />
            <span className="hidden sm:inline">Snippet Kode</span>
          </button>
        </div>

        {/* Publish Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && mediaUrls.length === 0 && !codeSnippet.trim())}
          className="px-5 py-2 rounded-full bg-[#FF5733] hover:bg-[#D9411E] text-white text-xs font-bold shadow-sm shadow-[#FF5733]/30 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "Membagikan..." : "Posting Karya 🚀"}</span>
        </button>
      </div>
    </div>
  );
}
