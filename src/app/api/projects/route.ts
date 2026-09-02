import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = "projects:all";

    // 1. Check Cache
    try {
      const cachedProjects = await redis.get(cacheKey);
      if (cachedProjects) {
        return NextResponse.json(
          typeof cachedProjects === "string"
            ? JSON.parse(cachedProjects)
            : cachedProjects
        );
      }
    } catch (cacheErr) {
      console.warn("Redis GET failed, fallback to DB query:", cacheErr);
    }

    // 2. Fetch from DB
    const projects = await prisma.project.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
        roles: true,
        roadmap: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Format to match frontend Project interface
    const formattedProjects = projects.map((p) => ({
      id: p.id,
      ownerId: p.authorId,
      ownerName: p.author?.name || session.user.name || "Developer",
      title: p.title,
      description: p.description,
      stage: p.stage,
      repoUrl: p.repoUrl || undefined,
      tags: p.tags || [],
      isRecruiting: !p.tags?.includes("RECRUITMENT_CLOSED"),
      roles: p.roles.map((r) => ({
        id: r.id,
        roleTitle: r.roleTitle,
        requiredSkills: r.requiredSkills || [],
        hoursPerWeek: r.hoursPerWeek,
        responsibilityLevel: r.responsibilityLevel as any,
        urgency: r.urgency as any,
        description: r.description || "",
      })),
      roadmap: p.roadmap.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description || "",
        targetQuarter: m.targetQuarter,
        status: m.status as any,
      })),
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    }));

    // 4. Cache for 1 hour
    try {
      await redis.setex(cacheKey, 3600, formattedProjects);
    } catch (cacheSetErr) {
      console.warn("Redis SETEX failed:", cacheSetErr);
    }

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, tags, lookingFor, stage, roles, roadmap, repoUrl } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // 1. Create Project in PostgreSQL via Prisma
    const newProject = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        tags: tags || [],
        lookingFor: lookingFor || [],
        stage: stage || "MVP",
        repoUrl: repoUrl?.trim() || null,
        authorId: session.user.id,
        roles: {
          create:
            roles?.map((role: any) => ({
              roleTitle: role.roleTitle,
              requiredSkills: role.requiredSkills || [],
              hoursPerWeek: Number(role.hoursPerWeek) || 5,
              responsibilityLevel: role.responsibilityLevel || "CORE_BUILDER",
              urgency: role.urgency || "IMMEDIATE",
              description: role.description || "",
            })) || [],
        },
        roadmap: {
          create:
            roadmap?.map((milestone: any) => ({
              title: milestone.title,
              description: milestone.description || "",
              targetQuarter: milestone.targetQuarter || "Q4 2026",
              status: milestone.status || "UPCOMING",
            })) || [],
        },
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, title: true },
        },
        roles: true,
        roadmap: true,
      },
    });

    // 2. Invalidate Projects Cache
    try {
      await redis.del("projects:all");
    } catch (cacheDelErr) {
      console.warn("Redis DEL failed:", cacheDelErr);
    }

    // 3. Format response for frontend Project contract
    const formatted = {
      id: newProject.id,
      ownerId: newProject.authorId,
      ownerName: newProject.author?.name || session.user.name || "Developer",
      title: newProject.title,
      description: newProject.description,
      stage: newProject.stage,
      repoUrl: newProject.repoUrl || undefined,
      tags: newProject.tags,
      isRecruiting: !newProject.tags?.includes("RECRUITMENT_CLOSED"),
      roles: newProject.roles.map((r) => ({
        id: r.id,
        roleTitle: r.roleTitle,
        requiredSkills: r.requiredSkills || [],
        hoursPerWeek: r.hoursPerWeek,
        responsibilityLevel: r.responsibilityLevel as any,
        urgency: r.urgency as any,
        description: r.description || "",
      })),
      roadmap: newProject.roadmap.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description || "",
        targetQuarter: m.targetQuarter,
        status: m.status as any,
      })),
      createdAt:
        newProject.createdAt instanceof Date
          ? newProject.createdAt.toISOString()
          : String(newProject.createdAt),
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Update project details or toggle recruitment status
export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, stage, repoUrl, isRecruiting, tags } = body;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const target = await prisma.project.findUnique({
      where: { id },
      include: { author: true, roles: true, roadmap: true },
    });

    if (!target || target.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized or Not Found" }, { status: 403 });
    }

    // Process tags with recruitment status
    let updatedTags = tags !== undefined ? [...tags] : [...(target.tags || [])];
    if (isRecruiting !== undefined) {
      if (!isRecruiting) {
        if (!updatedTags.includes("RECRUITMENT_CLOSED")) {
          updatedTags.push("RECRUITMENT_CLOSED");
        }
      } else {
        updatedTags = updatedTags.filter((t) => t !== "RECRUITMENT_CLOSED");
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        stage: stage !== undefined ? stage : undefined,
        repoUrl: repoUrl !== undefined ? (repoUrl ? repoUrl.trim() : null) : undefined,
        tags: updatedTags,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, title: true },
        },
        roles: true,
        roadmap: true,
      },
    });

    // Invalidate Cache
    try {
      await redis.del("projects:all");
    } catch (cacheDelErr) {
      console.warn("Redis DEL failed:", cacheDelErr);
    }

    const formatted = {
      id: updated.id,
      ownerId: updated.authorId,
      ownerName: updated.author?.name || session.user.name || "Developer",
      title: updated.title,
      description: updated.description,
      stage: updated.stage,
      repoUrl: updated.repoUrl || undefined,
      tags: updated.tags,
      isRecruiting: !updated.tags?.includes("RECRUITMENT_CLOSED"),
      roles: updated.roles.map((r) => ({
        id: r.id,
        roleTitle: r.roleTitle,
        requiredSkills: r.requiredSkills || [],
        hoursPerWeek: r.hoursPerWeek,
        responsibilityLevel: r.responsibilityLevel as any,
        urgency: r.urgency as any,
        description: r.description || "",
      })),
      roadmap: updated.roadmap.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description || "",
        targetQuarter: m.targetQuarter,
        status: m.status as any,
      })),
      createdAt:
        updated.createdAt instanceof Date
          ? updated.createdAt.toISOString()
          : String(updated.createdAt),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("PATCH /api/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a project
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const target = await prisma.project.findUnique({
      where: { id },
    });

    if (!target || target.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized or Not Found" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id },
    });

    // Invalidate Cache
    try {
      await redis.del("projects:all");
    } catch (cacheDelErr) {
      console.warn("Redis DEL failed:", cacheDelErr);
    }

    return NextResponse.json({ success: true, message: "Proyek berhasil dihapus", id });
  } catch (error) {
    console.error("DELETE /api/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
