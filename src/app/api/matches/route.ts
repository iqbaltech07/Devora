import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";
import { CandidatePartner, CompatibilityResult, SkillItem } from "@/store/types";

function deriveTagsAndStack(title?: string | null, tags?: string[], primaryStack?: string[]) {
  const t = (title || "").toLowerCase();
  let defaultTags = tags && tags.length > 0 ? [...tags] : [];
  let defaultStack = primaryStack && primaryStack.length > 0 ? [...primaryStack] : [];

  if (defaultTags.length === 0) {
    if (t.includes("ui/ux") || t.includes("design")) {
      defaultTags = ["UI/UX", "Product Design", "Design System", "Figma", "User Research"];
    } else if (t.includes("backend") || t.includes("api") || t.includes("database")) {
      defaultTags = ["Backend", "API Architect", "PostgreSQL", "Database", "Redis"];
    } else if (t.includes("frontend") || t.includes("react") || t.includes("next")) {
      defaultTags = ["Frontend", "Next.js", "React", "Tailwind CSS", "TypeScript"];
    } else if (t.includes("ai") || t.includes("agent") || t.includes("llm")) {
      defaultTags = ["AI & Agents", "LLM", "Prompt Engineering", "Python", "LangChain"];
    } else if (t.includes("mobile") || t.includes("flutter") || t.includes("react native")) {
      defaultTags = ["Mobile", "Flutter", "iOS & Android", "React Native", "Expo"];
    } else if (t.includes("devops") || t.includes("cloud")) {
      defaultTags = ["DevOps", "Cloud", "Docker", "Kubernetes", "AWS", "CI/CD"];
    } else {
      defaultTags = ["Fullstack", "Next.js", "TypeScript", "Node.js", "PostgreSQL"];
    }
  }

  if (defaultStack.length === 0) {
    if (t.includes("ui/ux") || t.includes("design")) {
      defaultStack = ["Figma", "Design Systems", "Prototyping", "Tailwind CSS", "User Flow"];
    } else if (t.includes("backend")) {
      defaultStack = ["Go", "Node.js", "PostgreSQL", "Redis", "Docker"];
    } else if (t.includes("frontend")) {
      defaultStack = ["Next.js", "TypeScript", "Tailwind CSS", "React", "Zustand"];
    } else if (t.includes("ai")) {
      defaultStack = ["Python", "FastAPI", "OpenAI", "LangChain", "Vector DB"];
    } else if (t.includes("mobile")) {
      defaultStack = ["Flutter", "Dart", "React Native", "Expo"];
    } else if (t.includes("devops")) {
      defaultStack = ["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"];
    } else {
      defaultStack = ["TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"];
    }
  }

  return { tags: defaultTags, primaryStack: defaultStack };
}

function buildSkillItems(tags: string[], primaryStack: string[]): SkillItem[] {
  const combined = Array.from(new Set([...tags, ...primaryStack]));
  return combined.map((name, i) => {
    let category: SkillItem["category"] = "Frontend";
    const n = name.toLowerCase();
    if (n.includes("ui") || n.includes("ux") || n.includes("figma") || n.includes("design")) category = "UI/UX";
    else if (n.includes("backend") || n.includes("api") || n.includes("node") || n.includes("go") || n.includes("express")) category = "Backend";
    else if (n.includes("sql") || n.includes("redis") || n.includes("db") || n.includes("database") || n.includes("postgres")) category = "Database";
    else if (n.includes("devops") || n.includes("cloud") || n.includes("docker") || n.includes("k8s") || n.includes("aws")) category = "DevOps & Cloud";
    else if (n.includes("ai") || n.includes("ml") || n.includes("llm") || n.includes("python") || n.includes("langchain")) category = "AI & Agents";
    else if (n.includes("mobile") || n.includes("flutter") || n.includes("ios") || n.includes("android")) category = "Mobile";

    return {
      id: `skill-${i}-${name}`,
      name,
      category,
      proficiency: i < 2 ? "Senior" : "Mid",
      yearsOfExperience: i < 2 ? 3 : 2,
      isPrimary: i < 3,
    };
  });
}

