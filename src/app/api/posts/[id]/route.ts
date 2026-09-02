import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/posts/[id]: Fetch single post detail with full comment thread
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
            location: true,
            primaryStack: true,
            githubUsername: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            stage: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: "asc" },
        },
        bookmarks: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Postingan tidak ditemukan" }, { status: 404 });
    }

    const isLiked = currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false;
    const isBookmarked = currentUserId ? post.bookmarks.some((b) => b.userId === currentUserId) : false;

    const formatted = {
      id: post.id,
      content: post.content,
      mediaUrls: post.mediaUrls,
      codeSnippet: post.codeSnippet,
      codeLanguage: post.codeLanguage,
      tags: post.tags,
      category: post.category,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: {
        id: post.author.id,
        name: post.author.name,
        avatarUrl: post.author.image || (post.author.githubUsername ? `https://github.com/${post.author.githubUsername}.png` : undefined),
        title: post.author.title || "Web Developer",
        location: post.author.location || "Indonesia",
        primaryStack: post.author.primaryStack || [],
      },
      project: post.project ? {
        id: post.project.id,
        title: post.project.title,
        stage: post.project.stage,
      } : null,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      bookmarkCount: post._count.bookmarks,
      isLiked,
      isBookmarked,
      isOwner: currentUserId === post.authorId,
      comments: post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        author: {
          id: c.author.id,
          name: c.author.name,
          avatarUrl: c.author.image || (c.author.githubUsername ? `https://github.com/${c.author.githubUsername}.png` : undefined),
          title: c.author.title || "Developer",
        },
        isOwner: currentUserId === c.authorId,
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/posts/[id]: Delete post if owned by current user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Postingan tidak ditemukan" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Kamu bukan pemilik postingan ini" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Postingan berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
