import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET: Fetch current user's portfolio projects
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolios = await prisma.portfolioProject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(portfolios);
  } catch (error: any) {
    console.error("GET /api/users/me/portfolios error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a new portfolio project
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, liveUrl, repoUrl, tags, imageUrl } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Judul proyek portofolio wajib diisi" },
        { status: 400 }
      );
    }

    const resolvedTags = Array.isArray(tags)
      ? tags.map((t: string) => String(t).trim()).filter(Boolean)
      : [];

    const project = await prisma.portfolioProject.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        description: description ? String(description).trim() : null,
        liveUrl: liveUrl ? String(liveUrl).trim() : null,
        repoUrl: repoUrl ? String(repoUrl).trim() : null,
        tags: resolvedTags,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/users/me/portfolios error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove a portfolio project
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Portfolio ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.portfolioProject.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.portfolioProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/users/me/portfolios error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
