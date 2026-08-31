"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/store/useProjectStore";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { ProjectStage, ProjectRole } from "@/store/types";
import {
  FolderPlus,
  Plus,
  Trash2,
  Send,
  ArrowRight,
  Code2,
  Clock,
  Layers,
  CheckCircle2,
  ArrowLeft,
  Palette,
  Server,
  Layout,
  Bot,
  Smartphone,
  Cloud,
} from "lucide-react";

interface RoleDraft {
  id: string;
  roleTitle: string;
  requiredSkills: string[];
  hoursPerWeek: number;
}

const PRESET_ROLES = [
  { title: "UI/UX Designer", defaultSkills: ["Figma", "Design Systems", "Tailwind CSS"], defaultHours: 6, icon: Palette },
  { title: "Backend Developer", defaultSkills: ["Node.js", "PostgreSQL", "Prisma", "Redis"], defaultHours: 8, icon: Server },
  { title: "Frontend Engineer", defaultSkills: ["Next.js", "React 19", "TypeScript", "Tailwind"], defaultHours: 8, icon: Layout },
  { title: "AI / LLM Specialist", defaultSkills: ["Python", "OpenAI API", "LangChain", "Vector DB"], defaultHours: 10, icon: Bot },
  { title: "Mobile Developer", defaultSkills: ["React Native", "Expo", "TypeScript"], defaultHours: 8, icon: Smartphone },
  { title: "DevOps & Cloud Engineer", defaultSkills: ["Docker", "Kubernetes", "AWS", "CI/CD"], defaultHours: 6, icon: Cloud },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { createProjectAsync } = useProjectStore();
  const { currentUser } = useUserStore();
  const { addToast } = useUiStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<ProjectStage>("MVP");
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [roles, setRoles] = useState<RoleDraft[]>([
    {
      id: "role-init-1",
      roleTitle: "UI/UX Designer",
      requiredSkills: ["Figma", "Design Systems", "Tailwind CSS"],
      hoursPerWeek: 6,
    },
    {
      id: "role-init-2",
      roleTitle: "Backend Developer",
      requiredSkills: ["Node.js", "PostgreSQL", "Redis"],
      hoursPerWeek: 8,
    },
  ]);

  const [newSkillInputs, setNewSkillInputs] = useState<{ [roleId: string]: string }>({});

  const handleAddPresetRole = (preset: typeof PRESET_ROLES[0]) => {
    if (roles.some((r) => r.roleTitle.toLowerCase() === preset.title.toLowerCase())) {
      addToast({
        title: "Role Sudah Ada",
        description: `${preset.title} sudah ada di daftar kebutuhan partner kamu.`,
        type: "info",
      });
      return;
    }

    setRoles([
      ...roles,
      {
        id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        roleTitle: preset.title,
        requiredSkills: [...preset.defaultSkills],
        hoursPerWeek: preset.defaultHours,
      },
    ]);
  };

  const handleAddCustomRole = () => {
    if (!customRoleInput.trim()) return;
    setRoles([
      ...roles,
      {
        id: `role-${Date.now()}`,
        roleTitle: customRoleInput.trim(),
        requiredSkills: ["TypeScript"],
        hoursPerWeek: 8,
      },
    ]);
    setCustomRoleInput("");
  };

  const handleRemoveRole = (roleId: string) => {
    setRoles(roles.filter((r) => r.id !== roleId));
  };

  const handleAddSkillToRole = (roleId: string) => {
    const inputVal = (newSkillInputs[roleId] || "").trim();
    if (!inputVal) return;

    setRoles(
      roles.map((r) => {
        if (r.id === roleId && !r.requiredSkills.includes(inputVal)) {
          return { ...r, requiredSkills: [...r.requiredSkills, inputVal] };
        }
        return r;
      })
    );
    setNewSkillInputs({ ...newSkillInputs, [roleId]: "" });
  };

  const handleRemoveSkillFromRole = (roleId: string, skillToRemove: string) => {
    setRoles(
      roles.map((r) => {
        if (r.id === roleId) {
          return {
            ...r,
            requiredSkills: r.requiredSkills.filter((s) => s !== skillToRemove),
          };
        }
        return r;
      })
    );
  };

  const handleUpdateRoleHours = (roleId: string, hours: number) => {
    setRoles(
      roles.map((r) => (r.id === roleId ? { ...r, hoursPerWeek: hours } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast({
        title: "Judul Proyek Masih Kosong",
        description: "Beri nama proyek keren kamu dulu ya!",
        type: "error",
      });
      return;
    }

    if (!description.trim()) {
      addToast({
        title: "Deskripsi Masih Kosong",
        description: "Ceritakan sedikit tentang apa yang mau kamu bangun.",
        type: "error",
      });
      return;
    }

    if (roles.length === 0) {
      addToast({
        title: "Pilih Kebutuhan Partner",
        description: "Tambahkan minimal 1 role partner yang kamu cari (misal: UI/UX atau Backend).",
        type: "error",
      });
      return;
    }

    const formattedRoles: ProjectRole[] = roles.map((r) => ({
      id: r.id,
      roleTitle: r.roleTitle,
      requiredSkills: r.requiredSkills,
      hoursPerWeek: r.hoursPerWeek,
      responsibilityLevel: "CORE_BUILDER",
      urgency: "IMMEDIATE",
    }));

    setIsSubmitting(true);
    try {
      await createProjectAsync({
        ownerId: currentUser.id,
        ownerName: currentUser.name || "Developer",
        title: title.trim(),
        description: description.trim(),
        stage,
        roles: formattedRoles,
        tags: Array.from(
          new Set([
            stage,
            ...roles.map((r) => r.roleTitle),
            ...roles.flatMap((r) => r.requiredSkills).slice(0, 3),
          ])
        ),
        roadmap: [
          {
            id: `m-${Date.now()}-1`,
            title: "MVP Kickoff & Partner Sync",
            targetQuarter: "Q3 2026",
            status: "IN_PROGRESS",
          },
        ],
      });

      addToast({
        title: "Proyek Berhasil Diposting",
        description: `"${title}" sudah tersimpan dan live di papan proyek. Yuk temukan partner yang cocok!`,
        type: "success",
      });

      router.push("/projects");
    } catch (err: any) {
      addToast({
        title: "Gagal Memposting Proyek",
        description: err.message || "Terjadi kendala saat menyimpan proyek ke database.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-devora-border pb-4">
          <div className="space-y-1">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-xs text-devora-muted hover:text-devora-ink font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Papan Proyek</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-devora-ink tracking-tight">
              Posting Proyek Baru
            </h1>
            <p className="text-xs sm:text-sm text-devora-muted">
              Ceritain ide atau produk kamu dan tentukan partner apa saja yang kamu butuhin buat kolaborasi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Project Details */}
          <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
            <div className="flex items-center gap-2 border-b border-devora-border pb-3">
              <div className="w-7 h-7 rounded-button bg-devora-brand/10 text-devora-brand flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-base font-bold text-devora-ink">
                Tentang Proyek Kamu
              </h2>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                Nama Proyek <span className="text-devora-brand">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Devora, FlowQuery, Safha AI..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-sm text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                Deskripsi Singkat <span className="text-devora-brand">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ceritakan apa yang lagi kamu bangun, solusi apa yang ditawarkan, dan visi kolaborasi yang kamu harapkan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-sm text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand resize-none"
                required
              />
            </div>

            {/* Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                Tahap Pengembangan Saat Ini
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["IDEATION", "PROTOTYPE", "MVP", "PRODUCTION"] as ProjectStage[]).map(
                  (stg) => (
                    <button
                      type="button"
                      key={stg}
                      onClick={() => setStage(stg)}
                      className={`py-2 px-3 rounded-button text-xs font-semibold border transition-all ${
                        stage === stg
                          ? "bg-devora-ink text-white border-devora-ink shadow-xs"
                          : "bg-devora-background text-devora-muted border-devora-border hover:text-devora-ink"
                      }`}
                    >
                      {stg}
                    </button>
                  )
                )}
              </div>
            </div>
          </Card>

          {/* Step 2: Partner Roles Needed */}
          <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
            <div className="flex items-center justify-between border-b border-devora-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-button bg-devora-brand/10 text-devora-brand flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-devora-ink">
                    Cari Partner (Kebutuhan Role)
                  </h2>
                  <p className="text-xs text-devora-muted">
                    Pilih posisi atau keahlian partner yang kamu butuhin buat bantu bangun proyek ini.
                  </p>
                </div>
              </div>
              <Badge variant="brand" className="text-xs font-bold px-2 py-0.5">
                {roles.length} Role Ditambahkan
              </Badge>
            </div>

            {/* Preset Quick Add Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase font-semibold text-devora-muted block">
                + Tambah Cepat Role Rekomendasi:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_ROLES.map((preset) => {
                  const isAdded = roles.some(
                    (r) => r.roleTitle.toLowerCase() === preset.title.toLowerCase()
                  );
                  const PresetIcon = preset.icon;
                  return (
                    <button
                      type="button"
                      key={preset.title}
                      onClick={() => handleAddPresetRole(preset)}
                      className={`px-3 py-1.5 rounded-button text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                        isAdded
                          ? "bg-devora-brand-soft/70 border-devora-brand/30 text-devora-brand-dark"
                          : "bg-devora-background border-devora-border text-devora-ink hover:border-devora-brand"
                      }`}
                    >
                      <PresetIcon className="w-3.5 h-3.5 text-devora-brand" />
                      <span>{preset.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Role Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Atau ketik nama role kustom (misal: Rust Developer, Growth Hacker)..."
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomRole();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddCustomRole}
                className="text-xs font-semibold"
              >
                + Tambah
              </Button>
            </div>

            {/* Roles List */}
            <div className="space-y-3 pt-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="p-4 bg-devora-background border border-devora-border rounded-container space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-devora-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-devora-ink">
                        {role.roleTitle}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role.id)}
                      className="p-1.5 text-devora-muted hover:text-red-500 rounded-button hover:bg-devora-surface transition-colors"
                      title="Hapus Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tech Stack for this Role */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-devora-muted font-medium block">
                      Tech Stack / Keahlian yang Dibutuhkan:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {role.requiredSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="default"
                          className="text-xs py-0.5 px-2 bg-devora-surface-strong text-devora-ink gap-1"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillFromRole(role.id, skill)}
                            className="hover:text-red-500 text-devora-muted ml-0.5"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}

                      {/* Add Skill tag input */}
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="+ Tambah skill..."
                          value={newSkillInputs[role.id] || ""}
                          onChange={(e) =>
                            setNewSkillInputs({
                              ...newSkillInputs,
                              [role.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSkillToRole(role.id);
                            }
                          }}
                          className="w-24 px-2 py-1 text-[11px] bg-devora-surface border border-devora-border rounded text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hours per week */}
                  <div className="flex items-center justify-between text-xs text-devora-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-devora-brand" />
                      Komitmen Waktu:
                    </span>
                    <div className="flex items-center gap-2">
                      {[5, 8, 12, 20].map((h) => (
                        <button
                          type="button"
                          key={h}
                          onClick={() => handleUpdateRoleHours(role.id, h)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            role.hoursPerWeek === h
                              ? "bg-devora-brand text-white border-devora-brand font-bold"
                              : "bg-devora-surface border-devora-border text-devora-muted"
                          }`}
                        >
                          {h}h/mgg
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/projects">
              <Button type="button" variant="secondary" size="md">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan ke Database..." : "Publikasikan Proyek Sekarang"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
