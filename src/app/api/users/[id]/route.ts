import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { calculateProfileCompleteness } from "@/lib/profile-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
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
        createdAt: true,
        // Phase 1 Professional fields
        experienceYears: true,
        experienceLevel: true,
        workPreference: true,
        flexibleHours: true,
        availableDays: true,
        portfolioUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        projects: {
          select: {
            id: true,
            title: true,
            description: true,
            stage: true,
            tags: true,
          },
          take: 3,
        },
        certificates: {
          select: {
            id: true,
            title: true,
            issuer: true,
            issueDate: true,
            credentialUrl: true,
            fileUrl: true,
          },
          orderBy: { createdAt: "desc" },
        },
        portfolios: {
          select: {
            id: true,
            title: true,
            description: true,
            liveUrl: true,
            repoUrl: true,
            tags: true,
            imageUrl: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const parsedGoals = targetUser.projectGoal
      ? targetUser.projectGoal.startsWith("[")
        ? JSON.parse(targetUser.projectGoal)
        : targetUser.projectGoal.split(",").map((g: string) => g.trim()).filter(Boolean)
      : [];

    const completeness = calculateProfileCompleteness({
      id: targetUser.id,
      name: targetUser.name,
      title: targetUser.title || "",
      bio: targetUser.bio || "",
      location: targetUser.location || "",
      timezone: targetUser.timezone || "",
      image: targetUser.image || "",
      avatarUrl: targetUser.image || "",
      skills: targetUser.tags || [],
      techStack: targetUser.primaryStack || targetUser.tags || [],
      availabilityHrs: targetUser.availabilityHrs || 0,
      workStyle: targetUser.workStyle || "",
      experienceYears: targetUser.experienceYears ?? undefined,
      experienceLevel: (targetUser.experienceLevel as any) || undefined,
      workPreference: (targetUser.workPreference as any) || undefined,
      flexibleHours: targetUser.flexibleHours ?? true,
      availableDays: targetUser.availableDays || [],
      portfolioUrl: targetUser.portfolioUrl || "",
      linkedinUrl: targetUser.linkedinUrl || "",
      websiteUrl: targetUser.websiteUrl || "",
      githubUrl: targetUser.githubUrl || "",
      githubUsername: targetUser.githubUsername || "",
    });

    return NextResponse.json({
      ...targetUser,
      goals: parsedGoals,
      profileCompleteness: completeness.score,
      completenessBreakdown: completeness,
    });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
