"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useUserStore } from "@/store/useUserStore";
import { useUiStore } from "@/store/useUiStore";
import { authClient } from "@/lib/auth-client";
import {
  Clock,
  Save,
  GitBranch,
  ExternalLink,
  Target,
  Calendar,
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
  Tag,
} from "lucide-react";
import { ProfilePageSkeleton } from "@/components/ui/ProfileSkeleton";
import { COMPLETE_INDONESIA_REGIONS, guessTimezoneFromCity, GeoLocationGroup } from "@/lib/geo-data";
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

const WORK_STYLES = [
  "Async-First (Santai lewat GitHub PR & Discord/Slack)",
  "Malam Hari (Weekday Evenings)",
  "Akhir Pekan (Weekend Sprints)",
  "Fleksibel / Sesuai Kesepakatan Tim",
];

const COLLAB_GOALS = [
  "Bikin SaaS MVP",
  "Developer Tooling",
  "Karya Open Source",
  "Aplikasi Mobile",
  "AI Agents & Otomasi",
];

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateProfileApi, logout, isLoadingProfile } = useUserStore();
  const { addToast } = useUiStore();
  const [isSaving, setIsSaving] = useState(false);

  // Local form state for intuitive editing
  const [isInitialized, setIsInitialized] = useState(false);
  const [name, setName] = useState(currentUser.name || "");
  const [title, setTitle] = useState(currentUser.title || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [timezone, setTimezone] = useState(currentUser.timezone || "");
  const [availabilityHrs, setAvailabilityHrs] = useState(currentUser.availabilityHrs || 10);
  const [workStyle, setWorkStyle] = useState(currentUser.workStyle || WORK_STYLES[0]);
  const [goals, setGoals] = useState<string[]>(currentUser.goals || []);
  const [techStack, setTechStack] = useState<string[]>(
    currentUser.techStack?.length
      ? currentUser.techStack
      : currentUser.skills?.length
        ? currentUser.skills
        : ["Next.js", "TypeScript", "Tailwind CSS"]
  );
  const [customSkillInput, setCustomSkillInput] = useState("");

  const handleToggleTech = (techName: string) => {
    if (techStack.includes(techName)) {
      setTechStack(techStack.filter((t) => t !== techName));
    } else {
      setTechStack([...techStack, techName]);
    }
  };

  const handleRemoveTech = (techName: string) => {
    setTechStack(techStack.filter((t) => t !== techName));
  };

  const handleAddCustomTech = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
    }
    setCustomSkillInput("");
  };

  // Comprehensive Geo API & Search State
  const [geoGroups, setGeoGroups] = useState<GeoLocationGroup[]>(COMPLETE_INDONESIA_REGIONS);
  const [timezonesList, setTimezonesList] = useState<any[]>([]);
  const [citySearch, setCitySearch] = useState("");

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
        console.error("Failed to load geo API:", err);
      }
    }
    loadGeoData();
  }, []);

  const handleAutoDetect = () => {
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
      } else if (userTz.includes("London")) {
        matchedTz = "Europe/London (UTC+0)";
        suggestedCity = "London, UK";
      } else if (userTz.includes("Los_Angeles") || userTz.includes("Pacific")) {
        matchedTz = "America/Los_Angeles (UTC-8)";
        suggestedCity = "San Francisco / US";
      } else if (userTz.includes("New_York") || userTz.includes("Eastern")) {
        matchedTz = "America/New_York (UTC-5)";
        suggestedCity = "New York, US";
      } else if (
        userTz.includes("Berlin") ||
        userTz.includes("Paris") ||
        userTz.includes("Amsterdam")
      ) {
        matchedTz = "Europe/Berlin (UTC+1)";
        suggestedCity = "Berlin, Germany";
      }

      setTimezone(matchedTz);
      if (!location) {
        setLocation(suggestedCity);
      }

      addToast({
        title: "Zona Waktu Terdeteksi",
        description: `Sistem mendeteksi zona waktu browser: ${matchedTz}`,
        type: "success",
      });
    } catch (e) {
      addToast({
        title: "Info",
        description: "Silakan pilih kota dan zona waktu dari daftar.",
        type: "info",
      });
    }
  };

  useEffect(() => {
    if (currentUser.id && !isInitialized) {
      setName(currentUser.name || "");
      setTitle(currentUser.title || "");
      setBio(currentUser.bio || "");
      setLocation(currentUser.location || "");
      setTimezone(currentUser.timezone || "");
      setAvailabilityHrs(currentUser.availabilityHrs || 10);
      setWorkStyle(currentUser.workStyle || WORK_STYLES[0]);
      setGoals(currentUser.goals || []);
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

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            logout();
            addToast({
              title: "Berhasil Keluar",
              description: "Kamu telah keluar dari akun Devora. Sampai jumpa lagi!",
              type: "info",
            });
            router.push("/signin");
          },
        },
      });
    } catch (e) {
      logout();
      router.push("/signin");
    }
  };

  const handleToggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleLocationChange = (newLoc: string) => {
    setLocation(newLoc);
    if (!newLoc) return;

    if (
      newLoc.includes("Bali") ||
      newLoc.includes("Makassar") ||
      newLoc.includes("Balikpapan") ||
      newLoc.includes("Samarinda") ||
      newLoc.includes("Manado") ||
      newLoc.includes("Palu") ||
      newLoc.includes("Lombok") ||
      newLoc.includes("Kupang")
    ) {
      setTimezone("Asia/Makassar (UTC+8)");
    } else if (
      newLoc.includes("Jayapura") ||
      newLoc.includes("Ambon") ||
      newLoc.includes("Sorong")
    ) {
      setTimezone("Asia/Jayapura (UTC+9)");
    } else if (newLoc.includes("Singapore") || newLoc.includes("Kuala Lumpur")) {
      setTimezone("Asia/Singapore (UTC+8)");
    } else if (newLoc.includes("Tokyo")) {
      setTimezone("Asia/Tokyo (UTC+9)");
    } else if (newLoc.includes("Sydney") || newLoc.includes("Melbourne")) {
      setTimezone("Australia/Sydney (UTC+10)");
    } else if (newLoc.includes("London")) {
      setTimezone("Europe/London (UTC+0)");
    } else if (newLoc.includes("San Francisco") || newLoc.includes("US")) {
      setTimezone("America/Los_Angeles (UTC-8)");
    } else if (newLoc.includes("Eropa")) {
      setTimezone("Europe/Berlin (UTC+1)");
    } else if (
      newLoc.includes("Jakarta") ||
      newLoc.includes("Bandung") ||
      newLoc.includes("Surabaya") ||
      newLoc.includes("Yogyakarta") ||
      newLoc.includes("Semarang") ||
      newLoc.includes("Medan") ||
      newLoc.includes("Solo") ||
      newLoc.includes("Malang") ||
      newLoc.includes("Bekasi") ||
      newLoc.includes("Tangerang") ||
      newLoc.includes("Depok") ||
      newLoc.includes("Bogor") ||
      newLoc.includes("Batam") ||
      newLoc.includes("Padang") ||
      newLoc.includes("Palembang") ||
      newLoc.includes("Pekanbaru") ||
      newLoc.includes("Lampung") ||
      newLoc.includes("Aceh") ||
      newLoc.includes("Pontianak") ||
      newLoc.includes("Banjarmasin") ||
      newLoc.includes("Cirebon") ||
      newLoc.includes("Sidoarjo") ||
      newLoc.includes("Jember")
    ) {
      setTimezone("Asia/Jakarta (UTC+7)");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const success = await updateProfileApi({
      name: name.trim(),
      title: title.trim(),
      bio: bio.trim(),
      location: location.trim(),
      timezone: timezone.trim(),
      workStyle,
      goals,
      availabilityHrs,
      techStack,
      skills: techStack,
    });

    setIsSaving(false);

    if (success) {
      addToast({
        title: "Profil Kamu Berhasil Disimpan",
        description: "Spesialisasi dan preferensi kamu sudah tersimpan di database.",
        type: "success",
      });
    } else {
      addToast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan perubahan profil.",
        type: "error",
      });
    }
  };

  return (
    <Shell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-devora-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-devora-brand" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-devora-muted">
                Profil Builder Kamu
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-devora-ink tracking-tight">
              Profil & Spesialisasi Kamu
            </h1>
            <p className="text-xs sm:text-sm text-devora-muted">
              Lengkapi info spesialisasi dan waktu santai kamu biar partner yang tepat gampang nemuin kamu.
            </p>
          </div>
        </div>

        {isLoadingProfile && !currentUser.id ? (
          <ProfilePageSkeleton />
        ) : (
          <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-200">
          {/* Card 1: Data Diri & Headline Spesialisasi */}
          <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-devora-border">
              <Avatar
                src={
                  currentUser.image ||
                  currentUser.avatarUrl ||
                  (currentUser.githubUsername
                    ? `https://github.com/${currentUser.githubUsername}.png`
                    : undefined)
                }
                fallback={
                  (name || currentUser.name || "DV").slice(0, 2).toUpperCase()
                }
                size="lg"
                className="border-2 border-devora-border shadow-xs"
              />
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-devora-ink leading-tight">
                  {name || currentUser.name || "Nama Kamu"}
                </h2>
                <p className="text-xs text-devora-muted font-medium">
                  {title || currentUser.title || "Posisi / Role Andalan"}
                </p>
                {currentUser.githubUsername && (
                  <div className="flex items-center gap-2 text-[11px] text-devora-muted">
                    <a
                      href={currentUser.githubUrl || `https://github.com/${currentUser.githubUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-devora-brand hover:underline font-semibold"
                    >
                      <GitBranch className="w-3 h-3" />
                      <span>@{currentUser.githubUsername}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Input: Nama Lengkap */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                Nama Lengkap <span className="text-devora-brand">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-sm text-devora-ink font-semibold focus:outline-none focus:border-devora-brand"
                required
              />
            </div>

            {/* Input & Presets: Headline Role / Spesialisasi Utama */}
            <div className="space-y-2.5 p-3.5 sm:p-4 bg-devora-surface-strong/60 rounded-container border border-devora-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Headline Role / Spesialisasi Utama</span>
                  <span className="text-devora-brand">*</span>
                </label>
                <span className="text-[11px] text-devora-muted font-medium">
                  Bisa pilih preset atau ketik spesialisasi custom
                </span>
              </div>

              <input
                type="text"
                placeholder="Contoh: Spesialis UI/UX & Product Design, Senior Fullstack Engineer..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-devora-background border border-devora-border rounded-button text-sm text-devora-ink font-bold focus:outline-none focus:border-devora-brand shadow-xs"
                required
              />

              {/* Quick Preset Selector Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-devora-muted font-semibold block">
                  ⚡ Ganti Cepat Spesialisasi:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SPECIALTY_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected =
                      title.toLowerCase() === preset.title.toLowerCase() ||
                      title.toLowerCase() === preset.label.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setTitle(preset.title)}
                        className={cn(
                          "px-2.5 py-1 rounded-button text-xs font-semibold flex items-center gap-1.5 border transition-all",
                          isSelected
                            ? "bg-devora-brand text-white border-devora-brand shadow-xs"
                            : "bg-devora-surface text-devora-ink border-devora-border hover:border-devora-brand hover:text-devora-brand hover:bg-devora-surface-strong"
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-devora-brand")} />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                Bio Singkat
              </label>
              <textarea
                rows={2}
                placeholder="Ceritain sedikit apa yang lagi kamu pelajari, ide yang bikin kamu excited, atau produk yang mau kamu bikin..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink focus:outline-none focus:border-devora-brand resize-none"
              />
            </div>

            {/* Location & Timezone Header + Auto Detect */}
            <div className="pt-2 border-t border-devora-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-devora-ink flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Domisili & Zona Waktu (Data Lengkap API)</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-devora-brand hover:text-devora-brand-dark bg-devora-brand/10 hover:bg-devora-brand/15 px-2.5 py-1 rounded-full border border-devora-brand/20 transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Deteksi zona waktu browser kamu secara otomatis"
                >
                  <Compass className="w-3.5 h-3.5 text-devora-brand" />
                  <span>Deteksi Otomatis</span>
                </button>
              </div>

              {/* Location & Timezone Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                      Domisili / Kota
                    </label>
                    <span className="text-[10px] text-devora-muted font-mono">
                      (500+ Kota/Kab & Global)
                    </span>
                  </div>

                  {/* Quick City Search Bar */}
                  <div className="relative">
                    <Search className="w-3 h-3 text-devora-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari kota cepat (misal: Canggu, Sleman, IKN)..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-[11px] bg-devora-background border border-devora-border rounded-button text-devora-ink placeholder:text-devora-muted focus:outline-none focus:border-devora-brand"
                    />
                  </div>

                  <select
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink focus:outline-none focus:border-devora-brand cursor-pointer transition-colors"
                  >
                    <option value="" disabled>
                      Pilih kota / domisili kamu...
                    </option>
                    {location &&
                      !geoGroups.some((g) => g.cities.includes(location)) && (
                        <option value={location}>{location} (Tersimpan)</option>
                      )}
                    {geoGroups
                      .map((group) => {
                        if (!citySearch.trim()) return group;
                        const q = citySearch.toLowerCase();
                        const matching = group.cities.filter((c) =>
                          c.toLowerCase().includes(q)
                        );
                        return { ...group, cities: matching };
                      })
                      .filter((group) => group.cities.length > 0)
                      .map((grp) => (
                        <optgroup
                          key={grp.provinceOrRegion}
                          label={`${grp.provinceOrRegion} (${grp.country})`}
                        >
                          {grp.cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-devora-brand" />
                      <span>Zona Waktu (Timezone)</span>
                    </label>
                    <span className="text-[10px] text-devora-brand font-mono font-semibold">
                      Standard IANA
                    </span>
                  </div>

                  <div className="h-[29px] hidden sm:block" />

                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink focus:outline-none focus:border-devora-brand cursor-pointer transition-colors"
                  >
                    <option value="" disabled>
                      Pilih zona waktu...
                    </option>
                    {timezone &&
                      !timezonesList.some((t) => t.value === timezone) && (
                        <option value={timezone}>{timezone} (Tersimpan)</option>
                      )}
                    {(timezonesList.length > 0
                      ? timezonesList
                      : [
                          {
                            value: "Asia/Jakarta (UTC+7)",
                            label: "WIB (UTC+7) - Jakarta, Bandung, Surabaya, Medan",
                          },
                          {
                            value: "Asia/Makassar (UTC+8)",
                            label: "WITA (UTC+8) - Bali, Makassar, Balikpapan",
                          },
                          {
                            value: "Asia/Jayapura (UTC+9)",
                            label: "WIT (UTC+9) - Jayapura, Ambon, Sorong",
                          },
                          {
                            value: "Asia/Singapore (UTC+8)",
                            label: "SGT (UTC+8) - Singapore, Kuala Lumpur",
                          },
                          {
                            value: "Asia/Tokyo (UTC+9)",
                            label: "JST (UTC+9) - Tokyo, Seoul",
                          },
                          {
                            value: "Australia/Sydney (UTC+10)",
                            label: "AEST (UTC+10) - Sydney, Melbourne",
                          },
                          {
                            value: "Europe/London (UTC+0)",
                            label: "GMT/BST (UTC+0) - London, Dublin",
                          },
                          {
                            value: "Europe/Berlin (UTC+1)",
                            label: "CET (UTC+1) - Berlin, Amsterdam, Paris",
                          },
                          {
                            value: "America/New_York (UTC-5)",
                            label: "EST (UTC-5) - New York, Toronto",
                          },
                          {
                            value: "America/Los_Angeles (UTC-8)",
                            label: "PST (UTC-8) - San Francisco, Seattle",
                          },
                        ]
                    ).map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Tech Stack & Keahlian Andalan (Atur Tech Stack) */}
          <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
            <div className="flex items-center justify-between border-b border-devora-border pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-devora-brand" />
                <h2 className="text-base font-bold text-devora-ink">
                  Tech Stack & Keahlian Andalan
                </h2>
              </div>
              <span className="text-xs font-mono text-devora-muted font-medium bg-devora-surface-strong px-2 py-0.5 rounded-button border border-devora-border">
                {techStack.length} tools terpilih
              </span>
            </div>

            {/* Selected Tech Stack Badges */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted block">
                Stack Kamu Saat Ini (Tampil di Kartu Profil & Teman Cocok):
              </label>
              {techStack.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-3 bg-devora-background border border-devora-border rounded-container min-h-[50px] items-center">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-devora-brand/10 text-devora-brand-dark border border-devora-brand/30 text-xs font-bold shadow-2xs group animate-in fade-in zoom-in-95 duration-150"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="w-3.5 h-3.5 rounded-full hover:bg-devora-brand hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title={`Hapus ${tech}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-devora-background border border-dashed border-devora-border rounded-container text-center text-xs text-devora-muted italic">
                  Belum ada tech stack yang dipilih. Klik tombol preset di bawah atau ketik manual.
                </div>
              )}
            </div>

            {/* Custom Input for Any Tech */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted block">
                Ketik & Tambah Tool / Library Lain:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik tool baru (misal: GraphQL, TRPC, Bun, PyTorch, Turborepo)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomTech();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-devora-background border border-devora-border rounded-button text-xs sm:text-sm text-devora-ink focus:outline-none focus:border-devora-brand"
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
            </div>

            {/* Popular Presets by Category */}
            <div className="space-y-3 pt-2 border-t border-devora-border/60">
              <span className="text-xs font-mono uppercase font-semibold text-devora-muted block">
                ⚡ Pilihan Cepat Tech Stack Populer (Klik untuk Tambah/Hapus):
              </span>
              <div className="space-y-3">
                {POPULAR_TECH_PRESETS.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <span className="text-[11px] font-mono text-devora-muted font-bold block uppercase tracking-wide">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item) => {
                        const isSelected = techStack.includes(item);
                        return (
                          <button
                            type="button"
                            key={item}
                            onClick={() => handleToggleTech(item)}
                            className={cn(
                              "px-2.5 py-1 rounded-button text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer",
                              isSelected
                                ? "bg-devora-brand text-white border-devora-brand shadow-xs scale-102 font-bold"
                                : "bg-devora-background text-devora-ink border-devora-border hover:border-devora-brand hover:text-devora-brand hover:bg-devora-surface-strong"
                            )}
                          >
                            <span>{item}</span>
                            {isSelected && <X className="w-2.5 h-2.5 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 3: Ketersediaan Waktu & Gaya Kolaborasi */}
          <Card className="p-5 sm:p-6 bg-devora-surface border-devora-border space-y-4">
            <div className="flex items-center gap-2 border-b border-devora-border pb-3">
              <Clock className="w-4 h-4 text-devora-brand" />
              <h2 className="text-base font-bold text-devora-ink">
                Waktu Luang & Gaya Ngoding
              </h2>
            </div>

            {/* Hours per week */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase font-semibold text-devora-muted">
                  Waktu yang Bisa Kamu Luangkan Per Minggu:
                </label>
                <span className="text-sm font-bold text-devora-brand">
                  {availabilityHrs} Jam / Minggu
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5, 8, 12, 20].map((hours) => (
                  <button
                    type="button"
                    key={hours}
                    onClick={() => setAvailabilityHrs(hours)}
                    className={`py-2 rounded-button text-xs font-bold border transition-all ${
                      availabilityHrs === hours
                        ? "bg-devora-ink text-white border-devora-ink shadow-xs"
                        : "bg-devora-background text-devora-muted border-devora-border hover:text-devora-ink"
                    }`}
                  >
                    {hours}h / mgg
                  </button>
                ))}
              </div>
            </div>

            {/* Work Style selection */}
            <div className="space-y-2 pt-2 border-t border-devora-border">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-devora-brand" />
                <span>Gaya & Waktu Ngoding Paling Asik:</span>
              </label>
              <div className="space-y-1.5">
                {WORK_STYLES.map((style) => (
                  <label
                    key={style}
                    className={`p-2.5 rounded-button border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                      workStyle === style
                        ? "bg-devora-brand-soft/70 border-devora-brand/40 text-devora-brand-dark font-bold"
                        : "bg-devora-background border-devora-border text-devora-ink hover:border-devora-brand"
                    }`}
                  >
                    <input
                      type="radio"
                      name="workStyle"
                      value={style}
                      checked={workStyle === style}
                      onChange={(e) => setWorkStyle(e.target.value)}
                      className="accent-devora-brand"
                    />
                    <span>{style}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Goals */}
            <div className="space-y-2 pt-2 border-t border-devora-border">
              <label className="text-xs font-mono uppercase font-semibold text-devora-muted flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-devora-brand" />
                <span>Tujuan Proyek yang Lagi Kamu Minati:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COLLAB_GOALS.map((goal) => {
                  const isSelected = goals.includes(goal);
                  return (
                    <button
                      type="button"
                      key={goal}
                      onClick={() => handleToggleGoal(goal)}
                      className={`px-3 py-1.5 rounded-button text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-devora-brand text-white border-devora-brand shadow-xs font-bold"
                          : "bg-devora-background text-devora-muted border-devora-border hover:text-devora-ink"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Action Buttons: Save & Log Out */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button text-xs font-bold text-red-600 hover:text-red-700 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun (Log Out)</span>
            </button>

            <Button
              type="submit"
              size="lg"
              disabled={isSaving}
              className="w-full sm:w-auto gap-2 bg-devora-brand hover:bg-devora-brand-dark text-white font-bold shadow-lg"
            >
              <Save className="w-4 h-4 fill-white" />
              <span>{isSaving ? "Menyimpan..." : "Simpan Profil Kamu"}</span>
            </Button>
          </div>
        </form>
        )}
      </div>
    </Shell>
  );
}
