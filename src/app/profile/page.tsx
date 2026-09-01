"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { authClient } from "@/lib/auth-client";
import {
  ExperienceLevel,
  WorkPreference,
} from "@/store/types";
import {
  Clock,
  Save,
  GitBranch,
  ExternalLink,
  Target,
  LogOut,
  Palette,
  Layers,
  Server,
  Layout,
  Bot,
  Smartphone,
  Cloud,
  Sparkles,
  MapPin,
  Globe,
  Compass,
  Search,
  Code2,
  Plus,
  X,
  Briefcase,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Eye,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ProfilePageSkeleton } from "@/components/ui/ProfileSkeleton";
import { COMPLETE_INDONESIA_REGIONS, GeoLocationGroup } from "@/lib/geo-data";
import {
  calculateProfileCompleteness,
  formatExperienceLabel,
  formatWorkPreferenceLabel,
} from "@/lib/profile-utils";
import { cn } from "@/lib/utils";

const POPULAR_TECH_PRESETS = [
  {
    category: "Frontend & Web",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vue.js", "Svelte", "HTML/CSS"],
  },
  {
    category: "Backend & API",
    items: ["Node.js", "Go (Golang)", "Python", "FastAPI", "Express.js", "NestJS", "Rust", "Laravel", "Java"],
  },
  {
    category: "Database & Cache",
    items: ["PostgreSQL", "Supabase", "Redis", "Prisma", "MongoDB", "MySQL", "Firebase"],
  },
  {
    category: "Mobile & Desktop",
    items: ["React Native", "Flutter", "Swift (iOS)", "Kotlin (Android)", "Tauri", "Electron"],
  },
  {
    category: "AI, Agents & Data",
    items: ["OpenAI API", "LangChain", "PyTorch", "Ollama", "Vector DB (Pinecone/pgvector)"],
  },
  {
    category: "DevOps & Cloud",
    items: ["Docker", "Kubernetes", "AWS", "Vercel", "CI/CD", "Linux", "Cloudflare"],
  },
  {
    category: "Product & UI/UX",
    items: ["Figma", "UI/UX Design", "Design Systems", "Framer", "Product Strategy"],
  },
];

const SPECIALTY_PRESETS = [
  { label: "Spesialis UI/UX", title: "Spesialis UI/UX & Product Design", icon: Palette },
  { label: "Fullstack Engineer", title: "Senior Fullstack Engineer", icon: Layers },
  { label: "Frontend Specialist", title: "Senior Frontend Engineer & Design Systems", icon: Layout },
  { label: "Backend Architect", title: "Senior Backend & Systems Architect", icon: Server },
  { label: "AI / LLM Specialist", title: "AI Engineer & Agent Systems Specialist", icon: Bot },
  { label: "Mobile Developer", title: "Mobile App Engineer (React Native/iOS)", icon: Smartphone },
  { label: "DevOps / Cloud", title: "DevOps & Cloud Infrastructure Engineer", icon: Cloud },
];