// GET /api/matches: Fetch all mutually matched partners for current user
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const cacheKey = `matches:${currentUserId}`;

    // 1. Check Redis Cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(
          typeof cached === "string" ? JSON.parse(cached) : cached
        );
      }
    } catch (cacheErr) {
      console.warn("Redis GET matches error:", cacheErr);
    }

    // 2. Fetch matches from Prisma where current user is user1 or user2
    const rawMatches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
            bio: true,
            location: true,
            timezone: true,
            githubUsername: true,
            githubUrl: true,
            tags: true,
            primaryStack: true,
            availabilityHrs: true,
            workStyle: true,
            projects: {
              select: { id: true, title: true, description: true, stage: true, tags: true },
              take: 1,
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
            bio: true,
            location: true,
            timezone: true,
            githubUsername: true,
            githubUrl: true,
            tags: true,
            primaryStack: true,
            availabilityHrs: true,
            workStyle: true,
            projects: {
              select: { id: true, title: true, description: true, stage: true, tags: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Format into CandidatePartner and CompatibilityResult schemas (Strict deduplication by partner.id)
    const partnerMap = new Map<string, CandidatePartner>();

    rawMatches.forEach((m, index) => {
      const partner = m.user1Id === currentUserId ? m.user2 : m.user1;
      if (!partner || !partner.id || partner.id === currentUserId || partnerMap.has(partner.id)) {
        return;
      }

      const { tags, primaryStack } = deriveTagsAndStack(partner.title, partner.tags, partner.primaryStack);
      const skills = buildSkillItems(tags, primaryStack);
      const score = 92 + ((index * 3) % 7);

      const avatarUrl =
        partner.image ||
        (partner.githubUsername ? `https://github.com/${partner.githubUsername}.png` : undefined);

      partnerMap.set(partner.id, {
        id: partner.id,
        name: partner.name || "Developer",
        avatarUrl,
        title: partner.title || "Fullstack Engineer & Partner",
        bio: partner.bio || `Halo! Senang bisa ngoding bareng kamu di Devora.`,
        location: partner.location || "Indonesia (WIB)",
        timezone: partner.timezone || "Asia/Jakarta (UTC+7)",
        availabilityHrs: partner.availabilityHrs || 10,
        workStyle: partner.workStyle || "Async-First & Weekend Sprint",
        githubUsername: partner.githubUsername || undefined,
        githubUrl: partner.githubUrl || (partner.githubUsername ? `https://github.com/${partner.githubUsername}` : undefined),
        matchScore: score,
        matchTier: score >= 95 ? ("EXCELLENT" as const) : ("STRONG" as const),
        matchReasons: [
          {
            title: "Partner Terkonfirmasi",
            description: `Kamu dan ${partner.name} sudah saling terhubung untuk kolaborasi proyek.`,
            type: "role" as const,
          },
          {
            title: "Ketersediaan Waktu",
            description: `Siap kolaborasi ${partner.availabilityHrs || 10} jam/minggu (${partner.workStyle || "Async-First"}).`,
            type: "availability" as const,
          },
        ],
        tags,
        primaryStack,
        skills,
        repositories: [],
        lookingFor: {
          roles: tags.slice(0, 3),
          commitment: `${partner.availabilityHrs || 10} jam/mgg (${partner.workStyle || "Async-First"})`,
          projectTypes: ["SaaS", "Open Source", "MVP"],
        },
        buildingProject: partner.projects?.[0]
          ? {
              title: partner.projects[0].title,
              description: partner.projects[0].description || "Building an exciting product on Devora",
              stage: (partner.projects[0].stage as any) || "MVP",
              tech: partner.projects[0].tags || primaryStack,
            }
          : undefined,
      });
    });

    const matchedCandidates = Array.from(partnerMap.values());

    const compatibilityResults: CompatibilityResult[] = matchedCandidates.map((c) => ({
      targetUserId: c.id,
      candidateName: c.name,
      candidateTitle: c.title,
      score: c.matchScore,
      stackOverlap: c.primaryStack.slice(0, 4),
      complementarySkills: c.skills.map((s) => s.name).slice(0, 3),
      hoursOverlap: `${c.availabilityHrs} hrs/wk (${c.workStyle})`,
      reasons: c.matchReasons,
    }));

    const responsePayload = {
      candidates: matchedCandidates,
      matches: compatibilityResults,
    };

    // 4. Cache for 10 minutes
    try {
      await redis.setex(cacheKey, 600, responsePayload);
    } catch (cacheSetErr) {
      console.warn("Redis SETEX matches error:", cacheSetErr);
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("GET /api/matches error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
