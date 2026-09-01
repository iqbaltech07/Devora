import { UserProfile, ExperienceLevel, WorkPreference } from "@/store/types";

export interface ProfileChecklistItem {
  key: string;
  label: string;
  category: "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
  isCompleted: boolean;
  weight: number;
  hint: string;
}

export interface ProfileCompletenessResult {
  score: number; // 0 - 100
  isMatchReady: boolean; // all required fields are filled
  items: ProfileChecklistItem[];
  completedCount: number;
  totalCount: number;
  missingRequired: ProfileChecklistItem[];
  nextSuggestedAction?: string;
}

export function calculateProfileCompleteness(
  user: Partial<UserProfile> | null | undefined
): ProfileCompletenessResult {
  if (!user) {
    return {
      score: 0,
      isMatchReady: false,
      items: [],
      completedCount: 0,
      totalCount: 0,
      missingRequired: [],
    };
  }

  const items: ProfileChecklistItem[] = [
    // 1. REQUIRED FIELDS (Bobot 70%)
    {
      key: "name",
      label: "Nama Lengkap",
      category: "REQUIRED",
      isCompleted: Boolean(user.name && user.name.trim().length > 1),
      weight: 10,
      hint: "Tuliskan nama asli atau panggilan profesional kamu.",
    },
    {
      key: "experienceYears",
      label: "Pengalaman Web Developer",
      category: "REQUIRED",
      isCompleted:
        typeof user.experienceYears === "number" &&
        !isNaN(user.experienceYears) &&
        user.experienceYears >= 0,
      weight: 10,
      hint: "Berapa tahun kamu aktif ngoding web (contoh: 0, 1, 2.5 tahun).",
    },
    {
      key: "experienceLevel",
      label: "Tingkat Pengalaman (Level)",
      category: "REQUIRED",
      isCompleted: Boolean(
        user.experienceLevel &&
          ["BEGINNER", "JUNIOR", "INTERMEDIATE", "SENIOR"].includes(
            user.experienceLevel
          )
      ),
      weight: 10,
      hint: "Pilih level: Beginner, Junior, Intermediate, atau Senior.",
    },
    {
      key: "skills",
      label: "Tech Stack & Keahlian Utama",
      category: "REQUIRED",
      isCompleted: Boolean(
        (user.skills && user.skills.length > 0) ||
          (user.techStack && user.techStack.length > 0)
      ),
      weight: 10,
      hint: "Tambahkan minimal 1 teknologi atau bahasa pemrograman andalan.",
    },
    {
      key: "location",
      label: "Domisili / Kota",
      category: "REQUIRED",
      isCompleted: Boolean(user.location && user.location.trim().length > 0),
      weight: 10,
      hint: "Pilih kota tempat tinggal kamu saat ini.",
    },
    {
      key: "availabilityHrs",
      label: "Ketersediaan Jam Kerja / Minggu",
      category: "REQUIRED",
      isCompleted: Boolean(
        typeof user.availabilityHrs === "number" && user.availabilityHrs > 0
      ),
      weight: 10,
      hint: "Tentukan berapa jam per minggu kamu siap luangkan untuk kolaborasi.",
    },
    {
      key: "workPreference",
      label: "Preferensi Kerja (Remote / Hybrid / On-site)",
      category: "REQUIRED",
      isCompleted: Boolean(
        user.workPreference &&
          ["REMOTE", "HYBRID", "ONSITE"].includes(user.workPreference)
      ),
      weight: 10,
      hint: "Tentukan preferensi gaya kerja: Remote, Hybrid, atau On-site.",
    },

    // 2. RECOMMENDED FIELDS (Bobot 20%)
    {
      key: "title",
      label: "Headline / Posisi Utama",
      category: "RECOMMENDED",
      isCompleted: Boolean(user.title && user.title.trim().length > 2),
      weight: 5,
      hint: "Contoh: Frontend Developer, Fullstack Engineer, UI/UX Specialist.",
    },
    {
      key: "bio",
      label: "Bio Singkat",
      category: "RECOMMENDED",
      isCompleted: Boolean(user.bio && user.bio.trim().length > 5),
      weight: 5,
      hint: "Ceritakan sedikit fokus belajar atau ketertarikan proyek kamu.",
    },
    {
      key: "image",
      label: "Foto Profil / Avatar",
      category: "RECOMMENDED",
      isCompleted: Boolean(
        (user.image && user.image.trim().length > 0) ||
          (user.avatarUrl && user.avatarUrl.trim().length > 0)
      ),
      weight: 5,
      hint: "Pasang foto profil agar profilmu lebih terpercaya bagi partner.",
    },
    {
      key: "links",
      label: "Tautan Portofolio / GitHub / LinkedIn",
      category: "RECOMMENDED",
      isCompleted: Boolean(
        user.portfolioUrl ||
          user.githubUrl ||
          user.githubUsername ||
          user.linkedinUrl ||
          user.websiteUrl
      ),
      weight: 5,
      hint: "Lampirkan link hasil karyamu, GitHub, atau LinkedIn.",
    },

    // 3. OPTIONAL FIELDS (Bobot 10%)
    {
      key: "timezone",
      label: "Zona Waktu (Timezone)",
      category: "OPTIONAL",
      isCompleted: Boolean(user.timezone && user.timezone.trim().length > 0),
      weight: 5,
      hint: "Pilih zona waktu (WIB, WITA, WIT, atau global).",
    },
    {
      key: "availableDays",
      label: "Hari Aktif Kolaborasi",
      category: "OPTIONAL",
      isCompleted: Boolean(
        (user.availableDays && user.availableDays.length > 0) ||
          user.workStyle
      ),
      weight: 5,
      hint: "Pilih hari apa saja kamu biasanya bisa aktif ngoding bareng.",
    },
  ];

  let calculatedScore = 0;
  let completedCount = 0;
  const missingRequired: ProfileChecklistItem[] = [];

  items.forEach((item) => {
    if (item.isCompleted) {
      calculatedScore += item.weight;
      completedCount += 1;
    } else if (item.category === "REQUIRED") {
      missingRequired.push(item);
    }
  });

  const score = Math.min(100, Math.round(calculatedScore));
  const isMatchReady = missingRequired.length === 0;

  let nextSuggestedAction: string | undefined;
  if (missingRequired.length > 0) {
    nextSuggestedAction = `Lengkapi "${missingRequired[0].label}" agar profilmu siap digunakan untuk pencarian partner.`;
  } else if (score < 100) {
    const nextRecommended = items.find((i) => !i.isCompleted);
    if (nextRecommended) {
      nextSuggestedAction = `Tambahkan "${nextRecommended.label}" untuk membuat profilmu semakin memikat calon partner.`;
    }
  }

  return {
    score,
    isMatchReady,
    items,
    completedCount,
    totalCount: items.length,
    missingRequired,
    nextSuggestedAction,
  };
}

export function formatExperienceLabel(
  years?: number | null,
  level?: string | null
): string {
  const levelLabels: Record<string, string> = {
    BEGINNER: "Pemula (Beginner)",
    JUNIOR: "Junior Developer",
    INTERMEDIATE: "Intermediate Developer",
    SENIOR: "Senior Developer",
  };

  const levelText = level ? levelLabels[level] || level : "";

  if (years === undefined || years === null) {
    return levelText || "Web Developer";
  }

  if (years === 0) {
    return `${levelText ? levelText + " • " : ""}Baru Mulai (< 1 thn)`;
  }

  const yrText = years === 1 ? "1 tahun" : `${years} tahun`;
  return `${levelText ? levelText + " • " : ""}${yrText} pengalaman`;
}

export function formatWorkPreferenceLabel(pref?: string | null): string {
  switch (pref) {
    case "REMOTE":
      return "Remote (Jarak Jauh)";
    case "HYBRID":
      return "Hybrid (Remote & On-site)";
    case "ONSITE":
      return "On-site (Bertemu Langsung)";
    default:
      return "Fleksibel";
  }
}
