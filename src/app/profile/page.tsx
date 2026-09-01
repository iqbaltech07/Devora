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
  Award,
  FolderGit2,
  Share2,
  Trash2,
  Copy,
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

const DAYS_LIST = [
  { full: "Senin", short: "Sen" },
  { full: "Selasa", short: "Sel" },
  { full: "Rabu", short: "Rab" },
  { full: "Kamis", short: "Kam" },
  { full: "Jumat", short: "Jum" },
  { full: "Sabtu", short: "Sab" },
  { full: "Minggu", short: "Min" },
];

const WORK_STYLES = [
  "Async-First (Santai lewat GitHub PR & Discord/Slack)",
  "Malam Hari (Weekday Evenings)",
  "Akhir Pekan (Weekend Sprints)",
  "Fleksibel / Sesuai Kesepakatan Tim",
];

const EXPERIENCE_YEAR_PRESETS = [
  { label: "0 thn (Baru)", value: 0 },
  { label: "0.5 thn (6 bln)", value: 0.5 },
  { label: "1 Tahun", value: 1 },
  { label: "2 Tahun", value: 2 },
  { label: "3 Tahun", value: 3 },
  { label: "5+ Tahun", value: 5 },
];

export default function ProfilePage() {
  const router = useRouter();
  const {
    currentUser,
    updateProfileApi,
    logout,
    isLoadingProfile,
    fetchProfile,
    addCertificate,
    deleteCertificate,
    addPortfolio,
    deletePortfolio,
  } = useUserStore();
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

  // Certificates State
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certCredentialUrl, setCertCredentialUrl] = useState("");
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);

  // Portfolio Project Showcase State
  const [isAddingProj, setIsAddingProj] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projLiveUrl, setProjLiveUrl] = useState("");
  const [projRepoUrl, setProjRepoUrl] = useState("");
  const [projTags, setProjTags] = useState<string[]>(["Next.js", "React"]);
  const [projTagInput, setProjTagInput] = useState("");
  const [projImageUrl, setProjImageUrl] = useState("");
  const [isSubmittingProj, setIsSubmittingProj] = useState(false);

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

  const handleCopyProfileLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/user/${currentUser.id || "me"}`;
    navigator.clipboard.writeText(url);
    addToast({
      title: "Link Profil Disalin! 🚀",
      description: "Link publik profilmu sudah disalin ke clipboard. Siap dibagikan ke LinkedIn, Twitter/X, atau WhatsApp!",
      type: "success",
    });
  };

  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certIssuer.trim()) {
      addToast({
        title: "Data Belum Lengkap",
        description: "Nama sertifikat dan nama lembaga penerbit wajib diisi.",
        type: "error",
      });
      return;
    }

    setIsSubmittingCert(true);
    const created = await addCertificate({
      title: certTitle.trim(),
      issuer: certIssuer.trim(),
      issueDate: certIssueDate.trim() || undefined,
      credentialUrl: certCredentialUrl.trim() || undefined,
    });
    setIsSubmittingCert(false);

    if (created) {
      setCertTitle("");
      setCertIssuer("");
      setCertIssueDate("");
      setCertCredentialUrl("");
      setIsAddingCert(false);
      addToast({
        title: "Sertifikat Ditambahkan",
        description: `Sertifikat "${created.title}" berhasil disimpan di profilmu.`,
        type: "success",
      });
    } else {
      addToast({
        title: "Gagal Menambahkan",
        description: "Terjadi kendala saat menyimpan sertifikat ke database.",
        type: "error",
      });
    }
  };

  const handleDeleteCert = async (id: string, titleName: string) => {
    const ok = await deleteCertificate(id);
    if (ok) {
      addToast({
        title: "Sertifikat Dihapus",
        description: `Sertifikat "${titleName}" telah dihapus dari profil.`,
        type: "info",
      });
    }
  };

  const handleAddProjTag = () => {
    const trimmed = projTagInput.trim();
    if (trimmed && !projTags.includes(trimmed)) {
      setProjTags([...projTags, trimmed]);
      setProjTagInput("");
    }
  };

  const handleRemoveProjTag = (tag: string) => {
    setProjTags(projTags.filter((t) => t !== tag));
  };

  const handleCreateProj = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      addToast({
        title: "Judul Proyek Wajib Diisi",
        description: "Mohon isi nama atau judul proyek portofolio kamu.",
        type: "error",
      });
      return;
    }

    setIsSubmittingProj(true);
    const created = await addPortfolio({
      title: projTitle.trim(),
      description: projDesc.trim() || undefined,
      liveUrl: projLiveUrl.trim() || undefined,
      repoUrl: projRepoUrl.trim() || undefined,
      tags: projTags,
      imageUrl: projImageUrl.trim() || undefined,
    });
    setIsSubmittingProj(false);

    if (created) {
      setProjTitle("");
      setProjDesc("");
      setProjLiveUrl("");
      setProjRepoUrl("");
      setProjTags(["Next.js", "React"]);
      setProjImageUrl("");
      setIsAddingProj(false);
      addToast({
        title: "Proyek Portofolio Ditambahkan",
        description: `Proyek "${created.title}" berhasil dipublikasikan di profilmu.`,
        type: "success",
      });
    } else {
      addToast({
        title: "Gagal Menambahkan Proyek",
        description: "Terjadi kendala saat menyimpan proyek ke database.",
        type: "error",
      });
    }
  };

  const handleDeleteProj = async (id: string, titleName: string) => {
    const ok = await deletePortfolio(id);
    if (ok) {
      addToast({
        title: "Proyek Dihapus",
        description: `Proyek "${titleName}" telah dihapus dari portofoliomu.`,
        type: "info",
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
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-12 px-1 sm:px-0">
        {/* ─── 1. PAGE HEADER & MODE CONTROLS ─── */}
        <div className="space-y-3 border-b border-devora-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-devora-brand/10 border border-devora-brand/20">
                <span className="w-2 h-2 rounded-full bg-devora-brand animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-devora-brand-dark">
                  Pengaturan Profil Developer
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-devora-ink tracking-tight">
                Profil Profesional Developer
              </h1>
              <p className="text-xs sm:text-sm text-devora-muted leading-relaxed">
                Lengkapi identitas, jam terbang, dan portofolio kamu agar algoritma matching dapat mencocokkan partner yang paling tepat.
              </p>
            </div>

            {/* Top Share Profile Button (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyProfileLink}
                className="gap-1.5 text-xs font-bold bg-white border-devora-border hover:border-devora-brand hover:text-devora-brand shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Salin Link Profil</span>
              </Button>
            </div>
          </div>

          {/* Tab Navigation: Edit vs Preview (Full-width on Mobile) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <div className="grid grid-cols-2 p-1 bg-devora-surface-strong/80 border border-devora-border rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("EDIT")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all select-none",
                  activeTab === "EDIT"
                    ? "bg-devora-ink text-white shadow-sm"
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
                  "flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all select-none",
                  activeTab === "PREVIEW"
                    ? "bg-devora-ink text-white shadow-sm"
                    : "text-devora-muted hover:text-devora-ink"
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Publik</span>
              </button>
            </div>

            {/* Mobile Share Button */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyProfileLink}
              className="sm:hidden w-full gap-2 text-xs font-bold bg-white border-devora-border hover:border-devora-brand hover:text-devora-brand py-2 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-devora-brand" />
              <span>Salin Link Profil Publik</span>
            </Button>
          </div>
        </div>

        {/* ─── 2. PROFILE COMPLETENESS WIDGET ─── */}
        <Card className="p-4 sm:p-5 bg-white border border-devora-border rounded-2xl sm:rounded-[24px] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Radial Progress Ring */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 sm:w-14 sm:h-14 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 stroke-current"
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
                <span className="absolute text-xs sm:text-sm font-extrabold text-devora-ink font-mono">
                  {completeness.score}%
                </span>
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-devora-ink">
                    Kelengkapan Profil
                  </h3>
                  {completeness.isMatchReady ? (
                    <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold gap-1 py-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Siap Matching 🚀</span>
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold gap-1 py-0.5">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>Perlu Dilengkapi</span>
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-devora-muted">
                  <strong className="text-devora-ink font-semibold">{completeness.completedCount}</strong> dari {completeness.totalCount} data profil telah terisi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowChecklistDetails(!showChecklistDetails)}
              className="inline-flex items-center justify-between sm:justify-start gap-1.5 text-xs font-bold text-devora-brand hover:text-devora-brand-dark p-2 sm:p-0 rounded-lg hover:bg-devora-brand/5 sm:hover:bg-transparent transition-colors"
            >
              <span>{showChecklistDetails ? "Sembunyikan Rincian" : "Lihat Checklist Lengkap"}</span>
              {showChecklistDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Next Suggested Action Hint */}
          {completeness.nextSuggestedAction && (
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-devora-ink">
              <Zap className="w-4 h-4 text-devora-brand shrink-0 mt-0.5" />
              <span className="leading-relaxed">{completeness.nextSuggestedAction}</span>
            </div>
          )}

          {/* Expandable Checklist Details */}
          {showChecklistDetails && (
            <div className="pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completeness.items.map((item) => (
                  <div
                    key={item.key}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors",
                      item.isCompleted
                        ? "bg-emerald-50/50 border-emerald-200/60 text-slate-700"
                        : item.category === "REQUIRED"
                        ? "bg-amber-50/60 border-amber-200 text-slate-800"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    )}
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={cn("font-bold text-xs truncate", item.isCompleted && "line-through text-slate-400")}>
                          {item.label}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                          {item.category === "REQUIRED" ? "Wajib" : item.category === "RECOMMENDED" ? "Dianjurkan" : "Opsional"}
                        </span>
                      </div>
                      {!item.isCompleted && (
                        <p className="text-[11px] text-slate-500 leading-tight">
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
             VIEW MODE: LIVE PUBLIC PROFILE PREVIEW (MOBILE-FIRST POLISHED)
             ================================================================ */
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <span className="leading-relaxed">👁️ Ini adalah tampilan kartu profilmu yang dilihat calon partner saat mencari kolaborator.</span>
              <Button size="sm" variant="secondary" onClick={() => setActiveTab("EDIT")} className="text-xs font-bold gap-1.5 self-start sm:self-auto shrink-0">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Data Profil</span>
              </Button>
            </div>

            {/* Profile Hero Card */}
            <Card className="p-4 sm:p-7 bg-white border border-devora-border rounded-2xl sm:rounded-[28px] shadow-sm space-y-5">
              {/* Header: Avatar, Name, Title, Experience Badge */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 border-b border-slate-100 pb-5">
                <Avatar
                  src={avatarUrlInput || undefined}
                  fallback={(name || "DV").slice(0, 2).toUpperCase()}
                  size="lg"
                  className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-devora-brand shadow-sm shrink-0"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg sm:text-2xl font-extrabold text-devora-ink">
                      {name || "Nama Belum Diisi"}
                    </h2>
                    {experienceLevel && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-devora-brand/10 text-devora-brand-dark border border-devora-brand/20">
                        {formatExperienceLabel(
                          experienceYears !== "" ? Number(experienceYears) : null,
                          experienceLevel
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-devora-brand">
                    {title || "Web Developer & Builder"}
                  </p>
                  
                  {/* Meta Chips */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 pt-1 text-[11px] text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-devora-brand" />
                      <span>{location || "Indonesia"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-devora-brand" />
                      <span>{availabilityHrs} jam/mgg ({flexibleHours ? "Fleksibel" : "Tetap"})</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                      <Globe className="w-3.5 h-3.5 text-devora-brand" />
                      <span>{formatWorkPreferenceLabel(workPreference)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {bio && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                    Tentang Saya:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    &ldquo;{bio}&rdquo;
                  </p>
                </div>
              )}

              {/* Tech Stack */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                  Tech Stack & Keahlian Utama:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs py-1 px-2.5 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability & Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Gaya & Jadwal Kerja:
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{workStyle}</p>
                  <p className="text-slate-500 text-[11px]">
                    Hari aktif: {availableDays.length > 0 ? availableDays.join(", ") : "Fleksibel"}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Zona Waktu & Preferensi:
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{timezone || "Asia/Jakarta (UTC+7)"}</p>
                  <p className="text-slate-500 text-[11px]">
                    Model Kerja: {formatWorkPreferenceLabel(workPreference)}
                  </p>
                </div>
              </div>

              {/* Links & Socials */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {portfolioUrl && (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-devora-brand/10 text-devora-brand-dark text-xs font-bold border border-devora-brand/20 hover:bg-devora-brand/20 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Portofolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {currentUser.githubUsername && (
                  <a
                    href={currentUser.githubUrl || `https://github.com/${currentUser.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>GitHub (@{currentUser.githubUsername})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Showcase Sertifikasi Terverifikasi */}
              {currentUser.certificates && currentUser.certificates.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-mono uppercase font-bold text-slate-800 tracking-wider">
                      Sertifikasi Terverifikasi ({currentUser.certificates.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentUser.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{cert.title}</h4>
                          <p className="text-[11px] text-slate-500">
                            {cert.issuer} {cert.issueDate && `• ${cert.issueDate}`}
                          </p>
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-devora-brand hover:underline shrink-0 inline-flex items-center gap-1 p-1"
                            title="Buka Kredensial"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Showcase Portofolio Proyek yang Pernah Dibuat */}
              {currentUser.portfolios && currentUser.portfolios.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-devora-brand" />
                    <h3 className="text-xs font-mono uppercase font-bold text-slate-800 tracking-wider">
                      Portofolio Proyek Live ({currentUser.portfolios.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentUser.portfolios.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                          {proj.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {proj.description}
                            </p>
                          )}
                          {proj.tags && proj.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] py-0.5 px-2 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-devora-brand hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Live Demo</span>
                            </a>
                          )}
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-devora-brand"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* ================================================================
             EDIT MODE: FULL PROFESSIONAL DEVELOPER FORM (MOBILE-FIRST OPTIMIZED)
             ================================================================ */
          <form onSubmit={handleSaveProfile} className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* -------------------------------------------------------------
                SECTION 1: IDENTITAS (Identity)
                ------------------------------------------------------------- */}
            <Card className="p-4 sm:p-6 bg-white border border-devora-border rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-extrabold text-xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-devora-ink">
                      Identitas Profil Developer
                    </h2>
                    <p className="text-[11px] text-devora-muted">
                      Informasi dasar & foto tampilan publik
                    </p>
                  </div>
                </div>
                <Badge variant="brand" className="text-[10px] font-bold px-2 py-0.5">
                  Wajib
                </Badge>
              </div>

              {/* Avatar Preview & URL Input */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200">
                <Avatar
                  src={avatarUrlInput || undefined}
                  fallback={(name || "DV").slice(0, 2).toUpperCase()}
                  size="lg"
                  className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-devora-brand shadow-xs shrink-0"
                />
                <div className="flex-1 space-y-2 w-full min-w-0">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-600 block">
                    URL Foto Profil / Avatar
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... atau https://github.com/username.png"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-devora-ink placeholder:text-slate-400 focus:outline-none focus:border-devora-brand"
                  />
                  {currentUser.githubUsername && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrlInput(`https://github.com/${currentUser.githubUsername}.png`)}
                      className="text-[11px] text-devora-brand font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Gunakan foto GitHub (@{currentUser.githubUsername})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-700">
                    Nama Lengkap <span className="text-devora-brand">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Wajib diisi</span>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: Acelino Kurniawan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink font-bold focus:bg-white focus:outline-none focus:border-devora-brand transition-colors"
                  required
                />
              </div>

              {/* Headline / Title */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Headline / Posisi Andalan</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Pilih preset atau ketik manual
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Contoh: Senior Frontend Engineer & Design Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink font-bold focus:bg-white focus:outline-none focus:border-devora-brand transition-colors"
                />

                {/* Specialty Presets Chips */}
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
                          "px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all active:scale-95",
                          isSelected
                            ? "bg-devora-brand text-white border-devora-brand shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-devora-brand hover:text-devora-brand"
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
                <label className="text-[11px] font-mono uppercase font-bold text-slate-700">
                  Bio Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan sedikit tentang dirimu, visi proyek, atau teknologi yang sedang kamu tekuni..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink focus:bg-white focus:outline-none focus:border-devora-brand resize-none transition-colors"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-700">
                    Domisili / Kota <span className="text-devora-brand">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">500+ Kota di Indonesia</span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter cepat kota (misal: Jakarta, Surabaya, Bali, Bandung)..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-devora-ink placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-devora-brand mb-1.5"
                  />
                </div>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink font-bold focus:bg-white focus:outline-none focus:border-devora-brand cursor-pointer"
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
            <Card className="p-4 sm:p-6 bg-white border border-devora-border rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-extrabold text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-devora-ink">
                      Pengalaman & Spesialisasi Web Dev
                    </h2>
                    <p className="text-[11px] text-devora-muted">
                      Wajib untuk menentukan kecocokan partner
                    </p>
                  </div>
                </div>
                <Badge variant="brand" className="text-[10px] font-bold px-2 py-0.5">
                  Wajib
                </Badge>
              </div>

              {/* Experience Years */}
              <div className="space-y-3 p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Pengalaman sebagai Web Developer</span>
                    <span className="text-devora-brand">*</span>
                  </label>
                  <p className="text-xs text-slate-500">
                    Berapa lama kamu aktif membuat website atau aplikasi web?
                  </p>
                </div>

                {/* Quick Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                  {EXPERIENCE_YEAR_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setExperienceYears(String(preset.value))}
                      className={cn(
                        "py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center active:scale-95",
                        experienceYears === String(preset.value)
                          ? "bg-devora-brand text-white border-devora-brand shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:border-devora-brand"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Number Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    placeholder="Misal: 1.5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink font-extrabold focus:outline-none focus:border-devora-brand"
                    required
                  />
                  <span className="text-xs font-mono font-bold text-slate-500">Tahun Pengalaman</span>
                </div>
              </div>

              {/* Experience Level Selector (4 Cards) */}
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Tingkat Level Pengalaman (Experience Level)</span>
                    <span className="text-devora-brand">*</span>
                  </label>
                  <p className="text-xs text-slate-500">
                    Pilih yang paling menggambarkan kemandirian ngoding kamu saat ini.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXPERIENCE_LEVELS.map((item) => {
                    const isSelected = experienceLevel === item.level;
                    return (
                      <div
                        key={item.level}
                        onClick={() => setExperienceLevel(item.level)}
                        className={cn(
                          "p-3.5 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none active:scale-[0.99]",
                          isSelected
                            ? "border-devora-brand bg-devora-brand-soft/30 shadow-xs"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          isSelected ? "border-devora-brand bg-devora-brand text-white" : "border-slate-300 bg-white"
                        )}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-xs font-extrabold text-devora-ink block">
                            {item.title}
                          </span>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tech Stack & Skills */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-devora-brand" />
                    <label className="text-[11px] font-mono uppercase font-bold text-slate-800">
                      Tech Stack & Keahlian Utama <span className="text-devora-brand">*</span>
                    </label>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {techStack.length} tools terpilih
                  </span>
                </div>

                {/* Selected Badges */}
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[46px] items-center">
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
                    <span className="text-xs text-slate-400 italic">
                      Belum ada tech stack yang dipilih. Tambahkan di bawah.
                    </span>
                  )}
                </div>

                {/* Custom Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ketik tool baru (misal: SvelteKit, Bun, Prisma)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTech();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-devora-ink focus:bg-white focus:outline-none focus:border-devora-brand"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomTech}
                    disabled={!customSkillInput.trim()}
                    className="gap-1 bg-devora-ink text-white hover:bg-devora-ink-soft text-xs font-bold shrink-0 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </Button>
                </div>

                {/* Categories */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[11px] font-mono text-slate-600 font-bold block uppercase tracking-wide">
                    ⚡ Pilihan Cepat Stack Populer:
                  </span>
                  <div className="space-y-2">
                    {POPULAR_TECH_PRESETS.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block font-semibold">{cat.category}</span>
                        <div className="flex flex-wrap gap-1">
                          {cat.items.map((item) => {
                            const isSelected = techStack.includes(item);
                            return (
                              <button
                                type="button"
                                key={item}
                                onClick={() => handleToggleTech(item)}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95",
                                  isSelected
                                    ? "bg-devora-brand text-white border-devora-brand shadow-xs"
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-devora-brand"
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
                SECTION 3: KETERSEDIAAN WAKTU & JADWAL
                ------------------------------------------------------------- */}
            <Card className="p-4 sm:p-6 bg-white border border-devora-border rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-extrabold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-devora-ink">
                      Ketersediaan Waktu & Jadwal
                    </h2>
                    <p className="text-[11px] text-devora-muted">
                      Overlap waktu kolaborasi dengan partner
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours per week */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Komitmen Jam Kerja per Minggu</span>
                  </label>
                  <span className="text-xs sm:text-sm font-extrabold text-devora-brand font-mono">
                    {availabilityHrs} Jam / Minggu
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[5, 8, 12, 20, 30].map((hrs) => (
                    <button
                      type="button"
                      key={hrs}
                      onClick={() => setAvailabilityHrs(hrs)}
                      className={cn(
                        "py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center active:scale-95",
                        availabilityHrs === hrs
                          ? "bg-devora-brand text-white border-devora-brand shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-devora-brand"
                      )}
                    >
                      {hrs} Jam
                    </button>
                  ))}
                </div>
              </div>

              {/* Flexible Hours Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-devora-ink block">
                    Jadwal Kerja Fleksibel
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Jadwal ngoding saya fleksibel mengikuti ritme dan kesepakatan tim.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={flexibleHours}
                    onChange={(e) => setFlexibleHours(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-devora-brand"></div>
                </label>
              </div>

              {/* Available Days */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Hari Aktif Kolaborasi</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {DAYS_LIST.map((day) => {
                    const isSelected = availableDays.includes(day.full);
                    return (
                      <button
                        type="button"
                        key={day.full}
                        onClick={() => handleToggleDay(day.full)}
                        className={cn(
                          "py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center active:scale-95",
                          isSelected
                            ? "bg-devora-ink text-white border-devora-ink shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:text-devora-ink"
                        )}
                      >
                        <span className="hidden sm:inline">{day.full}</span>
                        <span className="sm:hidden">{day.short}</span>
                        {isSelected && " ✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Zona Waktu (Timezone)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDetectTimezone}
                    className="text-[11px] font-bold text-devora-brand hover:underline inline-flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Deteksi Otomatis</span>
                  </button>
                </div>

                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink font-bold focus:bg-white focus:outline-none focus:border-devora-brand cursor-pointer"
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
                <label className="text-[11px] font-mono uppercase font-bold text-slate-700">
                  Gaya & Ritme Kolaborasi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WORK_STYLES.map((ws) => (
                    <button
                      type="button"
                      key={ws}
                      onClick={() => setWorkStyle(ws)}
                      className={cn(
                        "p-3 rounded-xl text-xs text-left font-bold border transition-all active:scale-95",
                        workStyle === ws
                          ? "bg-devora-brand/10 border-devora-brand text-devora-brand-dark"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:text-devora-ink"
                      )}
                    >
                      {ws}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* -------------------------------------------------------------
                SECTION 4: PREFERENSI CARA KERJA
                ------------------------------------------------------------- */}
            <Card className="p-4 sm:p-6 bg-white border border-devora-border rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-extrabold text-xs">
                    4
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-devora-ink">
                      Preferensi Cara Kerja
                    </h2>
                    <p className="text-[11px] text-devora-muted">
                      Remote, hybrid, atau on-site
                    </p>
                  </div>
                </div>
                <Badge variant="brand" className="text-[10px] font-bold px-2 py-0.5">
                  Wajib
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {WORK_PREFERENCES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = workPreference === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setWorkPreference(item.key)}
                      className={cn(
                        "p-3.5 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 select-none active:scale-[0.99]",
                        isSelected
                          ? "border-devora-brand bg-devora-brand-soft/30 shadow-xs"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={cn("w-5 h-5", isSelected ? "text-devora-brand" : "text-slate-400")} />
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          isSelected ? "border-devora-brand bg-devora-brand text-white" : "border-slate-300 bg-white"
                        )}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-devora-ink block">
                          {item.title}
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* -------------------------------------------------------------
                SECTION 5: LINK PORTOFOLIO & SOSIAL
                ------------------------------------------------------------- */}
            <Card className="p-4 sm:p-6 bg-white border border-devora-border rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-extrabold text-xs">
                    5
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-devora-ink">
                      Tautan Portofolio & Jejaring
                    </h2>
                    <p className="text-[11px] text-devora-muted">
                      Tunjukkan karya terbaik ke calon partner
                    </p>
                  </div>
                </div>
              </div>

              {/* Portfolio URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-devora-brand" />
                  <span>URL Portofolio Pribadi</span>
                </label>
                <input
                  type="url"
                  placeholder="https://portofolio-kamu.dev"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink focus:bg-white focus:outline-none focus:border-devora-brand"
                />
              </div>

              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-devora-brand" />
                  <span>GitHub Profile</span>
                </label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-devora-ink">
                  {currentUser.githubUsername ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-bold">@{currentUser.githubUsername}</span>
                      <span className="text-[11px] text-emerald-600 font-bold">Terhubung Otomatis</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">
                      Login dengan GitHub untuk sinkronisasi repositori otomatis.
                    </span>
                  )}
                </div>
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-devora-brand" />
                  <span>URL Profil LinkedIn</span>
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink focus:bg-white focus:outline-none focus:border-devora-brand"
                />
              </div>

              {/* Personal Website */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Website Pribadi / Blog</span>
                </label>
                <input
                  type="url"
                  placeholder="https://blog.kamu.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-devora-ink focus:bg-white focus:outline-none focus:border-devora-brand"
                />
              </div>
            </Card>

            {/* -------------------------------------------------------------
                SECTION 6: MANAJEMEN & UPLOAD SERTIFIKAT
                ------------------------------------------------------------- */}
            <Card className="p-4 sm:p-6 bg-white border border-devora-border rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-extrabold text-xs">
                    6
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-devora-ink flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Sertifikasi & Lisensi Developer</span>
                    </h2>
                    <p className="text-[11px] text-devora-muted">
                      Bukti sertifikat kursus, bootcamp, atau cloud
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsAddingCert(!isAddingCert)}
                  className="text-xs font-bold gap-1.5 w-full sm:w-auto border-slate-200 hover:border-amber-500 rounded-xl py-2"
                >
                  {isAddingCert ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{isAddingCert ? "Batal" : "+ Tambah Sertifikat"}</span>
                </Button>
              </div>

              {/* Form Tambah Sertifikat */}
              {isAddingCert && (
                <div className="p-3.5 sm:p-4 bg-amber-50/40 rounded-xl sm:rounded-2xl border-2 border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                  <h3 className="text-xs font-extrabold uppercase font-mono text-amber-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Form Tambah Sertifikat Baru</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-slate-700">
                        Nama Sertifikat <span className="text-devora-brand">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Belajar Membuat Aplikasi Web dengan React"
                        value={certTitle}
                        onChange={(e) => setCertTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-devora-ink font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-slate-700">
                        Lembaga / Platform Penerbit <span className="text-devora-brand">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Dicoding, Coursera, AWS, FreeCodeCamp"
                        value={certIssuer}
                        onChange={(e) => setCertIssuer(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-devora-ink font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-slate-700">
                        Bulan & Tahun Perolehan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Jan 2025"
                        value={certIssueDate}
                        onChange={(e) => setCertIssueDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-devora-ink focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-slate-700">
                        Link Verifikasi / Kredensial
                      </label>
                      <input
                        type="url"
                        placeholder="https://dicoding.com/certificates/..."
                        value={certCredentialUrl}
                        onChange={(e) => setCertCredentialUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-devora-ink focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAddingCert(false)}
                      className="text-xs rounded-xl"
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCert}
                      disabled={isSubmittingCert}
                      className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1 rounded-xl shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSubmittingCert ? "Menyimpan..." : "Simpan Sertifikat"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Daftar Sertifikat yang Tersimpan */}
              {currentUser.certificates && currentUser.certificates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {currentUser.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-2 group hover:border-amber-500/50 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-bold text-devora-ink truncate">{cert.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          {cert.issuer} {cert.issueDate && `• ${cert.issueDate}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-devora-brand hover:text-devora-brand-dark rounded"
                            title="Buka Kredensial"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCert(cert.id, cert.title)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          title="Hapus Sertifikat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                  <Award className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Belum ada sertifikat ditambahkan</p>
                  <p className="text-[11px] text-slate-400">
                    Tambahkan sertifikat bootcamp atau kursus untuk meningkatkan daya tarik profil kamu.
                  </p>
                </div>
              )}
            </Card>

            {/* -------------------------------------------------------------
                SECTION 7: SHOWCASE PORTOFOLIO PROYEK
                ------------------------------------------------------------- */}
            <Card className="p-4 sm:p-6 bg-white border border-devora-border rounded-2xl sm:rounded-[24px] space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-devora-brand/10 text-devora-brand flex items-center justify-center font-extrabold text-xs">
                    7
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-devora-ink flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4 text-devora-brand" />
                      <span>Showcase Portofolio Proyek</span>
                    </h2>
                    <p className="text-[11px] text-devora-muted">
                      Website & aplikasi yang pernah kamu bangun
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsAddingProj(!isAddingProj)}
                  className="text-xs font-bold gap-1.5 w-full sm:w-auto border-slate-200 hover:border-devora-brand rounded-xl py-2"
                >
                  {isAddingProj ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-devora-brand" />}
                  <span>{isAddingProj ? "Batal" : "+ Tambah Proyek Portofolio"}</span>
                </Button>
              </div>

              {/* Form Tambah Proyek Portofolio */}
              {isAddingProj && (
                <div className="p-3.5 sm:p-4 bg-devora-brand-soft/30 rounded-xl sm:rounded-2xl border-2 border-devora-brand/30 space-y-3 animate-in fade-in duration-200">
                  <h3 className="text-xs font-extrabold uppercase font-mono text-devora-brand-dark flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-devora-brand" />
                    <span>Formulir Proyek Portofolio Baru</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-slate-700">
                        Judul / Nama Proyek <span className="text-devora-brand">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: SaaS Platform Pengelola Inventaris Toko"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-devora-ink font-bold focus:outline-none focus:border-devora-brand"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-slate-700">
                        Deskripsi Singkat Proyek
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ceritakan fitur utama atau teknologi yang kamu gunakan di proyek ini..."
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-devora-ink focus:outline-none focus:border-devora-brand resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-700">
                          Link Live Demo (Website Aktif)
                        </label>
                        <input
                          type="url"
                          placeholder="https://myproject.vercel.app"
                          value={projLiveUrl}
                          onChange={(e) => setProjLiveUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-devora-ink focus:outline-none focus:border-devora-brand"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-mono font-bold text-slate-700">
                          Link GitHub Repository
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/username/repo-name"
                          value={projRepoUrl}
                          onChange={(e) => setProjRepoUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-devora-ink focus:outline-none focus:border-devora-brand"
                        />
                      </div>
                    </div>

                    {/* Tech Stack Chips for Project */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-slate-700">
                        Tech Stack di Proyek Ini:
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {projTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="default"
                            className="text-xs py-0.5 px-2 bg-white border border-slate-200 text-slate-800 font-bold gap-1 shadow-2xs"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProjTag(tag)}
                              className="text-slate-400 hover:text-red-500 font-bold"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}

                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="+ Tambah tech..."
                            value={projTagInput}
                            onChange={(e) => setProjTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddProjTag();
                              }
                            }}
                            className="w-28 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-devora-ink focus:outline-none focus:border-devora-brand"
                          />
                          <button
                            type="button"
                            onClick={handleAddProjTag}
                            className="px-2 py-1 text-[11px] font-bold bg-devora-brand text-white rounded-lg hover:bg-devora-brand-dark"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-devora-brand/20">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAddingProj(false)}
                      className="text-xs rounded-xl"
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateProj}
                      disabled={isSubmittingProj}
                      className="text-xs bg-devora-brand hover:bg-devora-brand-dark text-white font-bold gap-1 rounded-xl shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSubmittingProj ? "Menyimpan..." : "Simpan Proyek"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Daftar Proyek yang Tersimpan */}
              {currentUser.portfolios && currentUser.portfolios.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {currentUser.portfolios.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 flex flex-col justify-between group hover:border-devora-brand/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-devora-ink">{proj.title}</h4>
                          <button
                            type="button"
                            onClick={() => handleDeleteProj(proj.id, proj.title)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                            title="Hapus Proyek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {proj.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        )}

                        {proj.tags && proj.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] py-0.5 px-2 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80">
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-devora-brand hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live Demo</span>
                          </a>
                        )}
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-devora-brand"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                  <FolderGit2 className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Belum ada portofolio proyek</p>
                  <p className="text-[11px] text-slate-400">
                    Showcase proyek yang pernah kamu buat agar calon partner yakin dengan keahlianmu.
                  </p>
                </div>
              )}
            </Card>

            {/* ─── STICKY BOTTOM ACTIONS BAR (MOBILE-FIRST FLOATING DOCK) ─── */}
            <div className="fixed sm:sticky bottom-0 sm:bottom-4 left-0 right-0 sm:left-auto sm:right-auto z-30 flex items-center justify-between gap-2 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t sm:border border-slate-200 sm:rounded-2xl shadow-xl">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar Akun</span>
              </button>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab("PREVIEW")}
                  className="gap-1.5 text-xs font-bold rounded-xl py-2 px-3"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pratinjau</span>
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-extrabold text-xs shadow-md rounded-xl py-2 px-4 flex-1 sm:flex-initial justify-center"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Profil"}</span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Shell>
  );
}
