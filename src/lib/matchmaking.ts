import { MatchReason } from "@/store/types";

export interface ProjectRoleData {
  id?: string;
  roleTitle: string;
  requiredSkills: string[];
  hoursPerWeek: number;
  responsibilityLevel?: string;
  urgency?: string;
  description?: string | null;
}

export interface ProjectMatchTarget {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  lookingFor?: string[];
  stage?: string;
  roles: ProjectRoleData[];
}

export interface CandidateMatchProfile {
  id: string;
  name: string;
  title?: string | null;
  tags?: string[];
  primaryStack?: string[];
  skills?: { name: string; category?: string }[];
  availabilityHrs?: number | null;
  workStyle?: string | null;
  experienceYears?: number | null;
  experienceLevel?: string | null;
}

export interface ProjectMatchResult {
  score: number; // 0 - 100
  bestRoleTitle: string;
  matchedSkills: string[];
  matchReasons: MatchReason[];
  isEligible: boolean; // >= 76%
  matchTier: "EXCELLENT" | "STRONG" | "GOOD";
}

/**
 * Normalizes text to lowercase keyword array for fuzzy semantic token matching
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s/+.-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

/**
 * Checks if candidate tokens overlap with role title or target domain
 */
function evaluateDomainFit(candidateTokens: string[], roleTitle: string): number {
  const roleLow = roleTitle.toLowerCase();
  
  if (roleLow.includes("ui") || roleLow.includes("ux") || roleLow.includes("design")) {
    const isDesign = candidateTokens.some((t) => ["ui", "ux", "design", "designer", "figma", "product"].includes(t));
    return isDesign ? 92 : 45;
  }
  if (roleLow.includes("backend") || roleLow.includes("server") || roleLow.includes("database")) {
    const isBackend = candidateTokens.some((t) => ["backend", "api", "node", "go", "postgres", "sql", "redis", "database"].includes(t));
    return isBackend ? 92 : 45;
  }
  if (roleLow.includes("frontend") || roleLow.includes("web")) {
    const isFrontend = candidateTokens.some((t) => ["frontend", "react", "next", "vue", "tailwind", "typescript", "javascript", "web"].includes(t));
    return isFrontend ? 92 : 45;
  }
  if (roleLow.includes("fullstack")) {
    const isFullstack = candidateTokens.some((t) => ["fullstack", "frontend", "backend", "react", "node", "next.js"].includes(t));
    return isFullstack ? 90 : 50;
  }
  if (roleLow.includes("mobile") || roleLow.includes("flutter") || roleLow.includes("react native")) {
    const isMobile = candidateTokens.some((t) => ["mobile", "flutter", "ios", "android", "dart", "react native", "expo"].includes(t));
    return isMobile ? 92 : 45;
  }
  if (roleLow.includes("ai") || roleLow.includes("ml") || roleLow.includes("agent")) {
    const isAI = candidateTokens.some((t) => ["ai", "ml", "llm", "agent", "python", "langchain", "prompt"].includes(t));
    return isAI ? 92 : 45;
  }
  if (roleLow.includes("devops") || roleLow.includes("cloud")) {
    const isDevOps = candidateTokens.some((t) => ["devops", "cloud", "docker", "k8s", "aws", "infra", "ci"].includes(t));
    return isDevOps ? 92 : 45;
  }

  // Fallback direct keyword search
  const roleWords = tokenize(roleTitle);
  const matchedWords = roleWords.filter((w) => candidateTokens.includes(w));
  return matchedWords.length > 0 ? 85 : 55;
}

/**
 * Calculates project-to-candidate compatibility score and forensic reasons.
 * Enforces the >= 76% threshold filter for clean, lightweight recommendations.
 */
