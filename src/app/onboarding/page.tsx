"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import {
  Flame,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Palette,
  Layers,
  Server,
  Layout,
  Bot,
  Smartphone,
  Cloud,
  Clock,
  Calendar,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPECIALTY_OPTIONS = [
  {
    id: "uiux",
    label: "Spesialis UI/UX",
    title: "Spesialis UI/UX & Product Design",
    description: "Figma, design systems, wireframing, dan visual taste modern.",
    icon: Palette,
    accent: "border-pink-500/30 text-pink-600 bg-pink-500/10",
  },
  {
    id: "fullstack",
    label: "Fullstack Engineer",
    title: "Senior Fullstack Engineer",
    description: "Ujung ke ujung: dari UI Next.js/React sampai PostgreSQL & API.",
    icon: Layers,
    accent: "border-devora-brand/30 text-devora-brand bg-devora-brand/10",
  },
  {
    id: "frontend",
    label: "Frontend Specialist",
    title: "Frontend Engineer & Design Systems",
    description: "Komponen modern, responsif, animasi halus, dan arsitektur UI.",
    icon: Layout,
    accent: "border-blue-500/30 text-blue-600 bg-blue-500/10",
  },
  {
    id: "backend",
    label: "Backend Architect",
    title: "Backend & Systems Architect",
    description: "Database relasional, query indexing, microservices, dan caching.",
    icon: Server,
    accent: "border-amber-500/30 text-amber-600 bg-amber-500/10",
  },
  {
    id: "ai",
    label: "AI / LLM Specialist",
    title: "AI & Agent Systems Specialist",
    description: "RAG pipeline, prompt engineering, agentic tools, dan LLM API.",
    icon: Bot,
    accent: "border-purple-500/30 text-purple-600 bg-purple-500/10",
  },
  {
    id: "mobile",
    label: "Mobile Developer",
    title: "Mobile App Engineer",
    description: "Aplikasi cross-platform iOS & Android dengan performa native.",
    icon: Smartphone,
    accent: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  },
  {
    id: "devops",
    label: "DevOps & Cloud",
    title: "DevOps & Cloud Infrastructure",
    description: "Docker container, CI/CD pipeline, Kubernetes, dan cloud deployment.",
    icon: Cloud,
    accent: "border-cyan-500/30 text-cyan-600 bg-cyan-500/10",
  },
];

const WORK_STYLES = [
  {
    id: "async",
    title: "Async-First",
    desc: "Santai lewat GitHub Pull Request, Discord, atau Slack tanpa perlu meeting terus-menerus.",
  },
  {
    id: "evening",
    title: "Malam Hari (Weekday Evenings)",
    desc: "Ngoding produktif setelah jam kantor atau kuliah di hari kerja.",
  },
  {
    id: "weekend",
    title: "Akhir Pekan (Weekend Sprints)",
    desc: "Fokus sprint bikin produk di hari Sabtu & Minggu.",
  },
  {
    id: "flexible",
    title: "Fleksibel / Sesuai Kesepakatan Tim",
    desc: "Bisa adaptasi waktu ngoding bareng partner sesuai kebutuhan proyek.",
  },
];