const EXPERIENCE_LEVELS: {
  level: ExperienceLevel;
  title: string;
  subtitle: string;
  badgeColor: string;
}[] = [
  {
    level: "BEGINNER",
    title: "Pemula (Beginner)",
    subtitle: "Baru mulai belajar web dev atau membuat 1-2 proyek sederhana.",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    level: "JUNIOR",
    title: "Junior Developer",
    subtitle: "1-2 tahun pengalaman, menguasai HTML, CSS, JavaScript/TypeScript & React dasar.",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    level: "INTERMEDIATE",
    title: "Intermediate (Mid-Level)",
    subtitle: "2-4 tahun pengalaman, mandiri membangun aplikasi fullstack/frontend kompleks.",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  {
    level: "SENIOR",
    title: "Senior / Lead Developer",
    subtitle: "5+ tahun pengalaman, terbiasa merancang arsitektur sistem dan skalabilitas.",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
];

const WORK_PREFERENCES: {
  key: WorkPreference;
  title: string;
  desc: string;
  icon: any;
}[] = [
  {
    key: "REMOTE",
    title: "Remote (Jarak Jauh)",
    desc: "Kolaborasi 100% online via GitHub, Discord, Slack, & Google Meet.",
    icon: Globe,
  },
  {
    key: "HYBRID",
    title: "Hybrid (Remote & On-site)",
    desc: "Kerja online santai dan sesekali meetup ngoding jika domisili sama.",
    icon: MapPin,
  },
  {
    key: "ONSITE",
    title: "On-site (Bertemu Langsung)",
    desc: "Lebih suka ngoding dan diskusi bersama langsung di co-working/cafe.",
    icon: Compass,
  },
];

const DAYS_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const WORK_STYLES = [
  "Async-First (Santai lewat GitHub PR & Discord/Slack)",
  "Malam Hari (Weekday Evenings)",
  "Akhir Pekan (Weekend Sprints)",
  "Fleksibel / Sesuai Kesepakatan Tim",
];

const EXPERIENCE_YEAR_PRESETS = [
  { label: "Baru Mulai (0 thn)", value: 0 },
  { label: "6 Bulan (0.5 thn)", value: 0.5 },
  { label: "1 Tahun", value: 1 },
  { label: "2 Tahun", value: 2 },
  { label: "3 Tahun", value: 3 },
  { label: "5+ Tahun", value: 5 },
];

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateProfileApi, logout, isLoadingProfile, fetchProfile } = useUserStore();
  const { addToast } = useUiStore();

  const [activeTab, setActiveTab] = useState<"EDIT" | "PREVIEW">("EDIT");
  const [isSaving, setIsSaving] = useState(false);
  const [showChecklistDetails, setShowChecklistDetails] = useState(false);

  // Form State
  const [isInitialized, setIsInitialized] = useState(false);
  const [name, setName] = useState(currentUser.name || "");
  const [title, setTitle] = useState(currentUser.title || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [avatarUrlInput, setAvatarUrlInput] = useState(currentUser.image || currentUser.avatarUrl || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [timezone, setTimezone] = useState(currentUser.timezone || "");
  const [availabilityHrs, setAvailabilityHrs] = useState<number>(currentUser.availabilityHrs ?? 10);
  const [workStyle, setWorkStyle] = useState(currentUser.workStyle || WORK_STYLES[0]);
  const [flexibleHours, setFlexibleHours] = useState<boolean>(currentUser.flexibleHours ?? true);
  const [availableDays, setAvailableDays] = useState<string[]>(currentUser.availableDays || ["Sabtu", "Minggu"]);

  // Phase 1 Professional Fields
  const [experienceYears, setExperienceYears] = useState<string>(
    currentUser.experienceYears !== undefined && currentUser.experienceYears !== null
      ? String(currentUser.experienceYears)
      : ""
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">(
    (currentUser.experienceLevel as ExperienceLevel) || ""
  );
  const [workPreference, setWorkPreference] = useState<WorkPreference | "">(
    (currentUser.workPreference as WorkPreference) || "REMOTE"
  );
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser.portfolioUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser.linkedinUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(currentUser.websiteUrl || "");

  const [techStack, setTechStack] = useState<string[]>(
    currentUser.techStack?.length
      ? currentUser.techStack
      : currentUser.skills?.length
      ? currentUser.skills
      : ["Next.js", "TypeScript", "Tailwind CSS"]
  );
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Geo API & City Search
  const [geoGroups, setGeoGroups] = useState<GeoLocationGroup[]>(COMPLETE_INDONESIA_REGIONS);
  const [timezonesList, setTimezonesList] = useState<any[]>([]);
  const [citySearch, setCitySearch] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (currentUser.id && !isInitialized) {
      setName(currentUser.name || "");
      setTitle(currentUser.title || "");
      setBio(currentUser.bio || "");
      setAvatarUrlInput(currentUser.image || currentUser.avatarUrl || "");
      setLocation(currentUser.location || "");
      setTimezone(currentUser.timezone || "");
      setAvailabilityHrs(currentUser.availabilityHrs ?? 10);
      setWorkStyle(currentUser.workStyle || WORK_STYLES[0]);
      setFlexibleHours(currentUser.flexibleHours ?? true);
      setAvailableDays(currentUser.availableDays?.length ? currentUser.availableDays : ["Sabtu", "Minggu"]);
      setExperienceYears(
        currentUser.experienceYears !== undefined && currentUser.experienceYears !== null
          ? String(currentUser.experienceYears)
          : ""
      );
      setExperienceLevel((currentUser.experienceLevel as ExperienceLevel) || "");
      setWorkPreference((currentUser.workPreference as WorkPreference) || "REMOTE");
      setPortfolioUrl(currentUser.portfolioUrl || "");
      setLinkedinUrl(currentUser.linkedinUrl || "");
      setWebsiteUrl(currentUser.websiteUrl || "");
      setTechStack(
        currentUser.techStack?.length
          ? currentUser.techStack
          : currentUser.skills?.length
          ? currentUser.skills
          : ["Next.js", "TypeScript", "Tailwind CSS"]
      );
      setIsInitialized(true);
    }
  }, [currentUser, isInitialized]);

  useEffect(() => {
    async function loadGeoData() {
      try {
        const [locRes, tzRes] = await Promise.all([
          fetch("/api/geo/locations"),
          fetch("/api/geo/timezones"),
        ]);
        if (locRes.ok) {
          const locData = await locRes.json();
          if (locData.groups) setGeoGroups(locData.groups);
        }
        if (tzRes.ok) {
          const tzData = await tzRes.json();
          if (tzData.timezones) setTimezonesList(tzData.timezones);
        }
      } catch (err) {
        console.error("Failed to load geo data:", err);
      }
    }
    loadGeoData();
  }, []);

  // Real-time completeness calculation based on current form state
  const completeness = useMemo(() => {
    const parsedExp = experienceYears !== "" && !isNaN(Number(experienceYears)) ? Number(experienceYears) : undefined;
    return calculateProfileCompleteness({
      name,
      title,
      bio,
      image: avatarUrlInput,
      avatarUrl: avatarUrlInput,
      location,
      timezone,
      skills: techStack,
      techStack,
      availabilityHrs,
      workStyle,
      experienceYears: parsedExp,
      experienceLevel: experienceLevel || undefined,
      workPreference: workPreference || undefined,
      flexibleHours,
      availableDays,
      portfolioUrl,
      linkedinUrl,
      websiteUrl,
      githubUrl: currentUser.githubUrl,
      githubUsername: currentUser.githubUsername,
    });
  }, [
    name,
    title,
    bio,
    avatarUrlInput,
    location,
    timezone,
    techStack,
    availabilityHrs,
    workStyle,
    experienceYears,
    experienceLevel,
    workPreference,
    flexibleHours,
    availableDays,
    portfolioUrl,
    linkedinUrl,
    websiteUrl,
    currentUser.githubUrl,
    currentUser.githubUsername,
  ]);

  const handleToggleTech = (tech: string) => {
    if (techStack.includes(tech)) {
      setTechStack(techStack.filter((t) => t !== tech));
    } else {
      setTechStack([...techStack, tech]);
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleAddCustomTech = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
    }
    setCustomSkillInput("");
  };

  const handleToggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleAutoDetectTimezone = () => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let matchedTz = "Asia/Jakarta (UTC+7)";
      let suggestedCity = "Jakarta";

      if (
        userTz.includes("Makassar") ||
        userTz.includes("Ujung_Pandang") ||
        userTz.includes("Bali")
      ) {
        matchedTz = "Asia/Makassar (UTC+8)";
        suggestedCity = "Bali / Denpasar";
      } else if (userTz.includes("Jayapura")) {
        matchedTz = "Asia/Jayapura (UTC+9)";
        suggestedCity = "Jayapura";
      } else if (userTz.includes("Singapore")) {
        matchedTz = "Asia/Singapore (UTC+8)";
        suggestedCity = "Singapore";
      } else if (userTz.includes("Tokyo")) {
        matchedTz = "Asia/Tokyo (UTC+9)";
        suggestedCity = "Tokyo, Japan";
      }

      setTimezone(matchedTz);
      if (!location) setLocation(suggestedCity);

      addToast({
        title: "Zona Waktu Terdeteksi",
        description: `Browser mendeteksi zona waktu: ${matchedTz}`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Info",
        description: "Silakan pilih zona waktu dari daftar.",
        type: "info",
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast({
        title: "Nama Wajib Diisi",
        description: "Mohon masukkan nama lengkap atau nama panggilan kamu.",
        type: "error",
      });
      return;
    }

    let parsedExp: number | undefined = undefined;
    if (experienceYears !== "") {
      const num = Number(experienceYears);
      if (isNaN(num) || num < 0 || num > 70) {
        addToast({
          title: "Format Pengalaman Tidak Valid",
          description: "Pengalaman Web Developer harus berupa angka positif (contoh: 0, 1, 2.5).",
          type: "error",
        });
        return;
      }
      parsedExp = num;
    }

    setIsSaving(true);

    const success = await updateProfileApi({
      name: name.trim(),
      title: title.trim(),
      bio: bio.trim(),
      image: avatarUrlInput ? avatarUrlInput.trim() : undefined,
      avatarUrl: avatarUrlInput ? avatarUrlInput.trim() : undefined,
      location: location.trim(),
      timezone: timezone.trim(),
      availabilityHrs,
      workStyle,
      flexibleHours,
      availableDays,
      experienceYears: parsedExp,
      experienceLevel: experienceLevel || undefined,
      workPreference: workPreference || undefined,
      portfolioUrl: portfolioUrl ? portfolioUrl.trim() : "",
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : "",
      websiteUrl: websiteUrl ? websiteUrl.trim() : "",
      techStack,
      skills: techStack,
    });

    setIsSaving(false);

    if (success) {
      addToast({
        title: "Profil Berhasil Disimpan",
        description: "Seluruh data profil profesional kamu sudah berhasil diperbarui!",
        type: "success",
      });
    } else {
      addToast({
        title: "Gagal Menyimpan",
        description: "Terjadi kendala saat menyimpan perubahan. Silakan periksa kembali.",
        type: "error",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            logout();
            addToast({
              title: "Berhasil Keluar",
              description: "Kamu telah keluar dari akun Devora.",
              type: "info",
            });
            router.push("/signin");
          },
        },
      });
    } catch {
      logout();
      router.push("/signin");
    }
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header with Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-devora-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-devora-brand" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-devora-muted">
                Pengaturan Profil Developer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-devora-ink tracking-tight">
              Profil Profesional Developer
            </h1>
            <p className="text-xs sm:text-sm text-devora-muted">
              Lengkapi informasi pengalaman, keahlian, dan ketersediaan waktu kamu agar matching partner berjalan akurat.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-devora-surface border border-devora-border rounded-button">
            <button
              type="button"
              onClick={() => setActiveTab("EDIT")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-bold transition-all",
                activeTab === "EDIT"
                  ? "bg-devora-ink text-white shadow-xs"
                  : "text-devora-muted hover:text-devora-ink"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PREVIEW")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-bold transition-all",
                activeTab === "PREVIEW"
                  ? "bg-devora-ink text-white shadow-xs"
                  : "text-devora-muted hover:text-devora-ink"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Publik</span>
            </button>
          </div>
        </div>

        {/* PROFILE COMPLETENESS WIDGET (Always visible) */}
        <Card className="p-4 sm:p-5 bg-devora-surface border-2 border-devora-border shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-devora-surface-strong stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={cn(
                      "stroke-current transition-all duration-500",
                      completeness.score >= 80
                        ? "text-emerald-500"
                        : completeness.score >= 50
                        ? "text-amber-500"
                        : "text-devora-brand"
                    )}
                    strokeDasharray={`${completeness.score}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-devora-ink">
                  {completeness.score}%
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-devora-ink">
                    Kelengkapan Profil
                  </h3>
                  {completeness.isMatchReady ? (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold gap-1 py-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Siap Matching</span>
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold gap-1 py-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>Belum Lengkap</span>
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-devora-muted">
                  {completeness.completedCount} dari {completeness.totalCount} item profil telah terisi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowChecklistDetails(!showChecklistDetails)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-devora-brand hover:text-devora-brand-dark self-start sm:self-center"
            >
              <span>{showChecklistDetails ? "Sembunyikan Checklist" : "Lihat Checklist Lengkap"}</span>
              {showChecklistDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Next Suggested Action Hint */}
          {completeness.nextSuggestedAction && (
            <div className="p-2.5 bg-devora-surface-strong/80 rounded-button border border-devora-border flex items-start gap-2 text-xs text-devora-ink">
              <Zap className="w-3.5 h-3.5 text-devora-brand shrink-0 mt-0.5" />
              <span>{completeness.nextSuggestedAction}</span>
            </div>
          )}

          {/* Expandable Checklist Details */}
          {showChecklistDetails && (
            <div className="pt-3 border-t border-devora-border/70 space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completeness.items.map((item) => (
                  <div
                    key={item.key}
                    className={cn(
                      "p-2 rounded-button border text-xs flex items-start gap-2",
                      item.isCompleted
                        ? "bg-emerald-500/5 border-emerald-500/20 text-devora-ink"
                        : item.category === "REQUIRED"
                        ? "bg-amber-500/5 border-amber-500/30 text-devora-ink"
                        : "bg-devora-surface border-devora-border text-devora-muted"
                    )}
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-devora-muted/60" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("font-bold text-[11px] truncate", item.isCompleted && "line-through text-devora-muted")}>
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono px-1 rounded bg-devora-surface-strong text-devora-muted shrink-0">
                          {item.category === "REQUIRED" ? "Wajib" : item.category === "RECOMMENDED" ? "Dianjurkan" : "Opsional"}
                        </span>
                      </div>
                      {!item.isCompleted && (
                        <p className="text-[10px] text-devora-muted leading-tight line-clamp-1">
                          {item.hint}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {isLoadingProfile && !currentUser.id ? (
          <ProfilePageSkeleton />
        ) : activeTab === "PREVIEW" ? (
          /* ================================================================
             VIEW MODE: LIVE PUBLIC PROFILE PREVIEW
             ================================================================ */
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-3 bg-devora-surface-strong/60 rounded-button border border-devora-border flex items-center justify-between text-xs text-devora-muted">
              <span>Ini adalah pratinjau kartu profilmu yang akan dilihat calon partner.</span>
              <Button size="sm" variant="secondary" onClick={() => setActiveTab("EDIT")} className="text-xs gap-1">
                <Edit3 className="w-3 h-3" />
                <span>Ubah Data</span>
              </Button>
            </div>

            {/* Profile Hero Card */}
            <Card className="p-6 bg-devora-surface border-2 border-devora-border rounded-container shadow-md space-y-5">
              {/* Header: Avatar, Name, Title, Experience Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-devora-border pb-5">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={avatarUrlInput || undefined}
                    fallback={(name || "DV").slice(0, 2).toUpperCase()}
                    size="lg"
                    className="border-2 border-devora-brand shadow-sm shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-devora-ink">
                        {name || "Nama Belum Diisi"}
                      </h2>
                      {experienceLevel && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-devora-brand/10 text-devora-brand-dark border border-devora-brand/20">
                          {formatExperienceLabel(
                            experienceYears !== "" ? Number(experienceYears) : null,
                            experienceLevel
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-devora-brand-dark">
                      {title || "Web Developer & Builder"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-devora-muted pt-0.5 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-devora-brand" />
                        {location || "Indonesia"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-devora-brand" />
                        {availabilityHrs} jam/minggu ({flexibleHours ? "Fleksibel" : "Jadwal Tetap"})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-devora-brand" />
                        {formatWorkPreferenceLabel(workPreference)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {bio && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-devora-muted">
                    Tentang Saya:
                  </span>
                  <p className="text-xs sm:text-sm text-devora-ink leading-relaxed italic bg-devora-background/60 p-3 rounded-button border border-devora-border/60">
                    &ldquo;{bio}&rdquo;
                  </p>
                </div>
              )}

              {/* Tech Stack */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-devora-muted block">
                  Tech Stack & Keahlian Utama:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="default"
                      className="text-xs py-1 px-2.5 bg-devora-surface-strong text-devora-ink font-semibold border border-devora-border"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Availability & Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-devora-muted">
                    Gaya & Jadwal Kerja:
                  </span>
                  <p className="font-bold text-devora-ink">{workStyle}</p>
                  <p className="text-devora-muted text-[11px]">
                    Hari aktif: {availableDays.length > 0 ? availableDays.join(", ") : "Fleksibel"}
                  </p>
                </div>

                <div className="p-3 bg-devora-background border border-devora-border rounded-button space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-devora-muted">
                    Zona Waktu:
                  </span>
                  <p className="font-bold text-devora-ink">{timezone || "Asia/Jakarta (UTC+7)"}</p>
                  <p className="text-devora-muted text-[11px]">
                    Preferensi: {formatWorkPreferenceLabel(workPreference)}
                  </p>
                </div>
              </div>

              {/* Links */}
              <div className="pt-3 border-t border-devora-border flex flex-wrap items-center gap-3">
                {portfolioUrl && (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-devora-brand hover:underline"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Portofolio</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {currentUser.githubUsername && (
                  <a
                    href={currentUser.githubUrl || `https://github.com/${currentUser.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-devora-ink hover:text-devora-brand"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>GitHub (@{currentUser.githubUsername})</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-devora-muted hover:text-devora-ink"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </Card>
          </div>
        ) : (
          /* ================================================================
             EDIT MODE: FULL PROFESSIONAL DEVELOPER FORM
             ================================================================ */
          <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-200">
            {/* -------------------------------------------------------------
                SECTION 1: IDENTITAS (Identity)
                ------------------------------------------------------------- */}
            <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
              <div className="flex items-center justify-between border-b border-devora-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-base font-bold text-devora-ink">
                    Identitas Profil Developer
                  </h2>
                </div>
                <span className="text-[11px] text-devora-muted font-mono">Bagian Wajib & Foto</span>
              </div>

              {/* Avatar Preview & URL Input */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 bg-devora-surface-strong/60 rounded-container border border-devora-border">
                <Avatar
                  src={avatarUrlInput || undefined}
                  fallback={(name || "DV").slice(0, 2).toUpperCase()}
                  size="lg"
                  className="border-2 border-devora-border shadow-xs shrink-0 mx-auto sm:mx-0"
                />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted block">
                    URL Foto Profil / Avatar
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... atau https://github.com/username.png"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand"
                  />
                  {currentUser.githubUsername && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrlInput(`https://github.com/${currentUser.githubUsername}.png`)}
                      className="text-[11px] text-devora-brand font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Gunakan foto GitHub (@{currentUser.githubUsername})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Nama Lengkap <span className="text-devora-brand">*</span>
                  </label>
                  <span className="text-[10px] text-devora-muted">Wajib diisi</span>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: Acelino Kurniawan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-sm text-devora-ink font-semibold focus:outline-none focus:border-devora-brand"
                  required
                />
              </div>

              {/* Headline / Title */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Headline / Posisi Andalan</span>
                  </label>
                  <span className="text-[11px] text-devora-muted font-medium">
                    Pilih preset atau ketik manual
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Contoh: Senior Frontend Engineer & Design Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-sm text-devora-ink font-bold focus:outline-none focus:border-devora-brand shadow-xs"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SPECIALTY_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = title.toLowerCase() === preset.title.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setTitle(preset.title)}
                        className={cn(
                          "px-2.5 py-1 rounded-button text-xs font-semibold flex items-center gap-1.5 border transition-all",
                          isSelected
                            ? "bg-devora-brand text-white border-devora-brand shadow-xs"
                            : "bg-devora-surface text-devora-ink border-devora-border hover:border-devora-brand hover:text-devora-brand"
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-devora-brand")} />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                  Bio Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan sedikit tentang dirimu, proyek impian yang ingin kamu bangun, atau teknologi yang sedang kamu tekuni..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink focus:outline-none focus:border-devora-brand resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                    Domisili / Kota <span className="text-devora-brand">*</span>
                  </label>
                  <span className="text-[10px] text-devora-muted">500+ Kota di Indonesia & Global</span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-devora-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ketik untuk filter kota cepat (misal: Jakarta, Surabaya, Canggu, Bandung)..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-devora-background border border-devora-border rounded-button text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand mb-1.5"
                  />
                </div>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink font-semibold focus:outline-none focus:border-devora-brand cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Pilih kota tempat tinggal kamu...
                  </option>
                  {location && !geoGroups.some((g) => g.cities.includes(location)) && (
                    <option value={location}>{location} (Tersimpan)</option>
                  )}
                  {geoGroups
                    .map((group) => {
                      if (!citySearch.trim()) return group;
                      const q = citySearch.toLowerCase();
                      const matching = group.cities.filter((c) => c.toLowerCase().includes(q));
                      return { ...group, cities: matching };
                    })
                    .filter((group) => group.cities.length > 0)
                    .map((grp) => (
                      <optgroup key={grp.provinceOrRegion} label={`${grp.provinceOrRegion} (${grp.country})`}>
                        {grp.cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              </div>
            </Card>

            {/* -------------------------------------------------------------
                SECTION 2: PENGALAMAN WEB DEVELOPER & KEAHLIAN
                ------------------------------------------------------------- */}
            <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-5">
              <div className="flex items-center justify-between border-b border-devora-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-devora-ink">
                      Pengalaman & Spesialisasi Web Developer
                    </h2>
                    <p className="text-xs text-devora-muted">
                      Field wajib untuk menentukan level kecocokan partner.
                    </p>
                  </div>
                </div>
                <Badge variant="brand" className="text-xs font-bold px-2 py-0.5">
                  Wajib untuk Matching
                </Badge>
              </div>

              {/* Experience Years (Explicit Web Developer Experience) */}
              <div className="space-y-2.5 p-4 bg-devora-surface-strong/60 rounded-container border border-devora-border">
                <div className="space-y-0.5">
                  <label className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Pengalaman sebagai Web Developer (dalam Tahun)</span>
                    <span className="text-devora-brand">*</span>
                  </label>
                  <p className="text-xs text-devora-muted leading-relaxed">
                    Sudah berapa lama kamu aktif mengembangkan website atau aplikasi web? (Bisa gunakan desimal, misal 0.5 untuk 6 bulan).
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {EXPERIENCE_YEAR_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setExperienceYears(String(preset.value))}
                      className={cn(
                        "px-2.5 py-1 rounded-button text-xs font-semibold border transition-all",
                        experienceYears === String(preset.value)
                          ? "bg-devora-brand text-white border-devora-brand shadow-xs font-bold"
                          : "bg-devora-surface border-devora-border text-devora-ink hover:border-devora-brand"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Number Input */}
                <div className="flex items-center gap-2 max-w-xs pt-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    placeholder="Contoh: 1.5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-36 px-3 py-2 bg-devora-background border border-devora-border rounded-button text-sm text-devora-ink font-bold focus:outline-none focus:border-devora-brand"
                    required
                  />
                  <span className="text-xs font-mono font-bold text-devora-muted">Tahun Pengalaman</span>
                </div>
              </div>

              {/* Experience Level Selector (4 Cards) */}
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <label className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Tingkat Level Pengalaman (Experience Level)</span>
                    <span className="text-devora-brand">*</span>
                  </label>
                  <p className="text-xs text-devora-muted">
                    Pilih kategori yang paling menggambarkan kemandirian ngoding kamu saat ini.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EXPERIENCE_LEVELS.map((item) => {
                    const isSelected = experienceLevel === item.level;
                    return (
                      <div
                        key={item.level}
                        onClick={() => setExperienceLevel(item.level)}
                        className={cn(
                          "p-3.5 rounded-container border-2 cursor-pointer transition-all flex items-start gap-3 select-none",
                          isSelected
                            ? "border-devora-brand bg-devora-brand-soft/40 shadow-xs"
                            : "border-devora-border bg-devora-background hover:border-devora-border-strong"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          isSelected ? "border-devora-brand bg-devora-brand text-white" : "border-devora-border"
                        )}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="text-xs font-bold text-devora-ink block">
                            {item.title}
                          </span>
                          <p className="text-[11px] text-devora-muted leading-relaxed">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tech Stack & Skills */}
              <div className="space-y-3 pt-2 border-t border-devora-border/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-devora-brand" />
                    <label className="text-xs font-mono uppercase font-bold text-devora-ink">
                      Tech Stack & Keahlian Utama <span className="text-devora-brand">*</span>
                    </label>
                  </div>
                  <span className="text-xs font-mono text-devora-muted bg-devora-surface-strong px-2 py-0.5 rounded border border-devora-border">
                    {techStack.length} tools terpilih
                  </span>
                </div>

                {/* Selected Badges */}
                <div className="flex flex-wrap gap-1.5 p-3 bg-devora-background border border-devora-border rounded-container min-h-[46px] items-center">
                  {techStack.length > 0 ? (
                    techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-devora-brand/10 text-devora-brand-dark border border-devora-brand/30 text-xs font-bold shadow-2xs"
                      >
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="w-3.5 h-3.5 rounded-full hover:bg-devora-brand hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-devora-muted italic">
                      Belum ada tech stack yang dipilih. Tambahkan di bawah.
                    </span>
                  )}
                </div>

                {/* Custom Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ketik tool baru (misal: SvelteKit, Bun, Prisma, GraphQL)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTech();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs text-devora-ink focus:outline-none focus:border-devora-brand"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomTech}
                    disabled={!customSkillInput.trim()}
                    className="gap-1 bg-devora-ink text-white hover:bg-devora-ink-soft text-xs font-bold shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </Button>
                </div>

                {/* Categories */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[11px] font-mono text-devora-muted font-bold block uppercase tracking-wide">
                    ⚡ Pilihan Cepat Stack Populer:
                  </span>
                  <div className="space-y-2">
                    {POPULAR_TECH_PRESETS.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <span className="text-[10px] font-mono text-devora-muted block">{cat.category}</span>
                        <div className="flex flex-wrap gap-1">
                          {cat.items.map((item) => {
                            const isSelected = techStack.includes(item);
                            return (
                              <button
                                type="button"
                                key={item}
                                onClick={() => handleToggleTech(item)}
                                className={cn(
                                  "px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-all",
                                  isSelected
                                    ? "bg-devora-brand text-white border-devora-brand font-bold"
                                    : "bg-devora-background text-devora-ink border-devora-border hover:border-devora-brand"
                                )}
                              >
                                {item} {isSelected && "✓"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* -------------------------------------------------------------
                SECTION 3: KETERSEDIAAN WAKTU & GAYA KERJA
                ------------------------------------------------------------- */}
            <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
              <div className="flex items-center justify-between border-b border-devora-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-devora-ink">
                      Ketersediaan Waktu & Jadwal Kolaborasi
                    </h2>
                    <p className="text-xs text-devora-muted">
                      Memastikan partner memiliki overlap waktu yang sefrekuensi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours per week */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Ketersediaan Jam Kerja per Minggu</span>
                  </label>
                  <span className="text-sm font-bold text-devora-brand font-mono">
                    {availabilityHrs} Jam / Minggu
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[5, 8, 12, 20, 30].map((hrs) => (
                    <button
                      type="button"
                      key={hrs}
                      onClick={() => setAvailabilityHrs(hrs)}
                      className={cn(
                        "px-3 py-1.5 rounded-button text-xs font-bold border transition-all",
                        availabilityHrs === hrs
                          ? "bg-devora-brand text-white border-devora-brand shadow-xs"
                          : "bg-devora-background text-devora-ink border-devora-border hover:border-devora-brand"
                      )}
                    >
                      {hrs} Jam / Minggu
                    </button>
                  ))}
                </div>
              </div>

              {/* Flexible Hours Toggle */}
              <div className="p-3.5 bg-devora-surface-strong/50 rounded-container border border-devora-border flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-devora-ink block">
                    Jam Kerja Fleksibel
                  </span>
                  <p className="text-[11px] text-devora-muted">
                    Jadwal ngoding saya fleksibel dan bisa menyesuaikan kesepakatan tim.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flexibleHours}
                    onChange={(e) => setFlexibleHours(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-devora-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-devora-brand"></div>
                </label>
              </div>

              {/* Available Days */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Hari Aktif Kolaborasi</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_LIST.map((day) => {
                    const isSelected = availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={cn(
                          "px-3 py-1.5 rounded-button text-xs font-semibold border transition-all",
                          isSelected
                            ? "bg-devora-ink text-white border-devora-ink font-bold shadow-xs"
                            : "bg-devora-background text-devora-muted border-devora-border hover:text-devora-ink"
                        )}
                      >
                        {day} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Zona Waktu (Timezone)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDetectTimezone}
                    className="text-[11px] font-semibold text-devora-brand hover:underline inline-flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Deteksi Otomatis</span>
                  </button>
                </div>

                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink font-semibold focus:outline-none focus:border-devora-brand cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih zona waktu...
                  </option>
                  <option value="Asia/Jakarta (UTC+7)">WIB (UTC+7) - Jakarta, Bandung, Surabaya, Medan</option>
                  <option value="Asia/Makassar (UTC+8)">WITA (UTC+8) - Bali, Makassar, Balikpapan</option>
                  <option value="Asia/Jayapura (UTC+9)">WIT (UTC+9) - Jayapura, Ambon, Sorong</option>
                  <option value="Asia/Singapore (UTC+8)">SGT (UTC+8) - Singapore, Kuala Lumpur</option>
                  <option value="Asia/Tokyo (UTC+9)">JST (UTC+9) - Tokyo, Seoul</option>
                  <option value="Australia/Sydney (UTC+10)">AEST (UTC+10) - Sydney, Melbourne</option>
                  <option value="Europe/London (UTC+0)">GMT/BST (UTC+0) - London, Dublin</option>
                  <option value="Europe/Berlin (UTC+1)">CET (UTC+1) - Berlin, Amsterdam, Paris</option>
                  <option value="America/New_York (UTC-5)">EST (UTC-5) - New York, Toronto</option>
                  <option value="America/Los_Angeles (UTC-8)">PST (UTC-8) - San Francisco, Seattle</option>
                </select>
              </div>

              {/* Working Rhythm */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                  Gaya & Ritme Kolaborasi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WORK_STYLES.map((ws) => (
                    <button
                      type="button"
                      key={ws}
                      onClick={() => setWorkStyle(ws)}
                      className={cn(
                        "p-2.5 rounded-button text-xs text-left font-semibold border transition-all",
                        workStyle === ws
                          ? "bg-devora-brand/10 border-devora-brand text-devora-brand-dark font-bold"
                          : "bg-devora-background border-devora-border text-devora-muted hover:text-devora-ink"
                      )}
                    >
                      {ws}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* -------------------------------------------------------------
                SECTION 4: PREFERENSI KERJA (Work Preference)
                ------------------------------------------------------------- */}
            <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
              <div className="flex items-center justify-between border-b border-devora-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-devora-ink">
                      Preferensi Cara Kerja
                    </h2>
                    <p className="text-xs text-devora-muted">
                      Apakah kamu lebih suka kerja remote, hybrid, atau on-site?
                    </p>
                  </div>
                </div>
                <Badge variant="brand" className="text-xs font-bold px-2 py-0.5">
                  Wajib
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {WORK_PREFERENCES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = workPreference === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setWorkPreference(item.key)}
                      className={cn(
                        "p-4 rounded-container border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 select-none",
                        isSelected
                          ? "border-devora-brand bg-devora-brand-soft/40 shadow-xs"
                          : "border-devora-border bg-devora-background hover:border-devora-border-strong"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={cn("w-5 h-5", isSelected ? "text-devora-brand" : "text-devora-muted")} />
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          isSelected ? "border-devora-brand bg-devora-brand text-white" : "border-devora-border"
                        )}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-devora-ink block">
                          {item.title}
                        </span>
                        <p className="text-[11px] text-devora-muted leading-tight">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* -------------------------------------------------------------
                SECTION 5: LINK PORTOFOLIO & SOSIAL PROFESIONAL
                ------------------------------------------------------------- */}
            <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
              <div className="flex items-center justify-between border-b border-devora-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-devora-ink">
                      Tautan Portofolio & Jejaring Profesional
                    </h2>
                    <p className="text-xs text-devora-muted">
                      Tunjukkan karya terbaik dan profil profesional kamu kepada partner.
                    </p>
                  </div>
                </div>
              </div>

              {/* Portfolio URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-devora-brand" />
                  <span>URL Portofolio Pribadi</span>
                </label>
                <input
                  type="url"
                  placeholder="https://portofolio-kamu.dev"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink focus:outline-none focus:border-devora-brand"
                />
              </div>

              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-devora-brand" />
                  <span>GitHub Profile</span>
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-devora-surface-strong/60 rounded-button border border-devora-border text-xs text-devora-ink">
                  {currentUser.githubUsername ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-semibold">@{currentUser.githubUsername}</span>
                      <span className="text-[11px] text-emerald-600 font-bold">Terhubung Otomatis</span>
                    </div>
                  ) : (
                    <span className="text-devora-muted">
                      Login dengan GitHub untuk sinkronisasi repositori otomatis.
                    </span>
                  )}
                </div>
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-devora-brand" />
                  <span>URL Profil LinkedIn</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink focus:outline-none focus:border-devora-brand"
                />
              </div>

              {/* Personal Website */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Website Pribadi / Blog</span>
                </label>
                <input
                  type="url"
                  placeholder="https://blog.kamu.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink focus:outline-none focus:border-devora-brand"
                />
              </div>
            </Card>

            {/* Bottom Actions Bar (Sticky on Mobile) */}
            <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 p-4 bg-devora-surface/95 backdrop-blur-md border-2 border-devora-border rounded-container shadow-xl">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-500/10 rounded-button border border-transparent transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab("PREVIEW")}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Pratinjau</span>
                </Button>

                <Button
                  type="submit"
                  size="md"
                  disabled={isSaving}
                  className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold text-xs shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Profil Sekarang"}</span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Shell>
  );
}
