import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";
import { CandidatePartner, SkillItem } from "@/store/types";
import { likesReceivedLimiter, checkRateLimit } from "@/lib/ratelimit";

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

// GET /api/likes/received: Fetch users who swiped RIGHT on current user but haven't been matched/swiped back yet
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // Rate Limiting: max 30 incoming likes requests / minute per user
    const rateLimit = await checkRateLimit(likesReceivedLimiter, currentUserId);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Terlalu banyak permintaan data peminat. Harap tunggu sebentar.",
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        }
      );
    }

    const cacheKey = `likes:received:${currentUserId}`;

    // 1. Check Redis Cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(
          typeof cached === "string" ? JSON.parse(cached) : cached
        );
      }
    } catch (cacheErr) {
      console.warn("Redis GET likes:received error:", cacheErr);
    }

    // 2. Query users who swiped RIGHT on current user
    const [alreadySwipedByMe, existingMatches, incomingSwipes] = await Promise.all([
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
      prisma.swipe.findMany({
        where: {
          swipedId: currentUserId,
          direction: "RIGHT",
        },
        include: {
          swiper: {
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
                  description: true,
                  stage: true,
                  tags: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const excludedIds = new Set([
      currentUserId,
      ...alreadySwipedByMe.map((s) => s.swipedId),
      ...existingMatches.map((m) => (m.user1Id === currentUserId ? m.user2Id : m.user1Id)),
    ]);

    const likesMap = new Map<string, CandidatePartner & { likedAt?: string }>();

    incomingSwipes.forEach((swipe, index) => {
      const user = swipe.swiper;
      if (!user || !user.id || excludedIds.has(user.id) || likesMap.has(user.id)) {
        return;
      }

      const { tags, primaryStack } = deriveTagsAndStack(user.title, user.tags, user.primaryStack);
      const skills = buildSkillItems(tags, primaryStack);
      const score = 94 + ((index * 2) % 6); // 94-99% strong match

      const avatarUrl =
        user.image ||
        (user.githubUsername
          ? `https://github.com/${user.githubUsername}.png`
          : undefined);

      likesMap.set(user.id, {
        id: user.id,
        name: user.name || "Developer",
        avatarUrl,
        title: user.title || "Fullstack Engineer & Partner",
        bio:
          user.bio ||
          `Halo! Saya tertarik mengajak kamu berkolaborasi membangun produk inovatif bersama di Devora.`,
        location: user.location || "Indonesia (WIB)",
        timezone: user.timezone || "Asia/Jakarta (UTC+7)",
        availabilityHrs: user.availabilityHrs || 10,
        workStyle: user.workStyle || "Async-First & Weekend Sprint",
        githubUsername: user.githubUsername || undefined,
        githubUrl: user.githubUrl || (user.githubUsername ? `https://github.com/${user.githubUsername}` : undefined),
        matchScore: score,
        matchTier: "EXCELLENT" as const,
        matchReasons: [
          {
            title: "Menyukai Profil Kamu",
            description: `${user.name} sudah memberikan love ke profilmu dan siap ngoding bareng!`,
            type: "role" as const,
          },
          {
            title: "Ketersediaan Waktu",
            description: `Siap alokasi ${user.availabilityHrs || 10} jam/minggu (${user.workStyle || "Async-First"}).`,
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
        buildingProject: user.projects?.[0]
          ? {
              title: user.projects[0].title,
              description: user.projects[0].description || "Building an exciting product on Devora",
              stage: (user.projects[0].stage as any) || "MVP",
              tech: user.projects[0].tags || primaryStack,
            }
          : undefined,
        likedAt: swipe.createdAt.toISOString(),
      });
    });

    const incomingLikes = Array.from(likesMap.values());
    const responsePayload = {
      likes: incomingLikes,
      count: incomingLikes.length,
    };

    // 3. Cache for 3 minutes (180 seconds)
    try {
      await redis.setex(cacheKey, 180, responsePayload);
    } catch (cacheSetErr) {
      console.warn("Redis SETEX likes:received error:", cacheSetErr);
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("GET /api/likes/received error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