const COLLAB_GOALS = [
  "Bikin SaaS MVP",
  "Developer Tooling",
  "Karya Open Source",
  "Aplikasi Mobile",
  "AI Agents & Otomasi",
  "Belajar Bareng & Portfolio",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, updateProfileApi } = useUserStore();
  const { addToast } = useUiStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [specialtyTitle, setSpecialtyTitle] = useState(
    currentUser.title || "Spesialis UI/UX & Product Design"
  );
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("uiux");
  const [availabilityHrs, setAvailabilityHrs] = useState<number>(currentUser.availabilityHrs || 8);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string>(
    currentUser.workStyle || WORK_STYLES[0].title
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    currentUser.goals && currentUser.goals.length > 0
      ? currentUser.goals
      : ["Bikin SaaS MVP", "Developer Tooling"]
  );

  const handleSelectSpecialty = (spec: typeof SPECIALTY_OPTIONS[0]) => {
    setSelectedSpecialtyId(spec.id);
    setSpecialtyTitle(spec.title);
  };

  const handleToggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    const success = await updateProfileApi({
      title: specialtyTitle.trim(),
      workStyle: selectedWorkStyle,
      goals: selectedGoals,
      availabilityHrs,
      onboarded: true,
    });

    setIsSubmitting(false);

    if (success) {
      addToast({
        title: "Personalisasi Profil Selesai!",
        description: `Profil kamu sebagai "${specialtyTitle}" sudah aktif. Yuk mulai cari partner cocok!`,
        type: "success",
      });
      router.push("/find-partner");
    } else {
      addToast({
        title: "Gagal Menyimpan Profil",
        description: "Terjadi kendala saat menyimpan. Silakan coba lagi.",
        type: "error",
      });
    }
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
        {/* Step Progress Tracker */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-devora-surface border border-devora-border text-xs font-mono font-bold text-devora-brand">
            <Sparkles className="w-3.5 h-3.5 fill-devora-brand" />
            <span>Personalisasi Profil Builder • Langkah {step} dari 3</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-devora-ink tracking-tight">
            {step === 1 && "Tentukan Spesialisasi & Peran Utama Kamu"}
            {step === 2 && "Atur Waktu Luang & Gaya Ngoding"}
            {step === 3 && "Profil Kamu Siap! Ayo Mulai Kolaborasi"}
          </h1>

          <p className="text-xs sm:text-sm text-devora-muted max-w-lg mx-auto">
            {step === 1 && "Pilih spesialisasi yang paling mewakili kamu saat membangun produk bersama developer lain."}
            {step === 2 && "Tentukan jam luang dan ritme kerja biar kamu cuma dicocokkan sama partner yang sefrekuensi."}
            {step === 3 && "Periksa ringkasan profil kamu sebelum masuk ke arena pencarian partner impian."}
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mx-auto h-1.5 bg-devora-surface-strong rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-devora-brand transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Spesialisasi & Headline Role */}
        {step === 1 && (
          <Card elevated className="p-5 sm:p-7 bg-devora-surface border-2 border-devora-border space-y-5 shadow-lg">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase font-bold text-devora-muted">
                Pilih Dari Rekomendasi Spesialisasi:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPECIALTY_OPTIONS.map((spec) => {
                const Icon = spec.icon;
                const isSelected = selectedSpecialtyId === spec.id;
                return (
                  <button
                    type="button"
                    key={spec.id}
                    onClick={() => handleSelectSpecialty(spec)}
                    className={cn(
                      "p-3.5 rounded-container border-2 text-left transition-all flex items-start gap-3 relative group",
                      isSelected
                        ? "bg-devora-background border-devora-brand ring-2 ring-devora-brand/20 shadow-md"
                        : "bg-devora-background/60 border-devora-border hover:border-devora-border-strong hover:bg-devora-background"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-button flex items-center justify-center shrink-0 border",
                        spec.accent
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-devora-ink">{spec.label}</h3>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-devora-brand shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-devora-muted leading-snug">
                        {spec.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Specialty Input */}
            <div className="space-y-2 pt-3 border-t border-devora-border">
              <label className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                <span>Sesuaikan Teks Headline Role Kamu:</span>
              </label>
              <input
                type="text"
                value={specialtyTitle}
                onChange={(e) => setSpecialtyTitle(e.target.value)}
                placeholder="Contoh: Spesialis UI/UX & Product Design, Senior Fullstack Engineer..."
                className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-sm text-devora-ink font-bold focus:outline-none focus:border-devora-brand"
                required
              />
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-end pt-3">
              <Button
                size="md"
                onClick={() => setStep(2)}
                className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md"
              >
                <span>Lanjut: Waktu & Gaya Ngoding</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Waktu Luang & Gaya Ngoding */}
        {step === 2 && (
          <Card elevated className="p-5 sm:p-7 bg-devora-surface border-2 border-devora-border space-y-5 shadow-lg">
            {/* Hours per week */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Waktu Santai per Minggu:</span>
                </label>
                <span className="text-sm font-extrabold text-devora-brand">
                  {availabilityHrs} Jam / Minggu
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { hrs: 5, label: "5 Jam (Santai)" },
                  { hrs: 8, label: "8 Jam (Stabil)" },
                  { hrs: 12, label: "12 Jam (Aktif)" },
                  { hrs: 20, label: "20+ Jam (Intensif)" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.hrs}
                    onClick={() => setAvailabilityHrs(item.hrs)}
                    className={cn(
                      "py-2.5 px-3 rounded-button text-xs font-bold border transition-all text-center",
                      availabilityHrs === item.hrs
                        ? "bg-devora-brand text-white border-devora-brand shadow-xs"
                        : "bg-devora-background text-devora-muted border-devora-border hover:text-devora-ink"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Style selection */}
            <div className="space-y-2 pt-3 border-t border-devora-border">
              <label className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-devora-brand" />
                <span>Pilih Gaya & Waktu Kolaborasi Paling Asik:</span>
              </label>
              <div className="space-y-2">
                {WORK_STYLES.map((style) => {
                  const isSelected = selectedWorkStyle === style.title;
                  return (
                    <label
                      key={style.id}
                      className={cn(
                        "p-3 rounded-button border flex items-start gap-3 cursor-pointer transition-all",
                        isSelected
                          ? "bg-devora-brand-soft/70 border-devora-brand text-devora-brand-dark font-bold shadow-xs"
                          : "bg-devora-background border-devora-border text-devora-ink hover:border-devora-brand"
                      )}
                    >
                      <input
                        type="radio"
                        name="workStyleOption"
                        checked={isSelected}
                        onChange={() => setSelectedWorkStyle(style.title)}
                        className="mt-0.5 accent-devora-brand"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block">{style.title}</span>
                        <p className="text-[11px] text-devora-muted font-normal leading-snug">
                          {style.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Target Goals */}
            <div className="space-y-2 pt-3 border-t border-devora-border">
              <label className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-devora-brand" />
                <span>Tujuan Proyek yang Paling Bikin Kamu Excited:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COLLAB_GOALS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      type="button"
                      key={goal}
                      onClick={() => handleToggleGoal(goal)}
                      className={cn(
                        "px-3 py-1.5 rounded-button text-xs font-semibold border transition-all",
                        isSelected
                          ? "bg-devora-brand text-white border-devora-brand shadow-xs font-bold"
                          : "bg-devora-background text-devora-muted border-devora-border hover:text-devora-ink"
                      )}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-devora-border">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </Button>
              <Button
                size="md"
                onClick={() => setStep(3)}
                className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-md"
              >
                <span>Lihat Ringkasan Profil</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: Ringkasan & Siap Match */}
        {step === 3 && (
          <Card elevated className="p-6 sm:p-8 bg-devora-surface border-2 border-devora-border space-y-6 shadow-xl text-center">
            <div className="w-14 h-14 rounded-full bg-devora-brand/10 border-2 border-devora-brand text-devora-brand flex items-center justify-center mx-auto shadow-md">
              <Flame className="w-8 h-8 fill-devora-brand" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase font-bold text-devora-brand tracking-wider">
                Profil Builder Siap 100%
              </span>
              <h2 className="text-2xl font-extrabold text-devora-ink">
                Keren, {currentUser.name}! Profil Kamu Sudah Lengkap
              </h2>
              <p className="text-xs sm:text-sm text-devora-muted max-w-md mx-auto">
                Berikut adalah kartu profil kamu yang akan dilihat oleh calon partner ngoding di arena swipe:
              </p>
            </div>

            {/* Preview Card */}
            <div className="max-w-md mx-auto p-4 sm:p-5 bg-devora-background rounded-container border-2 border-devora-brand/40 shadow-lg text-left space-y-3.5">
              <div className="flex items-center gap-3 border-b border-devora-border pb-3">
                <Avatar
                  src={
                    currentUser.image ||
                    currentUser.avatarUrl ||
                    (currentUser.githubUsername
                      ? `https://github.com/${currentUser.githubUsername}.png`
                      : undefined)
                  }
                  fallback={
                    currentUser.name
                      ? currentUser.name.slice(0, 2).toUpperCase()
                      : "DV"
                  }
                  size="md"
                  className="border border-devora-border"
                />
                <div className="space-y-0.5 flex-1">
                  <h3 className="text-base font-bold text-devora-ink">
                    {currentUser.name || "Nama Kamu"}
                  </h3>
                  <p className="text-xs font-semibold text-devora-brand">{specialtyTitle}</p>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] font-bold">
                  ● Siap Match
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-devora-surface border border-devora-border space-y-0.5">
                  <span className="text-[10px] font-mono text-devora-muted uppercase font-bold">Komitmen</span>
                  <span className="block font-bold text-devora-ink">{availabilityHrs} jam/minggu</span>
                </div>
                <div className="p-2 rounded bg-devora-surface border border-devora-border space-y-0.5">
                  <span className="text-[10px] font-mono text-devora-muted uppercase font-bold">Gaya Ngoding</span>
                  <span className="block font-bold text-devora-ink truncate">{selectedWorkStyle}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ubah Data</span>
              </Button>
              <Button
                size="lg"
                onClick={handleFinishOnboarding}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-lg"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>
                  {isSubmitting ? "Menyimpan Profil..." : "Simpan & Mulai Cari Partner Sekarang"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Shell>
  );
}
