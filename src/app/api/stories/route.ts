import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/stories: Fetch unexpired 24-hour stories grouped by author
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const now = new Date();

    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: now,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
            githubUsername: true,
          },
        },
        views: {
          select: {
            viewerId: true,
            viewedAt: true,
            viewer: {
              select: {
                id: true,
                name: true,
                image: true,
                title: true,
              },
            },
          },
          orderBy: { viewedAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group stories by author
    const authorMap = new Map<string, any>();

    stories.forEach((story) => {
      const authorId = story.authorId;
      const isOwner = currentUserId === story.authorId;
      const isViewed = story.views.some((v) => v.viewerId === currentUserId);

      if (!authorMap.has(authorId)) {
        authorMap.set(authorId, {
          author: {
            id: story.author.id,
            name: story.author.name,
            avatarUrl: story.author.image || (story.author.githubUsername ? `https://github.com/${story.author.githubUsername}.png` : undefined),
            title: story.author.title || "Web Developer",
            isMe: isOwner,
          },
          hasUnviewed: false,
          stories: [],
        });
      }

      if (!isViewed && !isOwner) {
        authorMap.get(authorId).hasUnviewed = true;
      }

      authorMap.get(authorId).stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        caption: story.caption,
        createdAt: story.createdAt.toISOString(),
        expiresAt: story.expiresAt.toISOString(),
        viewsCount: story.views.length,
        isViewed,
        viewers: isOwner
          ? story.views.map((v) => ({
              id: v.viewer.id,
              name: v.viewer.name,
              avatarUrl: v.viewer.image,
              title: v.viewer.title || "Developer",
              viewedAt: v.viewedAt.toISOString(),
            }))
          : [],
      });
    });

    return NextResponse.json(Array.from(authorMap.values()));
  } catch (error) {
    console.error("GET /api/stories error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/stories: Create a 24-hour sprint story
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mediaUrl, caption } = await request.json();

    if (!mediaUrl && !caption?.trim()) {
      return NextResponse.json({ error: "Story harus memiliki gambar atau teks caption" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const newStory = await prisma.story.create({
      data: {
        authorId: session.user.id,
        mediaUrl: mediaUrl || null,
        caption: caption?.trim() || null,
        expiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
            githubUsername: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: newStory.id,
      mediaUrl: newStory.mediaUrl,
      caption: newStory.caption,
      createdAt: newStory.createdAt.toISOString(),
      expiresAt: newStory.expiresAt.toISOString(),
      author: {
        id: newStory.author.id,
        name: newStory.author.name,
        avatarUrl: newStory.author.image,
        title: newStory.author.title || "Developer",
        isMe: true,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/stories error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
