import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/posts/[id]/comments: Fetch all comments with nested replies and like counts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null }, // Fetch root comments
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
        likes: true,
        replies: {
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
            likes: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.author.id,
        name: c.author.name,
        avatarUrl: c.author.image || (c.author.githubUsername ? `https://github.com/${c.author.githubUsername}.png` : undefined),
        title: c.author.title || "Developer",
      },
      likeCount: c.likes.length,
      isLiked: currentUserId ? c.likes.some((l) => l.userId === currentUserId) : false,
      isOwner: currentUserId === c.authorId,
      replies: c.replies.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        author: {
          id: r.author.id,
          name: r.author.name,
          avatarUrl: r.author.image || (r.author.githubUsername ? `https://github.com/${r.author.githubUsername}.png` : undefined),
          title: r.author.title || "Developer",
        },
        likeCount: r.likes.length,
        isLiked: currentUserId ? r.likes.some((l) => l.userId === currentUserId) : false,
        isOwner: currentUserId === r.authorId,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments: Add a comment or reply to a post
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, parentId } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Isi komentar tidak boleh kosong" }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
        parentId: parentId || null,
        authorId: session.user.id,
        content: content.trim(),
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
        likes: true,
      },
    });

    const formatted = {
      id: newComment.id,
      content: newComment.content,
      parentId: newComment.parentId,
      createdAt: newComment.createdAt.toISOString(),
      author: {
        id: newComment.author.id,
        name: newComment.author.name,
        avatarUrl: newComment.author.image || (newComment.author.githubUsername ? `https://github.com/${newComment.author.githubUsername}.png` : undefined),
        title: newComment.author.title || "Developer",
      },
      likeCount: 0,
      isLiked: false,
      isOwner: true,
      replies: [],
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
