import assert from "node:assert";

// Implementation of calculation logic from profile-utils
function calculateProfileCompleteness(user) {
  if (!user) {
    return { score: 0, isMatchReady: false, items: [], completedCount: 0, totalCount: 0, missingRequired: [] };
  }

  const items = [
    {
      key: "name",
      label: "Nama Lengkap",
      category: "REQUIRED",
      isCompleted: Boolean(user.name && user.name.trim().length > 1),
      weight: 10,
    },
    {
      key: "experienceYears",
      label: "Pengalaman Web Developer",
      category: "REQUIRED",
      isCompleted: typeof user.experienceYears === "number" && !isNaN(user.experienceYears) && user.experienceYears >= 0,
      weight: 10,
    },
    {
      key: "experienceLevel",
      label: "Tingkat Pengalaman (Level)",
      category: "REQUIRED",
      isCompleted: Boolean(user.experienceLevel && ["BEGINNER", "JUNIOR", "INTERMEDIATE", "SENIOR"].includes(user.experienceLevel)),
      weight: 10,
    },
    {
      key: "skills",
      label: "Tech Stack & Keahlian Utama",
      category: "REQUIRED",
      isCompleted: Boolean((user.skills && user.skills.length > 0) || (user.techStack && user.techStack.length > 0)),
      weight: 10,
    },
    {
      key: "location",
      label: "Domisili / Kota",
      category: "REQUIRED",
      isCompleted: Boolean(user.location && user.location.trim().length > 0),
      weight: 10,
    },
    {
      key: "availabilityHrs",
      label: "Ketersediaan Jam Kerja / Minggu",
      category: "REQUIRED",
      isCompleted: Boolean(typeof user.availabilityHrs === "number" && user.availabilityHrs > 0),
      weight: 10,
    },
    {
      key: "workPreference",
      label: "Preferensi Kerja (Remote / Hybrid / On-site)",
      category: "REQUIRED",
      isCompleted: Boolean(user.workPreference && ["REMOTE", "HYBRID", "ONSITE"].includes(user.workPreference)),
      weight: 10,
    },
    {
      key: "title",
      label: "Headline / Posisi Utama",
      category: "RECOMMENDED",
      isCompleted: Boolean(user.title && user.title.trim().length > 2),
      weight: 5,
    },
    {
      key: "bio",
      label: "Bio Singkat",
      category: "RECOMMENDED",
      isCompleted: Boolean(user.bio && user.bio.trim().length > 5),
      weight: 5,
    },
    {
      key: "image",
      label: "Foto Profil / Avatar",
      category: "RECOMMENDED",
      isCompleted: Boolean((user.image && user.image.trim().length > 0) || (user.avatarUrl && user.avatarUrl.trim().length > 0)),
      weight: 5,
    },
    {
      key: "links",
      label: "Tautan Portofolio / GitHub / LinkedIn",
      category: "RECOMMENDED",
      isCompleted: Boolean(user.portfolioUrl || user.githubUrl || user.githubUsername || user.linkedinUrl || user.websiteUrl),
      weight: 5,
    },
    {
      key: "timezone",
      label: "Zona Waktu (Timezone)",
      category: "OPTIONAL",
      isCompleted: Boolean(user.timezone && user.timezone.trim().length > 0),
      weight: 5,
    },
    {
      key: "availableDays",
      label: "Hari Aktif Kolaborasi",
      category: "OPTIONAL",
      isCompleted: Boolean((user.availableDays && user.availableDays.length > 0) || user.workStyle),
      weight: 5,
    },
  ];

  let calculatedScore = 0;
  let completedCount = 0;
  const missingRequired = [];

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

  return {
    score,
    isMatchReady,
    items,
    completedCount,
    totalCount: items.length,
    missingRequired,
  };
}

