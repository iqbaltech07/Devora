import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/posts/[id]/comments: Fetch all comments for a post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const comments = await prisma.comment.findMany({
      where: { postId },
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
      isOwner: currentUserId === c.authorId,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments: Add a comment to a post
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

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Isi komentar tidak boleh kosong" }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
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
      },
    });

    const formatted = {
      id: newComment.id,
      content: newComment.content,
      createdAt: newComment.createdAt.toISOString(),
      author: {
        id: newComment.author.id,
        name: newComment.author.name,
        avatarUrl: newComment.author.image || (newComment.author.githubUsername ? `https://github.com/${newComment.author.githubUsername}.png` : undefined),
        title: newComment.author.title || "Developer",
      },
      isOwner: true,
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
