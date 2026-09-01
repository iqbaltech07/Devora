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

    let dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const portfolios = await prisma.portfolioProject.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(portfolios);
  } catch (error: any) {
    console.error("GET /api/users/me/portfolios error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a new portfolio project
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Sesi login kedaluwarsa. Silakan refresh atau login kembali." }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Akun pengguna tidak ditemukan di database. Silakan login ulang." },
        { status: 404 }
      );
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
        userId: dbUser.id,
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
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
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
      return NextResponse.json({ error: "ID portofolio wajib disertakan" }, { status: 400 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!dbUser && session.user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const project = await prisma.portfolioProject.findUnique({
      where: { id },
    });

    if (!project || project.userId !== dbUser.id) {
      return NextResponse.json({ error: "Proyek tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    await prisma.portfolioProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/users/me/portfolios error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