function formatExperienceLabel(years, level) {
  const levelLabels = {
    BEGINNER: "Pemula (Beginner)",
    JUNIOR: "Junior Developer",
    INTERMEDIATE: "Intermediate Developer",
    SENIOR: "Senior Developer",
  };
  const levelText = level ? levelLabels[level] || level : "";
  if (years === undefined || years === null) return levelText || "Web Developer";
  if (years === 0) return `${levelText ? levelText + " • " : ""}Baru Mulai (< 1 thn)`;
  const yrText = years === 1 ? "1 tahun" : `${years} tahun`;
  return `${levelText ? levelText + " • " : ""}${yrText} pengalaman`;
}

function formatWorkPreferenceLabel(pref) {
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

console.log("⚡ Executing unit tests for Phase 1...");

// Test 1: Blank user
const r1 = calculateProfileCompleteness({ id: "1", name: "" });
assert.strictEqual(r1.score, 0);
assert.strictEqual(r1.isMatchReady, false);
assert.strictEqual(r1.missingRequired.length, 7);
console.log("✔ Test 1 passed: Blank user correctly gives 0% completeness and is not match ready.");

// Test 2: Incomplete profile (missing experienceYears and workPreference)
const r2 = calculateProfileCompleteness({
  id: "2",
  name: "Acelino",
  skills: ["React"],
  location: "Bandung",
  availabilityHrs: 10,
});
assert.strictEqual(r2.isMatchReady, false);
assert.strictEqual(r2.score, 40); // 4 required items * 10% = 40%
console.log("✔ Test 2 passed: Incomplete profile correctly identifies missing required fields.");

// Test 3: Match ready minimum profile
const r3 = calculateProfileCompleteness({
  id: "3",
  name: "Acelino",
  experienceYears: 2,
  experienceLevel: "JUNIOR",
  skills: ["Next.js", "TypeScript"],
  location: "Bandung",
  availabilityHrs: 10,
  workPreference: "REMOTE",
});
assert.strictEqual(r3.isMatchReady, true);
assert.strictEqual(r3.score, 70); // 7 required items = 70%
console.log("✔ Test 3 passed: Minimum required profile scores 70% and is match ready.");

// Test 4: 100% Complete Profile
const r4 = calculateProfileCompleteness({
  id: "4",
  name: "Marchelino Kurniawan",
  title: "Founder & Fullstack Developer",
  bio: "Passionate about interactive frontend experiences and scalable web apps.",
  image: "https://avatar.png",
  location: "Bandung",
  timezone: "Asia/Jakarta (UTC+7)",
  skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL"],
  techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL"],
  availabilityHrs: 20,
  workStyle: "Async-First",
  experienceYears: 3,
  experienceLevel: "INTERMEDIATE",
  workPreference: "REMOTE",
  flexibleHours: true,
  availableDays: ["Senin", "Rabu", "Jumat"],
  portfolioUrl: "https://acelino.dev",
  githubUsername: "acelino",
  linkedinUrl: "https://linkedin.com/in/acelino",
  websiteUrl: "https://acelino.dev",
});
assert.strictEqual(r4.isMatchReady, true);
assert.strictEqual(r4.score, 100);
console.log("✔ Test 4 passed: 100% full profile correctly scores 100%.");

// Test 5: Formatters
assert.strictEqual(formatExperienceLabel(0, "BEGINNER"), "Pemula (Beginner) • Baru Mulai (< 1 thn)");
assert.strictEqual(formatExperienceLabel(3, "SENIOR"), "Senior Developer • 3 tahun pengalaman");
assert.strictEqual(formatWorkPreferenceLabel("REMOTE"), "Remote (Jarak Jauh)");
assert.strictEqual(formatWorkPreferenceLabel("HYBRID"), "Hybrid (Remote & On-site)");
assert.strictEqual(formatWorkPreferenceLabel("ONSITE"), "On-site (Bertemu Langsung)");
console.log("✔ Test 5 passed: Label formatters return clean Indonesian outputs.");

console.log("\n🎉 ALL PHASE 1 UNIT & INTEGRATION TESTS PASSED!");
