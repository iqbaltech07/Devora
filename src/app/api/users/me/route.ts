import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { calculateProfileCompleteness } from "@/lib/profile-utils";

const githubReposCache = new Map<string, { data: any[]; expiresAt: number }>();

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
        certificates: {
          orderBy: { createdAt: "desc" },
        },
        portfolios: {
          orderBy: { createdAt: "desc" },
        },
        projects: {
          include: { roles: true, roadmap: true, joinRequests: true },
        },
        joinRequests: {
          include: { project: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a GitHub account and sync GitHub metadata
    const githubAccount = user.accounts?.find(
      (acc: any) => acc.providerId === "github"
    );

    let githubUsername = user.githubUsername;
    let githubUrl = user.githubUrl;
    let avatarUrl = user.image;
    let gitRepos: any[] = [];

    if (githubAccount) {
      try {
        // If we haven't resolved githubUsername yet, fetch from GitHub API
        if (!githubUsername) {
          const ghHeaders: Record<string, string> = {
            "User-Agent": "Devora-Platform",
            Accept: "application/vnd.github.v3+json",
          };
          if (githubAccount.accessToken) {
            ghHeaders["Authorization"] = `Bearer ${githubAccount.accessToken}`;
          }

          const ghRes = await fetch("https://api.github.com/user", {
            headers: ghHeaders,
          });

          if (ghRes.ok) {
            const ghData = await ghRes.json();
            githubUsername = ghData.login;
            githubUrl = ghData.html_url || `https://github.com/${ghData.login}`;
            avatarUrl = ghData.avatar_url || avatarUrl;

            // Persist synced info to database without overwriting custom uploaded avatar
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                githubUsername,
                githubUrl,
                image: user.image || avatarUrl,
                bio: user.bio || ghData.bio || undefined,
                location: user.location || ghData.location || undefined,
              },
              include: {
                accounts: true,
                certificates: true,
                portfolios: true,
                projects: {
                  include: { roles: true, roadmap: true, joinRequests: true },
                },
                joinRequests: {
                  include: { project: true },
                },
              },
            });
          }
        }

        // Fetch top public repos for portfolio evidence with in-memory caching
        if (githubUsername) {
          const now = Date.now();
          const cached = githubReposCache.get(githubUsername);
          if (cached && cached.expiresAt > now) {
            gitRepos = cached.data;
          } else {
            const reposRes = await fetch(
              `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`,
              {
                headers: {
                  "User-Agent": "Devora-Platform",
                  Accept: "application/vnd.github.v3+json",
                },
              }
            );
            if (reposRes.ok) {
              const rawRepos = await reposRes.json();
              if (Array.isArray(rawRepos)) {
                gitRepos = rawRepos.map((r: any) => ({
                  id: `gh-repo-${r.id}`,
                  name: r.name,
                  description: r.description || "No description provided.",
                  language: r.language || "TypeScript",
                  languageColor: getLanguageColor(r.language),
                  starsCount: r.stargazers_count || 0,
                  forksCount: r.forks_count || 0,
                  isPrivate: r.private || false,
                  updatedAt: r.updated_at || new Date().toISOString(),
                  isEvidence: true,
                  url: r.html_url || `https://github.com/${githubUsername}/${r.name}`,
                }));
                githubReposCache.set(githubUsername, {
                  data: gitRepos,
                  expiresAt: now + 5 * 60 * 1000, // 5 mins cache
                });
              }
            }
          }
        }
      } catch (ghErr) {
        console.error("Error fetching GitHub metadata:", ghErr);
      }
    }

    const gitAccounts = githubAccount
      ? [
        {
          provider: "github" as const,
          connected: true,
          username: githubUsername || "GitHub User",
          profileUrl: githubUrl || `https://github.com/${githubUsername || ""}`,
          avatarUrl: user.image || avatarUrl || undefined,
          lastSyncedAt: new Date().toISOString(),
          totalRepos: gitRepos.length,
          repositories: gitRepos,
        },
        {
          provider: "gitlab" as const,
          connected: false,
          repositories: [],
        },
      ]
      : [];

    const parsedGoals = user.projectGoal
      ? user.projectGoal.startsWith("[")
        ? JSON.parse(user.projectGoal)
        : user.projectGoal.split(",").map((g: string) => g.trim()).filter(Boolean)
      : [];

    const completeness = calculateProfileCompleteness({
      id: user.id,
      name: user.name,
      title: user.title || "",
      bio: user.bio || "",
      location: user.location || "",
      timezone: user.timezone || "",
      image: user.image || "",
      avatarUrl: user.image || "",
      skills: user.tags || [],
      techStack: user.primaryStack || user.tags || [],
      availabilityHrs: user.availabilityHrs || 0,
      workStyle: user.workStyle || "",
      experienceYears: user.experienceYears ?? undefined,
      experienceLevel: (user.experienceLevel as any) || undefined,
      workPreference: (user.workPreference as any) || undefined,
      flexibleHours: user.flexibleHours ?? true,
      availableDays: user.availableDays || [],
      portfolioUrl: user.portfolioUrl || "",
      linkedinUrl: user.linkedinUrl || "",
      websiteUrl: user.websiteUrl || "",
      githubUrl: githubUrl || "",
      githubUsername: githubUsername || "",
    });

    return NextResponse.json({
      ...user,
      image: user.image || avatarUrl || "",
      avatarUrl: user.image || avatarUrl || "",
      goals: parsedGoals,
      githubUsername,
      githubUrl,
      gitAccounts,
      profileCompleteness: completeness.score,
      completenessBreakdown: completeness,
    });
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      title,
      bio,
      location,
      timezone,
      tags,
      skills,
      primaryStack,
      techStack,
      availabilityHrs,
      workStyle,
      projectGoal,
      goals,
      onboarded,
      image,
      avatarUrl,
      // Phase 1 Professional Profile Fields
      experienceYears,
      experienceLevel,
      workPreference,
      flexibleHours,
      availableDays,
      portfolioUrl,
      linkedinUrl,
      websiteUrl,
    } = body;

    // Server-side validation for experience
    let parsedExpYears: number | null | undefined = undefined;
    if (experienceYears !== undefined) {
      if (experienceYears === null || experienceYears === "") {
        parsedExpYears = null;
      } else {
        const num = Number(experienceYears);
        if (isNaN(num) || num < 0 || num > 70) {
          return NextResponse.json(
            { error: "Pengalaman Web Developer harus berupa angka positif yang masuk akal (0 - 70 tahun)." },
            { status: 400 }
          );
        }
        parsedExpYears = num;
      }
    }

    // Server-side validation for experience level
    let parsedExpLevel: string | null | undefined = undefined;
    if (experienceLevel !== undefined) {
      if (experienceLevel === null || experienceLevel === "") {
        parsedExpLevel = null;
      } else if (["BEGINNER", "JUNIOR", "INTERMEDIATE", "SENIOR"].includes(String(experienceLevel).toUpperCase())) {
        parsedExpLevel = String(experienceLevel).toUpperCase();
      } else {
        return NextResponse.json(
          { error: "Tingkat pengalaman harus salah satu dari: BEGINNER, JUNIOR, INTERMEDIATE, SENIOR." },
          { status: 400 }
        );
      }
    }

    // Server-side validation for work preference
    let parsedWorkPref: string | null | undefined = undefined;
    if (workPreference !== undefined) {
      if (workPreference === null || workPreference === "") {
        parsedWorkPref = null;
      } else if (["REMOTE", "HYBRID", "ONSITE"].includes(String(workPreference).toUpperCase())) {
        parsedWorkPref = String(workPreference).toUpperCase();
      } else {
        return NextResponse.json(
          { error: "Preferensi kerja harus salah satu dari: REMOTE, HYBRID, ONSITE." },
          { status: 400 }
        );
      }
    }

    let computedProjectGoal = projectGoal;
    if (goals !== undefined && Array.isArray(goals)) {
      computedProjectGoal = goals.join(", ");
    }

    const resolvedSkills = Array.isArray(skills)
      ? skills
      : Array.isArray(techStack)
      ? techStack
      : Array.isArray(tags)
      ? tags
      : undefined;

    const resolvedPrimaryStack = Array.isArray(primaryStack)
      ? primaryStack
      : Array.isArray(techStack)
      ? techStack
      : resolvedSkills;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(title !== undefined && { title: String(title).trim() }),
        ...(bio !== undefined && { bio: String(bio).trim() }),
        ...(location !== undefined && { location: String(location).trim() }),
        ...(timezone !== undefined && { timezone: String(timezone).trim() }),
        ...(image !== undefined && { image: image ? String(image).trim() : null }),
        ...(avatarUrl !== undefined && image === undefined && { image: avatarUrl ? String(avatarUrl).trim() : null }),
        ...(resolvedSkills !== undefined && { tags: resolvedSkills }),
        ...(resolvedPrimaryStack !== undefined && { primaryStack: resolvedPrimaryStack }),
        ...(availabilityHrs !== undefined && {
          availabilityHrs: Number(availabilityHrs) >= 0 ? Number(availabilityHrs) : 0,
        }),
        ...(workStyle !== undefined && { workStyle: String(workStyle).trim() }),
        ...(computedProjectGoal !== undefined && { projectGoal: computedProjectGoal }),
        ...(onboarded !== undefined && { onboarded: Boolean(onboarded) }),

        // Phase 1 Professional Fields
        ...(parsedExpYears !== undefined && { experienceYears: parsedExpYears }),
        ...(parsedExpLevel !== undefined && { experienceLevel: parsedExpLevel }),
        ...(parsedWorkPref !== undefined && { workPreference: parsedWorkPref }),
        ...(flexibleHours !== undefined && { flexibleHours: Boolean(flexibleHours) }),
        ...(Array.isArray(availableDays) && { availableDays }),
        ...(portfolioUrl !== undefined && { portfolioUrl: portfolioUrl ? String(portfolioUrl).trim() : null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : null }),
        ...(websiteUrl !== undefined && { websiteUrl: websiteUrl ? String(websiteUrl).trim() : null }),
      },
      include: {
        accounts: true,
        certificates: {
          orderBy: { createdAt: "desc" },
        },
        portfolios: {
          orderBy: { createdAt: "desc" },
        },
        projects: {
          include: { roles: true, roadmap: true, joinRequests: true },
        },
        joinRequests: {
          include: { project: true },
        },
      },
    });

    const parsedGoals = updatedUser.projectGoal
      ? updatedUser.projectGoal.startsWith("[")
        ? JSON.parse(updatedUser.projectGoal)
        : updatedUser.projectGoal.split(",").map((g: string) => g.trim()).filter(Boolean)
      : [];

    const completeness = calculateProfileCompleteness({
      id: updatedUser.id,
      name: updatedUser.name,
      title: updatedUser.title || "",
      bio: updatedUser.bio || "",
      location: updatedUser.location || "",
      timezone: updatedUser.timezone || "",
      image: updatedUser.image || "",
      avatarUrl: updatedUser.image || "",
      skills: updatedUser.tags || [],
      techStack: updatedUser.primaryStack || updatedUser.tags || [],
      availabilityHrs: updatedUser.availabilityHrs || 0,
      workStyle: updatedUser.workStyle || "",
      experienceYears: updatedUser.experienceYears ?? undefined,
      experienceLevel: (updatedUser.experienceLevel as any) || undefined,
      workPreference: (updatedUser.workPreference as any) || undefined,
      flexibleHours: updatedUser.flexibleHours ?? true,
      availableDays: updatedUser.availableDays || [],
      portfolioUrl: updatedUser.portfolioUrl || "",
      linkedinUrl: updatedUser.linkedinUrl || "",
      websiteUrl: updatedUser.websiteUrl || "",
      githubUrl: updatedUser.githubUrl || "",
      githubUsername: updatedUser.githubUsername || "",
    });

    return NextResponse.json({
      ...updatedUser,
      goals: parsedGoals,
      profileCompleteness: completeness.score,
      completenessBreakdown: completeness,
    });
  } catch (error) {
    console.error("PUT /api/users/me error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function getLanguageColor(language?: string): string {
  switch (language) {
    case "TypeScript":
      return "#3178C6";
    case "JavaScript":
      return "#F7DF1E";
    case "Python":
      return "#3572A5";
    case "Go":
      return "#00ADD8";
    case "Rust":
      return "#DEA584";
    case "HTML":
      return "#E34F26";
    case "CSS":
      return "#563D7C";
    case "PHP":
      return "#4F5D95";
    default:
      return "#8B949E";
  }
}
