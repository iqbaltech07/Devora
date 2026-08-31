import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

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

            // Persist synced info to database
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                githubUsername,
                githubUrl,
                image: avatarUrl,
                bio: user.bio || ghData.bio || undefined,
                location: user.location || ghData.location || undefined,
              },
              include: {
                accounts: true,
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

        // Fetch top public repos for portfolio evidence
        if (githubUsername) {
          const reposRes = await fetch(
            `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`,
            {
              headers: {
                "User-Agent": "Devora-Platform",
                Accept: "application/vnd.github.v3+json",
              },
              next: { revalidate: 300 },
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
          avatarUrl: avatarUrl || undefined,
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

    return NextResponse.json({
      ...user,
      goals: parsedGoals,
      githubUsername,
      githubUrl,
      gitAccounts,
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
    if (!session?.user) {
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
      availabilityHrs,
      workStyle,
      projectGoal,
      goals,
      onboarded,
    } = body;

    let computedProjectGoal = projectGoal;
    if (goals !== undefined && Array.isArray(goals)) {
      computedProjectGoal = goals.join(", ");
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(timezone !== undefined && { timezone }),
        ...(tags !== undefined && { tags }),
        ...(skills !== undefined && { tags: skills }),
        ...(primaryStack !== undefined && { primaryStack }),
        ...(availabilityHrs !== undefined && {
          availabilityHrs: Number(availabilityHrs),
        }),
        ...(workStyle !== undefined && { workStyle }),
        ...(computedProjectGoal !== undefined && { projectGoal: computedProjectGoal }),
        ...(onboarded !== undefined && { onboarded: Boolean(onboarded) }),
      },
      include: {
        accounts: true,
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

    return NextResponse.json({
      ...updatedUser,
      goals: parsedGoals,
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