export function calculateProjectCandidateMatch(
  project: ProjectMatchTarget,
  candidate: CandidateMatchProfile
): ProjectMatchResult {
  // Collect all candidate capability tokens
  const candidateSkills = (candidate.skills || []).map((s) => s.name);
  const candidateTags = candidate.tags || [];
  const candidateStack = candidate.primaryStack || [];
  const candidateTitle = candidate.title || "";
  
  const allCandidateCapabilities = Array.from(
    new Set([...candidateSkills, ...candidateTags, ...candidateStack])
  );
  const candidateCapabilityLower = allCandidateCapabilities.map((s) => s.toLowerCase());
  
  const candidateTokens = Array.from(
    new Set([
      ...tokenize(candidateTitle),
      ...tokenize(allCandidateCapabilities.join(" ")),
    ])
  );

  const candidateAvail = candidate.availabilityHrs && candidate.availabilityHrs > 0 ? candidate.availabilityHrs : 10;
  const candidateExpLevel = (candidate.experienceLevel || "INTERMEDIATE").toUpperCase();
  const candidateExpYears = typeof candidate.experienceYears === "number" ? candidate.experienceYears : 2;

  // Case 1: Project has specified roles
  if (project.roles && project.roles.length > 0) {
    let bestScore = 0;
    let bestRole: ProjectRoleData = project.roles[0];
    let bestMatchedSkills: string[] = [];

    for (const role of project.roles) {
      // 1. Pillar 1: Role & Tech Stack Fit (50%)
      const domainScore = evaluateDomainFit(candidateTokens, role.roleTitle);
      
      const reqSkills = (role.requiredSkills && role.requiredSkills.length > 0)
        ? role.requiredSkills
        : project.tags || [];

      let matchedSkills: string[] = [];
      if (reqSkills.length > 0) {
        matchedSkills = reqSkills.filter((req) => {
          const rLow = req.toLowerCase();
          return candidateCapabilityLower.some(
            (c) => c === rLow || c.includes(rLow) || rLow.includes(c)
          );
        });
      }

      const skillOverlapRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 0.8;
      const stackScore = Math.min(100, Math.round(domainScore * 0.4 + skillOverlapRatio * 100 * 0.6));

      // 2. Pillar 2: Availability Fit (30%)
      const requiredHours = role.hoursPerWeek && role.hoursPerWeek > 0 ? role.hoursPerWeek : 8;
      let availScore = 80;
      if (candidateAvail >= requiredHours) {
        availScore = 100;
      } else {
        const ratio = candidateAvail / requiredHours;
        availScore = Math.max(50, Math.round(ratio * 95));
      }
      if (candidate.workStyle && candidate.workStyle.toLowerCase().includes("async")) {
        availScore = Math.min(100, availScore + 5);
      }

      // 3. Pillar 3: Experience & Responsibility Fit (20%)
      const resp = (role.responsibilityLevel || "CORE_BUILDER").toUpperCase();
      let expScore = 85;
      if (resp === "LEAD") {
        if (candidateExpLevel === "SENIOR" || candidateExpYears >= 3.5) expScore = 100;
        else if (candidateExpLevel === "INTERMEDIATE" || candidateExpYears >= 2) expScore = 82;
        else expScore = 65;
      } else if (resp === "CORE_BUILDER") {
        if (candidateExpLevel === "SENIOR" || candidateExpLevel === "INTERMEDIATE" || candidateExpYears >= 1.5) expScore = 98;
        else if (candidateExpLevel === "JUNIOR" || candidateExpYears >= 1) expScore = 85;
        else expScore = 70;
      } else {
        // CONTRIBUTOR / FLEXIBLE
        if (candidateExpLevel === "BEGINNER") expScore = 80;
        else expScore = 95;
      }

      // Composite calculation (50% Stack, 30% Avail, 20% Exp)
      const roleCompositeScore = Math.round(stackScore * 0.50 + availScore * 0.30 + expScore * 0.20);

      if (roleCompositeScore > bestScore) {
        bestScore = roleCompositeScore;
        bestRole = role;
        bestMatchedSkills = matchedSkills;
      }
    }

    // Clamp score between 45 and 98
    const finalScore = Math.min(98, Math.max(40, bestScore));
    const isEligible = finalScore >= 76;

    const reasons: MatchReason[] = [
      {
        title: `Spesialisasi ${bestRole.roleTitle}`,
        description: bestMatchedSkills.length > 0
          ? `${candidate.name} menguasai ${bestMatchedSkills.slice(0, 3).join(", ")} yang menjadi syarat utama peran ${bestRole.roleTitle} di "${project.title}".`
          : `Profil dan keahlian ${candidate.name} sangat sejalan dengan kebutuhan posisi ${bestRole.roleTitle} pada proyek "${project.title}".`,
        type: "role",
      },
      {
        title: "Ketersediaan Waktu & Ritme",
        description: `Memiliki waktu ${candidateAvail} jam/minggu (kebutuhan peran: ${bestRole.hoursPerWeek} jam/minggu) dengan gaya ${candidate.workStyle || "kolaboratif"}.`,
        type: "availability",
      },
    ];

    if (bestMatchedSkills.length > 0) {
      reasons.push({
        title: "Stack Saling Melengkapi",
        description: `Teknologi ${bestMatchedSkills.slice(0, 2).join(" & ")} langsung siap digunakan tanpa penyesuaian kurva belajar.`,
        type: "stack",
      });
    }

    return {
      score: finalScore,
      bestRoleTitle: bestRole.roleTitle,
      matchedSkills: bestMatchedSkills,
      matchReasons: reasons,
      isEligible,
      matchTier: finalScore >= 90 ? "EXCELLENT" : finalScore >= 80 ? "STRONG" : "GOOD",
    };
  }

  // Case 2: Project has no roles defined, match against project tags & lookingFor
  const targetTags = Array.from(new Set([...(project.tags || []), ...(project.lookingFor || [])]));
  const matched = targetTags.filter((t) => {
    const tLow = t.toLowerCase();
    return candidateCapabilityLower.some((c) => c === tLow || c.includes(tLow));
  });

  const ratio = targetTags.length > 0 ? matched.length / targetTags.length : 0.7;
  const score = Math.min(96, Math.max(50, Math.round(75 + ratio * 20)));
  const isEligible = score >= 76;

  return {
    score,
    bestRoleTitle: project.lookingFor?.[0] || "Kolaborator Proyek",
    matchedSkills: matched,
    matchReasons: [
      {
        title: "Kesesuaian Tag & Stack",
        description: matched.length > 0
          ? `Keahlian ${matched.slice(0, 3).join(", ")} relevan dengan roadmap produk "${project.title}".`
          : `Minat dan stack teknologi cocok untuk pengembangan "${project.title}".`,
        type: "stack",
      },
      {
        title: "Kesiapan Kolaborasi",
        description: `Waktu luang ${candidateAvail} jam/minggu siap dioptimalkan untuk sprint proyek.`,
        type: "availability",
      },
    ],
    isEligible,
    matchTier: score >= 90 ? "EXCELLENT" : score >= 80 ? "STRONG" : "GOOD",
  };
}
