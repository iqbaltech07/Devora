import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";
import { SkillItem } from "@/store/types";

function deriveTagsAndStack(title?: string | null, tags?: string[], primaryStack?: string[]) {
  const t = (title || "").toLowerCase();
  let defaultTags = tags && tags.length > 0 ? [...tags] : [];
  let defaultStack = primaryStack && primaryStack.length > 0 ? [...primaryStack] : [];

  if (defaultTags.length === 0) {
    if (t.includes("ui/ux") || t.includes("product design") || t.includes("design") || t.includes("figma")) {
      defaultTags = ["UI/UX", "Product Design", "Design System", "Figma", "User Research"];
    } else if (t.includes("backend") || t.includes("api") || t.includes("go") || t.includes("node")) {
      defaultTags = ["Backend", "API Architect", "Microservices", "PostgreSQL", "Database"];
    } else if (t.includes("frontend") || t.includes("react") || t.includes("next")) {
      defaultTags = ["Frontend", "Next.js", "React", "Tailwind CSS", "TypeScript"];
    } else if (t.includes("ai") || t.includes("ml") || t.includes("agent") || t.includes("llm")) {
      defaultTags = ["AI & Agents", "LLM", "Prompt Engineering", "Python", "LangChain"];
    } else if (t.includes("mobile") || t.includes("flutter") || t.includes("react native") || t.includes("ios") || t.includes("android")) {
      defaultTags = ["Mobile", "Flutter", "iOS & Android", "React Native", "Expo"];
    } else if (t.includes("devops") || t.includes("cloud") || t.includes("infra") || t.includes("aws")) {
      defaultTags = ["DevOps", "Cloud", "Docker", "Kubernetes", "AWS", "CI/CD"];
    } else {
      defaultTags = ["Fullstack", "Next.js", "TypeScript", "Node.js", "PostgreSQL"];
    }
  }

  if (defaultStack.length === 0) {
    if (t.includes("ui/ux") || t.includes("product design") || t.includes("design")) {
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

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // 1. Fetch Swiped IDs & Already Matched IDs for current user
    const [swiped, matches] = await Promise.all([
      prisma.swipe.findMany({
        where: { swiperId: currentUserId },
        select: { swipedId: true },
      }),
      prisma.match.findMany({
        where: {
          OR: [
            { user1Id: currentUserId },
            { user2Id: currentUserId },
          ],
        },
        select: { user1Id: true, user2Id: true },
      }),
    ]);
    
    const swipedIds = swiped.map((s) => s.swipedId);
    const matchedUserIds = matches.map((m) => (m.user1Id === currentUserId ? m.user2Id : m.user1Id));
    const excludedUserIds = Array.from(new Set([currentUserId, ...swipedIds, ...matchedUserIds]));

    // 2. Fetch Candidates (Not self, not already swiped, not already matched)
    const rawCandidates = await prisma.user.findMany({
      where: {
        id: {
          notIn: excludedUserIds,
        },
      },
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
        projectGoal: true,
        projects: {
          select: {
            id: true,
            title: true,
            stage: true,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // 3. Format & Enrich candidates to match CandidatePartner schema (Strict deduplication by user.id)
    const candidateMap = new Map<string, CandidatePartner>();

    rawCandidates.forEach((user, index) => {
      if (!user.id || candidateMap.has(user.id)) return;

      const { tags, primaryStack } = deriveTagsAndStack(user.title, user.tags, user.primaryStack);
      const skills = buildSkillItems(tags, primaryStack);
      const score = 90 + ((index * 3) % 9); // Consistent high match score (90-98%)

      const avatarUrl =
        user.image ||
        (user.githubUsername
          ? `https://github.com/${user.githubUsername}.png`
          : undefined);

      candidateMap.set(user.id, {
        id: user.id,
        name: user.name || "Developer",
        avatarUrl,
        image: avatarUrl,
        title: user.title || "Fullstack Engineer & Builder",
        bio:
          user.bio ||
          `Halo! Saya developer yang fokus di ${tags.slice(0, 2).join(" & ")}. Senang berkolaborasi membangun produk inovatif bareng kamu!`,
        location: user.location || "Indonesia (WIB)",
        timezone: user.timezone || "Asia/Jakarta (UTC+7)",
        availabilityHrs: user.availabilityHrs || 10,
        workStyle: user.workStyle || "Async-First & Weekend Sprint",
        githubUsername: user.githubUsername || undefined,
        githubUrl: user.githubUrl || (user.githubUsername ? `https://github.com/${user.githubUsername}` : undefined),
        matchScore: score,
        matchTier: score >= 95 ? ("EXCELLENT" as const) : ("STRONG" as const),
        matchReasons: [
          {
            title: "Spesialisasi Saling Melengkapi",
            description: `${user.name} memiliki keahlian ${tags.slice(0, 3).join(", ")} yang saling mengisi roadmap proyek.`,
            type: "role" as const,
          },
          {
            title: "Waktu Luang Selaras",
            description: `Ketersediaan ${user.availabilityHrs || 10} jam/minggu dengan gaya kolaborasi ${user.workStyle || "Async-First"}.`,
            type: "availability" as const,
          },
        ],
        tags,
        primaryStack,
        skills,
        repositories: [],
        lookingFor: {
          roles: tags.slice(0, 3),
          commitment: `${user.availabilityHrs || 10} jam/mgg (${user.workStyle || "Async-First"})`,
          projectTypes: ["SaaS", "Open Source", "MVP"],
        },
        buildingProject: user.projects?.[0] || undefined,
      });
    });

    const formattedCandidates = Array.from(candidateMap.values());

    return NextResponse.json(formattedCandidates);
  } catch (error) {
    console.error("GET /api/candidates error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
